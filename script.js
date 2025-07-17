// Primary station ID
const station1 = 'KDMA';

// Secondary station ID
const station2 = 'QHVA3';

// Weather alert zone ID
const alertZone = 'AZZ504'; 

async function fetchStationProps(stationId) {
  const url = `https://api.weather.gov/stations/${stationId}/observations/latest`;
  const response = await fetch(url);
  const data = await response.json();
  return data.properties;
}

async function getWeather() {
  try {
    const primaryProps = await fetchStationProps(station1);
    let tempC = primaryProps.temperature.value;
    let dewpointC = primaryProps.dewpoint.value;

    // If either value is missing, fetch from fallback
    if (tempC === null || dewpointC === null) {
      console.warn("Fetching fallback data from secondary station for missing values...");
      const fallbackProps = await fetchStationProps(station2);

      if (tempC === null) {
        tempC = fallbackProps.temperature.value;
      }

      if (dewpointC === null) {
        dewpointC = fallbackProps.dewpoint.value;
      }
    }

    const tempF = tempC !== null ? (tempC * 9 / 5) + 32 : null;
    const dewpointF = dewpointC !== null ? (dewpointC * 9 / 5) + 32 : null;

    document.getElementById("temp").textContent = tempF !== null
      ? `Temperature: ${tempF.toFixed(0)}°F`
      : "Temperature: N/A";

    document.getElementById("dew").textContent = dewpointF !== null
      ? `Dewpoint: ${dewpointF.toFixed(0)}°F`
      : "Dewpoint: N/A";

    document.getElementById("desc").textContent = primaryProps.textDescription || "Conditions unknown";

    const iconEl = document.getElementById("icon");
    if (primaryProps.icon) {
      iconEl.src = primaryProps.icon;
      iconEl.alt = primaryProps.textDescription || "Weather icon";
    } else {
      iconEl.remove();
    }

  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.getElementById("desc").textContent = "Unable to load weather.";
  }
}

async function getAlerts() {
  const zoneId = alertZone; // Forecast zone for the area
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
