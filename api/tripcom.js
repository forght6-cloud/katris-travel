"use strict";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const city = String(body.city || "").trim();
  const date = String(body.date || "");
  const checkoutDate = String(body.checkoutDate || date);
  const limit = Math.min(Number(body.limit) || 5, 10);

  if (!city) {
    res.status(400).json({ error: "city is required" });
    return;
  }

  const hotels = [
    "Trip Central Hotel",
    "Trip Boutique Stay",
    "Trip Design Suites",
    "Trip Station Hotel",
    "Trip Quiet Residence",
    "Trip Spa Hotel",
    "Trip Garden Residence",
    "Trip Harbour Hotel",
  ].slice(0, limit).map((label, index) => ({
    id: `tripcom-placeholder-${index + 1}`,
    name: `${city} ${label}`,
    rating: "Placeholder rating",
    rateLabel: "Placeholder rate",
    address: city,
    city,
    date,
    checkoutDate,
    bookingUrl: `https://www.trip.com/hotels/list?city=${encodeURIComponent(city)}`,
    googleHotelsUrl: `https://www.google.com/travel/hotels?q=${encodeURIComponent(`${city} hotels`)}`,
    tripadvisorUrl: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(`${city} hotels`)}`,
    mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${city} hotels`)}`,
    provider: "placeholder-tripcom",
  }));

  res.status(200).json({
    provider: "placeholder-tripcom",
    city,
    hotels,
    warning: "This is a placeholder response. Trip.com integration is not connected in this phase.",
  });
};
