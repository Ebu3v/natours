/*eslint-disable */
export const displayMap = (locations) => {
  maptilersdk.config.apiKey = document.getElementById('map').dataset.key;

  const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.OUTDOOR,
    // center: locations[0],
    // zoom: 5,
  });

  // Extend map bounds to include current location
  const bounds = new maptilersdk.LngLatBounds();
  locations.forEach((loc) => bounds.extend(loc.coordinates));

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });

  // Create and Add Marker
  for (let i = 0; i < locations.length; i++) {
    const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(
      `<p>Day ${locations[i].day}: ${locations[i].description} </P>`,
    );

    new maptilersdk.Marker()
      .setLngLat(locations[i].coordinates)
      .setPopup(popup)
      .addTo(map);
  }
};
