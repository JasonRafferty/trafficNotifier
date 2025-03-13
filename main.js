const apiKey = "6MeXOfGABChBThe1jaanIcv1kz7RbP4T";

// Import venues database
import { venueCapacities } from "./venues.js";

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

// Helper to parse "HH:MM" into minutes from midnight
function parseTimeString(timeStr) {
  // e.g., "14:30" => 14 * 60 + 30 = 870
  const [hh, mm] = timeStr.split(":");
  return parseInt(hh) * 60 + parseInt(mm);
}

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

function displayEvents(events, userTimeInMins) {
  const eventsContainer = document.getElementById("events");
  eventsContainer.innerHTML = "";

  if (!events || events.length === 0) {
    eventsContainer.innerHTML = "<p>No events found for today.</p>";
    return;
  }

  let html = "<ul>";

  events.forEach((event) => {
    const name = event.name || "Unnamed Event";
    const date = event.dates?.start?.localDate || "Unknown Date";
    const startTimeStr = event.dates?.start?.localTime || "00:00:00";
    const startTimeInMins = parseTimeString(startTimeStr.slice(0, 5));

    // Check if there's an actual end time
    let endTimeStr = event.dates?.end?.localTime;
    let endTimeInMins;

    // Determine if venue is football/music for estimated times
    const venueId = event._embedded?.venues?.[0]?.id;
    const venueInfo = venueCapacities[venueId]; // e.g., { capacity, type }

    if (endTimeStr && endTimeStr !== "00:00:00") {
      endTimeInMins = parseTimeString(endTimeStr.slice(0, 5));
    } else {
      // Estimate based on type
      if (venueInfo?.type === "football") {
        endTimeInMins = startTimeInMins + 120; // 2 hours
      } else if (venueInfo?.type === "rugby") {
        endTimeInMins = startTimeInMins + 120; // 3 hours
      } else if (venueInfo?.type === "cricket") {
        endTimeInMins = startTimeInMins + 180; // 3 hours
      } else {
        endTimeInMins = startTimeInMins + 120; // 3 hours
      }
      endTimeStr = "";
    }

    // Decide if we highlight this event
    let highlight = false;
    if (typeof userTimeInMins === "number") {
      // highlight if userTimeInMins is within [start-60, end+60]
      if (
        userTimeInMins >= startTimeInMins - 60 &&
        userTimeInMins <= endTimeInMins + 60
      ) {
        highlight = true;
      }
    }

    // Build HTML for this event
    html += `
      <li style="${highlight ? "background-color: yellow;" : ""}">
        <strong>${name}</strong><br>
        Date: ${date}<br>
        Starts: ${startTimeStr !== "00:00:00" ? startTimeStr : "TBA"}
        ${
          endTimeStr && endTimeStr !== "00:00:00"
            ? `<br>Ends: ${endTimeStr}`
            : ""
        }
      </li>
    `;
  });

  html += "</ul>";
  eventsContainer.innerHTML = html;
}
