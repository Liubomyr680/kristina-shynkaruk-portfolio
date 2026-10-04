const photos=[['139','A quiet beginning','Bride in soft window light'],['18','Together, always','Wedding couple standing together in an ornate room'],['180','The little things','Close-up of a bride holding a white calla lily'],['144','Before the day begins','Bride framed by a bright archway'],['15','A moment to yourself','Groom adjusting his tie beside the window'],['179','Light & shadow','Bridal portrait with flowing veil'],['171','An unhurried morning','Bride resting on a sofa'],['146','Room to breathe','Bride in a sunlit room with arches'],['189','Something beautiful','Delicate details of a lace wedding dress'],['183','In the stillness','Bride holding a flower beside the window'],['1','Finishing touches','Polished wedding shoes and accessories'],['19','Reflections','Groom reflected in an antique mirror'],['184','A soft pause','Bridal portrait in shadow'],['20','Just before','Groom preparing in front of a mirror'],['9','Ready for forever','Groom straightening his tie']];
let lightboxOrder=photos.map((_,i)=>i);
let photoIndex=0;const gallery=document.querySelector('#gallery'),lightbox=document.querySelector('#lightbox');
function renderGallery(){if(!gallery)return;gallery.innerHTML='';photos.forEach((original,i)=>{const p=localizePhoto(original,i);const figure=document.createElement('figure');figure.innerHTML=`<button class="photo-button" aria-label="${localeText('open')} ${p[1].toLowerCase()}"><img src="/images/Photo-${p[0]}.webp" loading="lazy" alt="${p[2]}"></button><figcaption><span>${p[1]}</span><span>${String(i+1).padStart(2,'0')}</span></figcaption>`;figure.querySelector('button').addEventListener('click',()=>{lightboxOrder=photos.map((_,index)=>index);showPhoto(i);lightbox.showModal();});gallery.append(figure);});}
function showPhoto(i){photoIndex=(i+photos.length)%photos.length;const p=localizePhoto(photos[photoIndex],photoIndex);document.querySelector('#lightbox-image').src=`/images/Photo-${p[0]}.webp`;document.querySelector('#lightbox-image').alt=p[2];document.querySelector('#lightbox-caption').textContent=`${String(lightboxOrder.indexOf(photoIndex)+1).padStart(2,'0')} / ${lightboxOrder.length} — ${p[1]}`;}
function stepPhoto(direction){const position=lightboxOrder.indexOf(photoIndex);showPhoto(lightboxOrder[(position+direction+lightboxOrder.length)%lightboxOrder.length]);}

document.querySelector('.lightbox-prev').addEventListener('click',()=>stepPhoto(-1));document.querySelector('.lightbox-next').addEventListener('click',()=>stepPhoto(1));lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')stepPhoto(-1);if(e.key==='ArrowRight')stepPhoto(1);});
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});document.querySelector('#year').textContent=new Date().getFullYear();renderGallery();


// Sample weddings share the supplied portfolio photographs; replace each photo list with its own collection later.
const stories=[
 {names:{en:'Andrii & Sofia',pl:'Andrij i Sofia',uk:'Андрій та Софія'},date:'2026-06-14',cover:1,photos:[10,14,4,11,13,7,3,0,6,8,2,5,9,12,1]},
 {names:{en:'Maksym & Anna',pl:'Maksym i Anna',uk:'Максим та Анна'},date:'2026-07-18',cover:7,photos:[7,3,6,0,8,2,9,12,5,10,14,4,13,11,1]},
 {names:{en:'Danylo & Olena',pl:'Danyło i Olena',uk:'Данило та Олена'},date:'2026-09-05',cover:3,photos:[3,0,5,9,12,8,2,6,7,10,4,14,11,13,1]}
];
let activeStory=null;
const storyCards=document.querySelector('#story-cards'),storyDetail=document.querySelector('#story-detail');
function storyDate(story){return new Intl.DateTimeFormat({en:'en-GB',pl:'pl-PL',uk:'uk-UA'}[selectedLanguage],{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(story.date+'T12:00:00Z'));}
function renderStories(){
 if(!storyCards)return;
 storyCards.innerHTML='';
 stories.forEach((story,index)=>{
  const button=document.createElement('button');button.className='story-card';button.dataset.story=index;
  const photo=localizePhoto(photos[story.cover],story.cover);
  button.innerHTML=`<img src="/images/Photo-${photo[0]}.webp" alt="${photo[2]}" loading="lazy"><span class="story-name">${story.names[selectedLanguage]}</span>`;
  button.addEventListener('click',()=>{activeStory=index;renderStories();document.querySelector('#story-title').focus();document.querySelector('#series').scrollIntoView({behavior:'instant'});});storyCards.append(button);
 });
 storyCards.hidden=activeStory!==null;storyDetail.hidden=activeStory===null;
 if(activeStory===null)return;
 const story=stories[activeStory];document.querySelector('#story-title').textContent=story.names[selectedLanguage];const date=document.querySelector('#story-date');date.textContent=storyDate(story);date.dateTime=story.date;
 const grid=document.querySelector('#story-gallery');grid.innerHTML='';
 story.photos.forEach(index=>{const p=localizePhoto(photos[index],index),button=document.createElement('button');button.className='photo-button';button.setAttribute('aria-label',`${localeText('open')} ${p[1].toLowerCase()}`);button.innerHTML=`<img src="/images/Photo-${p[0]}.webp" alt="${p[2]}" loading="lazy">`;button.addEventListener('click',()=>{lightboxOrder=story.photos;showPhoto(index);lightbox.showModal();});grid.append(button);});
}
document.querySelector('#stories-back')?.addEventListener('click',()=>{const previous=activeStory;activeStory=null;renderStories();storyCards.querySelector(`[data-story="${previous}"]`).focus();document.querySelector('#series').scrollIntoView({behavior:'instant'});});

document.addEventListener('languagechange',()=>{renderGallery();renderStories();if(lightbox.open)showPhoto(photoIndex);});
initializeLanguage();

const backToTop=document.querySelector('#back-to-top');
function updateBackToTop(){backToTop.hidden=window.scrollY<240;}
window.addEventListener('scroll',updateBackToTop,{passive:true});
window.addEventListener('pageshow',updateBackToTop);
backToTop.addEventListener('click',()=>{
 const root=document.documentElement;
 root.style.scrollBehavior='auto';
 document.querySelector('.header .brand').focus({preventScroll:true});
 window.scrollTo({top:0,left:0,behavior:'instant'});
 requestAnimationFrame(()=>{root.style.removeProperty('scroll-behavior');});
 if(location.hash)history.replaceState(null,'',location.pathname+location.search);
 updateBackToTop();
});
updateBackToTop();
const menuToggle=document.querySelector('#menu-toggle');
const mainNavigation=document.querySelector('#main-navigation');
const mobileNavigation=window.matchMedia('(max-width: 700px)');
function setMenuBackground(open){
 document.body.classList.toggle('navigation-open',open);
 document.querySelectorAll('main,footer,.header>.brand,#back-to-top').forEach(element=>element.inert=open);
}
function closeNavigation(returnFocus=false){
 setMenuBackground(false);
 menuToggle.setAttribute('aria-expanded','false');
 mainNavigation.classList.remove('is-open');
 if(returnFocus)menuToggle.focus();
}
menuToggle.addEventListener('click',()=>{
 const open=menuToggle.getAttribute('aria-expanded')!=='true';
 menuToggle.setAttribute('aria-expanded',String(open));
 mainNavigation.classList.toggle('is-open',open);
 setMenuBackground(open);
});
mainNavigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeNavigation()));
document.addEventListener('click',event=>{if(!mainNavigation.contains(event.target)&&!menuToggle.contains(event.target))closeNavigation();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuToggle.getAttribute('aria-expanded')==='true'){closeNavigation(true);}});
document.querySelector('.header').addEventListener('focusout',event=>{if(!document.querySelector('.header').contains(event.relatedTarget))closeNavigation();});
mobileNavigation.addEventListener('change',()=>closeNavigation());

// Keep keyboard navigation inside the full-screen mobile menu while it is open.
document.addEventListener('keydown',event=>{
 if(event.key!=='Tab'||menuToggle.getAttribute('aria-expanded')!=='true')return;
 const focusable=[menuToggle,...mainNavigation.querySelectorAll('a,button')].filter(el=>el.getClientRects().length&&!el.disabled);
 const first=focusable[0],last=focusable[focusable.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
