const items = $input.all();
const token = 'REDACTED_MAPBOX_PUBLIC_TOKEN';

// Engelse landnaam -> ISO 3166-1 alpha-2. Per stop, zodat een reis met meerdere landen
// (bijv. Thailand -> Laos -> Cambodja) elke stop in het JUISTE land vastzet.
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

return items.map(function(item, index) {
  const destinationGeocode = item.json.destination_geocode || item.json.destination;
  const country = item.json.country;
  const iso = landIso(country);
  const searchText = encodeURIComponent(destinationGeocode + ', ' + country);
  // 'country' bewust weggelaten zodat hij niet terugvalt op een heel-land-middelpunt.
  // 'poi' bewust NIET gebruikt: brak werkende kaarten (bijv. Addo matchte op een verkeerde POI).
  var mapboxUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + searchText + '.json' + '?access_token=' + token + '&limit=1&types=place,locality,region';
  if (iso) { mapboxUrl += '&country=' + iso.toLowerCase(); }
  return {
    json: {
      _index: index,
      order: item.json.order,
      destination: item.json.destination,
      destination_geocode: destinationGeocode,
      country: country,
      country_code: iso || null,
      days: item.json.days,
      type: item.json.type || 'destination',
      transport: item.json.transport || 'car',
      bekendheid: item.json.bekendheid || 1,
      url: item.json.url || '',
      mapboxUrl: mapboxUrl
    }
  };
});