const mapboxItems = $input.all();
const destinationItems = $('Bouw Mapbox URL').all();

function vindCountryCode(feature) {
  try {
    if (feature.place_type && feature.place_type.indexOf('country') !== -1) {
      return (feature.properties && feature.properties.short_code) ? feature.properties.short_code.toUpperCase() : null;
    }
    if (feature.context) {
      const c = feature.context.find(function(x) { return x.id && x.id.indexOf('country') === 0; });
      if (c && c.short_code) return c.short_code.toUpperCase();
    }
  } catch(e) {}
  return null;
}

return mapboxItems.map(function(item, i) {
  const dest = destinationItems[i] ? destinationItems[i].json : {};

  let features = [];
  try {
    const raw = item.json.data;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    features = parsed.features || [];
  } catch(e) {}

  if (!features || features.length === 0) {
    return {
      json: {
        order: dest.order,
        destination: dest.destination,
        destination_geocode: dest.destination_geocode || dest.destination,
        country: dest.country,
        days: dest.days,
        type: dest.type || 'destination',
        transport: dest.transport || 'car',
        bekendheid: dest.bekendheid || 1,
        day_label: dest.day_label || '',
        url: dest.url || '',
        latitude: null,
        longitude: null,
        place_name: null,
        country_code: null,
        error: 'Geen coordinaten gevonden'
      }
    };
  }

  return {
    json: {
      order: dest.order,
      destination: dest.destination,
      destination_geocode: dest.destination_geocode || dest.destination,
      country: dest.country,
      days: dest.days,
      type: dest.type || 'destination',
      transport: dest.transport || 'car',
      bekendheid: dest.bekendheid || 1,
      day_label: dest.day_label || '',
      url: dest.url || '',
      latitude: features[0].center[1],
      longitude: features[0].center[0],
      place_name: features[0].place_name,
      country_code: vindCountryCode(features[0])
    }
  };
});