document.addEventListener("DOMContentLoaded", function () {

  const mapDiv = document.getElementById("map");
  const latInput = document.getElementById("latitude");
  const lngInput = document.getElementById("longitude");

  if (!mapDiv || !latInput || !lngInput) {
    console.log("Map elements not found");
    return;
  }
  const mapToken = mapDiv.dataset.token;
  mapboxgl.accessToken = mapToken;

  const coordinates = JSON.parse(mapDiv.dataset.coordinates);

  let defaultLng = coordinates[0];
  let defaultLat = coordinates[1];

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: [defaultLng, defaultLat],
    zoom: 9
  });

  const marker = new mapboxgl.Marker({ draggable: true })
    .setLngLat([defaultLng, defaultLat])
    .addTo(map);

  const countryInput = document.getElementById("country");
  const stateInput = document.getElementById("state");
  const cityInput = document.getElementById("city");

  async function updateLocation() {
    const country = countryInput?.value || "";
    const state = stateInput?.value || "";
    const city = cityInput?.value || "";

    if (!country && !state && !city) return;

    const query = `${city}, ${state}, ${country}`;

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapToken}`
      );

      const data = await res.json();

      if (data.features.length > 0) {
        const [lng, lat] = data.features[0].center;

        map.flyTo({
          center: [lng, lat],
          zoom: 12
        });

        marker.setLngLat([lng, lat]);

        latInput.value = lat;
        lngInput.value = lng;
      }
    } catch (err) {
      console.log("Geocoding error:", err);
    }
  }

  countryInput?.addEventListener("change", updateLocation);
  stateInput?.addEventListener("change", updateLocation);
  cityInput?.addEventListener("change", updateLocation);
  
  latInput.value = Number(defaultLat);
  lngInput.value = Number(defaultLng);

  marker.on("dragend", function () {
    const lngLat = marker.getLngLat();
    latInput.value = Number(lngLat.lat);
    lngInput.value = Number(lngLat.lng);
  });

});
