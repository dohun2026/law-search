export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mst, keyword } = req.query;
  const OC = process.env.LAW_API_KEY;
  const kw = (keyword || '').trim();

  try {
    // XML로 받아서 정규식으로 파싱 (JSON보다 가벼움)
    const url = `https://www.law.go.kr/DRF/lawService.do?OC=${OC}&target=law&type=XML&MST=${mst}`;
    const upstream = await fetch(url);
    const xml = await upstream.text();

    if (!xml || xml.includes('일치하는 법령이 없습니다')) {
      return res.status(200).json({ articles: [] });
    }

    // XML에서 조문단위 추출
    const articleBlocks = xml.match(/<조문단위[^>]*>([\s\S]*?)<\/조문단위>/g) || [];

    const results = [];
    for (const block of articleBlocks) {
      // 키워드 필터
      if (kw && !block.includes(kw)) continue;

      const num   = (block.match(/<조문번호>([^<]*)</) || [])[1] || '';
      const title = (block.match(/<조문제목>([^<]*)</) || [])[1] || '';
      const content = (block.match(/<조문내용><!\[CDATA\[([\s\S]*?)\]\]>/) ||
                       block.match(/<조문내용>([^<]*)</)  || [])[1] || '';

      // 항 내용
      const items = [];
      const hangMatches = block.match(/<항내용><!\[CDATA\[([\s\S]*?)\]\]>/g) || [];
      for (const h of hangMatches) {
        const txt = (h.match(/<항내용><!\[CDATA\[([\s\S]*?)\]\]>/) || [])[1];
        if (txt) items.push(txt.trim());
      }

      if (num || content) {
        results.push({ num, title, content: content.trim(), items });
      }

      if (results.length >= 30) break;
    }

    res.status(200).json({ articles: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
