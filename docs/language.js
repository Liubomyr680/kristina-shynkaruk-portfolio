// English is captured from the original markup; translated copy uses the same structure.
const translatedContent = [
 ['#portfolio-title','Fotografia ślubna — Kristina Shynkaruk','Весільна фотографія — Крістіна Шинкарук'],
 ['.header nav a[href="/kristina-shynkaruk-portfolio/contacts"]','Kontakt','Контакти'],
 ['#contacts-title','Kontakt','Контакти'],
 ['.contact-intro','Napisz, kiedy i gdzie planujecie ślub.','Напишіть дату вашого весілля та місце святкування.'],
 ['#phone-label','Telefon','Телефон'],
 ['.contact-pending','Dane kontaktowe wkrótce','Контактні дані незабаром'],
 ['.header nav a[href="/kristina-shynkaruk-portfolio/wedding-stories"]','Historie ślubne','Весільні серії'],
 ['#stories-page-title','Historie ślubne','Весільні серії'],
 ['#stories-back','Wszystkie historie','Усі весільні серії'],
 ['.skip','Przejdź do zdjęć','Перейти до фотографій'],
 ['.brand span','FOTOGRAFIA ŚLUBNA','ВЕСІЛЬНА ФОТОГРАФІЯ'],
 ['.explore','ODKRYJ WIĘCEJ <span class="scroll-line"></span>','ДИВИТИСЯ ДАЛІ <span class="scroll-line"></span>'],
 ['.header nav a[href="/kristina-shynkaruk-portfolio/"]','Portfolio','Портфоліо'],
 ['.header nav a[href="/kristina-shynkaruk-portfolio/about"]','O mnie','Про мене'],
 ['.approach-copy h2','Bądźcie sobą.<br><em>Ja zadbam o zdjęcia.</em>','Будьте собою.<br><em>Я подбаю про фотографії.</em>'],
 ['.approach-copy > p','Naturalna fotografia ślubna i delikatne wskazówki, gdy ich potrzebujecie. Od kameralnej ceremonii po cały dzień — wybierzcie zakres, który do Was pasuje.','Природна весільна фотографія та делікатні підказки, коли вони потрібні. Від камерної церемонії до цілого дня — оберіть зйомку, яка підходить саме вам.'],
];
const translatedAttributes = [
 ['#menu-toggle','aria-label','Menu nawigacji','Меню навігації'],
 ['#back-to-top','aria-label','Wróć na górę','На початок сторінки'],
 ['#back-to-top','title','Wróć na górę','На початок сторінки'],
 ['nav','aria-label','Nawigacja główna','Головна навігація'],
 ['#lightbox .close','aria-label','Zamknij zdjęcie','Закрити фотографію'],
 ['.lightbox-prev','aria-label','Poprzednie zdjęcie','Попередня фотографія'],
 ['.lightbox-next','aria-label','Następne zdjęcie','Наступна фотографія'],
 ['.approach-photo img','alt','Panna młoda odpoczywająca przy oknie w miękkim świetle','Наречена відпочиває біля вікна в м’якому природному світлі'],
 ['#language-toggle','aria-label','Zmień język','Змінити мову']
];
const languageWords = {
 en:{play:'Play slideshow',pause:'Pause slideshow',photo:'Photograph',open:'Open',more:'View the full collection',less:'Show selected photographs',title:'Kristina Shynkaruk — Wedding Photographer',description:'Wedding photography by Kristina Shynkaruk. Honest moments, quiet beauty, and photographs to keep forever.'},
 pl:{play:'Włącz pokaz slajdów',pause:'Wstrzymaj pokaz slajdów',photo:'Zdjęcie',open:'Otwórz',more:'Zobacz całą kolekcję',less:'Pokaż wybrane zdjęcia',title:'Kristina Shynkaruk — Fotografia ślubna',description:'Fotografia ślubna Kristiny Shynkaruk. Prawdziwe chwile, subtelne piękno i zdjęcia na zawsze.'},
 uk:{play:'Увімкнути слайд-шоу',pause:'Призупинити слайд-шоу',photo:'Фотографія',open:'Відкрити',more:'Переглянути всю колекцію',less:'Показати вибрані фотографії',title:'Kristina Shynkaruk — Весільна фотографія',description:'Весільна фотографія Крістіни Шинкарук. Справжні миті, тиха краса та фотографії назавжди.'}
};
const translatedPhotos = {
 pl:[['Spokojny początek','Panna młoda w miękkim świetle okna'],['Razem, zawsze','Para młoda w bogato zdobionym wnętrzu'],['Drobne gesty','Zbliżenie panny młodej trzymającej białą kalię'],['Zanim zacznie się dzień','Panna młoda w jasnym łukowatym przejściu'],['Chwila dla siebie','Pan młody poprawiający krawat przy oknie'],['Światło i cień','Portret panny młodej w zwiewnym welonie'],['Poranek bez pośpiechu','Panna młoda odpoczywająca na sofie'],['Przestrzeń na oddech','Panna młoda w słonecznym pokoju z łukami'],['Coś pięknego','Delikatne detale koronkowej sukni ślubnej'],['W ciszy','Panna młoda trzymająca kwiat przy oknie'],['Ostatnie detale','Wypolerowane buty ślubne i dodatki'],['Odbicia','Pan młody w odbiciu zabytkowego lustra'],['Spokojna chwila','Portret panny młodej w cieniu'],['Tuż przed','Pan młody przygotowujący się przed lustrem'],['Gotowy na zawsze','Pan młody poprawiający krawat']],
 uk:[['Тихий початок','Наречена в м’якому світлі з вікна'],['Разом, назавжди','Наречені в ошатній кімнаті'],['Маленькі деталі','Наречена тримає білу калу, крупний план'],['Перш ніж почнеться день','Наречена у світлій арці'],['Мить для себе','Наречений поправляє краватку біля вікна'],['Світло й тінь','Портрет нареченої з легкою фатою'],['Ранок без поспіху','Наречена відпочиває на дивані'],['Простір для подиху','Наречена в сонячній кімнаті з арками'],['Щось прекрасне','Ніжні деталі мереживної весільної сукні'],['У тиші','Наречена з квіткою біля вікна'],['Останні штрихи','Весільне взуття та аксесуари'],['Відображення','Відображення нареченого в старовинному дзеркалі'],['Тиха пауза','Портрет нареченої в тіні'],['За мить до','Наречений готується перед дзеркалом'],['Готовий до назавжди','Наречений поправляє краватку']]
};
let selectedLanguage='en';
function localeText(key){return languageWords[selectedLanguage][key];}
function localizePhoto(photo,index){return selectedLanguage==='en'?photo:[photo[0],...translatedPhotos[selectedLanguage][index]];}
function initializeLanguage(){
 const content=translatedContent.flatMap(([selector,pl,uk])=>[...document.querySelectorAll(selector)].map(element=>({element,en:element.innerHTML,pl,uk})));
 const attributes=translatedAttributes.map(([selector,attribute,pl,uk])=>{const element=document.querySelector(selector);return element?{element,attribute,en:element.getAttribute(attribute),pl,uk}:null;}).filter(Boolean);
 const toggle=document.querySelector('#language-toggle'),options=document.querySelector('#language-options'),picker=document.querySelector('.language-picker');
 const choices=[...options.querySelectorAll('button')];
 function closePicker(){options.hidden=true;toggle.setAttribute('aria-expanded','false');}
 function changeLanguage(lang){
  selectedLanguage=Object.hasOwn(languageWords,lang)?lang:'en';document.documentElement.lang=selectedLanguage;
  content.forEach(item=>item.element.innerHTML=item[selectedLanguage]);attributes.forEach(item=>item.element.setAttribute(item.attribute,item[selectedLanguage]));
  const choice=choices.find(b=>b.dataset.language===selectedLanguage);toggle.querySelector('img').src=choice.querySelector('img').getAttribute('src');toggle.querySelector('span').textContent=choice.querySelector('strong').textContent;
  choices.forEach(b=>b.setAttribute('aria-pressed',String(b===choice)));
  const pageLink=document.querySelector('nav a[aria-current="page"]');document.title=(pageLink?pageLink.textContent+' — ':'')+localeText('title');document.querySelector('meta[name="description"]').content=localeText('description');
  document.querySelectorAll('.dot').forEach((dot,i)=>dot.setAttribute('aria-label',`${localeText('photo')} ${i+1}`));
  document.dispatchEvent(new Event('languagechange'));
  try{localStorage.setItem('kristina-language',selectedLanguage);}catch{/* Language switching also works when storage is unavailable. */}
 }
 toggle.addEventListener('click',()=>{options.hidden=!options.hidden;toggle.setAttribute('aria-expanded',String(!options.hidden));});
 choices.forEach(button=>button.addEventListener('click',()=>{changeLanguage(button.dataset.language);closePicker();toggle.focus();}));
 document.addEventListener('click',e=>{if(!picker.contains(e.target))closePicker();});
 picker.addEventListener('focusout',e=>{if(!picker.contains(e.relatedTarget))closePicker();});
 picker.addEventListener('keydown',e=>{if(e.key==='Escape'){closePicker();toggle.focus();}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();options.hidden=false;toggle.setAttribute('aria-expanded','true');const index=choices.indexOf(document.activeElement);choices[(index+(e.key==='ArrowDown'?1:-1)+choices.length)%choices.length].focus();}});
 let saved='en';try{saved=localStorage.getItem('kristina-language')||'en';}catch{}changeLanguage(saved);
}
