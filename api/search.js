export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  const OC = process.env.LAW_API_KEY;

  try {
    const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=${OC}&target=law&type=JSON&display=20&query=${encodeURIComponent(query)}`;
    const upstream = await fetch(url);
    const text = await upstream.text();
    if (!text || text.trim().startsWith('<')) {
      return res.status(200).json({ LawSearch: { law: [] } });
    }
    res.status(200).json(JSON.parse(text));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
