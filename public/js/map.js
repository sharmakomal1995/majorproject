const mapDiv = document.getElementById("map");

if (mapDiv) {
  const coordinates = JSON.parse(mapDiv.dataset.coordinates);
  const token = mapDiv.dataset.token;

  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 8
  });

  new mapboxgl.Marker()
    .setLngLat(coordinates)
    .addTo(map);
}
