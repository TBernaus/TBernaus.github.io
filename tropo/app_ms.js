const msStations = [
  {
    code: "MS22",
    altitude: 2281,
    utmX: 464171.6003,
    utmY: 4104678.0697,
  },
  {
    code: "MS23",
    altitude: 2439,
    utmX: 464030.156,
    utmY: 4103813.5504,
  },
  {
    code: "MS24",
    altitude: 2964,
    utmX: 466583.6472,
    utmY: 4101991.5984,
  },
  {
    code: "MS25",
    altitude: 2775,
    utmX: 465753.7132,
    utmY: 4101416.1044,
  },
  {
    code: "MS28",
    altitude: 2799,
    utmX: 465628.5134,
    utmY: 4102112.0918,
  },
  {
    code: "MS32",
    altitude: 2723,
    utmX: 465829.0729,
    utmY: 4102739.1072,
  },
  {
    code: "MS83",
    altitude: 2339,
    utmX: 464205.0601,
    utmY: 4104385.9425,
  },
  {
    code: "SN-RT",
    name: "Sierra Nevada, Radiotelescopio",
    altitude: 2856,
    lat: 37.06306,
    lon: -3.38694,
  },
  {
    code: "SN-PN",
    name: "Pradollano, Parque Nacional Sierra Nevada",
    altitude: 3092,
    lat: 37.06444,
    lon: -3.37139,
  },
  {
    code: "PRADOLLANO",
    name: "Pradollano AEMET",
    altitude: 2500,
    lat: 37.09389,
    lon: -3.39139,
    isAemet: true,
    idema: "5511"
  }
];

const AEMET_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtcnVzaW5vbEB0cm9wb3NmZXJpY2EuY29tIiwianRpIjoiZGIyNDkzNjQtOTA3MS00NjExLWIwZjMtZTBlN2RlMGUyZGIzIiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE3NDc4MTQ2MDAsInVzZXJJZCI6ImRiMjQ5MzY0LTkwNzEtNDYxMS1iMGYzLWUwZTdkZTBlMmRiMyIsInJvbGUiOiIifQ.ML6ciatRj9WzAHeJM6qoXamNxomP-sGw0kahW9DS4dc";

// Proxy CORS per permetre crides a l'API AEMET des del navegador
const CORS_PROXY = "https://corsproxy.io/?";

const aemetDataCache = {};

async function fetchAemetData(idema) {
  if (aemetDataCache[idema]) {
    return aemetDataCache[idema];
  }

  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 4);
    const startDate = new Date(endDate);
    
    const formatDate = (date) => date.toISOString().split('T')[0] + 'T00:00:00UTC';
    const fechaIni = formatDate(startDate);
    const fechaFin = formatDate(endDate);
    
    const apiUrl = `https://opendata.aemet.es/opendata/api/valores/climatologicos/diarios/datos/fechaini/${fechaIni}/fechafin/${fechaFin}/estacion/${idema}`;
    
    // Primera crida amb proxy CORS
    const response1 = await fetch(CORS_PROXY + encodeURIComponent(apiUrl), {
      headers: {
        'api_key': AEMET_API_KEY
      }
    });
    
    if (!response1.ok) {
      throw new Error(`Error en la primera petició: ${response1.status}`);
    }
    
    const metaData = await response1.json();
    
    if (!metaData.datos) {
      throw new Error('No s\'ha rebut URL de dades');
    }
    
    // Segona crida amb proxy CORS
    const response2 = await fetch(CORS_PROXY + encodeURIComponent(metaData.datos));
    
    if (!response2.ok) {
      throw new Error(`Error en obtenir dades: ${response2.status}`);
    }
    
    const climaData = await response2.json();
    
    if (climaData && climaData.length > 0) {
      const latestData = climaData[climaData.length - 1];
      aemetDataCache[idema] = latestData;
      return latestData;
    }
    
    return null;
  } catch (error) {
    console.error('Error obtenint dades AEMET:', error);
    return null;
  }
}

const utm30 = "+proj=utm +zone=30 +datum=WGS84 +units=m +no_defs";
const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";
const highestAltitude = Math.max(...msStations.map((station) => station.altitude));

function lngLatToUtm(lon, lat) {
  const [utmX, utmY] = proj4(wgs84, utm30, [lon, lat]);
  return { utmX, utmY };
}

function utmToLngLat({ utmX, utmY }) {
  const [lon, lat] = proj4(utm30, wgs84, [utmX, utmY]);
  return { lon, lat };
}

function getStationCoords(station) {
  if (station.lat !== undefined && station.lon !== undefined) {
    return { lon: station.lon, lat: station.lat };
  }
  return utmToLngLat(station);
}

function createMsStyle(styleId) {
  const base = {
    background: "#0b1724",
    entries: {
      topo: {
        tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
        attribution:
          'Mapa © <a href="https://www.opentopomap.org" target="_blank" rel="noopener noreferrer">OpenTopoMap</a> (CC-BY-SA)',
        maxzoom: 17,
      },
      classic: {
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        attribution:
          'Mapes © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxzoom: 19,
      },
      satellite: {
        tiles: [
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        attribution:
          'Imatge © <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> & contributors',
        maxzoom: 18,
        background: "#020509",
      },
    },
  };

  const styleEntry = base.entries[styleId] ?? base.entries.topo;

  return {
    version: 8,
    sources: {
      base: {
        type: "raster",
        tiles: styleEntry.tiles,
        tileSize: 256,
        maxzoom: styleEntry.maxzoom,
        attribution: styleEntry.attribution,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": styleEntry.background ?? base.background },
      },
      {
        id: "base",
        type: "raster",
        source: "base",
        minzoom: 0,
        maxzoom: styleEntry.maxzoom,
        paint: { "raster-opacity": styleId === "satellite" ? 1 : 0.96 },
      },
    ],
  };
}

function ensureMsTerrain(map) {
  const sourceId = "terrain-dem";
  const terrainSource = map.getSource(sourceId);
  const config = {
    type: "raster-dem",
    tiles: [
      "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
    ],
    tileSize: 256,
    maxzoom: 15,
    encoding: "terrarium",
  };

  if (!terrainSource) {
    map.addSource(sourceId, config);
  }
  map.setTerrain({ source: sourceId, exaggeration: 1.6 });
}

function buildMsPopup(station, aemetData = null) {
  const percentage = Math.round((station.altitude / highestAltitude) * 100);
  const geographic = getStationCoords(station);
  const latAbs = Math.abs(geographic.lat).toFixed(5);
  const lonAbs = Math.abs(geographic.lon).toFixed(5);
  const latHemisphere = geographic.lat >= 0 ? "N" : "S";
  const lonHemisphere = geographic.lon >= 0 ? "E" : "O";
  
  let utmX, utmY;
  if (station.utmX !== undefined && station.utmY !== undefined) {
    utmX = station.utmX;
    utmY = station.utmY;
  } else {
    const utm = lngLatToUtm(geographic.lon, geographic.lat);
    utmX = utm.utmX;
    utmY = utm.utmY;
  }
  
  const stationName = station.name || station.code;

  let aemetSection = '';
  if (aemetData) {
    aemetSection = `
      <section class="aemet-data">
        <h4>Dades climatològiques (${aemetData.fecha || 'N/A'})</h4>
        <dl class="aemet-values">
          <div>
            <dt>Temp. màxima</dt>
            <dd>${aemetData.tmax !== undefined ? aemetData.tmax + ' °C' : 'N/A'}</dd>
          </div>
          <div>
            <dt>Temp. mínima</dt>
            <dd>${aemetData.tmin !== undefined ? aemetData.tmin + ' °C' : 'N/A'}</dd>
          </div>
          <div>
            <dt>Humitat màxima</dt>
            <dd>${aemetData.hrMax !== undefined ? aemetData.hrMax + ' %' : 'N/A'}</dd>
          </div>
          <div>
            <dt>Humitat mínima</dt>
            <dd>${aemetData.hrMin !== undefined ? aemetData.hrMin + ' %' : 'N/A'}</dd>
          </div>
          <div>
            <dt>Pressió màxima</dt>
            <dd>${aemetData.presMin !== undefined ? aemetData.presMin + ' hPa' : 'N/A'}</dd>
          </div>
          <div>
            <dt>Pressió mínima</dt>
            <dd>${aemetData.presMax !== undefined ? aemetData.presMax + ' hPa' : 'N/A'}</dd>
          </div>
        </dl>
      </section>
    `;
  }

  return `
    <article class="popup">
      <header>
        <h3>${stationName}</h3>
        <p class="subtitle">Sierranevada · ${station.code}</p>
      </header>
      <section class="altitude">
        <div class="altitude-label">
          <span>Altitud</span>
          <strong>${station.altitude.toLocaleString("ca-ES")} m</strong>
        </div>
        <div class="altitude-meter" aria-hidden="true">
          <span style="width: ${percentage}%"></span>
        </div>
      </section>
      ${aemetSection}
      <dl>
        <div>
          <dt>Coordenades UTM (Zona 30N)</dt>
          <dd>${utmX.toLocaleString("ca-ES")} E, ${utmY.toLocaleString("ca-ES")} N</dd>
        </div>
        <div>
          <dt>GEO</dt>
          <dd>
            ${latAbs} ${latHemisphere}, ${lonAbs} ${lonHemisphere}
          </dd>
        </div>
      </dl>
    </article>
  `;
}

const msMarkerStore = [];
let msActiveMarker = null;
let msMapInstance = null;
let msCurrentFilter = "all";

function filterByAltitude(station, filterValue) {
  if (filterValue === "alt-2600") {
    return station.altitude >= 2600;
  }
  if (filterValue === "alt-2400-2599") {
    return station.altitude >= 2400 && station.altitude < 2600;
  }
  if (filterValue === "alt-2300-2399") {
    return station.altitude >= 2300 && station.altitude < 2400;
  }
  return true;
}

function updateMsStats(visibleStations) {
  const summary = document.getElementById("statsSummaryMs");
  if (!summary) return;

  const total = visibleStations.length;
  const avgAltitude =
    total > 0
      ? Math.round(
          visibleStations.reduce((acc, item) => acc + item.altitude, 0) / total
        )
      : 0;
  const maxStation = visibleStations.reduce(
    (acc, item) => (item.altitude > acc.altitude ? item : acc),
    visibleStations[0] ?? msStations[0]
  );

  summary.innerHTML = `
    <div class="stat-pill">
      <span>Estacions visibles</span>
      <strong>${total}</strong>
    </div>
    <div class="stat-pill">
      <span>Altitud mitjana</span>
      <strong>${avgAltitude.toLocaleString("ca-ES")} m</strong>
    </div>
    <div class="stat-pill">
      <span>Altitud màxima</span>
      <strong>${maxStation ? `${maxStation.code} · ${maxStation.altitude.toLocaleString("ca-ES")} m` : "-"}</strong>
    </div>
  `;
}

function applyMsFilter(filterValue) {
  msCurrentFilter = filterValue;
  const visible = [];

  msMarkerStore.forEach((entry) => {
    const show = filterByAltitude(entry.station, filterValue);
    entry.element.style.display = show ? "" : "none";
    if (!show && msActiveMarker && msActiveMarker.station === entry.station) {
      entry.element.classList.remove("is-active");
      if (entry.marker.getPopup()) {
        entry.marker.getPopup().remove();
      }
      msActiveMarker = null;
    }
    if (show) {
      visible.push(entry.station);
    }
  });

  updateMsStats(visible);
}

function highlightMsMarker(entry) {
  if (msActiveMarker) {
    msActiveMarker.element.classList.remove("is-active");
  }
  msActiveMarker = entry;
  entry.element.classList.add("is-active");
}

async function focusMsStation(code) {
  if (!code) return;
  const target = msStations.find((station) => station.code.toLowerCase() === code.toLowerCase());
  if (!target) return;

  if (!filterByAltitude(target, msCurrentFilter)) {
    const filterSelect = document.getElementById("filterSelectMs");
    if (filterSelect) {
      filterSelect.value = "all";
    }
    applyMsFilter("all");
  }

  const entry = msMarkerStore.find(({ station }) => station === target);
  if (!entry || !msMapInstance) return;

  highlightMsMarker(entry);
  const { lng, lat } = entry.marker.getLngLat();
  msMapInstance.easeTo({
    center: [lng, lat],
    zoom: Math.max(msMapInstance.getZoom(), 11),
    duration: 900,
  });
  
  const popup = entry.marker.getPopup();
  if (popup) {
    popup.setLngLat([lng, lat]).addTo(msMapInstance);
  }
}

function populateMsDatalist() {
  const datalist = document.getElementById("stationsListMs");
  if (!datalist) return;
  const fragment = document.createDocumentFragment();
  msStations.forEach((station) => {
    const option = document.createElement("option");
    option.value = station.code;
    fragment.appendChild(option);
  });
  datalist.textContent = "";
  datalist.appendChild(fragment);
}

async function initMsMap() {
  const map = new maplibregl.Map({
    container: "mapMs",
    style: createMsStyle("topo"),
    center: [-3.38, 37.06],
    zoom: 12,
    pitch: 0,
    bearing: 0,
  });
  msMapInstance = map;

  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }));

  map.on("load", async () => {
    ensureMsTerrain(map);

    if (msMarkerStore.length === 0) {
      const bounds = new maplibregl.LngLatBounds();

      // Primer, carregar les dades AEMET de totes les estacions que ho necessiten
      console.log("Carregant dades de l'AEMET...");
      const aemetPromises = msStations
        .filter(station => station.isAemet && station.idema)
        .map(station => fetchAemetData(station.idema));
      
      await Promise.all(aemetPromises);
      console.log("Dades de l'AEMET carregades");

      for (const station of msStations) {
        const { lon, lat } = getStationCoords(station);
        bounds.extend([lon, lat]);
        const markerEl = document.createElement("div");
        markerEl.className = "station-marker";
        if (station.isAemet) {
          markerEl.classList.add("aemet-marker");
        }
        const stationName = station.name || station.code;
        markerEl.title = `${stationName} · ${station.altitude} m`;

        let aemetData = null;
        if (station.isAemet && station.idema) {
          aemetData = aemetDataCache[station.idema] || null;
        }

        const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(
          buildMsPopup(station, aemetData)
        );

        const marker = new maplibregl.Marker({ element: markerEl })
          .setLngLat([lon, lat])
          .setPopup(popup)
          .addTo(map);

        const entry = { station, marker, element: markerEl, popup, aemetData };
        markerEl.addEventListener("click", () => {
          highlightMsMarker(entry);
        });
        msMarkerStore.push(entry);
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, maxZoom: 12.5, duration: 1200 });
      }
      applyMsFilter(msCurrentFilter);
    }
  });

  const toggleButton = document.getElementById("toggleViewMs");
  let is3d = false;
  toggleButton?.addEventListener("click", () => {
    is3d = !is3d;
    map.easeTo({
      pitch: is3d ? 60 : 0,
      bearing: is3d ? 20 : 0,
      duration: 700,
    });
    toggleButton.textContent = is3d ? "Canvia a vista 2D" : "Canvia a vista 3D";
  });

  const styleSelect = document.getElementById("styleSelectMs");
  styleSelect?.addEventListener("change", (event) => {
    const value = event.target.value;
    const onStyleLoad = () => {
      map.off("style.load", onStyleLoad);
      ensureMsTerrain(map);
      applyMsFilter(msCurrentFilter);
      if (msActiveMarker) {
        msActiveMarker.element.classList.add("is-active");
        const coords = msActiveMarker.marker.getLngLat();
        msActiveMarker.marker.getPopup()?.setLngLat([coords.lng, coords.lat]).addTo(map);
      }
    };
    map.on("style.load", onStyleLoad);
    map.setStyle(createMsStyle(value));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateMsDatalist();
  initMsMap();
  updateMsStats(msStations);

  const filterSelect = document.getElementById("filterSelectMs");
  filterSelect?.addEventListener("change", (event) => {
    applyMsFilter(event.target.value);
  });

  const searchInput = document.getElementById("searchInputMs");
  searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      focusMsStation(searchInput.value);
    }
  });
  searchInput?.addEventListener("change", () => {
    focusMsStation(searchInput.value);
  });
});