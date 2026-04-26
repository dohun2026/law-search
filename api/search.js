export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  const OC = process.env.LAW_API_KEY;

  try {
    const url = `https://open.law.go.kr/LSO/openApi/lawSearch.do?target=law&type=JSON&display=20&OC=${OC}&query=${encodeURIComponent(query)}`;
    const upstream = await fetch(url);
    const text = await upstream.text();

    // 원문 그대로 반환해서 확인
    res.status(200).json({ raw: text.slice(0, 1000) });

  } catch (e) {
    res.status(200).json({ error: e.message });
  }
}
