export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mst, keyword } = req.query;
  const OC = process.env.LAW_API_KEY;

  try {
    // MST로 직접 조회 (lawName 파라미터 제거)
    const url = `https://www.law.go.kr/DRF/lawService.do?OC=${OC}&target=law&type=JSON&MST=${mst}`;
    const upstream = await fetch(url);
    const text = await upstream.text();

    // 응답 전체를 디버그로 반환
    let data;
    try { data = JSON.parse(text); } catch {
      return res.status(200).json({ articles: [], debug: 'parse_fail', raw: text.slice(0,300) });
    }

    return res.status(200).json({ 
      articles: [],
      debug_keys: Object.keys(data),
      debug_sub: data ? JSON.stringify(data).slice(0, 800) : 'null'
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
