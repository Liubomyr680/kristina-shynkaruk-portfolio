const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {LocalStore}=require('./api/storage.cjs'),{handle}=require('./api/service.cjs');
const root=path.join(__dirname,'dist'),store=new LocalStore(process.env.CONTENT_DIR||path.join(__dirname,'.data'));
const port=Number(process.env.PORT||4173),sessions=new Map();
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
function loopback(req){return ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)&&['localhost','127.0.0.1','[::1]'].includes(new URL('http://'+req.headers.host).hostname);}
const server=http.createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://'+req.headers.host),route=decodeURIComponent(url.pathname).replace(/\/$/,'')||'/';
 const token=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('owner_session='))?.slice(14);
 const owner=loopback(req)&&sessions.get(token)>Date.now();
 const sameOrigin=req.headers.origin===url.origin;
 const send=(status,body,headers={})=>{res.writeHead(status,{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(body);};
 if(route==='/api/local-session'){
  if(req.method!=='POST'||!loopback(req)||!sameOrigin||req.headers['x-admin-request']!=='1')return send(403,'Forbidden');
  const id=crypto.randomBytes(32).toString('hex');sessions.set(id,Date.now()+8*60*60*1000);
  return send(200,JSON.stringify({owner:true}),{'Content-Type':'application/json','Set-Cookie':`owner_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`});
 }
 if(route==='/api/local-mode')return send(200,JSON.stringify({local:loopback(req)}),{'Content-Type':'application/json'});
 if(route==='/.auth/logout'){sessions.delete(token);return send(302,'',{Location:'/admin/login.html','Set-Cookie':'owner_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});}
 if(route.startsWith('/api/')){
  if(req.method!=='GET'&&!sameOrigin)return send(403,JSON.stringify({error:'Invalid origin.'}),{'Content-Type':'application/json'});
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>8*1024*1024)return send(413,JSON.stringify({error:'Upload too large.'}),{'Content-Type':'application/json'});chunks.push(chunk);}
  const result=await handle({method:req.method,pathname:route,headers:req.headers,bytes:Buffer.concat(chunks),owner},store);return send(result.status,result.body,result.headers);
 }
 if(route.startsWith('/admin')&&!['/admin/login.html','/admin/login.js','/admin/admin.css'].includes(route)&&!owner)return send(302,'',{Location:'/admin/login.html'});
 let name=route;if(['/wedding-stories','/about','/contacts','/admin'].includes(name))name+='/index.html';if(name==='/')name='/index.html';
 const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))return send(403,'Forbidden');
 try{return send(200,await fs.readFile(file),{'Content-Type':types[path.extname(file)]||'application/octet-stream'});}catch{return send(404,'Not found');}
 }catch(e){res.writeHead(400);res.end('Invalid request');}
});
if(require.main===module)server.listen(port,'0.0.0.0',()=>console.log(`Website: http://127.0.0.1:${port}\nOwner editor (this laptop only): http://127.0.0.1:${port}/admin`));
module.exports=server;
