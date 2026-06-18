const items = $input.all();

const out = [];
items.forEach(function(item) {
  // Parse de dag-label-respons, robuust tegen tekst voor of na de JSON
  let labels = [];
  try {
    const textBlock = (item.json.claude_content || []).find(function(c) { return c.type === 'text' && c.text; });
    let text = textBlock ? textBlock.text : '';
    text = text.replace(/```json|```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch(e1) {
      var a = text.indexOf('{'); var b = text.lastIndexOf('}');
      if (a !== -1 && b !== -1 && b > a) { parsed = JSON.parse(text.slice(a, b + 1)); }
      else { throw e1; }
    }
    labels = parsed.labels || [];
  } catch(e) {
    labels = [];
  }

  const labelMap = {};
  labels.forEach(function(l) { labelMap[l.order] = l.day_label || ''; });

  // Geen dag-tot-dag programma (geen enkele niet-lege day_label) => geen kaart: reis overslaan
  const heeftDagProgramma = Object.keys(labelMap).some(function(k) {
    return labelMap[k] && String(labelMap[k]).trim() !== '';
  });
  if (!heeftDagProgramma) { return; }

  const route = (item.json.route || []).map(function(stop) {
    return Object.assign({}, stop, { day_label: labelMap[stop.order] || '' });
  });

  out.push({ json: { URL: item.json.URL, route: route, legenda: item.json.legenda } });
});

return out;