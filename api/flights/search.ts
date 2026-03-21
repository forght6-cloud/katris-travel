declare const process: { env: Record<string, string | undefined> };

const AMADEUS_AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_FLIGHT_SEARCH_URL = "https://test.api.amadeus.com/v2/shopping/flight-offers";

type Carrier = {
  code: string;
  name: string;
};

type NormalizedOffer = {
  id: string;
  price: {
    total: number;
    currency: string;
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

async function getAccessToken(clientId: string, clientSecret: string) {
  const tokenResponse = await fetch(AMADEUS_AUTH_URL, {
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

async function searchFlights(token: string, params: { origin: string; destination: string; departDate: string; adults: number }) {
  const requestUrl = new URL(AMADEUS_FLIGHT_SEARCH_URL);
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).json({ error: "Amadeus credentials are not configured" });
    return;
  }

  const { origin, destination, departDate, adults } = req.body || {};

  if (!origin || !destination || !departDate) {
    res.status(400).json({ error: "origin, destination, and departDate are required" });
    return;
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret);
    const amadeusResponse = await searchFlights(accessToken, {
      origin,
      destination,
      departDate,
      adults: Number(adults) || 1,
    });

    const offers = (amadeusResponse.data || []).map((offer: any) =>
      normalizeOffer(offer, amadeusResponse.dictionaries?.carriers || {}),
    );

    res.status(200).json({ offers });
  } catch (error: any) {
    res.status(502).json({
      error: "Flight search failed",
      details: error?.message || "Unknown error",
    });
  }
}
