// アプリ全体の処理。お気に入り・訪問/味わった記録・言語設定は、この端末のブラウザ内だけに保存します。
const KEY_VISITED="terroirmap-visited", KEY_TASTED="terroirmap-tasted";
let facilities=[];
let currentFacility=null;
let currentFilter="all";
let currentTab="favorites";
let currentLanguage=localStorage.getItem("terroirmap-language")||"ja";
let favorites=readFavorites();
let visited=readRecords(KEY_VISITED);
let tasted=readRecords(KEY_TASTED);

const words={
 ja:{tagline:"土地の個性に出会う地図",title:"ワインと日本酒の造り手を探す",intro:"地図から、気になるワイナリーや酒蔵を見つけてみましょう。",
 all:"すべて",winery:"ワイナリー",sake:"酒蔵",count:"件を表示",locate:"現在地",myList:"マイリスト",
 how:"使い方",howCopy:"地図上のマーカーを押すと、施設の情報を確認できます。☆でお気に入り、「訪問した」「味わった」で自分の記録を残せます。記録はマイリストで見られます。",
 support:"改善のアイディア・応援はこちら",address:"住所",brands:"代表銘柄",website:"公式サイトを見る ↗",
 add:"☆ お気に入りに追加",remove:"★ お気に入りから削除",
 visit:"＋ 訪問した",visitDone:"✓ 訪問済み",taste:"＋ 味わった",tasteDone:"✓ 味わった",
 tabFav:"お気に入り",tabVisited:"訪問した",tabTasted:"味わった",
 emptyFav:"お気に入りに登録した施設はまだありません。",emptyVisited:"訪問した施設の記録はまだありません。",emptyTasted:"味わった施設の記録はまだありません。",
 recordedOn:"記録日",confirmRemove:"この記録を削除しますか？",
 wineryType:"WINERY / ワイナリー",sakeType:"SAKE BREWERY / 酒蔵",locating:"現在地を確認しています…",
 locationError:"現在地を取得できませんでした。位置情報の利用を許可しているか確認してください。地図はそのまま利用できます。",
 locationUnsupported:"このブラウザでは現在地を利用できません。",none:"情報なし",removeButton:"削除",
 positionLabel:"位置",approx:"概略位置です。実際の施設の場所とは異なる場合があります。",privacy:"プライバシーについて",mapNote:"地図データ © OpenStreetMap contributors",gmap:"Googleマップで開く ↗"
 },
 en:{tagline:"Discover the character of each place",title:"Discover wineries and sake breweries",intro:"Explore wineries and sake breweries on the map.",
 all:"All",winery:"Wineries",sake:"Sake breweries",count:"shown",locate:"My location",myList:"My list",
 how:"How to use",howCopy:"Select a marker to see its details. Tap ☆ to add a favorite, or use “Visited” and “Tasted” to keep your own record. See them in My list.",
 support:"Ideas & support",address:"Address",brands:"Featured brands",website:"Visit official website ↗",
 add:"☆ Add to favorites",remove:"★ Remove from favorites",
 visit:"+ Visited",visitDone:"✓ Visited",taste:"+ Tasted",tasteDone:"✓ Tasted",
 tabFav:"Favorites",tabVisited:"Visited",tabTasted:"Tasted",
 emptyFav:"You have no favorite places yet.",emptyVisited:"No visited places recorded yet.",emptyTasted:"No tasted places recorded yet.",
 recordedOn:"Recorded",confirmRemove:"Delete this record?",
 wineryType:"WINERY",sakeType:"SAKE BREWERY",locating:"Finding your location…",
 locationError:"Could not get your location. Check your location permission. You can continue using the map.",
 locationUnsupported:"Geolocation is not supported by this browser.",none:"Not available",removeButton:"Remove",
 positionLabel:"Location",approx:"Approximate location. It may differ from the actual site.",privacy:"Privacy",mapNote:"Map data © OpenStreetMap contributors",gmap:"Open in Google Maps ↗"
 }
};
function t(key){return words[currentLanguage][key]||key;}
function readFavorites(){try{return JSON.parse(localStorage.getItem("terroirmap-favorites")||"[]");}catch(e){return [];}}
function saveFavorites(){try{localStorage.setItem("terroirmap-favorites",JSON.stringify(favorites));}catch(e){}updateCounts();}
function readRecords(key){try{const v=JSON.parse(localStorage.getItem(key)||"{}");return (v&&typeof v==="object"&&!Array.isArray(v))?v:{};}catch(e){return {};}}
function saveRecords(key,obj){try{localStorage.setItem(key,JSON.stringify(obj));}catch(e){}updateCounts();}
function today(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function recordsOf(tab){return tab==="visited"?visited:tasted;}
function keyOf(tab){return tab==="visited"?KEY_VISITED:KEY_TASTED;}

async function startApp(){
  const response=await fetch("./data/facilities.json",{cache:"no-cache"});
  if(!response.ok)throw new Error("施設データを読み込めませんでした。");
  facilities=await response.json();
  TerroirMap.setFacilities(facilities,showDetail);
  document.querySelectorAll(".filter-button").forEach(button=>button.addEventListener("click",()=>{
    currentFilter=button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach(b=>b.classList.toggle("active",b===button));
    TerroirMap.filter(currentFilter);updateCount();
  }));
  document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{currentTab=tab.dataset.tab;renderMyList();}));
  document.getElementById("language-toggle").addEventListener("click",toggleLanguage);
  document.getElementById("locate-button").addEventListener("click",locateUser);
  document.getElementById("open-favorites").addEventListener("click",openMyList);
  document.getElementById("close-favorites").addEventListener("click",closePanels);
  document.getElementById("sheet-close").addEventListener("click",closePanels);
  document.getElementById("sheet-backdrop").addEventListener("click",closePanels);
  document.getElementById("favorite-toggle").addEventListener("click",toggleFavorite);
  document.getElementById("visit-toggle").addEventListener("click",()=>toggleRecord("visited"));
  document.getElementById("taste-toggle").addEventListener("click",()=>toggleRecord("tasted"));
  applyLanguage();updateCount();
}
function updateCount(){
  const count=currentFilter==="all"?facilities.length:facilities.filter(x=>x.type===currentFilter).length;
  document.getElementById("map-count").textContent=`${count} ${t("count")}`;
}
function getName(item){return currentLanguage==="en"?(item.name_en||item.name_ja):item.name_ja;}
function getAddress(item){return currentLanguage==="en"?(item.address_en||item.address_ja):(item.address_ja||item.address_en);}
function showDetail(item){
  currentFacility=item;
  const type=document.getElementById("detail-type");
  type.textContent=item.type==="winery"?t("wineryType"):t("sakeType");
  type.classList.toggle("sake-type",item.type==="sake");
  document.getElementById("detail-name").textContent=getName(item);
  document.getElementById("detail-address").textContent=getAddress(item)||t("none");
  const exact=item.location_accuracy==="exact";
  document.getElementById("accuracy-row").hidden=exact;
  document.getElementById("detail-accuracy").textContent=t("approx");
  const brands=Array.isArray(item.brands)?item.brands.filter(Boolean):[];
  document.getElementById("brand-row").hidden=brands.length===0;
  document.getElementById("detail-brands").textContent=brands.join("、");
  const link=document.getElementById("detail-website");
  if(item.website){link.href=item.website;link.setAttribute("aria-disabled","false");}
  else{link.removeAttribute("href");link.setAttribute("aria-disabled","true");}
  // 座標が概略のこともあるため、施設名＋住所で検索します（住所がなければ座標）。リンクは利用者が押したときだけ開きます。
  const mapQuery=item.address_ja?`${item.name_ja} ${item.address_ja}`:`${item.latitude},${item.longitude}`;
  document.getElementById("detail-gmap").href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(mapQuery);
  updateMarkButtons();
  document.getElementById("detail-sheet").classList.add("open");
  document.getElementById("sheet-backdrop").classList.add("open");
}
function setToggle(id,on,onText,offText){
  const b=document.getElementById(id);
  b.textContent=on?onText:offText;
  b.classList.toggle("on",on);
  b.setAttribute("aria-pressed",on?"true":"false");
}
function updateMarkButtons(){
  if(!currentFacility)return;
  const id=currentFacility.id;
  setToggle("favorite-toggle",favorites.includes(id),t("remove"),t("add"));
  setToggle("visit-toggle",!!visited[id],t("visitDone"),t("visit"));
  setToggle("taste-toggle",!!tasted[id],t("tasteDone"),t("taste"));
}
function closePanels(){
  document.getElementById("detail-sheet").classList.remove("open");
  document.getElementById("favorites-panel").classList.remove("open");
  document.getElementById("sheet-backdrop").classList.remove("open");
}
function toggleFavorite(){
  if(!currentFacility)return;
  if(favorites.includes(currentFacility.id))favorites=favorites.filter(id=>id!==currentFacility.id);
  else favorites.push(currentFacility.id);
  saveFavorites();updateMarkButtons();renderMyList();
}
function toggleRecord(tab){
  if(!currentFacility)return;
  const rec=recordsOf(tab),id=currentFacility.id;
  if(rec[id])delete rec[id];else rec[id]=today();
  saveRecords(keyOf(tab),rec);updateMarkButtons();renderMyList();
}
function listItems(tab){
  if(tab==="favorites")return facilities.filter(x=>favorites.includes(x.id)).map(item=>({item}));
  const rec=recordsOf(tab);
  return facilities.filter(x=>rec[x.id]).map(item=>({item,date:rec[item.id]})).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function updateCounts(){
  const labels={favorites:"tabFav",visited:"tabVisited",tasted:"tabTasted"};
  Object.entries(labels).forEach(([tab,key])=>{
    document.getElementById("tab-"+tab).textContent=`${t(key)} ${listItems(tab).length}`;
  });
}
function openMyList(){renderMyList();document.getElementById("favorites-panel").classList.add("open");document.getElementById("sheet-backdrop").classList.add("open");}
function renderMyList(){
  document.querySelectorAll(".tab").forEach(tab=>{
    const on=tab.dataset.tab===currentTab;
    tab.classList.toggle("active",on);tab.setAttribute("aria-selected",on?"true":"false");
  });
  updateCounts();
  const list=document.getElementById("favorites-list");list.innerHTML="";
  const rows=listItems(currentTab);
  const emptyKey={favorites:"emptyFav",visited:"emptyVisited",tasted:"emptyTasted"}[currentTab];
  const empty=document.getElementById("favorites-empty");
  empty.textContent=t(emptyKey);empty.hidden=rows.length>0;
  rows.forEach(({item,date})=>{
    const row=document.createElement("div");row.className="favorite-item";
    const info=document.createElement("button");info.type="button";info.className="favorite-item-info";
    info.style.cssText="border:0;background:transparent;text-align:left;padding:0;flex:1;cursor:pointer";
    const name=document.createElement("strong");name.textContent=getName(item);
    const address=document.createElement("small");address.textContent=getAddress(item)||t("none");
    info.append(name,address);
    if(date){const d=document.createElement("small");d.className="record-date";d.textContent=`${t("recordedOn")}: ${date}`;info.append(d);}
    info.addEventListener("click",()=>{closePanels();TerroirMap.showFacility(item);showDetail(item);});
    const remove=document.createElement("button");remove.type="button";remove.className="favorite-remove";remove.textContent=t("removeButton");
    remove.addEventListener("click",()=>removeFromList(item));
    row.append(info,remove);list.append(row);
  });
}
function removeFromList(item){
  if(currentTab==="favorites"){favorites=favorites.filter(id=>id!==item.id);saveFavorites();}
  else{
    if(!confirm(t("confirmRemove")))return;
    const rec=recordsOf(currentTab);delete rec[item.id];saveRecords(keyOf(currentTab),rec);
  }
  renderMyList();updateMarkButtons();
}
function toggleLanguage(){
  currentLanguage=currentLanguage==="ja"?"en":"ja";
  localStorage.setItem("terroirmap-language",currentLanguage);
  applyLanguage();
  if(currentFacility)showDetail(currentFacility);
}
function applyLanguage(){
  document.documentElement.lang=currentLanguage;
  document.getElementById("language-toggle").textContent=currentLanguage==="ja"?"EN":"日本語";
  const mapText={tagline:"tagline","page-title":"title","intro-copy":"intro","filter-all":"all","filter-winery":"winery","filter-sake":"sake",
    "locate-label":"locate","favorites-label":"myList","how-title":"how","how-copy":"howCopy","support-link":"support",
    "address-label":"address","brand-label":"brands","favorites-title":"myList","accuracy-label":"positionLabel","privacy-link":"privacy","map-note":"mapNote"};
  Object.entries(mapText).forEach(([id,key])=>document.getElementById(id).textContent=t(key));
  document.getElementById("detail-website").textContent=t("website");
  document.getElementById("detail-gmap").textContent=t("gmap");
  updateCount();updateMarkButtons();renderMyList();
}
function locateUser(){
  if(!navigator.geolocation){alert(t("locationUnsupported"));return;}
  document.getElementById("locate-label").textContent=t("locating");
  navigator.geolocation.getCurrentPosition(position=>{
    TerroirMap.showLocation(position.coords.latitude,position.coords.longitude);
    document.getElementById("locate-label").textContent=t("locate");
  },()=>{
    document.getElementById("locate-label").textContent=t("locate");
    alert(t("locationError"));
  },{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
}
startApp().catch(error=>{
  console.error(error);
  document.getElementById("map-count").textContent="データの読み込みに失敗しました";
  alert("施設データを読み込めませんでした。ファイル一式が正しくアップロードされているか確認してください。");
});
