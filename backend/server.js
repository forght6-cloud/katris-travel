const http = require("http");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");

loadEnv(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 4000);
const AMADEUS_TEST_BASE_URL = "https://test.api.amadeus.com";
const AMADEUS_PRODUCTION_BASE_URL = "https://api.amadeus.com";
const GEOAPIFY_GEOCODING_URL = "https://api.geoapify.com/v1/geocode/search";
const GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places";

const CITY_CENTER_MAP = {
  bergen: { lat: 60.3913, lon: 5.3221 }, copenhagen: { lat: 55.6761, lon: 12.5683 },
  oslo: { lat: 59.9139, lon: 10.7522 }, stockholm: { lat: 59.3293, lon: 18.0686 },
  helsinki: { lat: 60.1699, lon: 24.9384 }, reykjavik: { lat: 64.1466, lon: -21.9426 },
  paris: { lat: 48.8566, lon: 2.3522 }, london: { lat: 51.5072, lon: -0.1276 },
  "new york": { lat: 40.7128, lon: -74.006 }, tokyo: { lat: 35.6762, lon: 139.6503 },
};

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
    if (!match || line.trim().startsWith("#")) continue;
    const value = (match[2] || "").replace(/^['"]|['"]$/g, "");
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

function send(res, status, data, extraHeaders = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...corsHeaders(), ...extraHeaders });
  res.end(JSON.stringify(data));
}
function corsHeaders() { return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" }; }
async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  const route = new URL(req.url, `http://${req.headers.host}`).pathname;
  try {
    if (req.method === "GET" && route === "/health") return send(res, 200, { status: "ok" });
    if (req.method !== "POST") return send(res, 404, { error: "Not found" });
    const body = await readJson(req);
    if (route === "/api/generate-plan" || route === "/api/ai/plan") return send(res, 200, await generatePlan(body));
    if (route === "/api/amadeus" || route === "/api/flights/search") return send(res, 200, await amadeusSearch(body));
    if (route === "/api/google-places" || route === "/api/places/search") return send(res, 200, await placesSearch(body));
    if (route === "/api/booking" || route === "/api/hotels/search") return send(res, 200, await bookingSearch(body));
    if (route === "/api/tripcom") return send(res, 200, tripcomLinks(body));
    return send(res, 404, { error: "Not found" });
  } catch (error) { send(res, 200, { provider: "fallback", warning: error.message, ...fallbackForRoute(route, req) }); }
});

async function generatePlan(payload) {
  if (!process.env.OPENAI_API_KEY) return { provider: "fallback", plan: buildFallbackPlan(payload), warning: "OpenAI key is not configured; local structured fallback returned." };
  const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", messages: [{ role: "system", content: "Return concise JSON for a travel execution plan." }, { role: "user", content: JSON.stringify(payload) }], response_format: { type: "json_object" } }) });
  if (!response.ok) throw new Error(`OpenAI request failed: ${await response.text()}`);
  const data = await response.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
  return { provider: "openai", model: process.env.OPENAI_MODEL || "gpt-4o-mini", plan: normalizePlan(parsed, payload) };
}
function buildFallbackPlan(payload) {
  const p = payload.planner || payload;
  const destination = p.to || "Nordic destination";
  return normalizePlan({ title: `${destination} travel execution draft`, summary: "Structured fallback plan generated without exposing API keys in the browser." }, payload);
}
function normalizePlan(plan, payload) {
  const p = payload.planner || payload;
  const destination = p.to || "destination";
  return { title: plan.title || `${destination} travel plan`, summary: plan.summary || `A calm, executable plan for ${destination}.`, cities: plan.cities || [], bookingNotes: plan.bookingNotes || ["Confirm flight, hotel, and timed-entry requirements before purchase."], uiSections: plan.uiSections || { travelOverview: `【旅行总览】\n${p.from || "Origin"} → ${destination}; ${p.tripLength || "flexible length"}; ${p.people || 1} traveler(s).`, dailyPlan: "【每日计划】\nDay 1 arrival and low-pressure orientation. Day 2 core sights with rest buffers. Day 3 flexible neighborhood route.", budgetAdvice: `【预算分配建议】\nBudget style: ${p.budget || "Balanced"}.`, transportAndHotels: "【交通与住宿建议】\nUse live search cards for flight and stay decisions.", internalSearchParams: `【站内查价参数】\nDestination=${destination}; Date=${p.date || "not set"}.`, shortVideoKeywords: `【短视频攻略关键词】\n${destination} calm itinerary, design hotel, scenic route`, ticketTextParsing: "【文本购票解析】\n未提供购票文本。", risks: "【风险与提醒】\nCheck weather, opening hours, and transfer margins before departure." } };
}

async function amadeusSearch(body) {
  const { origin, destination, departDate, adults = 1 } = body;
  if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) return { provider: "fallback", offers: mockFlights(origin, destination, departDate), warning: "Amadeus keys are not configured." };
  const base = process.env.AMADEUS_ENV === "production" ? AMADEUS_PRODUCTION_BASE_URL : AMADEUS_TEST_BASE_URL;
  const tokenResponse = await fetch(`${base}/v1/security/oauth2/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "client_credentials", client_id: process.env.AMADEUS_CLIENT_ID, client_secret: process.env.AMADEUS_CLIENT_SECRET }) });
  if (!tokenResponse.ok) throw new Error("Amadeus token failed");
  const token = (await tokenResponse.json()).access_token;
  const url = new URL(`${base}/v2/shopping/flight-offers`);
  Object.entries({ originLocationCode: origin, destinationLocationCode: destination, departureDate: departDate, adults, max: 6, currencyCode: "EUR" }).forEach(([k, v]) => url.searchParams.set(k, String(v || "")));
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("Amadeus search failed");
  const data = await response.json();
  return { provider: "amadeus", offers: (data.data || []).map(normalizeOffer) };
}
function normalizeOffer(offer) { return { id: offer.id, price: { total: Number(offer.price?.total || 0), currency: offer.price?.currency || "EUR" }, itineraries: (offer.itineraries || []).map(i => ({ duration: i.duration || "", segments: (i.segments || []).map(s => ({ from: s.departure?.iataCode, to: s.arrival?.iataCode, departureAt: s.departure?.at, arrivalAt: s.arrival?.at })) })), carriers: [] }; }
function mockFlights(origin = "ORIGIN", destination = "DEST", date = "") { return [8, 13, 21].map((h, i) => ({ id: `mock-${i+1}`, price: { total: [420, 360, 290][i], currency: "EUR", label: "Estimated" }, bookingUrl: "", itineraries: [{ duration: ["PT7H20M", "PT9H10M", "PT11H45M"][i], segments: [{ from: origin, to: destination, departureAt: `${date || "2026-07-01"}T${String(h).padStart(2,"0")}:00:00`, arrivalAt: `${date || "2026-07-01"}T${String((h+[7,9,11][i])%24).padStart(2,"0")}:20:00` }] }], carriers: [{ code: "KT", name: "Katris sample fare" }] })); }

async function geocodeCity(city) { const known = CITY_CENTER_MAP[String(city || "").trim().toLowerCase()]; if (known) return known; const key = process.env.GEOAPIFY_GEOCODING_API_KEY || process.env.GEOAPIFY_PLACES_API_KEY; if (!key) throw new Error("Geoapify key is not configured"); const url = new URL(GEOAPIFY_GEOCODING_URL); url.searchParams.set("text", city); url.searchParams.set("limit", "1"); url.searchParams.set("format", "json"); url.searchParams.set("apiKey", key); const data = await (await fetch(url)).json(); return { lat: data.results?.[0]?.lat, lon: data.results?.[0]?.lon }; }
async function placesSearch(body) { if (!process.env.GEOAPIFY_PLACES_API_KEY) return { provider: "fallback", places: mockPlaces(body.city), warning: "Geoapify key is not configured." }; const c = await geocodeCity(body.city); const url = new URL(GEOAPIFY_PLACES_URL); url.searchParams.set("categories", "tourism.sights,tourism.attraction,entertainment.museum"); url.searchParams.set("filter", `circle:${c.lon},${c.lat},14000`); url.searchParams.set("limit", String(body.limit || 5)); url.searchParams.set("apiKey", process.env.GEOAPIFY_PLACES_API_KEY); const data = await (await fetch(url)).json(); return { provider: "geoapify", places: (data.features || []).map(placeFromFeature).slice(0, body.limit || 5) }; }
function placeFromFeature(f) { const p = f.properties || {}; const coords = f.geometry?.coordinates || []; return { id: p.place_id || p.name, name: p.name || p.address_line1 || p.formatted, category: (p.categories || ["Place"])[0], summary: p.formatted || "Local recommendation", address: p.formatted || "", mapsUrl: `https://www.google.com/maps/search/?api=1&query=${coords[1]},${coords[0]}` }; }
function mockPlaces(city = "Destination") { return ["Old Quarter", "Waterfront", "Design Museum", "Market Hall", "Scenic Lookout"].map((name, i) => ({ id: `place-${i}`, name: `${city} ${name}`, category: "Recommendation", summary: "Fallback place until live places API is configured.", address: city, mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${city} ${name}`)}` })); }
function bookingSearch(body) { const city = body.city || "Destination"; return { provider: "booking-links", hotels: ["Central Hotel", "Boutique Stay", "Garden Residence", "Harbour Hotel", "Design Suites"].slice(0, body.limit || 5).map((name, i) => hotelLink(`${city} ${name}`, city, body.date, i)), warning: process.env.GEOAPIFY_PLACES_API_KEY ? "Booking direct API not configured; returning search links." : "Booking API key is not configured; returning safe external search links." }; }
function hotelLink(name, city, date = "") { const booking = new URL("https://www.booking.com/searchresults.html"); booking.searchParams.set("ss", `${name}, ${city}`); if (date) booking.searchParams.set("checkin", date); return { id: name, name, rating: "External rating", rateLabel: "Search live rates", address: city, city, date, bookingUrl: booking.toString(), googleHotelsUrl: `https://www.google.com/travel/hotels?q=${encodeURIComponent(`${name} ${city}`)}`, tripadvisorUrl: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(`${name} ${city}`)}`, mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${city}`)}`, provider: "booking-links" }; }
function tripcomLinks(body) { return { provider: "tripcom-links", links: [{ label: "Trip.com hotel search", url: `https://www.trip.com/hotels/list?city=${encodeURIComponent(body.city || "")}` }, { label: "Trip.com flight search", url: "https://www.trip.com/flights/" }] }; }
function fallbackForRoute(route) { if (route.includes("amadeus") || route.includes("flights")) return { offers: mockFlights() }; if (route.includes("places")) return { places: mockPlaces() }; if (route.includes("booking") || route.includes("hotels")) return bookingSearch({}); return { plan: buildFallbackPlan({}) }; }

server.listen(PORT, () => console.log(`Katris backend listening on http://localhost:${PORT}`));
