const shaItems = $input.all();
const uploadItems = $('Bouw upload body').all();

return shaItems.map(function(shaItem, idx) {
  const uploadItem = uploadItems[idx] || { json: {} };

  // SHA is aanwezig als statusCode 200 en sha veld gevuld
  // Bij 404 of lege response is sha null
  let sha = null;
  try {
    if (shaItem.json && shaItem.json.sha && shaItem.json.sha !== 'undefined') {
      sha = shaItem.json.sha;
    }
  } catch(e) { sha = null; }

  const bestandsnaam = uploadItem.json.bestandsnaam || '';

  return {
    json: {
      URL: uploadItem.json.URL,
      route: uploadItem.json.route,
      legenda: uploadItem.json.legenda,
      bestandsnaam: bestandsnaam,
      base64content: uploadItem.json.base64content,
      upload_message: uploadItem.json.upload_message,
      delete_message: 'Verwijder voor herplaatsing: ' + bestandsnaam,
      delete_sha: sha || '',
      has_sha: sha ? true : false
    }
  };
});