const items = $input.all();

const regels = [
  'Je bent een data-extractie specialist voor Getaway Travel. Extraheer alle bestemmingen uit de onderstaande reisinformatie voor een routekaart.',
  '',
  'REGELS:',
  '- Neem alle steden, eilanden, parken en regio\'s op waar de reiziger overnacht of een substantieel deel van de dag doorbrengt',
  '- Gebruik type "arrival" voor de aankomstplaats ALLEEN als de reiziger daar niet overnacht (bijv. vliegveld Preveza waar je landt en doorrijdt). Als de reiziger in de aankomststad overnacht (bijv. Johannesburg op dag 1), gebruik dan type "destination" met het juiste aantal verblijfsdagen.',
  '- Neem de vertrekplaats aan het einde van de reis op als type "transit". Als de laatste verblijfplaats dezelfde stad is als de vertrekplaats (bijv. Kaapstad), voeg dan TOCH een aparte transit-stop toe met days: 0 — zodat de stad zowel als verblijfplaats als vertrekpunt op de kaart staat.',
  '- Let op: een vliegveld als Preveza telt zowel als aankomst (type "arrival", order 1) als als vertrekstop (type "transit", laatste order). Beide mogen in de route staan ook al zijn het dezelfde coördinaten.',
  '- Transit-stops zijn: ferry-havens waar de reiziger een boot pakt, vliegvelden in het reisland waar een binnenlandse vlucht vertrekt of aankomt, directe aansluitingspunten, én plaatsen waar tijdens een reisdag tussen twee verblijfplaatsen bewust wordt gestopt voor een bezoek (bijv. de tempels van Ayutthaya of de drijvende markt van Damnoen Saduak onderweg naar de volgende bestemming). GEEN transit-stops: plaatsen waar alleen doorheen wordt gereden of die alleen als reisinfo of richtingaanwijzer worden genoemd (bijv. Blyde River Canyon, Tsitsikamma, Wilderness), en daguitstapjes vanuit een vaste uitvalsbasis waarbij de reiziger \'s avonds terugkeert.',
  '- Kijk ook in de reisinformatie (niet alleen de dag-tot-dag) voor transit-stops. Als de tekst zegt "je reist naar [haven] waar de ferry je naar [eiland] brengt", neem dan [haven] op als transit-stop.',
  '- Een transit-stop heeft altijd days: 0 en type: "transit"',
  '- Filter vertrekplaatsen in Nederland eruit (Amsterdam, Rotterdam, Eindhoven etc.)',
  '- Laat daguitstapjes weg waarbij de reiziger \'s avonds terugkeert naar dezelfde uitvalsbasis',
  '- Neem alleen plaatsen op waar de reiziger daadwerkelijk overnacht of de nacht doorbrengt. Een park of stad die wordt doorkruist of bezocht als dagexcursie telt NIET mee, ook niet als het prominent in de tekst staat (bijv. Blyde River Canyon, Tsitsikamma, Wilderness zijn geen stops — de reiziger slaapt er niet).',
  '- Vermeld bij elke bestemming altijd het land in het Engels',
  '- Tel het aantal verblijfsdagen per bestemming (een dagbereik "Dag 6 t/m 9" = 4 dagen)',
  '- Nummer de bestemmingen op volgorde van bezoek',
  '- Gebruik voor "destination" de naam zoals die in de inputtekst staat',
 '- Als de tekst een specifieke stad, wijk of dorp noemt als overnachtingsplek die binnen circa 30 kilometer van een grotere, bekendere bestemming ligt (bijv. Houtbaai bij Kaapstad), gebruik dan de grotere bestemming als destination én destination_geocode. Alleen als de verblijfplaats écht een eigen bestemming is op meer dan 30 kilometer afstand, neem je hem als aparte stop op. En: als de verblijfplaats een klein dorp op een eiland is dat al als bestemming telt (bijv. Agia Efimia op Kefalonia), gebruik dan de eilandnaam als destination.',
  '- Gebruik voor "destination_geocode" de meest gangbare Engelstalige plaatsnaam die Mapbox Geocoding het beste herkent',
  '- Kies voor de geocode de meest herkenbare, bekende plaats die bij de bestemming hoort, ook als het feitelijke verblijf iets verderop ligt. Een reiziger moet de pin direct kunnen plaatsen. Voorbeeld: bij "River Kwai" is dat Kanchanaburi, de stad met de beroemde brug — gebruik "Kanchanaburi" als destination_geocode, ook al ligt het hotel bij Sai Yok.',
  '- Gebruik type "destination" voor reguliere verblijfplaatsen',
  '- Als aankomstplaats en verblijfplaats dezelfde stad zijn (bijv. aankomst Bangkok én verblijf Bangkok), neem dan ALLEEN de verblijfbestemming op met type "destination" en sla de arrival stop volledig over. Voeg die stad dus NIET twee keer toe.',
  '- Bij seizoensgebonden verblijfplaatsen (herkenbaar aan een schuine streep in de koptekst, bijv. "Knysna – Swellendam/Hermanus" of een zin als "in de periode juni-november verblijf je in Hermanus"): neem ALTIJD BEIDE plaatsen op als aparte, opeenvolgende stops van type "destination" met elk days: 1. Sla er dus NOOIT één van over — Swellendam én Hermanus moeten beide in de route staan.',
  '',
  '- Voeg bij elke stop een "transport" veld toe: het vervoersmiddel waarmee de reiziger van de VORIGE stop naar DEZE stop reist',
  '- Gebruik ALLEEN: "car", "flight", "ferry", "train", "cruise", "walk", "unknown"',
  '- "car" = standaard voor rondreis per huurauto, 4WD, camper, minibus of groepsbus',
  '- "flight" = alleen voor vluchten BINNEN de reis tussen twee bestemmingen (NIET de internationale heenvlucht vanuit Nederland)',
  '- "ferry" = overtocht per boot, ferry, speedboot of catamaran tussen twee plaatsen',
  '- "train" = treinreis tussen twee bestemmingen (ook hogesnelheidstrein/shinkansen)',
  '- "cruise" = reiziger vaart op een cruiseschip of riviercruise (dahabiya, Nijlcruise) van A naar B',
  '- "walk" = trekkingreis waarbij de reiziger lopend van A naar B gaat',
  '- Kijk zowel naar expliciete vermeldingen als naar context (eilandenreis = waarschijnlijk ferry, safarigebied = waarschijnlijk auto)',
  '- Negeer lokaal vervoer tijdens excursies (tuk-tuk, riksja, lokale bus voor daguitstap)',
  '- Tussenstops die alleen worden aangedaan onderweg (bijv. een drijvende markt of historische plek als dagstop) zijn transit-stops met type: "transit" en days: 0, ook als ze in de tekst prominent worden beschreven',
  '- De eerste stop krijgt transport: "flight" als de reis per vliegtuig vanuit Nederland begint, anders "unknown"',
  '',
  '- Voeg bij elke stop een "bekendheid" veld toe: een getal 1, 2 of 3 dat aangeeft hoe toeristisch bekend/iconisch de bestemming is. Kijk HEEL goed naar de context van de reistekst: hoeveel aandacht krijgt de plek, wordt het als hoogtepunt beschreven, zijn er wereldberoemde bezienswaardigheden?',
  '  - 3 = wereldberoemd / iconisch hoogtepunt van de reis (bijv. Siem Reap met Angkor Wat, Bangkok, Kaapstad, Luang Prabang, Drakensberg, Chiang Mai)',
  '  - 2 = bekende, aantrekkelijke bestemming maar geen wereldwonder (bijv. Hua Hin, Knysna, Vang Vieng, Addo)',
  '  - 1 = doorrij-, transit- of overnachtingsplaats zonder grote toeristische trekpleister (bijv. Nakhon Pathom, Clarens, Cradock, Damnoen Saduak)',
  '  - Wees streng: niet alles is een 3. Gebruik de relatieve nadruk in de tekst als leidraad.',
  '',
  'Geef ALLEEN een geldig JSON object terug, zonder uitleg, inleiding of markdown:',
  '',
  '{',
  '  "route": [',
  '    { "order": 1, "destination": "Bangkok", "destination_geocode": "Bangkok", "country": "Thailand", "days": 3, "type": "destination", "transport": "flight", "bekendheid": 3, "day_label": "Dag 1-4" },',
  '    { "order": 2, "destination": "Damnoen Saduak", "destination_geocode": "Damnoen Saduak", "country": "Thailand", "days": 0, "type": "transit", "transport": "car", "bekendheid": 1, "day_label": "Dag 5" },',
  '    { "order": 3, "destination": "River Kwai", "destination_geocode": "Kanchanaburi", "country": "Thailand", "days": 2, "type": "destination", "transport": "car", "bekendheid": 2, "day_label": "Dag 5-6" },',
  '    { "order": 4, "destination": "Chiang Mai", "destination_geocode": "Chiang Mai", "country": "Thailand", "days": 3, "type": "destination", "transport": "train", "bekendheid": 3, "day_label": "Dag 8-10" },',
  '    { "order": 5, "destination": "Hua Hin", "destination_geocode": "Hua Hin", "country": "Thailand", "days": 4, "type": "destination", "transport": "flight", "bekendheid": 2, "day_label": "Dag 11-15" }',
  '  ]',
  '}',
  '',
  '---',
  '',
  'Dag tot dag:',
  '<<DAG_TOT_DAG>>',
  '',
  'Reisinformatie:',
  '<<REISINFORMATIE>>'
];

const promptTemplate = regels.join('\n');

return items.map(function(item) {
  const dagTotDag = item.json['Dag tot dag - generated'] || '';
  const reisinformatie = item.json['Reisinformatie - scraped'] || '';
  const url = item.json.URL || '';

  const prompt = promptTemplate
    .replace('<<DAG_TOT_DAG>>', dagTotDag)
    .replace('<<REISINFORMATIE>>', reisinformatie);

  const requestBody = {
    model: 'claude-opus-4-8',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }]
  };

  return { json: { requestBody: JSON.stringify(requestBody), url: url } };
});