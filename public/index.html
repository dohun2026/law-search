import fs from 'fs';
import path from 'path';

function loadDoc(doc) {
  const safe = (doc || '').replace(/[^0-9A-Za-z가-힣]/g, '');
  if (!safe) return null;
  const file = path.join(process.cwd(), 'data', 'guide', `${safe}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { doc, keyword } = req.query;
  const kw = (keyword || '').trim();

  try {
    const data = loadDoc(doc);
    if (!data) return res.status(200).json({ articles: [] });

    const filtered = kw
      ? data.filter(s => `${s.title}${s.content}`.includes(kw))
      : data.slice(0, 10);

    const articles = filtered.slice(0, 30).map(s => ({
      num: s.num || '',
      title: s.title || '',
      content: (s.chapter ? `[${s.chapter}] ` : '') + (s.content || ''),
      items: [],
    }));

    res.status(200).json({ articles });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
