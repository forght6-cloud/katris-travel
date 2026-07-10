"use strict";

const AMADEUS_TEST_BASE_URL = "https://test.api.amadeus.com";
const AMADEUS_PRODUCTION_BASE_URL = "https://api.amadeus.com";

const AIRPORT_CODE_MAP = {
  Amsterdam: "AMS",
  Athens: "ATH",
  Bangkok: "BKK",
  Barcelona: "BCN",
  Bergen: "BGO",
  Berlin: "BER",
  Brussels: "BRU",
  Budapest: "BUD",
  Chicago: "ORD",
  Copenhagen: "CPH",
  Dublin: "DUB",
  Edinburgh: "EDI",
  Florence: "FLR",
  Frankfurt: "FRA",
  Geneva: "GVA",
  Helsinki: "HEL",
  "Hong Kong": "HKG",
  Istanbul: "IST",
  Kyoto: "KIX",
  "Las Vegas": "LAS",
  Lisbon: "LIS",
  London: "LHR",
  "Los Angeles": "LAX",
  Madrid: "MAD",
  Manchester: "MAN",
  Milan: "MXP",
  Munich: "MUC",
  "New York": "JFK",
  Nice: "NCE",
  Oslo: "OSL",
  Paris: "CDG",
  Prague: "PRG",
  Reykjavik: "KEF",
  Rome: "FCO",
  Seoul: "ICN",
  Singapore: "SIN",
  Stockholm: "ARN",
  Tallinn: "TLL",
  Tokyo: "HND",
  Venice: "VCE",
  Vienna: "VIE",
  Zurich: "ZRH",
};

const MOCK_CARRIERS = [
  { code: "SK", name: "Scandinavian Airlines" },
  { code: "AY", name: "Finnair" },
  { code: "LH", name: "Lufthansa" },
];

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

function isTruthy(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function getBaseUrl() {
  return process.env.AMADEUS_ENV === "production" ? AMADEUS_PRODUCTION_BASE_URL : AMADEUS_TEST_BASE_URL;
}

function resolveAirportCode(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  const directMatch = Object.entries(AIRPORT_CODE_MAP).find(([city]) => city.toLowerCase() === trimmed.toLowerCase());
  if (directMatch) return directMatch[1];
  return /^[A-Za-z]{3}$/.test(trimmed) ? trimmed.toUpperCase() : trimmed.toUpperCase();
}

function addMinutes(date, minutes) {
  const candidate = new Date(date);
  candidate.setMinutes(candidate.getMinutes() + minutes);
  return candidate;
}

function buildDateTime(departDate, hour, minute) {
  return new Date(`${departDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`);
}

function buildBookingUrl(params) {
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  if (!marker) return "";

  const url = new URL("https://search.aviasales.com/flights/");
  url.searchParams.set("origin_iata", params.origin);
  url.searchParams.set("destination_iata", params.destination);
  url.searchParams.set("depart_date", params.departDate);
  url.searchParams.set("adults", String(params.adults || 1));
  url.searchParams.set("children", "0");
  url.searchParams.set("infants", "0");
  url.searchParams.set("trip_class", "0");
  url.searchParams.set("currency", "EUR");
  url.searchParams.set("locale", "en");
  url.searchParams.set("oneway", "1");
  url.searchParams.set("marker", marker);
  return url.toString();
}

function createMockOffers(params) {
  const basePrice = 220 + params.adults * 35;
  const schedules = [
    { hour: 8, minute: 15, duration: 140, carrier: MOCK_CARRIERS[0] },
    { hour: 12, minute: 40, duration: 180, carrier: MOCK_CARRIERS[1] },
    { hour: 18, minute: 5, duration: 155, carrier: MOCK_CARRIERS[2] },
  ];

  return schedules.map((schedule, index) => {
    const departure = buildDateTime(params.departDate, schedule.hour, schedule.minute);
    const arrival = addMinutes(departure, schedule.duration);

    return {
      id: `mock-${params.origin}-${params.destination}-${index + 1}`,
      price: {
        total: basePrice + index * 45,
        currency: "EUR",
      },
      bookingUrl: buildBookingUrl(params),
      itineraries: [
        {
          duration: `PT${Math.floor(schedule.duration / 60)}H${schedule.duration % 60}M`,
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

async function getAccessToken(clientId, clientSecret, baseUrl) {
  const response = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
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

  if (!response.ok) {
    throw new Error(`Amadeus OAuth token failed: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function searchFlightOffers(token, params, baseUrl) {
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
    throw new Error(`Amadeus flight-offers search failed: ${await response.text()}`);
  }

  return response.json();
}

function normalizeOffer(offer, carriersDictionary, params) {
  const carrierCodes = Array.from(
    new Set(
      (offer.itineraries || []).flatMap((itinerary) =>
        (itinerary.segments || []).map((segment) => segment.carrierCode).filter(Boolean),
      ),
    ),
  );

  return {
    id: offer.id,
    price: {
      total: Number(offer.price?.total || 0),
      currency: offer.price?.currency || "EUR",
    },
    bookingUrl: buildBookingUrl(params),
    itineraries: (offer.itineraries || []).map((itinerary) => ({
      duration: itinerary.duration || "",
      segments: (itinerary.segments || []).map((segment) => ({
        from: segment.departure?.iataCode || "",
        to: segment.arrival?.iataCode || "",
        departureAt: segment.departure?.at || "",
        arrivalAt: segment.arrival?.at || "",
      })),
    })),
    carriers: carrierCodes.map((code) => ({
      code,
      name: carriersDictionary?.[code] || code,
    })),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const params = {
    origin: resolveAirportCode(body.origin),
    destination: resolveAirportCode(body.destination),
    departDate: String(body.departDate || ""),
    adults: Number(body.adults) || 1,
  };

  if (!params.origin || !params.destination || !params.departDate) {
    sendJson(res, 400, { error: "origin, destination, and departDate are required" });
    return;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  const forceMockMode = isTruthy(process.env.AMADEUS_USE_MOCK);

  if (forceMockMode || !clientId || !clientSecret) {
    sendJson(res, 200, {
      offers: createMockOffers(params),
      provider: "mock",
      warning: forceMockMode
        ? "AMADEUS_USE_MOCK is enabled; returned mock offers for free development mode."
        : "AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET not configured; returned mock offers.",
    });
    return;
  }

  try {
    const baseUrl = getBaseUrl();
    const token = await getAccessToken(clientId, clientSecret, baseUrl);
    const data = await searchFlightOffers(token, params, baseUrl);
    const offers = (data.data || []).map((offer) => normalizeOffer(offer, data.dictionaries?.carriers || {}, params));

    sendJson(res, 200, {
      offers: offers.length ? offers : createMockOffers(params),
      provider: offers.length ? "amadeus" : "mock",
      environment: process.env.AMADEUS_ENV || "test",
      warning: offers.length ? "" : "No Amadeus offers returned; returned mock offers instead.",
    });
  } catch (error) {
    sendJson(res, 200, {
      offers: createMockOffers(params),
      provider: "mock",
      warning: `Amadeus request failed; returned mock offers. ${error.message || "Unknown error"}`,
    });
  }
};
