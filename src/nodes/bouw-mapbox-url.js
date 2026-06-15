const items = $input.all();
return items.map(function(item, index) {
  const destinationGeocode = item.json.destination_geocode || item.json.destination;
  const country = item.json.country;
  const searchText = encodeURIComponent(destinationGeocode + ', ' + country);
  const mapboxUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + searchText + '.json';
  return {
    json: {
      _index: index,
      order: item.json.order,
      destination: item.json.destination,
      destination_geocode: destinationGeocode,
      country: country,
      days: item.json.days,
      type: item.json.type || 'destination',
      transport: item.json.transport || 'car',
      bekendheid: item.json.bekendheid || 1,
      url: item.json.url || '',
      mapboxUrl: mapboxUrl
    }
  };
});