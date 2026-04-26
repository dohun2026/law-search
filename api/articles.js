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
      return res.status(200).json({ articles: [] });
    }

    const data = JSON.parse(text);

    // 조문 구조 다양하게 시도
    const rawArticles =
      data?.법령?.조문?.조문단위 ||
      data?.LawService?.법령?.조문?.조문단위 ||
      data?.조문?.조문단위 || [];

    const articles = [].concat(rawArticles);

    // 키워드 있으면 필터, 없으면 전체 (최대 50개)
    const kw = keyword || '';
    const filtered = kw
      ? articles.filter(a => JSON.stringify(a).includes(kw))
      : articles;

    const result = filtered.slice(0, 50).map(a => ({
      num:     a.조문번호  || '',
      title:   a.조문제목  || '',
      content: a.조문내용  || '',
      items:   extractItems(a),
    }));

    // 필터 결과 없으면 전체 앞 10개라도 반환
    if (result.length === 0 && articles.length > 0) {
      const fallback = articles.slice(0, 10).map(a => ({
        num:     a.조문번호  || '',
        title:   a.조문제목  || '',
        content: a.조문내용  || '',
        items:   extractItems(a),
      }));
      return res.status(200).json({ articles: fallback, note: '키워드 조문 없음, 앞 10개 표시' });
    }

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
