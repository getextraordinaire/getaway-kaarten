const claudeItems = $input.all();
const bouwItems = $('Bouw dag label request').all();

// Combineer Claude response met originele route op basis van index
return claudeItems.map(function(claudeItem, idx) {
  const bouwItem = bouwItems[idx] || { json: {} };
  return {
    json: {
      URL: bouwItem.json.URL,
      route: bouwItem.json.route,
      legenda: bouwItem.json.legenda,
      claude_content: claudeItem.json.content
    }
  };
});