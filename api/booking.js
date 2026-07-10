"use strict";

function buildBookingUrl(name, city, checkin, checkout, adults) {
  const url = new URL("https://www.booking.com/searchresults.html");
  url.searchParams.set("ss", `${name}, ${city}`);
  url.searchParams.set("checkin", checkin);
  url.searchParams.set("checkout", checkout);
  url.searchParams.set("group_adults", String(adults || 1));
  url.searchParams.set("no_rooms", "1");
  url.searchParams.set("group_children", "0");
  return url.toString();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const city = String(body.city || "").trim();
  const date = String(body.date || "");
  const checkoutDate = String(body.checkoutDate || date);
  const adults = Number(body.adults) || 1;
  const limit = Math.min(Number(body.limit) || 5, 10);

  if (!city) {
    res.status(400).json({ error: "city is required" });
    return;
  }

  const hotels = [
    "Central Hotel",
    "Boutique Stay",
    "Garden Residence",
    "Design Suites",
    "Station Hotel",
    "Apartment Hotel",
    "Spa Hotel",
    "Harbour Hotel",
  ].slice(0, limit).map((label, index) => {
    const name = `${city} ${label}`;
    return {
      id: `booking-placeholder-${index + 1}`,
      name,
      rating: "Placeholder rating",
      rateLabel: "Placeholder live-rate link",
      address: city,
      city,
      date,
      checkoutDate,
      bookingUrl: buildBookingUrl(name, city, date, checkoutDate, adults),
      googleHotelsUrl: `https://www.google.com/travel/hotels?q=${encodeURIComponent(`${name} ${city}`)}`,
      tripadvisorUrl: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(`${name} ${city}`)}`,
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${city}`)}`,
      provider: "placeholder-booking",
    };
  });

  res.status(200).json({
    provider: "placeholder-booking",
    city,
    hotels,
    warning: "This is a placeholder response. Booking.com partner API is not connected in this phase.",
  });
};
