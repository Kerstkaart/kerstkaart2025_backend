import type { VercelRequest, VercelResponse } from '@vercel/node';

type GameState = {
  location: string;
  inventory: string[];
  npc: {
    R: false,
    L: false,
    B: false
  }
  solved: boolean;
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
1. Robert – verantwoordelijk voor de kerstlichtjes. De kabels zijn beschadigd. Hij is nu afgeleid en zit op zijn telefoon.
2. Linda – verantwoordelijk voor de muziek. Ze luistert naar een playlist via haar headset en reageert nergens op.
3. Bram – verantwoordelijk voor de hapjes. Alles is aangebrand. Hij zoekt hulp via zijn telefoon.

Doel:
Help de drie NPC's zodat het kerstfeest toch doorgaat. Probeer ze van hun telefoon af te krijgen en samen kerst te laten vieren. Alle drie de NPC's zijn initieel met hun telefoon bezig en je moet wel een beetje moeite doen om hun aandacht te krijgen. 

Spelstatus:
{
  "loc": ${gameState.location}
  "inv": ${gameState.inventory.join(', ')}
  "npc": {
    "R": ${gameState.npc.R},
    "L": ${gameState.npc.L},
    "B": ${gameState.npc.B}
  },
  "solved": ${gameState.solved}
}

Geef een sfeervol antwoord en update de status indien nodig. Gebruik JSON zoals:
{
  "loc": "plein",
  "inv": ["kerstmuts"],
  "npc": {
    "R": false,
    "L": false,
    "B": false
  },
  "goal": false
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
  const reply = data.choices?.[0]?.message?.content;

  res.status(200).json({ reply });
}