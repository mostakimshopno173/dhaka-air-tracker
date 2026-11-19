const areas = {
  mirpur: { name: "Mirpur, Dhaka", lat: 23.8042, lon: 90.3667 },
  uttara: { name: "Uttara, Dhaka", lat: 23.8759, lon: 90.3795 },
  dhanmondi: { name: "Dhanmondi, Dhaka", lat: 23.7461, lon: 90.3742 },
  gulshan: { name: "Gulshan, Dhaka", lat: 23.7925, lon: 90.4078 },
  motijheel: { name: "Motijheel, Dhaka", lat: 23.7330, lon: 90.4172 }
};

// তোমার নিজের রিসার্চ আর্টিকেলগুলো এখানে যোগ করবে (নতুন আর্টিকেল লিখলে এই অ্যারেতে একটি অবজেক্ট বাড়িয়ে দিলেই হবে)
const articles = [
  {
    title: "Why Winter Smog Peaks in Dense Zones Like Mirpur",
    author: "Project Maintainer (Draft Note)",
    date: "November 2026",
    summary: "An initial observation note looking at seasonal wind patterns, construction dust, and traffic density across Dhaka neighborhoods."
  },
  {
    title: "How Students Can Track Local Air Data Responsibly",
    author: "Project Maintainer (Methodology)",
    date: "November 2026",
    summary: "A short guide on reading PM2.5 values, understanding thresholds, and keeping environmental notes organized."
  }
];

let map;
let markers = {};

function initMap() {
  map = L.map("map").setView([areas.mirpur.lat, areas.mirpur.lon], 11.5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  Object.keys(areas).forEach((key) => {
    const area = areas[key];
    const marker = L.marker([area.lat, area.lon]).addTo(map);
    marker.bindPopup(`<b>${area.name}</b><br>Loading...`);
    marker.on("click", () => {
      document.getElementById("areaSelect").value = key;
      loadAreaData(key);
    });
    markers[key] = marker;
  });
}

function getStatusInfo(pm25) {
  if (pm25 <= 15) return { label: "Good", color: "#15803d", bg: "#dcfce7", msg: "Air quality is relatively clean for outdoor activities." };
  if (pm25 <= 55) return { label: "Moderate", color: "#a16207", bg: "#fef9c3", msg: "Sensitive groups should consider limiting prolonged outdoor exertion." };
  if (pm25 <= 150) return { label: "Unhealthy", color: "#c2410c", bg: "#ffedd5", msg: "Wear a mask outdoors and reduce long exposure in heavy traffic." };
  return { label: "Very Unhealthy / Hazardous", color: "#b91c1c", bg: "#fee2e2", msg: "High risk! Avoid unnecessary outdoor exposure and wear a protective mask." };
}

async function loadAreaData(areaKey) {
  const area = areas[areaKey];
  document.getElementById("areaTitle").innerText = area.name;

  try {
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${area.lat}&longitude=${area.lon}&current=pm2_5`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${area.lat}&longitude=${area.lon}&current=temperature_2m,relative_humidity_2m`;

    const [airRes, weatherRes] = await Promise.all([fetch(airUrl), fetch(weatherUrl)]);
    const airData = await airRes.json();
    const weatherData = await weatherRes.json();

    const pm25 = airData.current.pm2_5;
    const temp = weatherData.current.temperature_2m;
    const humidity = weatherData.current.relative_humidity_2m;

    document.getElementById("pm25Value").innerText = pm25;
    document.getElementById("tempText").innerText = `Temperature: ${temp} °C | Humidity: ${humidity} %`;

    const status = getStatusInfo(pm25);
    const badge = document.getElementById("badge");
    badge.innerText = status.label;
    badge.style.color = status.color;
    badge.style.background = status.bg;

    const adviceEl = document.getElementById("healthAdvice");
    adviceEl.innerText = status.msg;
    adviceEl.style.color = status.color;

    if (map && markers[areaKey]) {
      map.setView([area.lat, area.lon], 12);
      markers[areaKey].bindPopup(`<b>${area.name}</b><br>PM2.5: ${pm25} µg/m³ (${status.label})`).openPopup();
    }
  } catch (err) {
    document.getElementById("pm25Value").innerText = "N/A";
    document.getElementById("healthAdvice").innerText = "Could not fetch live data right now.";
  }
}

function renderArticles() {
  const listEl = document.getElementById("articleList");
  listEl.innerHTML = articles.map((art) => `
    <div class="article-item">
      <h3>${art.title}</h3>
      <div class="article-meta">By ${art.author} • ${art.date}</div>
      <p>${art.summary}</p>
    </div>
  `).join("");
}

function toggleSubmitBox() {
  document.getElementById("submitBox").classList.toggle("hidden");
}

document.getElementById("areaSelect").addEventListener("change", (e) => {
  loadAreaData(e.target.value);
});

document.getElementById("refreshBtn").addEventListener("click", () => {
  const currentKey = document.getElementById("areaSelect").value;
  loadAreaData(currentKey);
});

initMap();
renderArticles();
loadAreaData("mirpur");