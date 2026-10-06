'use strict';
const $=selector=>document.querySelector(selector);
let allStories=[],current=null,dirty=false,busy=false;
const errorMessages={
 'Missing series details.':'Не вказано дані серії.',
 'Series titles must be under 120 characters.':'Назва серії має містити не більше 120 символів.',
 'Enter a series title.':'Введіть назву серії.',
 'Enter a valid wedding date.':'Вкажіть правильну дату весілля.',
 'A series can contain up to 100 photos.':'Серія може містити до 100 фото.',
 'Invalid photo selection.':'Некоректний вибір фотографій. Оновіть сторінку.',
 'Select a cover photo.':'Оберіть фото для обкладинки.',
 'Series not found.':'Серію не знайдено.',
 'Photo not found.':'Фото не знайдено.',
 'Not found':'Не знайдено.',
 'Invalid request.':'Не вдалося обробити запит. Спробуйте ще раз.',
 'Invalid origin.':'Запит відхилено. Відкрийте панель керування безпосередньо на сайті.',
 'This series was changed elsewhere. Reload before saving.':'Серію змінено в іншому вікні. Оновіть сторінку перед збереженням.',
 'Content changed. Reload and try again.':'Вміст змінився. Оновіть сторінку та спробуйте ще раз.',
 'Photo is too large (maximum 8 MB).':'Фото завелике. Максимальний розмір — 8 МБ.',
 'Upload too large.':'Файл завеликий для завантаження.',
 'Upload a valid WebP photo.':'Завантажте коректне фото у форматі WebP.',
 'Add at least one photo before publishing.':'Додайте хоча б одне фото перед публікацією.',
 'Photo storage is not configured or unavailable.':'Сховище фотографій не налаштоване або недоступне.',
 'Could not complete the request. Please try again.':'Не вдалося виконати запит. Спробуйте ще раз.'
};
function errorText(error){return errorMessages[error.message]||(/[А-Яа-яІіЇїЄєҐґ]/.test(error.message)?error.message:'Не вдалося виконати дію. Перевірте з’єднання та спробуйте ще раз.');}
function isPortfolio(){return current?.id==='portfolio';}
function contentPath(){return isPortfolio()?'portfolio':'stories/'+current.id;}
function seriesTitle(draft){if(!draft.names)return 'Портфоліо';return draft.names.uk||(draft.names.en==='Untitled wedding'?'Нова весільна серія':draft.names.en);}
function formatDate(date){return new Intl.DateTimeFormat('uk-UA',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));}
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function notice(message,error=false){$('#notice').textContent=message;$('#notice').classList.toggle('error',error);}
function photoUrl(photo){return photo.url.startsWith('/api/media/')?photo.url.replace('/api/media/','/api/admin/media/'):photo.url;}
async function api(path,method='GET',body,version){
 const headers={'X-Admin-Request':'1'};if(version!==undefined)headers['If-Match']=String(version);
 if(body!==undefined&&!(body instanceof Blob)){headers['Content-Type']='application/json';body=JSON.stringify(body);}
 const response=await fetch('/api/admin/'+path,{method,headers,body});
 if(response.status===401||response.status===403||response.redirected){throw Object.assign(new Error('Сеанс завершився. Увійдіть знову, щоб зберегти зміни.'),{status:401});}
 if(!response.headers.get('Content-Type')?.includes('application/json'))throw new Error('Панель керування тимчасово недоступна.');
 const data=await response.json();if(!response.ok)throw Object.assign(new Error(errorText({message:data.error||''})),{status:response.status});return data;
}
function changed(){dirty=true;$('#save-state').textContent='Незбережені зміни';}
function formDraft(){if(isPortfolio())return {photos:current.draft.photos};return {names:{en:$('#title-en').value.trim()||$('#title-uk').value.trim(),pl:$('#title-pl').value.trim(),uk:$('#title-uk').value.trim()},date:$('#wedding-date').value,cover:current.draft.cover,photos:current.draft.photos};}
function validForm(){if(isPortfolio())return true;if(!$('#title-uk').value.trim()){notice('Введіть назву серії українською.',true);return false;}if(!$('#wedding-date').value){notice('Вкажіть дату весілля.',true);return false;}return true;}
function setBusy(value){busy=value;$('#editing-fields').disabled=value;for(const selector of ['#save','#publish','#back','#preview','#delete-series','#unpublish','#new-series','#tab-stories','#tab-portfolio'])$(selector).disabled=value;}
async function action(fn){if(busy)return;setBusy(true);try{await fn();}catch(e){notice(errorText(e),true);}finally{setBusy(false);}}
function confirmAction(title,text,label){const dialog=$('#confirm-dialog');$('#confirm-title').textContent=title;$('#confirm-text').textContent=text;$('#confirm-yes').textContent=label;dialog.showModal();return new Promise(resolve=>{let accepted=false;$('#confirm-yes').onclick=()=>{accepted=true;dialog.close();};$('#confirm-cancel').onclick=()=>dialog.close();dialog.addEventListener('close',()=>resolve(accepted),{once:true});});}
async function load(){allStories=(await api('stories')).stories;renderLibrary();}
function renderLibrary(){
 const list=$('#series-list');list.replaceChildren();$('#empty-library').hidden=allStories.length>0;
 for(const story of allStories){const draft=story.draft,card=element('article','series-tile'),cover=draft.photos.find(p=>p.id===draft.cover);
  if(cover){const img=element('img');img.src=photoUrl(cover);img.alt=seriesTitle(draft);img.loading='lazy';card.append(img);}else card.append(element('div','tile-placeholder','Обкладинку ще не обрано'));
  const info=element('div','tile-info');info.append(element('h2','',seriesTitle(draft)),element('p','muted',formatDate(draft.date)+' · '+draft.photos.length+' фото'));
  const bottom=element('div','tile-bottom'),hasChanges=story.published&&JSON.stringify(story.draft)!==JSON.stringify(story.published);
  bottom.append(element('span','badge'+(!story.published||hasChanges?' draft':''),!story.published?'Чернетка':hasChanges?'Неопубліковані зміни':'Опубліковано'));
  const edit=element('button','','Редагувати серію');edit.onclick=()=>openEditor(story);bottom.append(edit);info.append(bottom);card.append(info);list.append(card);
 }
}
function openEditor(story){current=structuredClone(story);dirty=false;$('#library').hidden=true;$('#editor').hidden=false;$('#editor-heading').textContent=seriesTitle(story.draft);for(const lang of ['en','pl','uk'])$('#title-'+lang).value=story.draft.names?.[lang]||'';$('#title-uk').value=seriesTitle(story.draft);if(story.draft.names?.en==='Untitled wedding')$('#title-en').value='';$('#wedding-date').value=story.draft.date||'';$('#upload-status').textContent='';$('#save-state').textContent=story.published?'Опубліковано · редагування чернетки':'Чернетка';$('#unpublish').hidden=!story.published;$('#publish').textContent=story.published?'Опублікувати зміни':'Опублікувати';configureEditor();notice('');renderPhotos();window.scrollTo(0,0);}
function renderPhotos(focusId,actionName){
 const grid=$('#photo-grid');grid.replaceChildren();$('#no-photos').hidden=current.draft.photos.length>0;$('#photo-count').textContent=current.draft.photos.length+' фото';
 current.draft.photos.forEach((photo,index)=>{
  const card=element('article','photo-tile'+(photo.id===current.draft.cover?' cover':''));card.draggable=true;card.dataset.id=photo.id;
  const img=element('img');img.src=photoUrl(photo);img.alt='Фото '+(index+1);img.loading='lazy';img.draggable=false;card.append(img,element('span','photo-label',photo.id===current.draft.cover?'ОБКЛАДИНКА · '+(index+1):String(index+1)));
  const tools=element('div','photo-tools');
  function button(text,name,fn,disabled=false){const b=element('button','',text);b.type='button';b.dataset.action=name;b.setAttribute('aria-label',name+' · фото '+(index+1));b.disabled=disabled;b.onclick=fn;tools.append(b);}
  if(!isPortfolio())button(photo.id===current.draft.cover?'✓ Обкладинка':'На обкладинку','Обкладинка',()=>{current.draft.cover=photo.id;changed();renderPhotos(photo.id,'Обкладинка');});
  button('←','Перемістити раніше',()=>move(index,index-1,photo.id,'Перемістити раніше'),index===0);
  button('→','Перемістити далі',()=>move(index,index+1,photo.id,'Перемістити далі'),index===current.draft.photos.length-1);
  button('Видалити','Видалити',async()=>{if(!await confirmAction('Видалити це фото?','Фото буде видалено з чернетки. Опубліковані фотографії залишаться на сайті, доки ви не опублікуєте зміни.','Видалити фото'))return;current.draft.photos.splice(index,1);if(!isPortfolio()&&current.draft.cover===photo.id)current.draft.cover=current.draft.photos[0]?.id||null;changed();renderPhotos();});
  card.append(tools);card.addEventListener('dragstart',event=>{if(busy){event.preventDefault();return;}event.dataTransfer.setData('text/plain',photo.id);event.dataTransfer.effectAllowed='move';});
  card.addEventListener('dragover',event=>{if(busy)return;event.preventDefault();card.classList.add('drag-over');});card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
  card.addEventListener('drop',event=>{event.preventDefault();if(busy)return;const from=current.draft.photos.findIndex(p=>p.id===event.dataTransfer.getData('text/plain'));if(from>=0)move(from,index,photo.id,isPortfolio()?'Видалити':'Обкладинка');});card.addEventListener('dragend',()=>document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over')));grid.append(card);
 });
 if(focusId){const card=[...grid.children].find(c=>c.dataset.id===focusId);const button=card?.querySelector(`[data-action="${actionName}"]`);if(button&&!button.disabled)button.focus({preventScroll:true});}
}
function move(from,to,id,name){if(to<0||to>=current.draft.photos.length)return;const [photo]=current.draft.photos.splice(from,1);current.draft.photos.splice(to,0,photo);changed();renderPhotos(id,name);}
async function save(publish=false){if(!validForm())return false;const result=await api(contentPath()+(publish?'/publish':''),publish?'POST':'PUT',formDraft(),current.version);current=result.story;dirty=false;$('#editor-heading').textContent=seriesTitle(current.draft);$('#save-state').textContent=publish?'Опубліковано':'Чернетку збережено';$('#unpublish').hidden=!current.published;$('#publish').textContent=current.published?'Опублікувати зміни':'Опублікувати';configureEditor();notice(publish?(isPortfolio()?'Портфоліо опубліковано. Зміни вже відображаються на головній сторінці.':'Серію опубліковано. Зміни вже відображаються на сайті.'):'Чернетку збережено. Опубліковані фото не змінилися.');return true;}
$('#new-series').onclick=()=>action(async()=>{const {story}=await api('stories','POST');openEditor(story);$('#title-uk').select();});
$('#back').onclick=async()=>{if(dirty&&!await confirmAction('Вийти без збереження?','Незбережені зміни назви, обкладинки та порядку фото буде втрачено. Завантажені фото вже збережено в чернетці.','Не зберігати зміни'))return;await action(async()=>{await load();current=null;dirty=false;$('#editor').hidden=true;$('#library').hidden=false;setActiveTab(false);$('#view-website').href='/wedding-stories';notice('');window.scrollTo(0,0);});};
for(const input of document.querySelectorAll('.details input'))input.addEventListener('input',changed);
$('#save').onclick=()=>action(()=>save());
$('#publish').onclick=()=>action(()=>save(true));
$('#unpublish').onclick=async()=>{if(!await confirmAction('Зняти цю серію з публікації?','Відвідувачі більше не бачитимуть серію. Чернетка та фото залишаться в панелі керування.','Зняти з публікації'))return;await action(async()=>{const draft=formDraft();current=(await api('stories/'+current.id+'/unpublish','POST',undefined,current.version)).story;current.draft=draft;$('#unpublish').hidden=true;$('#publish').textContent='Опублікувати';$('#save-state').textContent=dirty?'Незбережені зміни':'Чернетка';notice('Серію знято з публікації.');});};
$('#delete-series').onclick=async()=>{if(!await confirmAction('Видалити цю весільну серію?','Серію буде видалено із сайту, а завантажені фото — зі сховища. Перед видаленням збережіть оригінали фотографій.','Видалити серію'))return;await action(async()=>{await api('stories/'+current.id,'DELETE',undefined,current.version);current=null;dirty=false;await load();$('#editor').hidden=true;$('#library').hidden=false;notice('Серію видалено.');});};
$('#upload-folder').onclick=()=>$('#folder-input').click();$('#upload-photos').onclick=()=>$('#photos-input').click();
async function preparePhoto(file){
 if(file.size>50*1024*1024)throw new Error('Розмір файлу перевищує 50 МБ.');
 const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.87));if(!blob||blob.type!=='image/webp')throw new Error('Цей браузер не підтримує підготовку WebP. Спробуйте оновити браузер.');return blob;}finally{bitmap.close();}
}
async function uploadFiles(files){
 const eligible=[...files].filter(f=>/\.(jpe?g|png|webp)$/i.test(f.name)).sort((a,b)=>(a.webkitRelativePath||a.name).localeCompare(b.webkitRelativePath||b.name,undefined,{numeric:true}));
 if(!eligible.length){notice('Оберіть фотографії у форматі JPG, PNG або WebP.',true);return;}
 if(eligible.length+current.draft.photos.length>100){notice(isPortfolio()?'Портфоліо може містити до 100 фото.':'Серія може містити до 100 фото.',true);return;}
 await action(async()=>{
  if(!await save())return;const progress=$('#upload-progress');progress.hidden=false;progress.value=0;const failed=[];let uploaded=0;
  try{for(let index=0;index<eligible.length;index++){const file=eligible[index];$('#upload-status').textContent=`Підготовка та завантаження ${index+1} із ${eligible.length}…`;
   try{const blob=await preparePhoto(file);current=(await api(contentPath()+'/photos','POST',blob,current.version)).story;uploaded++;renderPhotos();}
   catch(e){failed.push(file.name+': '+errorText(e));if([401,403,409].includes(e.status))break;}
   progress.value=(index+1)/eligible.length*100;
  }}finally{progress.hidden=true;}
  $('#upload-status').textContent=uploaded+' фото завантажено до чернетки.'+(failed.length?' Не вдалося завантажити: '+failed.join('; '):'');
  $('#save-state').textContent='Чернетку збережено';notice(failed.length?'Деякі фото не вдалося завантажити. Успішно завантажені фото збережено; повторіть спробу для решти файлів.':(isPortfolio()?'Фото завантажено. Налаштуйте порядок і опублікуйте портфоліо.':'Фото завантажено. Оберіть обкладинку та порядок фото, а потім опублікуйте серію.'),failed.length>0);
 });
}
for(const input of [$('#folder-input'),$('#photos-input')])input.onchange=()=>{const files=[...input.files];input.value='';uploadFiles(files);};
$('#preview').onclick=()=>{const draft=formDraft();$('#preview-title').textContent=seriesTitle(draft);$('#preview-date').textContent=draft.date?formatDate(draft.date):'';const grid=$('#preview-grid');grid.replaceChildren();for(const [i,p]of draft.photos.entries()){const img=element('img');img.src=photoUrl(p);img.alt='Фото '+(i+1);grid.append(img);}$('#preview-dialog').showModal();};
$('#close-preview').onclick=()=>$('#preview-dialog').close();
window.addEventListener('beforeunload',event=>{if(dirty||busy){event.preventDefault();event.returnValue='';}});
fetch('/api/local-mode').then(r=>r.ok?r.json():null).then(data=>{$('#environment').hidden=!data?.local;}).catch(()=>{});
action(load);

function setActiveTab(portfolio){$('#tab-stories').setAttribute('aria-pressed',String(!portfolio));$('#tab-portfolio').setAttribute('aria-pressed',String(portfolio));}
function configureEditor(){
 const portfolio=isPortfolio();setActiveTab(portfolio);$('#view-website').href=portfolio?'/':'/wedding-stories';
 $('.details').hidden=portfolio;$('#delete-series').hidden=portfolio;$('#unpublish').hidden=portfolio||!current.published;
 $('#editor-eyebrow').textContent=portfolio?'ФОТО НА ГОЛОВНІЙ СТОРІНЦІ':'РЕДАГУВАННЯ СЕРІЇ';
 $('#photo-instructions').textContent=portfolio?'Перетягуйте фото або змінюйте порядок стрілками.':'Оберіть обкладинку. Перетягуйте фото або змінюйте порядок стрілками.';
 $('#upload-hint').textContent='JPG, PNG або WebP · До 100 фото'+(portfolio?' в портфоліо':' в серії')+' · Фото оптимізуються для сайту; оригінали залишаються на вашому пристрої.';
}
$('#tab-stories').onclick=()=>{if(current)$('#back').click();};
$('#tab-portfolio').onclick=async()=>{
 if(isPortfolio())return;
 if(dirty&&!await confirmAction('Вийти без збереження?','Незбережені зміни буде втрачено. Завантажені фото вже збережено в чернетці.','Не зберігати зміни'))return;
 await action(async()=>openEditor((await api('portfolio')).story));
};
