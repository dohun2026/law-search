export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mst, keyword } = req.query;
  const OC = process.env.LAW_API_KEY;

  try {
    const url = `https://www.law.go.kr/DRF/lawService.do?OC=${OC}&target=law&type=JSON&MST=${mst}`;
    const upstream = await fetch(url);
    const text = await upstream.text();

    if (!text || text.trim().startsWith('<')) {
      return res.status(200).json({ articles: [], debug: 'xml_or_empty', raw: text.slice(0,200) });
    }

    const data = JSON.parse(text);

    // 응답 구조 전체를 디버그로 반환
    return res.status(200).json({ 
      articles: [], 
      debug_keys: Object.keys(data),
      debug_raw: JSON.stringify(data).slice(0, 500)
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
