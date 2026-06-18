const items = $input.all();

// Leid de bestandsnaam robuust af uit de URL: trim (sommige sheet-URL's hebben spaties),
// strip trailing slash, neem laatste pad-segment, saneer onveilige tekens.
// Voorkomt dat meerdere reizen naar dezelfde bestandsnaam schrijven (SHA-race / 409).
function bestandsnaamVanUrl(u) {
  var slug = (u || '').trim().replace(/[/]+$/, '').split('/').filter(Boolean).pop() || 'rondreis';
  slug = slug.replace(/[^a-zA-Z0-9._-]/g, '-');
  return 'routekaart-' + slug + '.html';
}

return items.map(function(item) {
  const bestandsnaam = bestandsnaamVanUrl(item.json.URL);
  const base64content = item.json.base64content || '';

  return {
    json: {
      URL: item.json.URL,
      route: item.json.route,
      legenda: item.json.legenda,
      bestandsnaam: bestandsnaam,
      base64content: base64content,
      upload_message: 'Kaart update: ' + bestandsnaam
    }
  };
});