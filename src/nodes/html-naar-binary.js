const items = $input.all();

return items.map(function(item) {
  const html = item.json.html_content;
  const bestandsnaam = item.json.bestandsnaam;
  const base64 = Buffer.from(html, 'utf8').toString('base64');

  return {
    json: {
      URL: item.json.URL,
      route: item.json.route,
      legenda: item.json.legenda,
      bestandsnaam: bestandsnaam,
      base64content: base64
    }
  };
});