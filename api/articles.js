export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mst, keyword, name } = req.query;
  const OC = process.env.LAW_API_KEY;

  try {
    // 법령명으로 조회
    const url = `https://www.law.go.kr/DRF/lawService.do?OC=${OC}&target=law&type=JSON&lawName=${encodeURIComponent(name || '')}`;
    const upstream = await fetch(url);
    const text = await upstream.text();

    if (!text || text.trim().startsWith('<')) {
      return res.status(200).json({ articles: [] });
    }

    const data = JSON.parse(text);
    if (data?.Law) return res.status(200).json({ articles: [], error: data.Law });

    const rawArticles =
      data?.법령?.조문?.조문단위 ||
      data?.LawService?.법령?.조문?.조문단위 || [];

    const articles = [].concat(rawArticles);
    const kw = keyword || '';
    const filtered = kw ? articles.filter(a => JSON.stringify(a).includes(kw)) : articles;

    const result = (filtered.length > 0 ? filtered : articles).slice(0, 50).map(a => ({
      num:   a.조문번호 || '',
      title: a.조문제목 || '',
      content: a.조문내용 || '',
      items: extractItems(a),
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
