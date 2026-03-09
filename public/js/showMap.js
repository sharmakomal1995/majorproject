const mapDiv = document.getElementById("map");

if (mapDiv) {
  const location = JSON.parse(mapDiv.dataset.location);
  const token = mapDiv.dataset.token;

  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: location.coordinates,
    zoom: 9,
  });

  new mapboxgl.Marker()
    .setLngLat(location.coordinates)
    .addTo(map);
}

