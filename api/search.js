export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  const OC = process.env.LAW_API_KEY;

  try {
    const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=${OC}&target=law&type=JSON&display=20&query=${encodeURIComponent(query)}`;
    const upstream = await fetch(url);
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { LawSearch: { law: [] } }; }

    const laws = [].concat(data?.LawSearch?.law || []);

    if (laws.length === 0) {
      // 주요 건축 법령 — MST는 법령상세링크에서 추출한 실제값
      return res.status(200).json({
        LawSearch: {
          law: [
            { 법령ID:'1',  법령명한글:'건축법',                                       법령구분명:'법률',        공포일자:'20231019', 법령일련번호:'261770' },
            { 법령ID:'2',  법령명한글:'건축법 시행령',                                  법령구분명:'대통령령',    공포일자:'20231031', 법령일련번호:'261769' },
            { 법령ID:'3',  법령명한글:'건축법 시행규칙',                                 법령구분명:'국토교통부령',공포일자:'20230915', 법령일련번호:'261768' },
            { 법령ID:'4',  법령명한글:'건축물의 피난·방화구조 등의 기준에 관한 규칙',     법령구분명:'국토교통부령',공포일자:'20230915', 법령일련번호:'258751' },
            { 법령ID:'5',  법령명한글:'시설물의 안전 및 유지관리에 관한 특별법',          법령구분명:'법률',        공포일자:'20231010', 법령일련번호:'261806' },
            { 법령ID:'6',  법령명한글:'시설물의 안전 및 유지관리에 관한 특별법 시행령',   법령구분명:'대통령령',    공포일자:'20230101', 법령일련번호:'255953' },
            { 법령ID:'7',  법령명한글:'건설기술 진흥법',                                 법령구분명:'법률',        공포일자:'20230801', 법령일련번호:'259361' },
            { 법령ID:'8',  법령명한글:'건설기술 진흥법 시행령',                          법령구분명:'대통령령',    공포일자:'20230801', 법령일련번호:'259360' },
            { 법령ID:'9',  법령명한글:'산업안전보건법',                                  법령구분명:'법률',        공포일자:'20231120', 법령일련번호:'262489' },
            { 법령ID:'10', 법령명한글:'화재의 예방 및 안전관리에 관한 법률',             법령구분명:'법률',        공포일자:'20231201', 법령일련번호:'262491' },
            { 법령ID:'11', 법령명한글:'소방시설 설치 및 관리에 관한 법률',              법령구분명:'법률',        공포일자:'20230103', 법령일련번호:'254584' },
            { 법령ID:'12', 법령명한글:'주택건설기준 등에 관한 규정',                     법령구분명:'대통령령',    공포일자:'20230720', 법령일련번호:'259289' },
          ]
        }
      });
    }

    // lawSearch 결과에서 MST를 법령상세링크에서 추출
    const enriched = laws.map(l => {
      let mst = l.법령일련번호 || '';
      const link = l.법령상세링크 || '';
      const mstMatch = link.match(/MST=(\d+)/);
      if (mstMatch) mst = mstMatch[1];
      return { ...l, 법령일련번호: mst };
    });

    res.status(200).json({ LawSearch: { law: enriched } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
