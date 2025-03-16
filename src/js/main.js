const apiKey = "6MeXOfGABChBThe1jaanIcv1kz7RbP4T";

// Import venues database
import { venueCapacities } from "./venues.js";
import { displayEvents } from "./displayEvents.js";
import { parseTimeString } from "./timeUtils.js";

// Event listener on button click
document
  .getElementById("inputButton")
  .addEventListener("click", fetchEventsByDate);

// Event listener on pressing Enter
document
  .getElementById("inputSearchBar")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      fetchEventsByDate();
    }
  });

// Set the date input to today's date on load
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("dateInput");
  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd format
  dateInput.value = today;
});

// Time button logic
document.getElementById("timeButton")?.addEventListener("click", () => {
  fetchEventsByDate();
});

// Parse user time input (hh:mm) to minutes
function getUserTimeInMins() {
  const timeInput = document.getElementById("timeInput");
  if (timeInput && timeInput.value) {
    return parseTimeString(timeInput.value);
  }
  return undefined;
}

// Fetch events for user-selected date
async function fetchEventsByDate() {
  const city = document.getElementById("inputSearchBar").value.trim();

  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  const dateInput = document.getElementById("dateInput").value;
  if (!dateInput) {
    alert("Please select a date.");
    return;
  }

  // Build start/end times from the chosen date
  const startDateTime = `${dateInput}T00:00:00Z`;
  const endDateTime = `${dateInput}T23:59:59Z`;

  // We'll parse the user time here so we can pass it to displayEvents
  const userTimeInMins = getUserTimeInMins();

  // Ticketmaster API URL to fetch events on the chosen date
  const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch events");

    const data = await response.json();

    console.log("API Response Data:", data);

    //Debug to stop events with incorrect date showing up
    if (data._embedded && data._embedded.events) {
      let allEvents = data._embedded.events;
      // 2. Filter out events that don’t match chosen date exactly
      let filteredEvents = allEvents.filter((event) => {
        return event.dates.start.localDate === dateInput;
      });

      displayEvents(filteredEvents, userTimeInMins);
    } else {
      displayEvents([], userTimeInMins);
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    displayEvents([], undefined);
  }
}
