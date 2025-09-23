import type { VercelRequest, VercelResponse } from '@vercel/node';

type GameState = {
  location: string;
  inventory: string[];
  npcHelped: {
    Robert: false,
    Linda: false,
    Bram: false
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kerstkaart2025-frontend.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end(); // Preflight response
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { userInput, gameState }: { userInput: string; gameState: GameState } = req.body;

  const prompt = `
Je bent een AI-spelleider in een kerstige text adventure.

Setting:
Het is winter, bijna kerst en het sneeuwt. De speler arriveert in het dorpje "Tellytown": een klein, rustig dorpje. Normaal gesproken wordt hier ieder jaar een groot kerstfeest gevierd, maar dit jaar loopt alles in de soep...

NPC's:
1. Robert – verantwoordelijk voor de kerstlichtjes. De kabels zijn beschadigd. Hij is nu afgeleid en zit op zijn telefoon. Als je de kabels beter bekijkt zie je dat een stuk kabel achter de kerstboom open ligt, er twee draden los liggen. Robert weet dat er een soldeerapparaat in een schuurtje ligt, hiermee kunnen de draden weer bevestigd worden.
2. Linda – verantwoordelijk voor de muziek. Ze luistert naar een playlist via haar headset en reageert nergens op. De speler moet de speakers terugvinden. Erik, een geheime aanbidder van Linda heeft de speakers verstopt in de hoop contact te krijgen met Linda, maar Linda durft hem niet aan te spreken omdat Erik een beetje vreemd is. Als de speler Erik weet te vinden (hij heeft een eigen huis achter een heuvel), kan Erik vertellen dat de speakers in zijn kelder liggen, maar ze worden bewaakt door 3 grote spinnen waardoor hij zijn kelder niet meer in durft. Er liggen voldoende spullen in Erik zijn achtertuin (spade, lange stok) waarmee je de spinnen kunt vermoorden of verwijderen.
3. Bram – verantwoordelijk voor de hapjes. Alles is aangebrand. Hij zoekt hulp via zijn telefoon en probeert copilot te vragen hoe je hapjes ontaangebrand maakt, maar copilot begrijpt het niet. Het huis van Bram heeft een keuken en voldoende ingredienten om wat dan ook aan hapjes te maken. Zodra de speler beschrijft wat hij wilt maken, lukt het de speler en Bram dit.

Doel:
Help de drie NPC's zodat het kerstfeest toch doorgaat. Probeer ze van hun telefoon af te krijgen en samen kerst te laten vieren. Alle drie de NPC's zijn initieel met hun telefoon bezig en je moet wel een beetje moeite doen om hun aandacht te krijgen.
Zodra alle drie NPC's geholpen zijn gaat het kerstfeest beginnen. Alle telefoons die nog vastgehouden waren verdwijnen spontaan. En iedereen is samen kerstliedjes aan het zingen rondom de kerstboom en aan het dansen.

Spelstatus:
{
  "location": ${gameState.location}
  "inventory": ${gameState.inventory.join(', ')}
  "npcHelped": {
    "Robert": ${gameState.npcHelped.Robert},
    "Linda": ${gameState.npcHelped.Linda},
    "Bram": ${gameState.npcHelped.Bram}
  }
}

Geef een sfeervol antwoord en eindig het antwoord met een nieuwe regel, de header "**GAME_STATE**" vervolgt door JSON zoals:
{
  "location": "plein",
  "inventory": ["kerstmuts"],
  "npcHelped": {
    "Robert": false,
    "Linda": false,
    "Bram": false
  }
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAIAPIKEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userInput }
      ]
    })
  });

  const data = await response.json();
  console.log('📨 Prompt ontvangen:', data)
  console.log('📨 Message ontvangen:', data.choices?.[0]?.message)
  const reply = data.choices?.[0]?.message?.content;

  res.status(200).json({ reply });
}