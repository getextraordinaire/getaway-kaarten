const claudeResponses = $input.all();
const tripItems = $('Bouw request body').all();

const allDestinations = [];

claudeResponses.forEach(function(response, tripIndex) {
  const textBlock = (response.json.content || []).find(function(c) { return c.type === 'text' && c.text; });
  const responseText = textBlock ? textBlock.text : '';
  if (!responseText) return;
  const url = tripItems[tripIndex] ? tripItems[tripIndex].json.url || '' : '';
  const clean = responseText.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch(e) {
    return;
  }

  parsed.route.forEach(function(dest) {
    allDestinations.push({
      json: {
        order: dest.order,
        destination: dest.destination,
        destination_geocode: dest.destination_geocode || dest.destination,
        country: dest.country,
        days: dest.days,
        type: dest.type || 'destination',
        transport: dest.transport || 'unknown',
        bekendheid: dest.bekendheid || 1,
        day_label: dest.day_label || '',
        url: url
      }
    });
  });
});

return allDestinations;