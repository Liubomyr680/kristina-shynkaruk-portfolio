// Content is fetched from the same-origin API on Azure and in the local preview.
// GitHub Pages has no API and deliberately continues to use its static samples.
function managedTitle(story){return story.names[selectedLanguage]||story.names.en;}
function renderManagedStories(){
 storyCards.replaceChildren();
 managedStories.forEach((story,index)=>{const button=document.createElement('button');button.className='story-card';button.dataset.story=index;const img=document.createElement('img');img.src=story.photos.find(p=>p.id===story.cover)?.url||story.photos[0]?.url;img.alt=managedTitle(story);img.loading='lazy';const title=document.createElement('span');title.className='story-name';title.textContent=managedTitle(story);button.append(img,title);button.onclick=()=>{activeStory=index;renderManagedStories();document.querySelector('#story-title').focus();document.querySelector('#series').scrollIntoView({behavior:'instant'});};storyCards.append(button);});
 storyCards.hidden=activeStory!==null;storyDetail.hidden=activeStory===null;
 if(!managedStories.length){const message=document.createElement('p');message.textContent={en:'New wedding stories are coming soon.',pl:'Nowe historie ślubne już wkrótce.',uk:'Нові весільні історії — незабаром.'}[selectedLanguage];storyCards.append(message);}
 if(activeStory===null)return;const story=managedStories[activeStory];document.querySelector('#story-title').textContent=managedTitle(story);const date=document.querySelector('#story-date');date.textContent=storyDate(story);date.dateTime=story.date;const grid=document.querySelector('#story-gallery');grid.replaceChildren();
 story.photos.forEach((photo,index)=>{const button=document.createElement('button');button.className='photo-button';button.setAttribute('aria-label',localeText('open')+' '+localeText('photo')+' '+(index+1));const img=document.createElement('img');img.src=photo.url;img.alt=managedTitle(story)+' · '+(index+1);img.loading='lazy';button.append(img);button.onclick=()=>{managedLightbox=story.photos;showManagedPhoto(index);lightbox.showModal();};grid.append(button);});
}
if(storyCards&&location.hostname!=='liubomyr680.github.io'){
 storyCards.hidden=true;
 fetch('/api/stories',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('Stories unavailable');return response.json();}).then(data=>{if(!Array.isArray(data.stories))throw new Error('Invalid stories');managedStories=data.stories;activeStory=null;renderManagedStories();}).catch(()=>{storyCards.replaceChildren();storyCards.hidden=false;const message=document.createElement('p');message.textContent={en:'Could not load wedding stories. Please refresh to try again.',pl:'Nie udało się wczytać historii. Odśwież stronę, aby spróbować ponownie.',uk:'Не вдалося завантажити історії. Оновіть сторінку, щоб спробувати ще раз.'}[selectedLanguage];storyCards.append(message);});
}
