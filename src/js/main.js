const apiKey = "6MeXOfGABChBThe1jaanIcv1kz7RbP4T";

// Import venues database
import { venueCapacities } from "./venues.js";
import { displayEvents } from "./displayEvents.js";
import { parseTimeString } from "./timeUtils.js";

// Event listener on button click
document
  .getElementById("inputButton")
  .addEventListener("click", fetchTodaysEvents);

// Event listener on pressing Enter
document
  .getElementById("inputSearchBar")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      fetchTodaysEvents();
    }
  });

// Also listen to the "timeButton" if you want to highlight events by time
document.getElementById("timeButton")?.addEventListener("click", () => {
  // Re-display events with userTimeInMins
  // We'll store or parse userTimeInMins in fetchTodaysEvents
  fetchTodaysEvents();
});

function getUserTimeInMins() {
  const timeInput = document.getElementById("timeInput");
  if (timeInput && timeInput.value) {
    return parseTimeString(timeInput.value);
  }
  return undefined;
}

async function fetchTodaysEvents() {
  const city = document.getElementById("inputSearchBar").value.trim();
  const countryCode = "GB";

  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  // We'll parse the user time here so we can pass it to displayEvents
  const userTimeInMins = getUserTimeInMins();
  const today = new Date().toISOString().split("T")[0];
  const startDateTime = `${today}T00:00:00Z`;
  const endDateTime = `${today}T23:59:59Z`;

  // Ticketmaster API URL to fetch today's events
  const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&countryCode=${countryCode}&startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch events");

    const data = await response.json();

    if (data._embedded && data._embedded.events) {
      // Filter events based on venue capacity (optional)
      const filteredEvents = data._embedded.events.filter((event) => {
        const venueId = event._embedded?.venues?.[0]?.id;
        // If there's no venue ID or capacity, exclude it
        if (!venueId || !venueCapacities[venueId]) return false;

        return venueCapacities[venueId].capacity >= 20000;
      });

      // Display events, passing userTimeInMins to highlight
      displayEvents(filteredEvents, userTimeInMins);
    } else {
      displayEvents([], userTimeInMins);
    }
  } catch (error) {
    console.error("Error fetching today's events:", error);
    displayEvents([], undefined);
  }
}
