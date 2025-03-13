const apiKey = "6MeXOfGABChBThe1jaanIcv1kz7RbP4T";

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
  //Button searches
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
      displayEvents(data._embedded.events);
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
    const venue = event._embedded?.venues?.[0]?.name || "Unknown Venue";

    html += `<li>
                    <strong>${name}</strong><br>
                    ${date} @ ${venue}
                 </li>`;
  });
  html += "</ul>";

  eventsContainer.innerHTML = html;
}
