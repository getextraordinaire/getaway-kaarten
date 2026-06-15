const items = $input.all();

return items.map(function(item) {
  // Parse Claude response
  let labels = [];
  try {
    const textBlock = (item.json.claude_content || []).find(function(c) { return c.type === 'text' && c.text; });
    const text = textBlock ? textBlock.text : '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    labels = parsed.labels || [];
  } catch(e) {
    labels = [];
  }

  // Maak een lookup map van order -> day_label
  const labelMap = {};
  labels.forEach(function(l) {
    labelMap[l.order] = l.day_label || '';
  });

  // Voeg day_label toe aan elke stop — alle stops bewaren
  const route = (item.json.route || []).map(function(stop) {
    return Object.assign({}, stop, { day_label: labelMap[stop.order] || '' });
  });

  return {
    json: {
      URL: item.json.URL,
      route: route,
      legenda: item.json.legenda
    }
  };
});