const mapDiv = document.getElementById("map");

if (mapDiv) {
  const coordinates = JSON.parse(mapDiv.dataset.coordinates);
  const token = mapDiv.dataset.token;

  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 9,
  });

  const marker = new mapboxgl.Marker()
    .setLngLat(coordinates)
    .addTo(map);

  const countryInput = document.getElementById("country");
  const stateInput = document.getElementById("state");
  const cityInput = document.getElementById("city");

  async function updateMap() {
    const country = countryInput.value;
    const state = stateInput.value;
    const city = cityInput.value;

    if (!country || !state || !city) return;

    const query = `${city}, ${state}, ${country}`;

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}`
    );

    const data = await response.json();

    if (data.features.length > 0) {
      const newCoordinates = data.features[0].geometry.coordinates;

      marker.setLngLat(newCoordinates);

      map.flyTo({
        center: newCoordinates,
        zoom: 13,
      });
    }
  }

  countryInput.addEventListener("change", updateMap);
  stateInput.addEventListener("change", updateMap);
  cityInput.addEventListener("change", updateMap);
}
