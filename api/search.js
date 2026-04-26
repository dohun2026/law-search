export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'query 파라미터 필요' });

  const OC = process.env.LAW_API_KEY;
  if (!OC) return res.status(500).json({ error: 'API 키 미설정 (Vercel 환경변수 확인)' });

  try {
    const url = `https://open.law.go.kr/LSO/openApi/lawSearch.do` +
      `?target=law&type=JSON&display=20&OC=${OC}&query=${encodeURIComponent(query)}`;

    const upstream = await fetch(url);
    const text = await upstream.text();

    let data;
    try { data = JSON.parse(text); }
    catch { return res.status(502).json({ error: '법제처 응답 파싱 실패', raw: text.slice(0, 300) }); }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
