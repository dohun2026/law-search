javascript// api/articles.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mst, keyword } = req.query;
  if (!mst) return res.status(400).json({ error: 'mst 파라미터 필요' });

  const OC = process.env.LAW_API_KEY;
  if (!OC) return res.status(500).json({ error: 'API 키 미설정' });

  try {
    const url = `https://open.law.go.kr/LSO/openApi/lawService.do` +
      `?target=law&type=JSON&MST=${mst}&OC=${OC}`;

    const upstream = await fetch(url);
    const text = await upstream.text();

    let data;
    try { data = JSON.parse(text); }
    catch { return res.status(502).json({ error: '파싱 실패', raw: text.slice(0, 300) }); }

    const rawArticles =
      data?.LawService?.법령?.조문?.조문단위 ||
      data?.법령?.조문?.조문단위 || [];

    const articles = [].concat(rawArticles);

    const kw = keyword || '';
    const filtered = kw
      ? articles.filter(a => JSON.stringify(a).includes(kw))
      : articles;

    const result = filtered.slice(0, 30).map(a => ({
      num:     a.조문번호  || '',
      title:   a.조문제목  || '',
      content: a.조문내용  || '',
      items:   extractItems(a),
    }));

    res.status(200).json({ articles: result, total: filtered.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function extractItems(a) {
  const parts = [];
  const 항list = [].concat(a.항 || []);
  for (const 항 of 항list) {
    if (항.항내용) parts.push(항.항내용);
    const 호list = [].concat(항.호 || []);
    for (const 호 of 호list) {
      if (호.호내용) parts.push('  · ' + 호.호내용);
    }
  }
  return parts;
}
