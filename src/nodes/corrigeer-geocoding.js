const items = $input.all();
const token = 'REDACTED_MAPBOX_PUBLIC_TOKEN';
const base = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

var ISO = {
  'thailand':'TH','laos':'LA','cambodia':'KH','vietnam':'VN','myanmar':'MM','burma':'MM',
  'malaysia':'MY','indonesia':'ID','singapore':'SG','philippines':'PH','japan':'JP',
  'china':'CN','india':'IN','nepal':'NP','bhutan':'BT','sri lanka':'LK','bangladesh':'BD',
  'mongolia':'MN','turkmenistan':'TM','uzbekistan':'UZ','kazakhstan':'KZ','kyrgyzstan':'KG',
  'tajikistan':'TJ','south korea':'KR','taiwan':'TW',
  'south africa':'ZA','eswatini':'SZ','swaziland':'SZ','lesotho':'LS','namibia':'NA',
  'botswana':'BW','zimbabwe':'ZW','zambia':'ZM','tanzania':'TZ','kenya':'KE','uganda':'UG',
  'rwanda':'RW','mozambique':'MZ','malawi':'MW','madagascar':'MG','morocco':'MA','tunisia':'TN',
  'egypt':'EG','jordan':'JO','israel':'IL','ethiopia':'ET','ghana':'GH','senegal':'SN',
  'cape verde':'CV','cabo verde':'CV','mauritius':'MU','seychelles':'SC',
  'greece':'GR','italy':'IT','spain':'ES','portugal':'PT','france':'FR','croatia':'HR',
  'germany':'DE','austria':'AT','switzerland':'CH','netherlands':'NL','belgium':'BE',
  'united kingdom':'GB','uk':'GB','ireland':'IE','iceland':'IS','norway':'NO','sweden':'SE',
  'finland':'FI','denmark':'DK','turkey':'TR','turkiye':'TR','georgia':'GE','armenia':'AM',
  'azerbaijan':'AZ','albania':'AL','montenegro':'ME','slovenia':'SI','poland':'PL',
  'czech republic':'CZ','czechia':'CZ','hungary':'HU','romania':'RO','bulgaria':'BG',
  'peru':'PE','argentina':'AR','chile':'CL','brazil':'BR','bolivia':'BO','ecuador':'EC',
  'colombia':'CO','venezuela':'VE','uruguay':'UY','paraguay':'PY','guatemala':'GT',
  'costa rica':'CR','panama':'PA','nicaragua':'NI','honduras':'HN','belize':'BZ',
  'mexico':'MX','cuba':'CU','dominican republic':'DO','jamaica':'JM',
  'united states':'US','usa':'US','united states of america':'US','canada':'CA',
  'australia':'AU','new zealand':'NZ','fiji':'FJ','french polynesia':'PF','samoa':'WS',
  'vanuatu':'VU','papua new guinea':'PG','oman':'OM','united arab emirates':'AE','uae':'AE',
  'saudi arabia':'SA','qatar':'QA','iran':'IR','pakistan':'PK','afghanistan':'AF'
};
function landIso(land) { var k = (land || '').toLowerCase().trim(); return ISO[k] || ''; }

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
    const iso = landIso(s.country);
    // forceer een betrouwbare country_code (stuurt de ingekleurde landen op de kaart aan)
    if (iso) { s.country_code = iso; }

    const q = encodeURIComponent((s.destination_geocode || s.destination) + ', ' + (s.country || ''));
    const url = base + q + '.json';
    // 'poi' erbij zodat kloosters/natuurplekken matchen; 'country' weggelaten (geen heel-land-terugval)
    var qs = { access_token: token, limit: 1, types: 'place,locality,poi,region', proximity: medLng + ',' + medLat };
    // per-stop landfilter: de pin kan nooit buiten het opgegeven land vallen
    if (iso) { qs.country = iso.toLowerCase(); }

    let resp;
    try {
      resp = await this.helpers.httpRequest({ method: 'GET', url: url, qs: qs, json: true });
    } catch(e) { continue; }

    const f = resp && resp.features && resp.features[0];
    if (!f || !f.center) continue;
    const newLng = f.center[0], newLat = f.center[1];

    if (s.latitude == null || s.longitude == null) {
      s.longitude = newLng; s.latitude = newLat;
      s.place_name = f.place_name;
      s.country_code = iso || vindCountryCode(f) || s.country_code;
      continue;
    }

    const dOud = afstand(s.longitude, s.latitude, medLng, medLat);
    const dNieuw = afstand(newLng, newLat, medLng, medLat);
    // alleen verplaatsen als het nieuwe punt DUIDELIJK dichter bij de route ligt
    if (dNieuw < dOud - 0.05) {
      s.longitude = newLng; s.latitude = newLat;
      s.place_name = f.place_name;
      s.country_code = iso || vindCountryCode(f) || s.country_code;
    }
  }

  // --- opschoon-vangnet: verwijder overduidelijk foute pins (beter geen pin dan een verkeerde) ---
  function rond(v){ return Math.round(v * 100) / 100; }
  const geldig2 = route.filter(function(s){ return s.latitude != null && s.longitude != null; });
  if (geldig2.length >= 4) {
    const cLat = mediaan(geldig2.map(function(s){ return s.latitude; }));
    const cLng = mediaan(geldig2.map(function(s){ return s.longitude; }));
    const spreiding = mediaan(geldig2.map(function(s){ return afstand(s.longitude, s.latitude, cLng, cLat); })) || 0.0001;
    // tel hoeveel VERSCHILLENDE plaatsnamen op exact hetzelfde (afgeronde) punt liggen
    const perPunt = {};
    geldig2.forEach(function(s){
      const k = rond(s.longitude) + ',' + rond(s.latitude);
      if (!perPunt[k]) perPunt[k] = {};
      perPunt[k][(s.destination || '').toLowerCase().trim()] = true;
    });
    route.forEach(function(s){
      if (s.latitude == null || s.longitude == null) return;
      const k = rond(s.longitude) + ',' + rond(s.latitude);
      const aantalNamen = Object.keys(perPunt[k] || {}).length;
      const d = afstand(s.longitude, s.latitude, cLng, cLat);
      const stapel = aantalNamen >= 3;
      const uitschieter = d > 6 && d > 5 * spreiding;
      if (stapel || uitschieter) { s.latitude = null; s.longitude = null; }
    });
  }

  out.push({ json: Object.assign({}, item.json, { route: route }) });
}
return out;