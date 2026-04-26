export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  const OC = process.env.LAW_API_KEY;

  // 건축 관련 주요 법령명 목록
  const majorLaws = [
    '건축법', '건축법 시행령', '건축법 시행규칙',
    '건축물의 피난·방화구조 등의 기준에 관한 규칙',
    '시설물의 안전 및 유지관리에 관한 특별법',
    '건설기술 진흥법', '산업안전보건법',
    '화재의 예방 및 안전관리에 관한 법률',
    '소방시설 설치 및 관리에 관한 법률',
    '주택건설기준 등에 관한 규정'
  ];

  try {
    // 1) 키워드로 법령명 검색
    const searchUrl = `https://www.law.go.kr/DRF/lawSearch.do?OC=${OC}&target=law&type=JSON&display=20&query=${encodeURIComponent(query)}`;
    const upstream = await fetch(searchUrl);
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { LawSearch: { law: [] } }; }

    let laws = [].concat(data?.LawSearch?.law || []);

    // 2) 결과 없으면 주요 법령 각각 검색해서 실제 MST 가져오기
    if (laws.length === 0) {
      const results = await Promise.all(
        majorLaws.map(async (lawName) => {
          try {
            const r = await fetch(`https://www.law.go.kr/DRF/lawSearch.do?OC=${OC}&target=law&type=JSON&display=1&query=${encodeURIComponent(lawName)}`);
            const t = await r.text();
            const d = JSON.parse(t);
            const found = [].concat(d?.LawSearch?.law || []);
            // 법령명이 정확히 일치하는 것만
            return found.find(l => (l.법령명한글||'').trim() === lawName) || null;
          } catch { return null; }
        })
      );
      laws = results.filter(Boolean);
    }

    // 3) 법령상세링크에서 MST 추출
    const enriched = laws.map(l => {
      let mst = l.법령일련번호 || '';
      const link = l.법령상세링크 || '';
      const m = link.match(/MST=(\d+)/);
      if (m) mst = m[1];
      return { ...l, 법령일련번호: mst };
    });

    res.status(200).json({ LawSearch: { law: enriched } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
