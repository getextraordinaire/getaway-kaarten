const githubItems = $input.all();
const htmlItems = $('Genereer HTML kaart').all();
const mapboxToken = 'REDACTED_MAPBOX_PUBLIC_TOKEN';

// Zelfde afleiding als in 'Bouw upload body', zodat de publieke URL exact de geuploade bestandsnaam volgt.
function bestandsnaamVanUrl(u) {
  var slug = (u || '').trim().replace(/[/]+$/, '').split('/').filter(Boolean).pop() || 'rondreis';
  slug = slug.replace(/[^a-zA-Z0-9._-]/g, '-');
  return 'routekaart-' + slug + '.html';
}

return githubItems.map(function(item, idx) {
  const htmlItem = htmlItems[idx] ? htmlItems[idx].json : {};
  const bestandsnaam = bestandsnaamVanUrl(htmlItem.URL);
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