let portfolioLoadFailed=false;
function renderManagedPortfolio(){
 gallery.replaceChildren();
 if(portfolioLoadFailed){const message=document.createElement('p');message.textContent={en:'Could not load photos. Please refresh to try again.',pl:'Nie udało się wczytać zdjęć. Odśwież stronę.',uk:'Не вдалося завантажити фото. Оновіть сторінку.'}[selectedLanguage];gallery.append(message);return;}
 managedPortfolio.forEach((photo,index)=>{
  const figure=document.createElement('figure'),button=document.createElement('button'),img=document.createElement('img');
  button.className='photo-button';button.setAttribute('aria-label',localeText('open')+' '+localeText('photo')+' '+(index+1));
  img.src=photo.url;img.loading='lazy';
  const originalIndex=photos.findIndex(p=>'sample-'+p[0]===photo.id);
  img.alt=originalIndex>=0?localizePhoto(photos[originalIndex],originalIndex)[2]:localeText('photo')+' '+(index+1);
  button.append(img);button.onclick=()=>{managedLightbox=managedPortfolio;showManagedPhoto(index);lightbox.showModal();};figure.append(button);gallery.append(figure);
 });
}
if(gallery&&location.hostname!=='liubomyr680.github.io'){
 managedPortfolio=[];renderManagedPortfolio();
 fetch('/api/portfolio',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Unavailable');return r.json();}).then(data=>{if(!Array.isArray(data.photos))throw new Error('Invalid portfolio');managedPortfolio=data.photos;renderManagedPortfolio();}).catch(()=>{portfolioLoadFailed=true;renderManagedPortfolio();});
}
