import type { VercelRequest, VercelResponse } from '@vercel/node';


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

  const { userInput, chapter, history }: { userInput: string; chapter: number, history: string[] } = req.body;

  const chapterContext: Record<number, string> = {
  1: `
  Missie 1 gaat over kerstlichtjes.
  De speler is zojuist bij Robert aangekomen.
  Robert is verantwoordelijk voor de kerstlichtjes. Hij heeft de stroomkabels aangesloten, maar omdat niet alles in 1 keer werkte heeft hij continu zitten klagen over de stroom. Hierdoor heeft de stroom er ook geen zin meer in. Het doel van de speler is de stroom helpen om weer aan te sluiten op de kerstboom.
  Naast Robert ligt een boek, het boek gaat over energie, het legt uit dat ook stroom last heeft van de donkere kerstmaanden en soms ook geen zin meer heeft. Als er te veel geklaagd wordt over stroom die niet werkt dan krijgt ook de stroom last van weerstand. Het beste wat dan werkt is een vriendelijk woord, en behulpzaam gedrag. Vraag eens wat er mis is en of jij ergens mee kunt helpen.
  Als de speler aan de stroom vraagt wat er aan de hand is, zal de stroom antwoorden dat het erg donker is in de stroomkabel, en dat hij het fijn zou vinden als jij met een lamp hem zou willen begeleiden waar hij naartoe moet (de kerstboom).

  Als de speler de stroom heeft geholpen om de weg te vinden naar de kerstboom is deze quest afgerond.
  Er zijn veel andere opties voor de speler om deze missie af te ronden. Zolang het de speler lukt om de kerstboomverlichting aan te krijgen is de missie geslaagd.
  `,
  
  2: `
  Missie 2 gaat over de muziekinstallatie
  De speler is zojuist bij Linda aangekomen.
  Linda is verantwoordelijk voor de muziek.
  Ze is de muziekinstallatie kwijtgeraakt. Deze is meegenomen door spinnen. De spinnen hebben de muziekinstallatie meegenomen naar de kelder.
  In de badkamer hebben de spinnen een webmaker 2025 geinstalleerd waarmee ze continu nieuwe spinnenwebben kunnen maken, om de muziekinstallatie voor altijd vast te houden.
  De webmaker 2025 heeft haren nodig uit een doucheputje om spinnenwebben te maken.
  Als de speler de haren uit het doucheputje haalt, of de badkamer schoonmaakt, worden er geen nieuwe spinnenwebben meer gemaakt en kan de muziekinstallatie losgehaald worden.
  Als je de muziekinstallatie losmaakt en aan Linda geeft zal ze je bedanken:
  Bedankt! Hiermee kan ik mijn afspeellijst eindelijk afspelen!`,
  
  3: `
  Missie 3 gaat over eten
  De speler is zojuist bij Bram aangekomen, een topchef die verantwoordelijk is voor het dessert: crème brûlées.
  Bram probeert al de hele ochtend crème brûlées te maken, maar telkens als hij ze uit de oven haalt, worden ze stiekem opgegeten door twee katten: Lila en Lolly. Deze katten zijn dol op room en suiker, en weten precies wanneer ze moeten toeslaan.
  Het doel van de speler is om Bram te helpen genoeg crème brûlées te maken zodat er genoeg zijn voor het kerstdiner — zelfs als Lila en Lolly er een paar stelen.
  De oplossing ligt in samenwerking: de speler moet leren hoe je crème brûlées maakt, en Bram helpen om ze sneller en efficiënter te bereiden. Als ze samen meer crème brûlées maken dan de katten kunnen opeten, is de missie geslaagd.
  Er zijn meerdere manieren om deze missie te voltooien. Zolang het de speler lukt om het kerstdessert te redden en Bram tevreden is, is de missie geslaagd.
  `
};

  const prompt = `
  Je bent een AI-spelleider in een kerstige text adventure.

  Setting:
  Het is winter, bijna kerst en het sneeuwt. De speler arriveert in het dorpje "Tellytown": een klein, rustig dorpje. Normaal gesproken wordt hier ieder jaar een groot kerstfeest gevierd, maar dit jaar loopt alles in de soep...

  Chapter Context:
  ${chapterContext[chapter]}

  Regels:
  1: Als de speler de missie heeft voltooid, **moet** je antwoord **exact beginnen met het woord "GESLAAGD"** (in hoofdletters, zonder aanhalingstekens, zonder extra tekens, zonder andere woorden ervoor). Gebruik nooit alternatieven zoals "Gelukt", "Goed gedaan", "Missie geslaagd", "Missie voltooid" etc.
  Voorbeeld:
  GESLAAGD  
  Je hebt de missie succesvol voltooid. De kerstboom straalt weer dankzij jouw hulp.
  2: Als de speler een actie probeert uit te voeren die niet direct helpt bij het oplossen van het probleem, of lijkt op een shortcut, initieer dan de "DnD regels" die hieronder staan.

  DnD regels:
  2A: Genereer een waarde tussen 10 en 20 als moeilijkheidsgraad op basis van wat de speler probeert te doen.
  2B: Deze moeilijkheidsgraad moet toenemen bij herhaalde pogingen: elke keer dat de speler dezelfde actie probeert, verhoog je de benodigde D20 score met 2 punten.
  2C: Rol een D20 en geef de uitkomst terug.
  2D: Als de D20-uitkomst **hoger is dan de moeilijkheidsgraad**, dan **moet** de actie slagen. Je beschrijft dan een positief resultaat en laat de speler verdergaan.
  2E: Als de D20-uitkomst **lager of gelijk is aan de moeilijkheidsgraad**, dan mislukt de actie. Je beschrijft een mislukking of een blokkade, en de speler moet iets anders proberen.
  2F: Geef altijd de D20-uitkomst en de moeilijkheidsgraad terug in je antwoord.
  `;

  const formattedHistory: { role: 'user' | 'assistant'; content: string }[] = [];

  if (Array.isArray(history)) {
    for (let i = 0; i < history.length; i++) {
      const role = i % 2 === 0 ? 'user' : 'assistant';
      formattedHistory.push({ role, content: history[i] });
    }
  }

  formattedHistory.push({ role: 'user', content: userInput });

  const messages = [
    { role: 'system', content: prompt },
    ...formattedHistory
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAIAPIKEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages
    })
  });

  const data = await response.json();
  console.log('📨 Prompt ontvangen:', data)
  console.log('📨 Message ontvangen:', data.choices?.[0]?.message)
  const reply = data.choices?.[0]?.message?.content;

  res.status(200).json({ reply });
}