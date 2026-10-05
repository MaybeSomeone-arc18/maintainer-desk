// Measures the workflow's own Normalize + Search + Rank code on real, maintainer-confirmed duplicates.
// Usage: node eval/run-eval.js [repo] [pairs]   (unauthenticated GitHub API; slow on purpose)
const fs = require('fs'), path = require('path');
const repo = process.argv[2] || 'n8n-io/n8n';
const want = Number(process.argv[3] || 30);
const wf = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'workflows', 'maintainer-desk-triage.workflow.json'), 'utf8'));
const code = n => wf.nodes.find(x => x.name === n).parameters.jsCode;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const gh = async u => { const r = await fetch('https://api.github.com' + u, { headers: { 'User-Agent': 'maintainer-desk-eval' } }); if (!r.ok) throw new Error(r.status + ' ' + u); return r.json(); };
const run = (src, ctx) => new Function('$input', '$', src)(ctx.input, ctx.dollar);

(async () => {
  const q = encodeURIComponent(`repo:${repo} is:issue is:closed "duplicate of #" in:comments`);
  const found = (await gh(`/search/issues?q=${q}&per_page=${want * 2}&sort=created&order=desc`)).items;
  const pairs = [];
  for (const it of found) {
    if (pairs.length >= want) break;
    await sleep(500);
    let comments; try { comments = await gh(`/repos/${repo}/issues/${it.number}/comments?per_page=30`); } catch (e) { console.error('skip', it.number, e.message); continue; }
    let orig = null;
    for (const c of comments) { const m = /duplicate of #(\d+)/i.exec(c.body || ''); if (m && Number(m[1]) !== it.number) { orig = Number(m[1]); break; } }
    if (!orig) continue;
    pairs.push({ dup: it, orig });
  }
  const rows = [];
  for (const p of pairs) {
    const payload = { action: 'opened', repository: { full_name: repo }, issue: { number: p.dup.number, title: p.dup.title, body: p.dup.body, user: { login: 'x' }, html_url: p.dup.html_url } };
    const norm = run(code('Normalize issue'), { input: { first: () => ({ json: payload }) } })[0].json;
    await sleep(7000);
    let items = []; try { items = (await gh(`/search/issues?q=${encodeURIComponent('repo:' + repo + ' is:issue ' + norm.query)}&per_page=10`)).items; } catch (e) { console.error('search fail', p.dup.number, e.message); }
    const ranked = run(code('Rank related issues'), { input: { first: () => ({ json: { items } }) }, dollar: () => ({ first: () => ({ json: norm }) }) })[0].json.candidates;
    const nums = ranked.map(r => r.number);
    const inPool = items.some(i => i.number === p.orig);
    rows.push({ dup: p.dup.number, orig: p.orig, inSearchPool: inPool, top1: nums[0] === p.orig, top3: nums.includes(p.orig), topScore: ranked[0] ? ranked[0].score : 0, flagged: ranked[0] ? ranked[0].score >= 0.3 : false, flaggedCorrect: ranked[0] ? (ranked[0].score >= 0.3 && ranked[0].number === p.orig) : false });
    console.error('done', p.dup.number, JSON.stringify(rows[rows.length - 1]));
  }
  const n = rows.length, c = k => rows.filter(r => r[k]).length;
  const summary = { repo, date: new Date().toISOString().slice(0, 10), pairs: n, original_in_search_results: c('inSearchPool'), top1: c('top1'), top3: c('top3'), flagged_as_duplicate_at_0_3: c('flagged'), flagged_and_correct: c('flaggedCorrect') };
  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({ summary, rows }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
})();
