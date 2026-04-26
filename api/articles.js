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
      return res.status(200).json({ articles: [], debug: text.slice(0, 300) });
    }

    const data = JSON.parse(text);
    const rawArticles = data?.법령?.조문?.조문단위 || [];
    const articles = [].concat(rawArticles);
    const kw = keyword || '';
    const filtered = kw ? articles.filter(a => JSON.stringify(a).includes(kw)) : articles;

    const result = filtered.slice(0, 30).map(a => ({
      num: a.조문번호 || '',
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
