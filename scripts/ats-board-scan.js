// Paste into Claude_Browser__javascript_tool on a page at https://boards-api.greenhouse.io (CORS works from there).
// Returns UK/remote commercial roles from life science employers' own ATS boards.
const slugs="dotmatics benchling genedata insilicomedicine recursionpharmaceuticals isomorphiclabs labgenius ginkgobioworks tempus flatironhealth owkin sophiagenetics bitbio basecampresearch cradle latentlabs elucidata scispot labguru biorender dnanexus seqera lifebit congenica huma relationtherapeutics healx benevolentai certara schrodinger cellarity insitro synthace automata iqvia medidata sapiosciences causaly patsnap revvity cdd labware titian genestack owlstone oxfordnanoporetechnologies bioptimus nucleome uncountable delfa skin-analytics WRITER tetrascience benchsci cradlebio inductive-bio formationbio pathai quantexa accurx tandem-health eclinicalsolutions boltz adaptyv qureight sanogenetics airfinity cognite".split(" ");
const kw=/sales|account|solution|customer|partner|business develop|commercial|presales|pre-sales|consult|success|application scien|product/i;
const uk=/\b(uk|united kingdom|london|england|reading|oxford|cambridge, uk|emea)\b/i;
const skip=/\b(director|vp|vice president|head of|intern|chief)\b/i;
const out=[];
await Promise.all(slugs.map(async s=>{
 for (const [name,url,parse] of [
  ["gh",`https://boards-api.greenhouse.io/v1/boards/${s}/jobs`,j=>j.jobs.map(x=>({t:x.title,l:x.location?.name,u:x.absolute_url,d:x.updated_at}))],
  ["ashby",`https://api.ashbyhq.com/posting-api/job-board/${s}`,j=>j.jobs.map(x=>({t:x.title,l:(x.location||"")+(x.isRemote?" (remote) ":" ")+(x.secondaryLocations||[]).map(y=>y.location).join("/"),u:x.applyUrl||x.jobUrl,d:x.publishedAt}))],
  ["lever",`https://api.lever.co/v0/postings/${s}?mode=json`,j=>j.map(x=>({t:x.text,l:x.categories?.location+" "+(x.workplaceType||""),u:x.applyUrl,d:new Date(x.createdAt).toISOString()}))]]){
  try{const r=await fetch(url); if(!r.ok) continue; const jobs=parse(await r.json());
   jobs.filter(x=>kw.test(x.t)&&uk.test(x.l||"")&&!skip.test(x.t)).forEach(x=>out.push([s,x.t,x.l,x.u,(x.d||"").slice(0,10)].join(" | ")));}catch(e){}
 }}));
out.sort().join("\n")
