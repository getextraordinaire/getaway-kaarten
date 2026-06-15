const deleteItems = $input.all();
const combineerItems = $('Combineer SHA').all();

return deleteItems.map(function(item, idx) {
  const combineerItem = combineerItems[idx] || { json: {} };
  return {
    json: {
      URL: combineerItem.json.URL,
      route: combineerItem.json.route,
      legenda: combineerItem.json.legenda,
      bestandsnaam: combineerItem.json.bestandsnaam,
      base64content: combineerItem.json.base64content,
      upload_message: combineerItem.json.upload_message
    }
  };
});