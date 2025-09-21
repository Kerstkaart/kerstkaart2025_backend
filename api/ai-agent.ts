import type { VercelRequest, VercelResponse } from '@vercel/node';

type GameState = {
  location: string;
  inventory: string[];
  puzzle: string;
  solved: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { userInput, gameState }: { userInput: string; gameState: GameState } = req.body;

  const prompt = `
Je bent een AI in een kerstige text adventure. Hier is de huidige status:
Locatie: ${gameState.location}
Inventory: ${gameState.inventory.join(', ')}
Puzzel: ${gameState.puzzle}
Opgelost: ${gameState.solved}

Speler zegt: "${userInput}"

Geef een sfeervol antwoord en update de status indien nodig.
Gebruik JSON zoals:
{
  "narrative": "...",
  "status_update": {
    "location": "...",
    "inventory": [...],
    "puzzle": "...",
    "solved": true/false
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
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;

  res.status(200).json({ reply });
}