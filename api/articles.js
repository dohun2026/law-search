export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mst, keyword } = req.query;
  const OC = process.env.LAW_API_KEY;
  const kw = (keyword || '').trim();

  try {
    const url = `https://www.law.go.kr/DRF/lawService.do?OC=${OC}&target=law&type=JSON&MST=${mst}`;
    const upstream = await fetch(url);
    const text = await upstream.text();

    if (!text || text.includes('일치하는 법령이 없습니다') || text.trim().startsWith('<')) {
      return res.status(200).json({ articles: [] });
    }

    // 텍스트 크기 제한 (2MB 이상이면 앞부분만)
    const safeText = text.length > 2000000 ? text.slice(0, 2000000) + '"}}}' : text;

    let data;
    try { data = JSON.parse(safeText); }
    catch { 
      // JSON 파싱 실패시 키워드 위치 앞뒤만 추출
      if (kw) {
        const idx = text.indexOf(kw);
        if (idx === -1) return res.status(200).json({ articles: [] });
        const chunk = text.slice(Math.max(0, idx-500), idx+1000);
        return res.status(200).json({ articles: [], debug: chunk.slice(0,300) });
      }
      return res.status(200).json({ articles: [] });
    }

    const rawArticles =
      data?.법령?.조문?.조문단위 ||
      data?.LawService?.법령?.조문?.조문단위 ||
      data?.법령?.조문단위 || [];

    const articles = [].concat(rawArticles);
    const filtered = kw ? articles.filter(a => JSON.stringify(a).includes(kw)) : articles;
    const source = filtered.length > 0 ? filtered : (kw ? [] : articles.slice(0, 10));

    const result = source.slice(0, 30).map(a => ({
      num:     a.조문번호  || '',
      title:   a.조문제목  || '',
      content: a.조문내용  || '',
      items:   extractItems(a),
    }));

    res.status(200).json({ articles: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function extractItems(a) {
  const parts = [];
  for (const h of [].concat(a.항 || [])) {
    if (h.항내용) parts.push(h.항내용);
    for (const ho of [].concat(h.호 || [])) {
      if (ho.호내용) parts.push('  · ' + ho.호내용);
    }
  }
  return parts;
}
