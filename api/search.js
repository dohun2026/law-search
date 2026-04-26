export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'query 파라미터 필요' });

  const OC = process.env.LAW_API_KEY;
  if (!OC) return res.status(500).json({ error: 'API 키 미설정' });

  try {
    const url = `https://open.law.go.kr/LSO/openApi/lawSearch.do?target=law&type=JSON&display=20&OC=${OC}&query=${encodeURIComponent(query)}`;
    
    const upstream = await fetch(url, {
      headers: { 'Accept': 'application/json, text/plain, */*' }
    });
    
    const text = await upstream.text();
    
    // 디버그용: 응답 원문 앞부분 반환
    if (!text || text.trim() === '') {
      return res.status(200).json({ LawSearch: { law: [] }, debug: 'empty response' });
    }
    
    if (text.trim().startsWith('<')) {
      // XML 또는 HTML 응답인 경우 디버그 반환
      return res.status(200).json({ LawSearch: { law: [] }, debug: 'xml_response', raw: text.slice(0, 500) });
    }

    const data = JSON.parse(text);
    res.status(200).json(data);
    
  } catch (e) {
    res.status(200).json({ LawSearch: { law: [] }, debug: e.message });
  }
}
