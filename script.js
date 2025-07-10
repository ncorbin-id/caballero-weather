async function getWeather() {
  try {
    const response = await fetch('https://api.weather.gov/stations/KDMA/observations/latest');
    const data = await response.json();
    const props = data.properties;

    const tempC = props.temperature.value;
    const dewpointC = props.dewpoint.value;

    const tempF = tempC !== null ? (tempC * 9 / 5) + 32 : null;
    const dewpointF = dewpointC !== null ? (dewpointC * 9 / 5) + 32 : null;

    document.getElementById("temp").textContent = tempF !== null
      ? `Temperature: ${tempF.toFixed(0)}°F`
      : "Temperature: N/A";

    document.getElementById("dew").textContent = dewpointF !== null
      ? `Dewpoint: ${dewpointF.toFixed(0)}°F`
      : "Dewpoint: N/A";

    document.getElementById("desc").textContent = props.textDescription || "Conditions unknown";

    const iconEl = document.getElementById("icon");
    if (props.icon) {
      iconEl.src = props.icon;
      iconEl.alt = props.textDescription || "Weather icon";
    } else {
      iconEl.remove();
    }

  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.getElementById("desc").textContent = "Unable to load weather.";
  }
}

async function getAlerts() {
  const zoneId = "AZZ504"; // Forecast zone for the area
  try {
    const response = await fetch(`https://api.weather.gov/alerts/active/zone/${zoneId}`);
    const data = await response.json();

    const alertsContainer = document.getElementById("alerts");
    alertsContainer.innerHTML = "";

    if (data.features.length === 0) {
      alertsContainer.textContent = "No active weather alerts.";
      return;
    }

    const alertData = data.features[0].properties; // renamed from `alert`
    const eventName = alertData.event;
    const message = `${alertData.description || ""}\n\n${alertData.instruction || ""}`.trim();

    const link = document.createElement("a");
    link.textContent = eventName;
    link.href = "#";
    link.onclick = (e) => {
  e.preventDefault();
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modal-text");
  modalText.textContent = message || "No further details available.";
  modal.classList.remove("hidden");
};

document.getElementById("close-modal").onclick = () => {
  document.getElementById("modal").classList.add("hidden");
};


    alertsContainer.appendChild(link);

  } catch (err) {
    console.error("Alert fetch failed", err);
    document.getElementById("alerts").textContent = "Unable to load alerts.";
  }
}


getWeather();
getAlerts();
