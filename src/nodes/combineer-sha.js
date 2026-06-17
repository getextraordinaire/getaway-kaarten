const shaItems = $input.all();
const uploadItems = $('Bouw upload body').all();

return shaItems.map(function(shaItem, idx) {
  const uploadItem = uploadItems[idx] || { json: {} };

  // SHA aanwezig => bestand bestaat al (update). Geen sha => nieuw bestand (create).
  let sha = null;
  try {
    if (shaItem.json && shaItem.json.sha && shaItem.json.sha !== 'undefined') {
      sha = shaItem.json.sha;
    }
  } catch(e) { sha = null; }

  const bestandsnaam = uploadItem.json.bestandsnaam || '';
  const body = {
    message: uploadItem.json.upload_message,
    content: uploadItem.json.base64content
  };
  if (sha) { body.sha = sha; }

  return {
    json: {
      URL: uploadItem.json.URL,
      route: uploadItem.json.route,
      legenda: uploadItem.json.legenda,
      bestandsnaam: bestandsnaam,
      has_sha: sha ? true : false,
      upload_body_json: JSON.stringify(body)
    }
  };
});