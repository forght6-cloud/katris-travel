declare const process: { env: Record<string, string | undefined> };

const GEOAPIFY_GEOCODING_URL = "https://api.geoapify.com/v1/geocode/search";
const GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places";
const DEFAULT_CATEGORIES = [
  "tourism.sights",
  "tourism.attraction",
  "entertainment.museum",
].join(",");

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

const VERIFIED_CITY_PLACES: Record<string, Array<Omit<NormalizedPlace, "id" | "mapsUrl">>> = {
  "new york": [
    {
      name: "The Metropolitan Museum of Art",
      category: "Museum",
      summary: "Major museum anchor for a focused culture block.",
      address: "1000 5th Ave, New York, NY 10028",
    },
    {
      name: "New York Public Library, Stephen A. Schwarzman Building",
      category: "Architecture",
      summary: "A strong Midtown architecture and reading-room stop.",
      address: "476 5th Ave, New York, NY 10018",
    },
    {
      name: "Chelsea Market",
      category: "Food",
      summary: "Practical lunch base with many vendors and easy indoor pacing.",
      address: "75 9th Ave, New York, NY 10011",
    },
    {
      name: "The High Line",
      category: "Urban walk",
      summary: "Elevated linear park that works well after Chelsea Market.",
      address: "Gansevoort St. to W 34th St, New York, NY 10011",
    },
    {
      name: "Museum of Modern Art",
      category: "Museum",
      summary: "Weather-proof art block near central Midtown routes.",
      address: "11 W 53rd St, New York, NY 10019",
    },
    {
      name: "Central Park",
      category: "Park",
      summary: "Use for daylight walking, recovery time, and flexible pacing.",
      address: "59th St to 110th St, New York, NY 10022",
    },
    {
      name: "Brooklyn Bridge Park",
      category: "Scenery",
      summary: "Waterfront views and a calmer evening route after Lower Manhattan.",
      address: "334 Furman St, Brooklyn, NY 11201",
    },
    {
      name: "Katz's Delicatessen",
      category: "Restaurant",
      summary: "Classic Lower East Side lunch stop; reserve buffer time for queues.",
      address: "205 E Houston St, New York, NY 10002",
    },
  ],
};

type NormalizedPlace = {
  id: string;
  name: string;
  category: string;
  summary: string;
  address: string;
  mapsUrl: string;
  lat?: number;
  lon?: number;
};

function getVerifiedFallbackPlaces(city: string, limit: number): NormalizedPlace[] {
  const places = VERIFIED_CITY_PLACES[city.trim().toLowerCase()] || [];

  return places.slice(0, limit).map((place, index) => ({
    id: `verified-${city}-${index + 1}`,
    ...place,
    mapsUrl: buildMapsUrl(`${place.name} ${place.address}`, 0, 0),
  }));
}

function mergeVerifiedAndLivePlaces(city: string, livePlaces: NormalizedPlace[], limit: number) {
  const verifiedPlaces = getVerifiedFallbackPlaces(city, limit);
  const seen = new Set<string>();
  const merged: NormalizedPlace[] = [];

  [...verifiedPlaces, ...livePlaces].forEach((place) => {
    const key = `${place.name}|${place.address}`.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(place);
  });

  return merged.slice(0, limit);
}

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

async function searchGeoapifyPlaces(city: string, limit: number) {
  const apiKey = process.env.GEOAPIFY_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("Geoapify places key is not configured.");
  }

  const center = await geocodeCity(city);
  const requestUrl = new URL(GEOAPIFY_PLACES_URL);
  requestUrl.searchParams.set("categories", DEFAULT_CATEGORIES);
  requestUrl.searchParams.set("filter", `circle:${center.lon},${center.lat},14000`);
  requestUrl.searchParams.set("bias", `proximity:${center.lon},${center.lat}`);
  requestUrl.searchParams.set("limit", String(Math.max(limit * 2, 12)));
  requestUrl.searchParams.set("apiKey", apiKey);

  const response = await fetch(requestUrl.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Geoapify places search failed.");
  }

  return normalizePlaces(data?.features || [], limit);
}

function normalizePlaces(features: any[], limit: number): NormalizedPlace[] {
  const seen = new Set<string>();
  const places: NormalizedPlace[] = [];

  for (const feature of features) {
    const properties = feature?.properties || {};
    const coordinates = feature?.geometry?.coordinates || [];
    const name = properties.name || properties.address_line1 || properties.formatted;
    const key = String(name || "").toLowerCase();

    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);
    const category = getReadableCategory(properties.categories || []);
    const address = properties.address_line2 || properties.formatted || "";
    const lat = Number(coordinates[1] || properties.lat || 0);
    const lon = Number(coordinates[0] || properties.lon || 0);

    places.push({
      id: properties.place_id || `${key}-${places.length + 1}`,
      name,
      category,
      summary: buildPlaceSummary(category, address),
      address,
      mapsUrl: buildMapsUrl(name, lat, lon),
      lat: lat || undefined,
      lon: lon || undefined,
    });

    if (places.length >= limit) {
      break;
    }
  }

  return places;
}

function getReadableCategory(categories: string[]) {
  const categorySet = new Set(categories);

  if (categorySet.has("entertainment.museum")) return "Museum";
  if ([...categorySet].some((category) => category.startsWith("tourism.sights"))) return "Sight";
  if ([...categorySet].some((category) => category.startsWith("tourism.attraction"))) return "Attraction";
  return "Local place";
}

function buildPlaceSummary(category: string, address: string) {
  const location = address ? ` near ${address}` : "";
  return `${category} recommendation${location}, sourced from Geoapify place data.`;
}

function buildMapsUrl(name: string, lat: number, lon: number) {
  if (lat && lon) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(name)}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const city = String(body.city || req.query?.city || "").trim();
  const limit = Math.min(Number(body.limit || req.query?.limit || 5) || 5, 10);

  if (!city) {
    res.status(400).json({ error: "city is required" });
    return;
  }

  try {
    const places = await searchGeoapifyPlaces(city, limit);
    const mergedPlaces = mergeVerifiedAndLivePlaces(city, places, limit);
    const hasVerifiedPlaces = getVerifiedFallbackPlaces(city, 1).length > 0;

    res.status(200).json({
      provider: hasVerifiedPlaces && mergedPlaces.length ? "verified + geoapify" : "geoapify",
      city,
      places: mergedPlaces,
      warning: places.length ? "" : "Geoapify returned no places for this city.",
    });
  } catch (error: any) {
    const fallbackPlaces = getVerifiedFallbackPlaces(city, limit);
    res.status(200).json({
      provider: fallbackPlaces.length ? "verified fallback" : "fallback",
      city,
      places: fallbackPlaces,
      warning: fallbackPlaces.length
        ? `Geoapify unavailable; returned verified static addresses for ${city}.`
        : error?.message || "Geoapify places search failed.",
    });
  }
}
