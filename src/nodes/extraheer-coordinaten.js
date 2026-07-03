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

function normTekst(x) {
  return String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function levAfstand(a, b) {
  var m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  var prev = [], cur = [];
  for (var j = 0; j <= n; j++) prev[j] = j;
  for (var i = 1; i <= m; i++) {
    cur[0] = i;
    for (var k = 1; k <= n; k++) {
      cur[k] = Math.min(prev[k] + 1, cur[k-1] + 1, prev[k-1] + (a[i-1] === b[k-1] ? 0 : 1));
    }
    var t = prev; prev = cur; cur = t;
  }
  return prev[n];
}
// Is deze Mapbox-match geloofwaardig voor de gezochte plaatsnaam? Zie ook
// 'Corrigeer geocoding': weigert catch-all fuzzy matches (zoals de "15 South
// African Military base" voor elke onvindbare Zuid-Afrika-query) zonder goede
// matches met een niet-matchend regiodeel te straffen ("Ponta do Sol, Santo Antao").
function matchGeloofwaardig(plaatsNaam, feature) {
  var qw = normTekst(plaatsNaam).split(/[^a-z0-9]+/).filter(function(w){ return w.length >= 4; });
  if (qw.length === 0) qw = normTekst(plaatsNaam).split(/[^a-z0-9]+/).filter(Boolean);
  var doel = normTekst((feature.text || '') + ' ' + (feature.place_name || '') + ' ' + (feature.matching_text || ''));
  var fw = doel.split(/[^a-z0-9]+/).filter(Boolean);
  for (var i = 0; i < qw.length; i++) {
    for (var j = 0; j < fw.length; j++) {
      if (fw[j].indexOf(qw[i]) !== -1 || qw[i].indexOf(fw[j]) !== -1) return true;
      if (qw[i].length >= 5 && fw[j].length >= 5 && levAfstand(qw[i], fw[j]) <= 2) return true;
    }
  }
  return feature.relevance === 1;
}

return mapboxItems.map(function(item, i) {
  const dest = destinationItems[i] ? destinationItems[i].json : {};

  let features = [];
  try {
    const raw = item.json.data;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    features = parsed.features || [];
  } catch(e) {}

  // Weiger ongeloofwaardige fuzzy-matches: beter geen pin dan een stille foute pin.
  if (features.length > 0) {
    const plaatsDeel = String(dest.destination_geocode || dest.destination || '').split(',')[0];
    if (!matchGeloofwaardig(plaatsDeel, features[0])) {
      features = [];
    }
  }

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
        country_code: dest.country_code || null,
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
      country_code: dest.country_code || vindCountryCode(features[0])
    }
  };
});