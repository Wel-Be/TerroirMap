// アプリ全体の処理。お気に入りと言語設定はこの端末のブラウザ内だけに保存します。
let facilities=[];
let currentFacility=null;
let currentFilter="all";
let currentLanguage=localStorage.getItem("terroirmap-language")||"ja";
let favorites=readFavorites();

const words={
 ja:{tagline:"土地の個性に出会う地図",title:"ワインと日本酒の造り手を探す",intro:"地図から、気になるワイナリーや酒蔵を見つけてみましょう。",
 all:"すべて",winery:"ワイナリー",sake:"酒蔵",count:"件を表示",locate:"現在地",favorites:"お気に入り一覧",
 how:"使い方",howCopy:"地図上のマーカーを押すと、施設の情報を確認できます。☆を押すとお気に入りに登録できます。",
 support:"改善のアイディア・応援はこちら",address:"住所",brands:"代表銘柄",website:"公式サイトを見る ↗",
 add:"☆ お気に入りに追加",remove:"★ お気に入りから削除",favoriteTitle:"お気に入り",empty:"お気に入りに登録した施設はまだありません。",
 wineryType:"WINERY / ワイナリー",sakeType:"SAKE BREWERY / 酒蔵",locating:"現在地を確認しています…",
 locationError:"現在地を取得できませんでした。位置情報の利用を許可しているか確認してください。地図はそのまま利用できます。",
 locationUnsupported:"このブラウザでは現在地を利用できません。",removed:"お気に入りから削除",added:"お気に入りに追加しました",none:"情報なし",removeButton:"削除"
 },
 en:{tagline:"Discover the character of each place",title:"Discover wineries and sake breweries",intro:"Explore wineries and sake breweries on the map.",
 all:"All",winery:"Wineries",sake:"Sake breweries",count:"shown",locate:"My location",favorites:"Favorites",
 how:"How to use",howCopy:"Select a marker to see its details. Tap ☆ to add a place to your favorites.",
 support:"Ideas & support",address:"Address",brands:"Featured brands",website:"Visit official website ↗",
 add:"☆ Add to favorites",remove:"★ Remove from favorites",favoriteTitle:"Favorites",empty:"You have no favorite places yet.",
 wineryType:"WINERY",sakeType:"SAKE BREWERY",locating:"Finding your location…",
 locationError:"Could not get your location. Check your location permission. You can continue using the map.",
 locationUnsupported:"Geolocation is not supported by this browser.",removed:"Removed from favorites",added:"Added to favorites",none:"Not available",removeButton:"Remove"
 }
};
function t(key){return words[currentLanguage][key]||key;}
function readFavorites(){try{return JSON.parse(localStorage.getItem("terroirmap-favorites")||"[]");}catch(e){return [];}}
function saveFavorites(){localStorage.setItem("terroirmap-favorites",JSON.stringify(favorites));updateFavoriteCount();}
async function startApp(){
  const response=await fetch("./data/facilities.json");
  if(!response.ok)throw new Error("施設データを読み込めませんでした。");
  facilities=await response.json();
  TerroirMap.setFacilities(facilities,showDetail);
  document.querySelectorAll(".filter-button").forEach(button=>button.addEventListener("click",()=>{
    currentFilter=button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach(b=>b.classList.toggle("active",b===button));
    TerroirMap.filter(currentFilter);updateCount();
  }));
  document.getElementById("language-toggle").addEventListener("click",toggleLanguage);
  document.getElementById("locate-button").addEventListener("click",locateUser);
  document.getElementById("open-favorites").addEventListener("click",openFavorites);
  document.getElementById("close-favorites").addEventListener("click",closePanels);
  document.getElementById("sheet-close").addEventListener("click",closePanels);
  document.getElementById("sheet-backdrop").addEventListener("click",closePanels);
  document.getElementById("favorite-toggle").addEventListener("click",toggleFavorite);
  applyLanguage();updateCount();updateFavoriteCount();
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
  const brands=Array.isArray(item.brands)?item.brands.filter(Boolean):[];
  document.getElementById("brand-row").hidden=brands.length===0;
  document.getElementById("detail-brands").textContent=brands.join("、");
  const link=document.getElementById("detail-website");
  if(item.website){link.href=item.website;link.setAttribute("aria-disabled","false");}
  else{link.removeAttribute("href");link.setAttribute("aria-disabled","true");}
  document.getElementById("favorite-toggle").textContent=favorites.includes(item.id)?t("remove"):t("add");
  document.getElementById("detail-sheet").classList.add("open");
  document.getElementById("sheet-backdrop").classList.add("open");
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
  saveFavorites();showDetail(currentFacility);renderFavorites();
}
function updateFavoriteCount(){document.getElementById("favorite-count").textContent=favorites.length;}
function openFavorites(){renderFavorites();document.getElementById("favorites-panel").classList.add("open");document.getElementById("sheet-backdrop").classList.add("open");}
function renderFavorites(){
  const list=document.getElementById("favorites-list");list.innerHTML="";
  const items=facilities.filter(item=>favorites.includes(item.id));
  document.getElementById("favorites-empty").hidden=items.length>0;
  items.forEach(item=>{
    const row=document.createElement("div");row.className="favorite-item";
    const info=document.createElement("button");info.type="button";info.className="favorite-item-info";
    info.style.cssText="border:0;background:transparent;text-align:left;padding:0;flex:1;cursor:pointer";
    const name=document.createElement("strong");name.textContent=getName(item);
    const address=document.createElement("small");address.textContent=getAddress(item)||t("none");
    info.append(name,address);info.addEventListener("click",()=>{closePanels();TerroirMap.showFacility(item);showDetail(item);});
    const remove=document.createElement("button");remove.type="button";remove.className="favorite-remove";remove.textContent=t("removeButton");
    remove.addEventListener("click",()=>{favorites=favorites.filter(id=>id!==item.id);saveFavorites();renderFavorites();});
    row.append(info,remove);list.append(row);
  });
}
function toggleLanguage(){
  currentLanguage=currentLanguage==="ja"?"en":"ja";
  localStorage.setItem("terroirmap-language",currentLanguage);
  applyLanguage();
  if(currentFacility)showDetail(currentFacility);
  renderFavorites();
}
function applyLanguage(){
  document.documentElement.lang=currentLanguage;
  document.getElementById("language-toggle").textContent=currentLanguage==="ja"?"EN":"日本語";
  const mapText={tagline:"tagline", "page-title":"title","intro-copy":"intro","filter-all":"all","filter-winery":"winery","filter-sake":"sake",
    "locate-label":"locate","favorites-label":"favorites","how-title":"how","how-copy":"howCopy","support-link":"support",
    "address-label":"address","brand-label":"brands","favorites-title":"favoriteTitle","favorites-empty":"empty"};
  Object.entries(mapText).forEach(([id,key])=>document.getElementById(id).textContent=t(key));
  document.getElementById("detail-website").textContent=t("website");
  updateCount();
  if(currentFacility)document.getElementById("favorite-toggle").textContent=favorites.includes(currentFacility.id)?t("remove"):t("add");
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
