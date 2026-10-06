const {randomUUID}=require('node:crypto');
const initialPortfolio=require('./seed.cjs').portfolio;
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const json=(body,status=200)=>({status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},body:JSON.stringify(body)});
function storedPhotos(story){return new Set([story.draft,story.published].filter(Boolean).flatMap(v=>v.photos.map(p=>p.id)).filter(id=>id.endsWith('.webp')));}
async function cleanup(store,before,after){for(const id of before){if(!after.has(id))try{await store.remove(id);}catch(e){console.error('Unused photo cleanup failed',id);}}}
function validate(value,existing){
 if(!value||typeof value!=='object')fail(400,'Missing series details.');
 const names={};for(const lang of ['en','pl','uk']){const name=value.names?.[lang];if(typeof name!=='string'||name.trim().length>120)fail(400,'Series titles must be under 120 characters.');names[lang]=name.trim();}
 if(!names.en)fail(400,'Enter a series title.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value.date)||Number.isNaN(Date.parse(value.date))||new Date(value.date).toISOString().slice(0,10)!==value.date)fail(400,'Enter a valid wedding date.');
 if(!Array.isArray(value.photos)||value.photos.length>100)fail(400,'A series can contain up to 100 photos.');
 const allowed=new Map(existing.map(p=>[p.id,p]));const seen=new Set();
 const photos=value.photos.map(p=>{if(!p||!allowed.has(p.id)||seen.has(p.id))fail(400,'Invalid photo selection.');seen.add(p.id);return allowed.get(p.id);});
 if(photos.length&&!seen.has(value.cover))fail(400,'Select a cover photo.');
 return {names,date:value.date,cover:photos.length?value.cover:null,photos};
}
function validatePortfolio(value,existing){
 if(!Array.isArray(value?.photos)||value.photos.length>100)fail(400,'Портфоліо може містити до 100 фото.');
 const allowed=new Map(existing.map(p=>[p.id,p])),seen=new Set();
 return {photos:value.photos.map(photo=>{if(!photo||!allowed.has(photo.id)||seen.has(photo.id))fail(400,'Invalid photo selection.');seen.add(photo.id);return allowed.get(photo.id);})};
}
async function handle({method,pathname,headers={},bytes=Buffer.alloc(0),owner=false},store){
 try{
 const parts=pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean);
 if(parts[0]==='admin'&&!owner)return json({error:'Owner sign-in required.'},401);
 if(parts[0]==='admin'&&method!=='GET'&&headers['x-admin-request']!=='1')return json({error:'Invalid request.'},403);
 if(method==='GET'&&parts.join('/')==='admin/session')return json({owner:true});
 if(!['stories','portfolio','admin','media'].includes(parts[0]))return json({error:'Not found'},404);
 const {data,etag}=await store.read();
 data.portfolio??=initialPortfolio();
 if(method==='GET'&&parts.join('/')==='portfolio')return json({photos:data.portfolio.published?.photos||[]});
 if(method==='GET'&&parts.join('/')==='admin/portfolio')return json({story:data.portfolio});
 if(method==='GET'&&parts.join('/')==='stories')return json({stories:data.stories.filter(s=>s.published).map(s=>({id:s.id,...s.published}))});
 if(method==='GET'&&parts.join('/')==='admin/stories')return json({stories:data.stories});
 const mediaId=parts[0]==='media'?parts[1]:parts[0]==='admin'&&parts[1]==='media'?parts[2]:null;
 if(method==='GET'&&mediaId){
  if(!/^[a-f0-9-]{36}\.webp$/.test(mediaId))fail(404,'Photo not found.');
  const visible=[...data.stories,data.portfolio].some(s=>[s.published,...(owner?[s.draft]:[])].filter(Boolean).some(v=>v.photos.some(p=>p.id===mediaId)));
  if(!visible)fail(404,'Photo not found.');
  return {status:200,headers:{'Content-Type':'image/webp','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},body:await store.get(mediaId)};
 }
 const portfolio=parts[0]==='admin'&&parts[1]==='portfolio';
 if(portfolio){if(!['PUT','POST'].includes(method)||parts.length>3||method==='POST'&&!['photos','publish'].includes(parts[2]))return json({error:'Not found'},404);parts.splice(1,1,'stories','portfolio');}
 if(parts[0]!=='admin'||parts[1]!=='stories')return json({error:'Not found'},404);
 if(method==='POST'&&parts.length===2){
  const blank={names:{en:'Untitled wedding',pl:'',uk:''},date:new Date().toISOString().slice(0,10),cover:null,photos:[]};
  const story={id:randomUUID(),version:1,draft:blank,published:null};data.stories.push(story);await store.write(data,etag);return json({story},201);
 }
 const story=portfolio?data.portfolio:data.stories.find(s=>s.id===parts[2]);if(!story)fail(404,'Series not found.');
 const validateDraft=portfolio?validatePortfolio:validate;
 const before=storedPhotos(story);
 if(headers['if-match']!==String(story.version)&&method!=='GET')fail(409,'This series was changed elsewhere. Reload before saving.');
 if(method==='POST'&&parts[3]==='photos'){
  if(story.draft.photos.length>=100)fail(400,'A series can contain up to 100 photos.');
  if(bytes.length>8*1024*1024)fail(413,'Photo is too large (maximum 8 MB).');
  if(bytes.length<20||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')fail(400,'Upload a valid WebP photo.');
  const id=randomUUID()+'.webp';await store.put(id,bytes);
  story.draft.photos.push({id,url:'/api/media/'+id});if(!portfolio)story.draft.cover??=id;story.version++;
  try{await store.write(data,etag);}catch(e){await store.remove(id);throw e;}return json({story},201);
 }
 let payload={};if(bytes.length){try{payload=JSON.parse(bytes.toString());}catch{fail(400,'Invalid request.');}}
 if(method==='PUT'&&parts.length===3){story.draft=validateDraft(payload,story.draft.photos);story.version++;await store.write(data,etag);await cleanup(store,before,storedPhotos(story));return json({story});}
 if(method==='POST'&&parts[3]==='publish'){
  story.draft=validateDraft(payload,story.draft.photos);if(!portfolio&&!story.draft.photos.length)fail(400,'Add at least one photo before publishing.');
  story.published=structuredClone(story.draft);story.version++;await store.write(data,etag);await cleanup(store,before,storedPhotos(story));return json({story});
 }
 if(method==='POST'&&parts[3]==='unpublish'){story.published=null;story.version++;await store.write(data,etag);await cleanup(store,before,storedPhotos(story));return json({story});}
 if(method==='DELETE'&&parts.length===3){data.stories=data.stories.filter(s=>s.id!==story.id);await store.write(data,etag);await cleanup(store,before,new Set());return json({deleted:true});}
 return json({error:'Not found'},404);
 }catch(e){if(!e.status)console.error(e);return json({error:e.status?e.message:'Could not complete the request. Please try again.'},e.status||500);}
}
module.exports={handle,validate};
