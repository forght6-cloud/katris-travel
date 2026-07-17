import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const generatePlanHandler = require("../api/generate-plan.js");
const amadeusHandler = require("../api/amadeus.js");
const googlePlacesHandler = require("../api/google-places.js");
const bookingHandler = require("../api/booking.js");
const tripcomHandler = require("../api/tripcom.js");

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.ended = true;
      return this;
    },
    send(payload) {
      this.body = payload;
      this.ended = true;
      return this;
    },
  };
}

{
  const res = createMockResponse();
  await googlePlacesHandler({ method: "POST", body: { city: "Manchester", limit: 4 } }, res);
  assert.equal(res.statusCode, 200, "google-places placeholder should return 200.");
  assert.ok(Array.isArray(res.body.places), "google-places placeholder should return places.");
}

{
  const res = createMockResponse();
  await bookingHandler(
    { method: "POST", body: { city: "Manchester", date: "2026-07-01", checkoutDate: "2026-07-05", adults: 2, limit: 4 } },
    res,
  );
  assert.equal(res.statusCode, 200, "booking placeholder should return 200.");
  assert.ok(Array.isArray(res.body.hotels), "booking placeholder should return hotels.");
}

{
  const res = createMockResponse();
  await tripcomHandler(
    { method: "POST", body: { city: "Manchester", date: "2026-07-01", checkoutDate: "2026-07-05", adults: 2, limit: 4 } },
    res,
  );
  assert.equal(res.statusCode, 200, "tripcom placeholder should return 200.");
  assert.ok(Array.isArray(res.body.hotels), "tripcom placeholder should return hotels.");
}

{
  const res = createMockResponse();
  await amadeusHandler(
    { method: "POST", body: { origin: "LHR", destination: "FRA", departDate: "2026-07-01", adults: 1 } },
    res,
  );
  assert.equal(res.statusCode, 200, "amadeus handler should return 200.");
  assert.ok(Array.isArray(res.body.offers), "amadeus handler should return offers.");
}

{
  const previous = process.env.AMADEUS_USE_MOCK;
  process.env.AMADEUS_USE_MOCK = "true";
  const res = createMockResponse();
  await amadeusHandler(
    { method: "POST", body: { origin: "LHR", destination: "FRA", departDate: "2026-07-01", adults: 1 } },
    res,
  );
  assert.equal(res.statusCode, 200, "amadeus mock mode should return 200.");
  assert.equal(res.body.provider, "mock", "amadeus mock mode should force mock provider.");
  process.env.AMADEUS_USE_MOCK = previous;
}

{
  const res = createMockResponse();
  await generatePlanHandler(
    {
      method: "POST",
      body: {
        planner: {
          from: "London",
          to: "Frankfurt",
          date: "2026-07-01",
          tripLength: "5 nights",
          people: 2,
          budget: "1200 EUR",
          notes: "Quiet summer city break",
          pillars: ["Scenery", "Quiet stays"],
        },
        analysis: {
          stops: [{ city: "Frankfurt", date: "2026-07-01" }],
        },
      },
    },
    res,
  );
  assert.equal(res.statusCode, 200, "generate-plan handler should return 200.");
  assert.ok(res.body.plan, "generate-plan handler should return a plan payload.");
}

{
  const previous = process.env.OPENAI_USE_FALLBACK;
  process.env.OPENAI_USE_FALLBACK = "true";
  const res = createMockResponse();
  await generatePlanHandler(
    {
      method: "POST",
      body: {
        planner: {
          from: "London",
          to: "Frankfurt",
          date: "2026-07-01",
          tripLength: "5 nights",
          people: 2,
          budget: "1200 EUR",
        },
      },
    },
    res,
  );
  assert.equal(res.statusCode, 200, "generate-plan fallback mode should return 200.");
  assert.equal(res.body.provider, "fallback", "generate-plan fallback mode should force fallback provider.");
  process.env.OPENAI_USE_FALLBACK = previous;
}

console.log("vercel api routes ok");

for (const route of [
  "../api/flights/search.ts",
  "../api/hotels/search.ts",
  "../api/places/search.ts",
  "../api/ai/plan.ts",
]) {
  assert.ok(existsSync(new URL(route, import.meta.url)), `${route} should exist for the normalized browser data flow.`);
}
