"use strict";

const PLACE_CATALOG = {
  manchester: [
    { name: "Manchester Art Gallery", category: "Placeholder", summary: "Placeholder place result for MVP serverless mode.", address: "Mosley Street, Manchester, M2 3JL", mapsUrl: "https://www.google.com/maps/search/Manchester%20Art%20Gallery" },
    { name: "Manchester Piccadilly Station", category: "Placeholder", summary: "Placeholder transit anchor for MVP serverless mode.", address: "Piccadilly Station, Manchester, M60 7RA", mapsUrl: "https://www.google.com/maps/search/Manchester%20Piccadilly%20Station" },
  ],
  "new york": [
    { name: "The Metropolitan Museum of Art", category: "Placeholder", summary: "Placeholder culture anchor for MVP serverless mode.", address: "1000 5th Ave, New York, NY 10028", mapsUrl: "https://www.google.com/maps/search/The%20Metropolitan%20Museum%20of%20Art" },
    { name: "Chelsea Market", category: "Placeholder", summary: "Placeholder food stop for MVP serverless mode.", address: "75 9th Ave, New York, NY 10011", mapsUrl: "https://www.google.com/maps/search/Chelsea%20Market" },
  ],
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const city = String(body.city || "").trim();
  const limit = Math.min(Number(body.limit) || 5, 10);

  if (!city) {
    res.status(400).json({ error: "city is required" });
    return;
  }

  const places = (PLACE_CATALOG[city.toLowerCase()] || [
    {
      name: `${city} main district`,
      category: "Placeholder",
      summary: "Placeholder places endpoint for MVP serverless mode.",
      address: city,
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${city} attractions`)}`,
    },
  ]).slice(0, limit);

  res.status(200).json({
    provider: "placeholder-google-places",
    city,
    places,
    warning: "This is a placeholder response. Live Google Places integration is not connected in this phase.",
  });
};
