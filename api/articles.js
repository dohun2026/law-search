export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mst, keyword } = req.query;
  const OC = process.env.LAW_API_KEY;

  try {
    const url = `https://www.law.go.kr/DRF/lawService.do?OC=${OC}&target=law&type=JSON&MST=${mst}`;
    const upstream = await fetch(url);
    const text = await upstream.text();

    let data;
    try { data = JSON.parse(text); } catch {
      return res.status(200).json({ articles: [] });
    }

    // 응답 구조: data.법령.조문.조문단위
    const rawArticles =
      data?.법령?.조문?.조문단위 ||
      data?.LawService?.법령?.조문?.조문단위 ||
      data?.법령?.조문단위 || [];

    const articles = [].concat(rawArticles);
    const kw = keyword || '';

    // 키워드 필터 (없으면 전체)
    const filtered = kw
      ? articles.filter(a => JSON.stringify(a).includes(kw))
      : articles;

    // 결과 없으면 앞 20개라도 반환
    const source = filtered.length > 0 ? filtered : articles.slice(0, 20);

    const result = source.slice(0, 50).map(a => ({
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
