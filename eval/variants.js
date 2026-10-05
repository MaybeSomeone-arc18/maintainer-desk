// Compares query strategies on the same duplicate pairs (pairs come from results.json written by run-eval.js).
const fs = require('fs'), path = require('path');
const repo = process.argv[2] || 'n8n-io/n8n', variant = process.argv[3] || 'B';
const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'results.json'), 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const gh = async u => { const r = await fetch('https://api.github.com' + u, { headers: { 'User-Agent': 'maintainer-desk-eval' } }); if (!r.ok) throw new Error(r.status + ' ' + u); return r.json(); };
const stop = new Set('the a an and or of to in on for with is it this that be are was not no when i my we you can cant cannot how do does did from as at by if have has had but so than then them there their what which will would should could also just get got use using used error issue bug problem node nodes workflow n8n'.split(' '));
const toks = s => [...new Set((s || '').toLowerCase().replace(/[^a-z0-9_\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stop.has(w)))];
const tk = s => new Set((s || '').toLowerCase().replace(/[^a-z0-9_\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2));
const jac = (A, B) => { let n = 0; for (const w of A) if (B.has(w)) n++; const u = new Set([...A, ...B]).size || 1; return n / u; };
const byLen = a => [...a].sort((x, y) => y.length - x.length);
const V = {
  A: d => [toks(d.title + ' ' + d.body).slice(0, 6).join(' ')],
  B: d => { const t = toks(d.title); return [byLen(t).slice(0, 4).join(' '), byLen(t).slice(0, 2).join(' ')]; },
  C: d => { const t = toks(d.title); const b = byLen(toks(d.body)).slice(0, 2); return [byLen(t).slice(0, 3).join(' '), byLen(t).slice(0, 2).join(' '), b.join(' ')]; },
};
(async () => {
  const q = encodeURIComponent(`repo:${repo} is:issue is:closed "duplicate of #" in:comments`);
  const found = (await gh(`/search/issues?q=${q}&per_page=60&sort=created&order=desc`)).items;
  const byNum = Object.fromEntries(found.map(i => [i.number, i]));
  const rows = [];
  for (const p of base.rows) {
    const d = byNum[p.dup]; if (!d) continue;
    const pool = new Map();
    for (const qs of V[variant](d)) {
      if (!qs) continue;
      await sleep(7000);
      try { for (const it of (await gh(`/search/issues?q=${encodeURIComponent('repo:' + repo + ' is:issue ' + qs)}&per_page=10`)).items) pool.set(it.number, it); } catch (e) { console.error('fail', e.message); }
    }
    const myAll = new Set(toks(d.title + ' ' + d.body)), myT = tk(d.title);
    const ranked = [...pool.values()].filter(i => i.number !== d.number && !i.pull_request).map(i => ({ number: i.number, score: 0.6 * jac(myT, tk(i.title)) + 0.4 * jac(myAll, tk(i.title + ' ' + i.body)) })).sort((a, b) => b.score - a.score).slice(0, 3);
    const nums = ranked.map(r => r.number);
    rows.push({ dup: d.number, orig: p.orig, inPool: pool.has(p.orig), top1: nums[0] === p.orig, top3: nums.includes(p.orig) });
    console.error(variant, d.number, JSON.stringify(rows[rows.length - 1]));
  }
  const c = k => rows.filter(r => r[k]).length;
  const s = { variant, pairs: rows.length, original_in_pool: c('inPool'), top1: c('top1'), top3: c('top3') };
  fs.writeFileSync(path.join(__dirname, `variant-${variant}.json`), JSON.stringify({ summary: s, rows }, null, 2));
  console.log(JSON.stringify(s));
})();
