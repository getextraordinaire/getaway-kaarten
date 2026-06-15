const items = $input.all();

return items.map(function(item) {
  const bestandsnaam = item.json.bestandsnaam || '';
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