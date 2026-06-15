const items = $input.all();
const token = 'REDACTED_MAPBOX_PUBLIC_TOKEN';
const base = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

function mediaan(arr) {
  const s = arr.slice().sort(function(a,b){ return a-b; });
  const n = s.length;
  if (!n) return 0;
  return n % 2 ? s[(n-1)/2] : (s[n/2-1] + s[n/2]) / 2;
}
function afstand(aLng, aLat, bLng, bLat) {
  const dx = aLng - bLng, dy = aLat - bLat;
  return Math.sqrt(dx*dx + dy*dy);
}
function vindCountryCode(feature) {
  try {
    if (feature.place_type && feature.place_type.indexOf('country') !== -1) {
      return (feature.properties && feature.properties.short_code) ? feature.properties.short_code.toUpperCase() : null;
    }
    if (feature.context) {
      const c = feature.context.find(function(x){ return x.id && x.id.indexOf('country') === 0; });
      if (c && c.short_code) return c.short_code.toUpperCase();
    }
  } catch(e) {}
  return null;
}

const out = [];
for (const item of items) {
  const route = item.json.route || [];
  const valid = route.filter(function(s){ return s.latitude != null && s.longitude != null; });

  // robuust middelpunt van de reis (mediaan is ongevoelig voor 1 foute uitschieter)
  const medLat = mediaan(valid.map(function(s){ return s.latitude; }));
  const medLng = mediaan(valid.map(function(s){ return s.longitude; }));

  for (const s of route) {
    const q = encodeURIComponent((s.destination_geocode || s.destination) + ', ' + (s.country || ''));
    const url = base + q + '.json';
    let resp;
    try {
      resp = await this.helpers.httpRequest({
        method: 'GET',
        url: url,
        qs: { access_token: token, limit: 1, types: 'place,region,country,locality', proximity: medLng + ',' + medLat },
        json: true
      });
    } catch(e) { continue; }

    const f = resp && resp.features && resp.features[0];
    if (!f || !f.center) continue;
    const newLng = f.center[0], newLat = f.center[1];

    if (s.latitude == null || s.longitude == null) {
      // had geen coordinaten: red de stop met het proximity-resultaat
      s.longitude = newLng; s.latitude = newLat;
      s.place_name = f.place_name;
      s.country_code = vindCountryCode(f) || s.country_code;
      continue;
    }

    const dOud = afstand(s.longitude, s.latitude, medLng, medLat);
    const dNieuw = afstand(newLng, newLat, medLng, medLat);
    // alleen verplaatsen als het nieuwe punt DUIDELIJK dichter bij de route ligt
    // (correcte verre stops zoals Kruger blijven zo onaangeroerd)
    if (dNieuw < dOud - 0.05) {
      s.longitude = newLng; s.latitude = newLat;
      s.place_name = f.place_name;
      s.country_code = vindCountryCode(f) || s.country_code;
    }
  }

  out.push({ json: Object.assign({}, item.json, { route: route }) });
}
return out;