declare const process: { env: Record<string, string | undefined> };

const GEOAPIFY_GEOCODING_URL = "https://api.geoapify.com/v1/geocode/search";
const GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places";
const APIFY_BOOKING_ACTOR_ID = "oeiQgfg5fsmIJB7Cn";
const APIFY_API_BASE_URL = "https://api.apify.com/v2";
const HASDATA_GOOGLE_HOTELS_URL = "https://api.hasdata.com/scrape/google/hotels";
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
  manchester: { lat: 53.4808, lon: -2.2426 },
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
  checkoutDate: string;
  bookingUrl: string;
  googleHotelsUrl: string;
  tripadvisorUrl: string;
  mapsUrl: string;
  provider: string;
};

async function searchApifyHotels(
  apiToken: string,
  city: string,
  date: string,
  checkoutDate: string,
  adults: number,
  limit: number,
) {
  const actorId = process.env.APIFY_BOOKING_ACTOR_ID || APIFY_BOOKING_ACTOR_ID;
  const requestUrl = new URL(`${APIFY_API_BASE_URL}/acts/${actorId}/run-sync-get-dataset-items`);
  requestUrl.searchParams.set("timeout", "90");
  requestUrl.searchParams.set("memory", "4096");

  const response = await fetch(requestUrl.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      search: city,
      maxItems: limit,
      extractAdditionalHotelData: false,
      propertyType: "Hotels",
      sortBy: "review_score_and_price",
      currency: "EUR",
      language: "en-gb",
      checkIn: date,
      checkOut: checkoutDate,
      flexWindow: "0",
      rooms: 1,
      adults,
      children: 0,
      minMaxPrice: "0-999999",
    }),
  });
  const responseText = await response.text();

  if (!responseText.trim()) {
    throw new Error("Apify returned an empty Booking response.");
  }

  let data: any;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error("Apify returned an unreadable Booking response.");
  }

  if (!response.ok || data?.error) {
    throw new Error(`Apify Booking search error: ${JSON.stringify(data?.error || data)}`);
  }

  return normalizeApifyHotels(Array.isArray(data) ? data : data?.items || [], city, date, checkoutDate, adults, limit);
}

function normalizeApifyHotels(
  items: any[],
  city: string,
  date: string,
  checkoutDate: string,
  adults: number,
  limit: number,
): HotelResult[] {
  const seen = new Set<string>();
  const hotels: HotelResult[] = [];

  for (const item of items) {
    const name = cleanHotelName(item?.name || item?.title);
    const key = name.toLowerCase();

    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);
    const currency = String(item?.currency || item?.rooms?.[0]?.currency || "EUR");
    const price = Number(item?.price || item?.rooms?.find((room: any) => room?.available)?.price || 0);
    const rating = Number(item?.rating || 0);
    const address = String(item?.address?.full || item?.address || city);
    const latitude = Number(item?.location?.lat || item?.latitude || 0);
    const longitude = Number(item?.location?.lng || item?.longitude || 0);
    const bookingUrl = String(item?.url || buildBookingSearchUrl(name, city, date, checkoutDate, adults));

    hotels.push({
      id: String(item?.id || item?.hotelId || item?.order || `apify-${key}-${hotels.length + 1}`),
      name,
      rating: rating ? `${rating} / 10${item?.ratingLabel ? ` · ${item.ratingLabel}` : ""}` : "Booking rating",
      rateLabel: price ? `${formatHotelPrice(price, currency)} total` : "Check live price",
      address,
      city,
      date,
      checkoutDate,
      bookingUrl,
      googleHotelsUrl: buildGoogleHotelsUrl(name, city, date, checkoutDate, adults),
      tripadvisorUrl: buildTripadvisorUrl(name, city),
      mapsUrl: buildMapsUrl(name, latitude, longitude),
      provider: "apify-booking",
    });

    if (hotels.length >= limit) {
      break;
    }
  }

  return hotels;
}

function formatHotelPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: normalizeCurrencyCode(currency),
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${Math.round(price)}`;
  }
}

function normalizeCurrencyCode(currency: string) {
  const normalized = currency.toUpperCase().replace(/[^A-Z]/g, "");
  if (normalized === "US" || normalized === "USDOLLAR") return "USD";
  if (normalized === "EURO") return "EUR";
  return normalized.length === 3 ? normalized : "EUR";
}

async function searchHasDataHotels(
  apiKey: string,
  city: string,
  date: string,
  checkoutDate: string,
  adults: number,
  limit: number,
) {
  const requestUrl = new URL(HASDATA_GOOGLE_HOTELS_URL);
  requestUrl.searchParams.set("q", `Hotels in ${city}`);
  requestUrl.searchParams.set("checkInDate", date);
  requestUrl.searchParams.set("checkOutDate", checkoutDate);

  const response = await fetch(requestUrl.toString(), {
    headers: {
      "x-api-key": apiKey,
    },
  });
  const responseText = await response.text();

  if (!responseText.trim()) {
    throw new Error("HasData returned an empty hotel response.");
  }

  let data: any;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error("HasData returned an unreadable hotel response.");
  }

  if (!response.ok || data.error || data.requestMetadata?.status === "error") {
    throw new Error(`HasData hotel search error: ${JSON.stringify(data.error || data.requestMetadata || data)}`);
  }

  return normalizeHasDataHotels(data, city, date, checkoutDate, adults, limit);
}

function normalizeHasDataHotels(
  data: any,
  city: string,
  date: string,
  checkoutDate: string,
  adults: number,
  limit: number,
): HotelResult[] {
  const candidates = [
    data?.properties,
    data?.hotels,
    data?.results,
    data?.propertyResults,
    data?.searchResults,
    data?.accommodations,
  ].find((value) => Array.isArray(value)) || [];
  const seen = new Set<string>();
  const hotels: HotelResult[] = [];

  for (const candidate of candidates) {
    const name = cleanHotelName(candidate?.name || candidate?.title || candidate?.propertyName || candidate?.hotelName);
    const key = name.toLowerCase();

    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);
    const nightlyPrice = getPriceLabel(candidate?.ratePerNight || candidate?.rate_per_night || candidate?.nightlyPrice);
    const totalPrice = getPriceLabel(candidate?.totalRate || candidate?.total_rate || candidate?.totalPrice);
    const priceLabel = nightlyPrice
      ? `${nightlyPrice} / night`
      : totalPrice
        ? `${totalPrice} total`
        : getPriceLabel(candidate?.price) || "Check live price";
    const ratingValue = candidate?.overallRating || candidate?.overall_rating || candidate?.rating;
    const address = String(candidate?.address || candidate?.location?.address || candidate?.location || city);
    const directLink = candidate?.link || candidate?.bookingUrl || candidate?.booking_url || candidate?.website || "";
    const coordinates = candidate?.gpsCoordinates || candidate?.gps_coordinates || candidate?.coordinates || {};
    const latitude = Number(coordinates.latitude || coordinates.lat || 0);
    const longitude = Number(coordinates.longitude || coordinates.lng || coordinates.lon || 0);

    hotels.push({
      id: String(candidate?.propertyToken || candidate?.property_token || candidate?.id || `hasdata-${key}-${hotels.length + 1}`),
      name,
      rating: ratingValue ? `${ratingValue} / 5` : "Google Hotels rating",
      rateLabel: priceLabel,
      address,
      city,
      date,
      checkoutDate,
      bookingUrl: directLink || buildBookingSearchUrl(name, city, date, checkoutDate, adults),
      googleHotelsUrl: buildGoogleHotelsUrl(name, city, date, checkoutDate, adults),
      tripadvisorUrl: buildTripadvisorUrl(name, city),
      mapsUrl: buildMapsUrl(name, latitude, longitude),
      provider: "hasdata",
    });

    if (hotels.length >= limit) {
      break;
    }
  }

  return hotels;
}

function getPriceLabel(value: any) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return String(value.lowest || value.extractedLowest || value.extracted_lowest || value.beforeTaxesFees || value.before_taxes_fees || value.value || "");
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

async function searchGeoapifyHotels(city: string, date: string, checkoutDate: string, adults: number, limit: number) {
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

  return normalizeHotels(data?.features || [], city, date, checkoutDate, adults, limit);
}

function normalizeHotels(features: any[], city: string, date: string, checkoutDate: string, adults: number, limit: number): HotelResult[] {
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
      checkoutDate,
      bookingUrl: buildBookingSearchUrl(name, city, date, checkoutDate, adults),
      googleHotelsUrl: buildGoogleHotelsUrl(name, city, date, checkoutDate, adults),
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

function buildBookingSearchUrl(name: string, city: string, date: string, checkoutDate: string, adults: number) {
  const requestUrl = new URL("https://www.booking.com/searchresults.html");
  requestUrl.searchParams.set("ss", `${name}, ${city}`);
  requestUrl.searchParams.set("checkin", date);
  requestUrl.searchParams.set("checkout", checkoutDate);
  requestUrl.searchParams.set("group_adults", String(adults));
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

function buildGoogleHotelsUrl(name: string, city: string, date: string, checkoutDate: string, adults: number) {
  const requestUrl = new URL("https://www.google.com/travel/hotels");
  requestUrl.searchParams.set("q", `${name} ${city}`);
  requestUrl.searchParams.set("checkin", date);
  requestUrl.searchParams.set("checkout", checkoutDate);
  requestUrl.searchParams.set("adults", String(adults));
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

function createFallbackHotels(city: string, date: string, checkoutDate: string, adults: number): HotelResult[] {
  const names = [
    `${city} Central Hotel`,
    `${city} Boutique Stay`,
    `${city} Garden Residence`,
    `${city} Harbour Hotel`,
    `${city} Design Suites`,
    `${city} Station Hotel`,
    `${city} Apartment Hotel`,
    `${city} Spa Hotel`,
  ];

  return names.map((name, index) => ({
    id: `fallback-${city}-${index + 1}`,
    name,
    rating: "External rating",
    rateLabel: "Search live rates",
    address: city,
    city,
    date,
    checkoutDate,
    bookingUrl: buildBookingSearchUrl(name, city, date, checkoutDate, adults),
    googleHotelsUrl: buildGoogleHotelsUrl(name, city, date, checkoutDate, adults),
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
  const checkoutDate = String(body.checkoutDate || req.query?.checkoutDate || getCheckoutDate(date));
  const adults = Math.min(Math.max(Number(body.adults || req.query?.adults || 1) || 1, 1), 8);
  const limit = Math.min(Number(body.limit || req.query?.limit || 5) || 5, 10);

  if (!city) {
    res.status(400).json({ error: "city is required" });
    return;
  }

  try {
    const providerWarnings: string[] = [];
    const apifyToken = process.env.APIFY_TOKEN;
    const hasDataApiKey = process.env.HASDATA_API_KEY;

    if (apifyToken) {
      try {
        const apifyHotels = await searchApifyHotels(apifyToken, city, date, checkoutDate, adults, limit);

        if (apifyHotels.length) {
          res.status(200).json({
            provider: "apify-booking",
            city,
            hotels: apifyHotels,
            warning: "Live Booking.com prices via Apify; final inventory and payment are confirmed by Booking.com.",
          });
          return;
        }

        providerWarnings.push("Apify returned no Booking.com properties.");
      } catch (error: any) {
        providerWarnings.push(error?.message || "Apify Booking search failed.");
      }
    } else {
      providerWarnings.push("Apify token is not configured.");
    }

    if (hasDataApiKey) {
      try {
        const hasDataHotels = await searchHasDataHotels(hasDataApiKey, city, date, checkoutDate, adults, limit);

        if (hasDataHotels.length) {
          res.status(200).json({
            provider: "hasdata",
            city,
            hotels: hasDataHotels,
            warning: "Live hotel rates from Google Hotels via HasData; final inventory is confirmed by the booking provider.",
          });
          return;
        }

        providerWarnings.push("HasData returned no hotel properties.");
      } catch (error: any) {
        providerWarnings.push(error?.message || "HasData hotel search failed.");
      }
    } else {
      providerWarnings.push("HasData hotel key is not configured.");
    }

    const hotels = await searchGeoapifyHotels(city, date, checkoutDate, adults, limit);

    res.status(200).json({
      provider: "geoapify",
      city,
      hotels: hotels.length ? hotels : createFallbackHotels(city, date, checkoutDate, adults),
      warning: hotels.length
        ? providerWarnings.join(" ")
        : [...providerWarnings, "Geoapify returned no hotels; external search links were generated."].join(" "),
    });
  } catch (error: any) {
    res.status(200).json({
      provider: "fallback",
      city,
      hotels: createFallbackHotels(city, date, checkoutDate, adults),
      warning: error?.message || "Hotel search failed; external search links were generated.",
    });
  }
}
