declare const process: { env: Record<string, string | undefined> };

const AMADEUS_TEST_BASE_URL = "https://test.api.amadeus.com";
const AMADEUS_PRODUCTION_BASE_URL = "https://api.amadeus.com";
const AVIATIONSTACK_FLIGHTS_URL = "https://api.aviationstack.com/v1/flights";

type Carrier = {
  code: string;
  name: string;
};

type NormalizedOffer = {
  id: string;
  price: {
    total: number;
    currency: string;
    label?: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      from: string;
      to: string;
      departureAt: string;
      arrivalAt: string;
    }>;
  }>;
  carriers: Carrier[];
};

type FlightSearchParams = {
  origin: string;
  destination: string;
  departDate: string;
  adults: number;
};

const MOCK_CARRIERS: Carrier[] = [
  { code: "SK", name: "Scandinavian Airlines" },
  { code: "AY", name: "Finnair" },
  { code: "KL", name: "KLM" },
  { code: "LH", name: "Lufthansa" },
];

function normalizeOffer(offer: any, carriersDictionary: Record<string, string>): NormalizedOffer {
  const carrierCodes = Array.from(
    new Set(
      (offer.itineraries || []).flatMap((itinerary: any) =>
        (itinerary.segments || []).map((segment: any) => segment.carrierCode).filter(Boolean),
      ),
    ),
  ) as string[];

  return {
    id: offer.id,
    price: {
      total: Number(offer.price?.total || 0),
      currency: offer.price?.currency || "EUR",
    },
    itineraries: (offer.itineraries || []).map((itinerary: any) => ({
      duration: itinerary.duration || "",
      segments: (itinerary.segments || []).map((segment: any) => ({
        from: segment.departure?.iataCode || "",
        to: segment.arrival?.iataCode || "",
        departureAt: segment.departure?.at || "",
        arrivalAt: segment.arrival?.at || "",
      })),
    })),
    carriers: carrierCodes.map((code) => ({
      code,
      name: carriersDictionary[code] || code,
    })),
  };
}

function getAmadeusBaseUrl() {
  return process.env.AMADEUS_ENV === "production" ? AMADEUS_PRODUCTION_BASE_URL : AMADEUS_TEST_BASE_URL;
}

async function getAccessToken(clientId: string, clientSecret: string, baseUrl: string) {
  const tokenResponse = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const message = await tokenResponse.text();
    throw new Error(`Amadeus token error: ${message}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token as string;
}

async function searchFlights(token: string, params: FlightSearchParams, baseUrl: string) {
  const requestUrl = new URL(`${baseUrl}/v2/shopping/flight-offers`);
  requestUrl.searchParams.set("originLocationCode", params.origin);
  requestUrl.searchParams.set("destinationLocationCode", params.destination);
  requestUrl.searchParams.set("departureDate", params.departDate);
  requestUrl.searchParams.set("adults", String(params.adults || 1));
  requestUrl.searchParams.set("max", "6");
  requestUrl.searchParams.set("currencyCode", "EUR");

  const response = await fetch(requestUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Amadeus flight search error: ${message}`);
  }

  return response.json();
}

async function searchAviationstackFlights(apiKey: string, params: FlightSearchParams) {
  const requestUrl = new URL(AVIATIONSTACK_FLIGHTS_URL);
  requestUrl.searchParams.set("access_key", apiKey);
  requestUrl.searchParams.set("dep_iata", params.origin);
  requestUrl.searchParams.set("arr_iata", params.destination);
  requestUrl.searchParams.set("limit", "6");

  const response = await fetch(requestUrl.toString());
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(`Aviationstack flight search error: ${JSON.stringify(data.error || data)}`);
  }

  return data;
}

function normalizeAviationstackOffer(flight: any, index: number, params: FlightSearchParams): NormalizedOffer {
  const airlineCode = flight.airline?.iata || flight.airline?.icao || flight.flight?.iata || "LIVE";
  const airlineName = flight.airline?.name || airlineCode;
  const departureAt = flight.departure?.scheduled || flight.departure?.estimated || "";
  const arrivalAt = flight.arrival?.scheduled || flight.arrival?.estimated || "";

  return {
    id: flight.flight?.iata || flight.flight?.icao || `aviationstack-${params.origin}-${params.destination}-${index + 1}`,
    price: {
      total: 0,
      currency: "STATUS",
      label: "Live status",
    },
    itineraries: [
      {
        duration: "",
        segments: [
          {
            from: flight.departure?.iata || params.origin,
            to: flight.arrival?.iata || params.destination,
            departureAt,
            arrivalAt,
          },
        ],
      },
    ],
    carriers: [
      {
        code: airlineCode,
        name: airlineName,
      },
    ],
  };
}

async function getAviationstackOffers(params: FlightSearchParams): Promise<NormalizedOffer[]> {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;

  if (!apiKey) {
    return [];
  }

  const response = await searchAviationstackFlights(apiKey, params);
  return (response.data || [])
    .filter((flight: any) => flight.departure?.iata && flight.arrival?.iata)
    .map((flight: any, index: number) => normalizeAviationstackOffer(flight, index, params));
}

function addMinutes(date: Date, minutes: number) {
  const candidate = new Date(date);
  candidate.setMinutes(candidate.getMinutes() + minutes);
  return candidate;
}

function buildDateTime(departDate: string, hour: number, minute = 0) {
  const paddedHour = String(hour).padStart(2, "0");
  const paddedMinute = String(minute).padStart(2, "0");
  return new Date(`${departDate}T${paddedHour}:${paddedMinute}:00`);
}

function createMockOffers(params: FlightSearchParams): NormalizedOffer[] {
  const routeSeed = params.origin.charCodeAt(0) + params.destination.charCodeAt(0);
  const basePrice = 180 + routeSeed + params.adults * 35;
  const schedules = [
    { departHour: 8, departMinute: 20, durationHours: 2, durationMinutes: 15, carrier: MOCK_CARRIERS[0] },
    { departHour: 12, departMinute: 45, durationHours: 3, durationMinutes: 5, carrier: MOCK_CARRIERS[1] },
    { departHour: 18, departMinute: 10, durationHours: 2, durationMinutes: 40, carrier: MOCK_CARRIERS[2] },
  ];

  return schedules.map((schedule, index) => {
    const departure = buildDateTime(params.departDate, schedule.departHour, schedule.departMinute);
    const arrival = addMinutes(departure, schedule.durationHours * 60 + schedule.durationMinutes);

    return {
      id: `mock-${params.origin}-${params.destination}-${params.departDate}-${index + 1}`,
      price: {
        total: basePrice + index * 42,
        currency: "EUR",
      },
      itineraries: [
        {
          duration: `PT${schedule.durationHours}H${schedule.durationMinutes}M`,
          segments: [
            {
              from: params.origin,
              to: params.destination,
              departureAt: departure.toISOString(),
              arrivalAt: arrival.toISOString(),
            },
          ],
        },
      ],
      carriers: [schedule.carrier],
    };
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { origin, destination, departDate, adults } = req.body || {};

  if (!origin || !destination || !departDate) {
    res.status(400).json({ error: "origin, destination, and departDate are required" });
    return;
  }

  const searchParams = {
    origin: String(origin).toUpperCase(),
    destination: String(destination).toUpperCase(),
    departDate: String(departDate),
    adults: Number(adults) || 1,
  };
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  try {
    const aviationstackOffers = await getAviationstackOffers(searchParams);

    if (aviationstackOffers.length) {
      res.status(200).json({
        offers: aviationstackOffers,
        provider: "aviationstack",
        warning: "Aviationstack provides flight status and schedule data, not ticket prices.",
      });
      return;
    }
  } catch (error: any) {
    console.error(error?.message || error);
  }

  if (!clientId || !clientSecret) {
    res.status(200).json({
      offers: createMockOffers(searchParams),
      provider: "mock",
      warning: "Amadeus credentials are not configured",
    });
    return;
  }

  try {
    const baseUrl = getAmadeusBaseUrl();
    const accessToken = await getAccessToken(clientId, clientSecret, baseUrl);
    const amadeusResponse = await searchFlights(accessToken, searchParams, baseUrl);

    const offers = (amadeusResponse.data || []).map((offer: any) =>
      normalizeOffer(offer, amadeusResponse.dictionaries?.carriers || {}),
    );

    if (!offers.length) {
      res.status(200).json({
        offers: createMockOffers(searchParams),
        provider: "mock",
        warning: "No Amadeus offers returned; mock offers returned",
      });
      return;
    }

    res.status(200).json({ offers, provider: "amadeus", environment: process.env.AMADEUS_ENV || "test" });
  } catch (error: any) {
    res.status(200).json({
      offers: createMockOffers(searchParams),
      provider: "mock",
      warning: "Flight search failed; mock offers returned",
      details: error?.message || "Unknown error",
    });
  }
}
