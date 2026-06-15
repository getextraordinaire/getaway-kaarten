const allItems = $input.all();

const tripMap = {};
allItems.forEach(function(item) {
  const url = item.json.url || '';
  if (!tripMap[url]) {
    tripMap[url] = [];
  }
  tripMap[url].push({
    order: item.json.order,
    destination: item.json.destination,
    destination_geocode: item.json.destination_geocode || item.json.destination,
    country: item.json.country,
    country_code: item.json.country_code || null,
    days: item.json.days,
    type: item.json.type || 'destination',
    transport: item.json.transport || 'unknown',
    bekendheid: item.json.bekendheid || 1,
    url: item.json.url || '',
    latitude: item.json.latitude,
    longitude: item.json.longitude,
    place_name: item.json.place_name
  });
});

return Object.keys(tripMap).map(function(url) {
  const route = tripMap[url].sort(function(a, b) { return a.order - b.order; });
  return {
    json: {
      URL: url,
      route: route,
      total_destinations: route.length,
      generated_at: new Date().toISOString()
    }
  };
});