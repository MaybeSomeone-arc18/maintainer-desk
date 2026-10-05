// Mock GitHub + OpenAI-compatible API for local tests. LLM_MODE: good | bad_number | garbage | fail
const http=require('http');const mode=()=>process.env.LLM_MODE||'good';
const CONTRIB=`# Contributing\n\nThanks for helping.\n\nWhen you report a bug, always include the n8n version, your database type and the steps to reproduce the problem so we can verify it.\n\nPull requests need a linked issue.\n`;
http.createServer((req,res)=>{let b='';req.on('data',d=>b+=d);req.on('end',()=>{
 const u=new URL(req.url,'http://x');const j=(o,c=200)=>{res.writeHead(c,{'content-type':'application/json'});res.end(JSON.stringify(o))};
 if(u.pathname==='/search/issues'){const q=u.searchParams.get('q')||'';global.queries=(global.queries||[]);console.log('SEARCH',q);
  const items=[];if(/webhook|timeout/.test(q))items.push({number:101,title:'Webhook node times out on large payload',body:'webhook timeout large payload error version 1.2',html_url:'https://github.com/o/r/issues/101',state:'open'},{number:102,title:'Unrelated docs typo',body:'typo in docs',html_url:'https://github.com/o/r/issues/102',state:'open'});
  return j({total_count:items.length,items});}
 if(u.pathname.endsWith('/contents/CONTRIBUTING.md')){if(/norepo/.test(u.pathname)){return j({message:'Not Found'},404)}res.writeHead(200,{'content-type':'text/plain'});return res.end(CONTRIB);}
 if(u.pathname==='/v1/chat/completions'){console.log('LLM',mode(),'auth',req.headers.authorization);
  if(mode()==='fail')return j({error:'boom'},500);
  let content;if(mode()==='good')content=JSON.stringify({duplicate_of:101,reason:'Both report webhook timeouts on large payloads.',missing_details:['n8n version'],reply:'Thanks! This looks like #101 (webhook timeout on large payloads). Could you confirm and share your n8n version?'});
  if(mode()==='bad_number')content=JSON.stringify({duplicate_of:99999,reason:'made up',missing_details:[],reply:'x'});
  if(mode()==='garbage')content='not json at all';
  return j({choices:[{message:{content}}]});}
 j({message:'not found'},404);});}).listen(9001,()=>console.log('mock up'));
