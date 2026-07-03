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

// ============================================================================
// DETERMINISTISCHE OVERRIDES: plekken die Mapbox (types=place,locality,region)
// structureel NIET kent: natuurgebieden, parken, kloosters, kleine dorpen.
// Deze vallen zonder tabel elke run van de kaart. Coordinaten geverifieerd via
// OpenStreetMap/Nominatim op 2026-07-02, met sanity-check op land en ligging.
// Formaat: 'lowercase naam' -> [lng, lat]. Match op destination_geocode EN
// destination; eerst de volledige string, daarna het deel voor de eerste komma
// (zodat "Sossusvlei, Namibia" ook matcht). Namen die elders in de wereld als
// grote stad bestaan (Dali, Huanggang, Ping'an) staan er ALLEEN met regio in,
// zodat een override nooit een andere reis kan breken.
// ============================================================================
var OVERRIDES = {
  // Zuidelijk Afrika
  'malealea': [27.6069, -29.8299],
  'lesotho': [28.25, -29.60],
  'sossusvlei': [15.2924, -24.7395],
  'sesriem': [15.7985, -24.4871],
  'namib desert': [15.7985, -24.4871],
  'namib woestijn': [15.7985, -24.4871],
  'fish river canyon': [17.6061, -27.6102],
  'spitzkoppe': [15.2044, -21.8488],
  'spitzkop': [15.2044, -21.8488],
  'brandberg': [14.5606, -21.1226],
  'ugab wilderness': [14.5606, -21.1226],
  'etosha national park': [15.9166, -19.1779],
  'etosha nationaal park': [15.9166, -19.1779],
  'etosha': [15.9166, -19.1779],
  'okaukuejo': [15.9166, -19.1779],
  'okavango delta': [22.9801, -19.154],
  'makgadikgadi pans': [24.8106, -20.5108],
  'makgadikgadi': [24.8106, -20.5108],
  'orange river': [17.618, -28.722],
  'oranje rivier': [17.618, -28.722],
  'felix unite orange river': [17.618, -28.722],
  'drakensberg': [29.1269, -28.6129],
  'drakensbergen': [29.1269, -28.6129],
  'royal natal national park': [28.8163, -28.5342],
  'royal natal nationaal park': [28.8163, -28.5342],
  'witsieshoek': [28.8163, -28.5342],
  'zululand': [32.2692, -28.0175],
  'kosi bay': [32.8248, -26.9591],
  'cape cross': [13.952, -21.7714],
  // IJsland
  'sn\u00e6fellsnes': [-22.819, 64.9035],
  'snaefellsnes': [-22.819, 64.9035],
  // Tibet
  'samye': [91.5024, 29.3266],
  'samye monastery': [91.5024, 29.3266],
  'rongbuk': [86.8282, 28.1952],
  'rongbuk monastery': [86.8282, 28.1952],
  'tsetang': [91.7672, 29.2441],
  'reting': [91.5135, 30.3106],
  'reting monastery': [91.5135, 30.3106],
  'tradruk': [91.7722, 29.1937],
  'tradruk monastery': [91.7722, 29.1937],
  'tradruk klooster': [91.7722, 29.1937],
  // Mongolie
  'uran togoo': [102.7355, 48.997],
  'terkhiin tsagaan': [99.6577, 48.1574],
  'terkhiin tsagaan lake': [99.6577, 48.1574],
  'terkhiin tsagaan nuur': [99.6577, 48.1574],
  'tuvkhun': [102.2559, 47.013],
  'tuvkhun monastery': [102.2559, 47.013],
  'tuvkhun khiid': [102.2559, 47.013],
  'tovkhon monastery': [102.2559, 47.013],
  'ongi monastery': [104.0062, 45.3402],
  'ongiin khiid': [104.0062, 45.3402],
  'ongi khiid': [104.0062, 45.3402],
  'khongoryn els': [102.1719, 43.7708],
  'khongor zandduinen': [102.1719, 43.7708],
  'yolyn am': [104.0974, 43.5003],
  'yol vallei': [104.0974, 43.5003],
  'yol valley': [104.0974, 43.5003],
  'tsagaan suvarga': [105.7005, 44.5794],
  'tsagaan suvraga': [105.7005, 44.5794],
  'tsagaan suvargaa': [105.7005, 44.5794],
  // Centraal-Azie
  'merv': [62.1697, 37.6676],
  'ancient merv': [62.1697, 37.6676],
  // Zuid-Amerika
  'amazon rescue center, ecuador': [-77.997, -1.4855],
  // Zuid-China (Guizhou/Guangxi) - grote-stad-namen alleen MET regio
  'jiabang': [108.5919, 25.6011],
  'jiabang, guizhou': [108.5919, 25.6011],
  'langdong': [108.554, 26.3606],
  'langdong, guizhou': [108.554, 26.3606],
  'dali, guizhou': [108.6394, 26.0415],
  'huanggang, guizhou': [108.9724, 25.9193],
  "ping'an, longji": [110.1179, 25.7581],
  "ping'an, guangxi": [110.1179, 25.7581]
};
function normNaam(x) { return String(x || '').toLowerCase().trim(); }
function zoekOverride(s) {
  var g = normNaam(s.destination_geocode);
  var d = normNaam(s.destination);
  if (OVERRIDES[g]) return OVERRIDES[g];
  if (OVERRIDES[d]) return OVERRIDES[d];
  var g2 = g.split(',')[0].trim();
  var d2 = d.split(',')[0].trim();
  if (OVERRIDES[g2]) return OVERRIDES[g2];
  if (OVERRIDES[d2]) return OVERRIDES[d2];
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
// Is deze Mapbox-match geloofwaardig voor de gezochte plaatsnaam?
// Geloofwaardig = de plaatsnaam zelf (deel voor de eerste komma) komt herkenbaar terug
// in het resultaat (substring of kleine spellingsvariant), OF Mapbox geeft een perfecte
// relevance van 1. Dit weigert catch-all fuzzy matches (zoals de "15 South African
// Military base" die elke onvindbare Zuid-Afrika-query terugkreeg) zonder goede
// matches met een niet-matchend regiodeel te straffen (zoals "Ponta do Sol, Santo Antao").
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

    // Deterministische override heeft altijd voorrang: vaste coordinaten,
    // geen Mapbox-call, en de stop kan verderop nooit meer gedropt worden.
    var ovr = zoekOverride(s);
    if (ovr) {
      s.longitude = ovr[0];
      s.latitude = ovr[1];
      s.place_name = s.destination;
      s._override = true;
      continue;
    }

    const q = encodeURIComponent((s.destination_geocode || s.destination) + ', ' + (s.country || ''));
    const url = base + q + '.json';
    // 'country' weggelaten (geen heel-land-terugval); 'poi' bewust NIET (brak werkende kaarten zoals Addo)
    var qs = { access_token: token, limit: 1, types: 'place,locality,region', proximity: medLng + ',' + medLat };
    // per-stop landfilter: de pin kan nooit buiten het opgegeven land vallen
    if (iso) { qs.country = iso.toLowerCase(); }

    let resp;
    try {
      resp = await this.helpers.httpRequest({ method: 'GET', url: url, qs: qs, json: true });
    } catch(e) { continue; }

    const f = resp && resp.features && resp.features[0];
    if (!f || !f.center) continue;
    // Weiger ongeloofwaardige fuzzy-matches (zie matchGeloofwaardig hierboven):
    // beter geen pin (zichtbaar bij controle) dan een stille foute pin.
    var plaatsDeel = String(s.destination_geocode || s.destination || '').split(',')[0];
    if (!matchGeloofwaardig(plaatsDeel, f)) continue;
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
    function heeftBuurStop(st) {
      // een andere stop op een ANDER punt binnen 3 graden = geloofwaardige route-buur
      return geldig2.some(function(o){
        if (o === st) return false;
        const d2 = afstand(o.longitude, o.latitude, st.longitude, st.latitude);
        return d2 > 1e-6 && d2 < 3;
      });
    }
    route.forEach(function(s){
      if (s._override) return; // geverifieerde vaste coordinaten nooit droppen
      if (s.latitude == null || s.longitude == null) return;
      const k = rond(s.longitude) + ',' + rond(s.latitude);
      const aantalNamen = Object.keys(perPunt[k] || {}).length;
      const d = afstand(s.longitude, s.latitude, cLng, cLat);
      const stapel = aantalNamen >= 3;
      const uitschieter = d > 6 && d > 5 * spreiding && !heeftBuurStop(s);
      if (stapel || uitschieter) { s.latitude = null; s.longitude = null; }
    });
  }

  out.push({ json: Object.assign({}, item.json, { route: route }) });
}
return out;