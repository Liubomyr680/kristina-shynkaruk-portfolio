const {app}=require('@azure/functions');
const {BlobStore}=require('./storage.cjs');
const {handle}=require('./service.cjs');
let store;
app.http('content',{route:'{*path}',methods:['GET','POST','PUT','DELETE'],authLevel:'anonymous',handler:async request=>{
 let principal=null;try{principal=JSON.parse(Buffer.from(request.headers.get('x-ms-client-principal')||'','base64').toString('utf8'));}catch{}
 // This adapter is deployed only as a managed Static Web Apps API. SWA supplies this trusted header.
 const owner=!!principal?.userRoles?.includes('owner');
 const length=Number(request.headers.get('content-length')||0);if(length>8*1024*1024)return {status:413,jsonBody:{error:'Upload too large.'}};
 try{store??=new BlobStore();const bytes=Buffer.from(await request.arrayBuffer());if(bytes.length>8*1024*1024)return {status:413,jsonBody:{error:'Upload too large.'}};return await handle({method:request.method,pathname:new URL(request.url).pathname,headers:Object.fromEntries(request.headers),bytes,owner},store);}catch{ return {status:503,jsonBody:{error:'Photo storage is not configured or unavailable.'}};}
}});
