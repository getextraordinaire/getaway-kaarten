const githubItems = $input.all();
const htmlItems = $('Genereer HTML kaart').all();
const mapboxToken = 'REDACTED_MAPBOX_PUBLIC_TOKEN';

return githubItems.map(function(item, idx) {
  const htmlItem = htmlItems[idx] ? htmlItems[idx].json : {};
  const bestandsnaam = htmlItem.bestandsnaam || '';
  const baseUrl = bestandsnaam
    ? 'https://getextraordinaire.github.io/getaway-kaarten/' + bestandsnaam
    : '';
  const interactiefUrl = baseUrl ? baseUrl + '?t=' + mapboxToken : '';

  return {
    json: {
      URL: htmlItem.URL,
      route: htmlItem.route,
      legenda: htmlItem.legenda,
      interactief_url: interactiefUrl
    }
  };
});