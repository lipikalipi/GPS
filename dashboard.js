// 🔹 Replace with your building center coordinates
const CENTER_LAT = 12.364966;  
const CENTER_LNG = 76.601773;

// 🔹 Building-level safe radius (since accuracy was 216m)
const RADIUS = 300; 

let watchId = null;

document.addEventListener("DOMContentLoaded", () => {

  if (!navigator.geolocation) {
    document.getElementById("status").innerText =
      "Geolocation not supported.";
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    handlePosition,
    handleError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
});

function handlePosition(position) {

  const userLat = position.coords.latitude;
  const userLng = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  const distance = getDistance(
    userLat,
    userLng,
    CENTER_LAT,
    CENTER_LNG
  );

  document.getElementById("distance").innerText =
    "Distance from building: " + distance.toFixed(2) + " meters";

  document.getElementById("accuracy").innerText =
    "GPS Accuracy: " + accuracy.toFixed(2) + " meters";

  const statusEl = document.getElementById("status");

  // Low accuracy warning
  if (accuracy > 250) {
    statusEl.innerText = "Low GPS accuracy ⚠️";
    statusEl.className = "orange";
    return;
  }

  if (distance <= RADIUS) {
    statusEl.innerText = "Inside Building Zone ✅";
    statusEl.className = "green";
  } else {
    statusEl.innerText = "Outside Building Zone ❌";
    statusEl.className = "red";
  }
}

function handleError(error) {
  const statusEl = document.getElementById("status");

  switch(error.code) {
    case error.PERMISSION_DENIED:
      statusEl.innerText = "Location permission denied.";
      break;
    case error.POSITION_UNAVAILABLE:
      statusEl.innerText = "Location unavailable.";
      break;
    case error.TIMEOUT:
      statusEl.innerText = "Location request timed out.";
      break;
    default:
      statusEl.innerText = "Unknown error occurred.";
  }

  statusEl.className = "red";
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) *
    Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Stop tracking when leaving page
window.addEventListener("beforeunload", () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
});
