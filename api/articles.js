export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mst } = req.query;
  const OC = process.env.LAW_API_KEY;

  try {
    const url = `https://www.law.go.kr/DRF/lawService.do?OC=${OC}&target=law&type=XML&MST=${mst}`;
    const upstream = await fetch(url);
    const xml = await upstream.text();

    // XML 앞부분 500자 반환
    res.status(200).json({ 
      length: xml.length,
      start: xml.slice(0, 500),
      has_조문단위: xml.includes('조문단위'),
      has_조문내용: xml.includes('조문내용'),
      has_CDATA: xml.includes('CDATA'),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
