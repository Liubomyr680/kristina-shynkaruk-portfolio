const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const seed=require('./seed.cjs');
class LocalStore{
 constructor(root){this.root=root;this.queue=Promise.resolve();}
 async read(){try{const body=await fs.readFile(path.join(this.root,'stories.json'));return {data:JSON.parse(body),etag:crypto.createHash('sha256').update(body).digest('hex')};}catch(e){if(e.code!=='ENOENT')throw e;return {data:seed(),etag:null};}}
 async write(data,etag){const work=this.queue.then(async()=>{await fs.mkdir(this.root,{recursive:true});if((await this.read()).etag!==etag)throw Object.assign(new Error('Content changed. Reload and try again.'),{status:409});const file=path.join(this.root,'stories.json');await fs.writeFile(file+'.tmp',JSON.stringify(data));await fs.rename(file+'.tmp',file);});this.queue=work.catch(()=>{});return work;}
 async put(id,bytes){await fs.mkdir(path.join(this.root,'photos'),{recursive:true});await fs.writeFile(path.join(this.root,'photos',id),bytes,{flag:'wx'});}
 async get(id){return fs.readFile(path.join(this.root,'photos',id));}
 async remove(id){await fs.rm(path.join(this.root,'photos',id),{force:true});}
}
class BlobStore{
 constructor(){const {BlobServiceClient}=require('@azure/storage-blob');if(!process.env.PHOTO_STORAGE_CONNECTION_STRING)throw new Error('Photo storage is not configured.');this.container=BlobServiceClient.fromConnectionString(process.env.PHOTO_STORAGE_CONNECTION_STRING).getContainerClient(process.env.PHOTO_STORAGE_CONTAINER||'wedding-content');}
 async read(){try{const result=await this.container.getBlobClient('stories.json').download();const chunks=[];for await(const c of result.readableStreamBody)chunks.push(c);return {data:JSON.parse(Buffer.concat(chunks)),etag:result.etag};}catch(e){if(e.statusCode!==404)throw e;return {data:seed(),etag:null};}}
 async write(data,etag){const bytes=Buffer.from(JSON.stringify(data));try{await this.container.getBlockBlobClient('stories.json').uploadData(bytes,{conditions:etag?{ifMatch:etag}:{ifNoneMatch:'*'},blobHTTPHeaders:{blobContentType:'application/json'}});}catch(e){if(e.statusCode===412||e.statusCode===409)throw Object.assign(new Error('Content changed. Reload and try again.'),{status:409});throw e;}}
 async put(id,bytes){await this.container.getBlockBlobClient('photos/'+id).uploadData(bytes,{conditions:{ifNoneMatch:'*'},blobHTTPHeaders:{blobContentType:'image/webp'}});}
 async get(id){return this.container.getBlobClient('photos/'+id).downloadToBuffer();}
 async remove(id){await this.container.getBlobClient('photos/'+id).deleteIfExists();}
}
module.exports={LocalStore,BlobStore};
