const apiKey = "6MeXOfGABChBThe1jaanIcv1kz7RbP4T";

//Import venues database
import { venueCapacities } from "./venues.js";

//Event listener on button blick
const city = document
  .getElementById("inputButton")
  .addEventListener("click", fetchTodaysEvents);

// Event listener on enter being clicked
document
  .getElementById("inputSearchBar")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      fetchTodaysEvents();
    }
  });

async function fetchTodaysEvents() {
  const city = document.getElementById("inputSearchBar").value.trim();
  const countryCode = "GB";

  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const startDateTime = `${today}T00:00:00Z`;
  const endDateTime = `${today}T23:59:59Z`;

  // Ticketmaster API URL to fetch today's events in Manchester
  const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&countryCode=${countryCode}&startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch events");

    const data = await response.json();

    if (data._embedded && data._embedded.events) {
      // Filter events based on venue capacity
      const filteredEvents = data._embedded.events.filter((event) => {
        const venueId = event._embedded?.venues?.[0]?.id;
        const venueCapacity = venueCapacities[venueId]; // Get capacity from venues.js

        return venueCapacity; // Only allow venues with capacity >= 20,000
      });
      displayEvents(filteredEvents);
    } else {
      displayEvents([]);
    }
  } catch (error) {
    console.error("Error fetching today's events:", error);
    displayEvents([]); // Show empty message on error
  }
}

// Function to display events on the webpage
function displayEvents(events) {
  const eventsContainer = document.getElementById("events");

  if (!eventsContainer) {
    console.error("No element with ID 'events' found.");
    return;
  }

  eventsContainer.innerHTML = ""; // Clear previous content

  if (events.length === 0) {
    eventsContainer.innerHTML = "<p>No events found for today.</p>";
    return;
  }

  let html = "<ul>";
  events.forEach((event) => {
    const name = event.name || "Unnamed Event";
    const date = event.dates?.start?.localDate || "Unknown Date";
    const startTime = event.dates?.start?.localTime || "TBA";
    const endTime = event.dates?.end?.localTime || "No end time";

    html += `
      <li>
        <strong>${name}</strong><br>
        Date: ${date}<br>
        Starts: ${startTime}<br>
        Ends: ${endTime}
      </li>
    `;
  });
  html += "</ul>";

  eventsContainer.innerHTML = html;
}
