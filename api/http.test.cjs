const {test}=require('node:test'),assert=require('node:assert/strict');
test('HTTP boundary requires a local session, rejects forged roles and cross-origin changes',async t=>{
 const server=require('../server.cjs');await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base='http://127.0.0.1:'+server.address().port;
 let response=await fetch(base+'/api/admin/stories',{headers:{'x-ms-client-principal':Buffer.from(JSON.stringify({userRoles:['owner']})).toString('base64')}});assert.equal(response.status,401);
 response=await fetch(base+'/admin/',{redirect:'manual'});assert.equal(response.status,302);
 response=await fetch(base+'/api/local-session',{method:'POST',headers:{Origin:'https://untrusted.example','X-Admin-Request':'1'}});assert.equal(response.status,403);
 response=await fetch(base+'/api/local-session',{method:'POST',headers:{Origin:base,'X-Admin-Request':'1'}});assert.equal(response.status,200);const cookie=response.headers.get('set-cookie').split(';')[0];assert.match(response.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
 response=await fetch(base+'/api/admin/stories',{headers:{Cookie:cookie}});assert.equal(response.status,200);
 response=await fetch(base+'/api/admin/stories',{method:'POST',headers:{Cookie:cookie,Origin:'https://untrusted.example','X-Admin-Request':'1'}});assert.equal(response.status,403);
 response=await fetch(base+'/.auth/logout',{headers:{Cookie:cookie},redirect:'manual'});assert.equal(response.status,302);
 response=await fetch(base+'/api/admin/stories',{headers:{Cookie:cookie}});assert.equal(response.status,401);
});
