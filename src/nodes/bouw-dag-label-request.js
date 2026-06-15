const items = $input.all();
const sheetItems = $('Google Sheets - Input').all();

return items.map(function(item, idx) {
  const sheetItem = sheetItems[idx] || { json: {} };
  const dagTotDag = sheetItem.json['Dag tot dag - generated'] || '';
  
  // Bouw een compacte routelijst voor Claude
  const routeLijst = item.json.route.map(function(s) {
    return s.order + '. ' + s.destination + ' (' + s.type + ')';
  }).join('\n');

  const prompt = 'Gegeven deze dag-tot-dag tekst en routelijst, geef voor elke stop het dagnummer of dagbereik terug zoals het in de dag-tot-dag tekst staat.\n\n' +
    'Route:\n' + routeLijst + '\n\n' +
    'Regels:\n' +
    '- Gebruik de exacte formulering uit de dag-tot-dag tekst (bijv. "Dag 1", "Dag 1-4", "Dag 5-6")\n' +
    '- Voor de eerste stop in het reisland: begin altijd op Dag 1, ook als Dag 1 de vliegdag is. De vliegdag telt mee als eerste dag van de bestemming. Voorbeeld: dag-tot-dag begint met "Dag 1 | Amsterdam - Bangkok" en Bangkok wordt beschreven op Dag 2-4 → day_label is "Dag 1-4" (niet "Dag 2-4")\n' +
    '- Voor transit-stops: gebruik het dagnummer waarop de reiziger door die stop reist\n' +
    '- Als een stop niet voorkomt in de dag-tot-dag: laat day_label leeg ("")\n\n' +
    '- Gebruik altijd een koppelteken voor dagbereiken ("Dag 6-7", "Dag 8-9"), nooit een ampersand ("Dag 6 & 7")\n' +
    'Geef ALLEEN een geldig JSON object terug:\n' +
    '{\n' +
    '  "labels": [\n' +
    '    { "order": 1, "day_label": "Dag 1-4" },\n' +
    '    { "order": 2, "day_label": "Dag 5" },\n' +
    '    { "order": 3, "day_label": "Dag 5-6" }\n' +
    '  ]\n' +
    '}\n\n' +
    'Dag tot dag:\n' + dagTotDag;

  const requestBody = {
    model: 'claude-opus-4-8',
    max_tokens: 2000,
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