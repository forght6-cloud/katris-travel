declare const process: { env: Record<string, string | undefined> };

const GEOAPIFY_GEOCODING_URL = "https://api.geoapify.com/v1/geocode/search";
const GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places";
const HOTEL_CATEGORIES = "accommodation.hotel,accommodation.apartment,accommodation.guest_house";

const CITY_CENTER_MAP: Record<string, { lat: number; lon: number }> = {
  amsterdam: { lat: 52.3676, lon: 4.9041 },
  athens: { lat: 37.9838, lon: 23.7275 },
  bangkok: { lat: 13.7563, lon: 100.5018 },
  barcelona: { lat: 41.3874, lon: 2.1686 },
  bergen: { lat: 60.3913, lon: 5.3221 },
  berlin: { lat: 52.52, lon: 13.405 },
  brussels: { lat: 50.8503, lon: 4.3517 },
  budapest: { lat: 47.4979, lon: 19.0402 },
  copenhagen: { lat: 55.6761, lon: 12.5683 },
  dublin: { lat: 53.3498, lon: -6.2603 },
  edinburgh: { lat: 55.9533, lon: -3.1883 },
  florence: { lat: 43.7696, lon: 11.2558 },
  geneva: { lat: 46.2044, lon: 6.1432 },
  helsinki: { lat: 60.1699, lon: 24.9384 },
  "hong kong": { lat: 22.3193, lon: 114.1694 },
  istanbul: { lat: 41.0082, lon: 28.9784 },
  kyoto: { lat: 35.0116, lon: 135.7681 },
  lisbon: { lat: 38.7223, lon: -9.1393 },
  london: { lat: 51.5072, lon: -0.1276 },
  "los angeles": { lat: 34.0522, lon: -118.2437 },
  madrid: { lat: 40.4168, lon: -3.7038 },
  milan: { lat: 45.4642, lon: 9.19 },
  munich: { lat: 48.1351, lon: 11.582 },
  "new york": { lat: 40.7128, lon: -74.006 },
  nice: { lat: 43.7102, lon: 7.262 },
  oslo: { lat: 59.9139, lon: 10.7522 },
  paris: { lat: 48.8566, lon: 2.3522 },
  prague: { lat: 50.0755, lon: 14.4378 },
  reykjavik: { lat: 64.1466, lon: -21.9426 },
  rome: { lat: 41.9028, lon: 12.4964 },
  seoul: { lat: 37.5665, lon: 126.978 },
  singapore: { lat: 1.3521, lon: 103.8198 },
  stockholm: { lat: 59.3293, lon: 18.0686 },
  tallinn: { lat: 59.437, lon: 24.7536 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  venice: { lat: 45.4408, lon: 12.3155 },
  vienna: { lat: 48.2082, lon: 16.3738 },
  zurich: { lat: 47.3769, lon: 8.5417 },
};

type HotelResult = {
  id: string;
  name: string;
  rating: string;
  rateLabel: string;
  address: string;
  city: string;
  date: string;
  bookingUrl: string;
  googleHotelsUrl: string;
  tripadvisorUrl: string;
  mapsUrl: string;
  provider: string;
};

async function geocodeCity(city: string) {
  const knownCenter = CITY_CENTER_MAP[city.trim().toLowerCase()];

  if (knownCenter) {
    return knownCenter;
  }

  const apiKey = process.env.GEOAPIFY_GEOCODING_API_KEY || process.env.GEOAPIFY_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("Geoapify geocoding key is not configured.");
  }

  const requestUrl = new URL(GEOAPIFY_GEOCODING_URL);
  requestUrl.searchParams.set("text", city);
  requestUrl.searchParams.set("limit", "1");
  requestUrl.searchParams.set("format", "json");
  requestUrl.searchParams.set("type", "city");
  requestUrl.searchParams.set("apiKey", apiKey);

  const response = await fetch(requestUrl.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Geoapify geocoding failed.");
  }

  const result = data?.results?.[0];

  if (!result?.lat || !result?.lon) {
    throw new Error(`Geoapify could not locate ${city}.`);
  }

  return {
    lat: Number(result.lat),
    lon: Number(result.lon),
  };
}

async function searchGeoapifyHotels(city: string, date: string, limit: number) {
  const apiKey = process.env.GEOAPIFY_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("Geoapify places key is not configured.");
  }

  const center = await geocodeCity(city);
  const requestUrl = new URL(GEOAPIFY_PLACES_URL);
  requestUrl.searchParams.set("categories", HOTEL_CATEGORIES);
  requestUrl.searchParams.set("filter", `circle:${center.lon},${center.lat},16000`);
  requestUrl.searchParams.set("bias", `proximity:${center.lon},${center.lat}`);
  requestUrl.searchParams.set("limit", String(Math.max(limit * 2, 12)));
  requestUrl.searchParams.set("apiKey", apiKey);

  const response = await fetch(requestUrl.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Geoapify hotel search failed.");
  }

  return normalizeHotels(data?.features || [], city, date, limit);
}

function normalizeHotels(features: any[], city: string, date: string, limit: number): HotelResult[] {
  const seen = new Set<string>();
  const hotels: HotelResult[] = [];

  for (const feature of features) {
    const properties = feature?.properties || {};
    const coordinates = feature?.geometry?.coordinates || [];
    const name = cleanHotelName(properties.name || properties.address_line1 || properties.formatted);
    const key = String(name || "").toLowerCase();

    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);
    const address = properties.address_line2 || properties.formatted || "";
    const lat = Number(coordinates[1] || properties.lat || 0);
    const lon = Number(coordinates[0] || properties.lon || 0);

    hotels.push({
      id: properties.place_id || `${key}-${hotels.length + 1}`,
      name,
      rating: "External rating",
      rateLabel: "Search live rates",
      address,
      city,
      date,
      bookingUrl: buildBookingSearchUrl(name, city, date),
      googleHotelsUrl: buildGoogleHotelsUrl(name, city, date),
      tripadvisorUrl: buildTripadvisorUrl(name, city),
      mapsUrl: buildMapsUrl(name, lat, lon),
      provider: "geoapify",
    });

    if (hotels.length >= limit) {
      break;
    }
  }

  return hotels;
}

function buildBookingSearchUrl(name: string, city: string, date: string) {
  const checkoutDate = getCheckoutDate(date);
  const requestUrl = new URL("https://www.booking.com/searchresults.html");
  requestUrl.searchParams.set("ss", `${name}, ${city}`);
  requestUrl.searchParams.set("checkin", date);
  requestUrl.searchParams.set("checkout", checkoutDate);
  requestUrl.searchParams.set("group_adults", "2");
  requestUrl.searchParams.set("no_rooms", "1");
  requestUrl.searchParams.set("group_children", "0");
  return requestUrl.toString();
}

function cleanHotelName(value: string) {
  return String(value || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)[0] || "";
}

function buildGoogleHotelsUrl(name: string, city: string, date: string) {
  const checkoutDate = getCheckoutDate(date);
  const requestUrl = new URL("https://www.google.com/travel/hotels");
  requestUrl.searchParams.set("q", `${name} ${city}`);
  requestUrl.searchParams.set("checkin", date);
  requestUrl.searchParams.set("checkout", checkoutDate);
  requestUrl.searchParams.set("adults", "2");
  return requestUrl.toString();
}

function buildTripadvisorUrl(name: string, city: string) {
  return `https://www.tripadvisor.com/Search?q=${encodeURIComponent(`${name} ${city}`)}`;
}

function buildMapsUrl(name: string, lat: number, lon: number) {
  if (lat && lon) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(name)}`;
}

function getCheckoutDate(checkinDate: string) {
  const parsed = new Date(`${checkinDate}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return checkinDate;
  }

  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().slice(0, 10);
}

function createFallbackHotels(city: string, date: string): HotelResult[] {
  const names = [
    `${city} Central Hotel`,
    `${city} Boutique Stay`,
    `${city} Garden Residence`,
    `${city} Harbour Hotel`,
    `${city} Design Suites`,
  ];

  return names.map((name, index) => ({
    id: `fallback-${city}-${index + 1}`,
    name,
    rating: "External rating",
    rateLabel: "Search live rates",
    address: city,
    city,
    date,
    bookingUrl: buildBookingSearchUrl(name, city, date),
    googleHotelsUrl: buildGoogleHotelsUrl(name, city, date),
    tripadvisorUrl: buildTripadvisorUrl(name, city),
    mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${city}`)}`,
    provider: "fallback",
  }));
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const city = String(body.city || req.query?.city || "").trim();
  const date = String(body.date || req.query?.date || new Date().toISOString().slice(0, 10));
  const limit = Math.min(Number(body.limit || req.query?.limit || 5) || 5, 10);

  if (!city) {
    res.status(400).json({ error: "city is required" });
    return;
  }

  try {
    const hotels = await searchGeoapifyHotels(city, date, limit);

    res.status(200).json({
      provider: "geoapify",
      city,
      hotels: hotels.length ? hotels : createFallbackHotels(city, date),
      warning: hotels.length ? "" : "Geoapify returned no hotels; external search links were generated.",
    });
  } catch (error: any) {
    res.status(200).json({
      provider: "fallback",
      city,
      hotels: createFallbackHotels(city, date),
      warning: error?.message || "Hotel search failed; external search links were generated.",
    });
  }
}
