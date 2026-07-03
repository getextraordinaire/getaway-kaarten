const items = $input.all();
const sheetItems = $('Google Sheets - Input').all();

// Koppel reisinformatie op URL i.p.v. op index. Index-koppeling breekt zodra er upstream
// een reis wegvalt (bijv. lege extractie): dan schuift alle reisinfo een plek op en krijgt
// elke reis de tekst van een ANDERE reis -> lege dag-labels -> onterecht overgeslagen.
const reisinfoByUrl = {};
sheetItems.forEach(function(s) {
  const u = String(s.json.URL || '').trim();
  if (u) reisinfoByUrl[u] = s.json['Reisinformatie - scraped'] || '';
});

return items.map(function(item) {
  const url = item.json.URL;
  const reisinfo = reisinfoByUrl[String(url || '').trim()] || '';

  const routeLijst = item.json.route.map(function(s) {
    return s.order + '. ' + s.destination + ' (' + s.type + ')';
  }).join('\n');

  const prompt = 'Gegeven deze reisinformatie en routelijst, geef voor elke stop het dagnummer of dagbereik terug zoals het in de reisinformatie staat.\n\n' +
    'Route:\n' + routeLijst + '\n\n' +
    'Regels:\n' +
    '- Gebruik de exacte formulering uit de reisinformatie (bijv. "Dag 1", "Dag 1-4", "Dag 5-6")\n' +
    '- Voor de eerste stop in het reisland: begin altijd op Dag 1, ook als Dag 1 de vliegdag is. De vliegdag telt mee als eerste dag van de bestemming. Voorbeeld: de reisinformatie begint met "Dag 1 | Amsterdam - Bangkok" en Bangkok wordt beschreven op Dag 2-4 → day_label is "Dag 1-4" (niet "Dag 2-4")\n' +
    '- Voor transit-stops: gebruik het dagnummer waarop de reiziger door die stop reist\n' +
    '- Als een stop niet voorkomt in de reisinformatie: laat day_label leeg ("")\n\n' +
    '- Gebruik altijd een koppelteken voor dagbereiken ("Dag 6-7", "Dag 8-9"), nooit een ampersand ("Dag 6 & 7")\n' +
    'Geef ALLEEN een geldig JSON object terug:\n' +
    '{\n' +
    '  "labels": [\n' +
    '    { "order": 1, "day_label": "Dag 1-4" },\n' +
    '    { "order": 2, "day_label": "Dag 5" },\n' +
    '    { "order": 3, "day_label": "Dag 5-6" }\n' +
    '  ]\n' +
    '}\n\n' +
    'Reisinformatie:\n' + reisinfo;

  const requestBody = {
    model: 'claude-fable-5',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }]
  };

  return {
    json: {
      URL: item.json.URL,
      route: item.json.route,
      legenda: item.json.legenda,
      requestBody: JSON.stringify(requestBody)
    }
  };
});