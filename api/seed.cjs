const ids=['139','18','180','144','15','179','171','146','189','183','1','19','184','20','9'];
module.exports=()=>({stories:[
 ['andrii-sofia',{en:'Andrii & Sofia',pl:'Andrij i Sofia',uk:'Андрій та Софія'},'2026-06-14',1,[10,14,4,11,13,7,3,0,6,8,2,5,9,12,1]],
 ['maksym-anna',{en:'Maksym & Anna',pl:'Maksym i Anna',uk:'Максим та Анна'},'2026-07-18',7,[7,3,6,0,8,2,9,12,5,10,14,4,13,11,1]],
 ['danylo-olena',{en:'Danylo & Olena',pl:'Danyło i Olena',uk:'Данило та Олена'},'2026-09-05',3,[3,0,5,9,12,8,2,6,7,10,4,14,11,13,1]]
].map(([id,names,date,cover,order])=>{const draft={names,date,cover:'sample-'+ids[cover],photos:order.map(i=>({id:'sample-'+ids[i],url:'/images/Photo-'+ids[i]+'.webp'}))};return {id,version:1,draft,published:structuredClone(draft)};})});
module.exports.portfolio=()=>{const draft={photos:ids.map(id=>({id:'sample-'+id,url:'/images/Photo-'+id+'.webp'}))};return {id:'portfolio',version:1,draft,published:structuredClone(draft)};};
