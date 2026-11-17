// 地図の初期設定とマーカー表示（近くの施設は数字でまとめて表示します）
const TerroirMap = (() => {
  const map = L.map("map", {scrollWheelZoom:true}).setView([36.2,138.2],5);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
  }).addTo(map);
  const layer=L.layerGroup().addTo(map);
  const CELL=56; // この大きさ（画面上のピクセル）に入る施設を1つにまとめます
  let entries=[], currentType="all", clusterHandler=()=>{};
  function makeIcon(type){
    const letter=type==="winery"?"W":"酒";
    return L.divIcon({className:"",html:`<div class="custom-marker ${type}"><span>${letter}</span></div>`,iconSize:[30,38],iconAnchor:[15,36]});
  }
  function clusterIcon(n){
    const size=n>=100?52:n>=20?44:36;
    return L.divIcon({className:"",html:`<div class="cluster-marker" style="width:${size}px;height:${size}px"><span>${n}</span></div>`,iconSize:[size,size]});
  }
  function visible(){return entries.filter(e=>currentType==="all"||e.item.type===currentType);}
  function render(){
    layer.clearLayers();
    const z=map.getZoom(),groups=new Map();
    visible().forEach(e=>{
      const p=map.project(e.latlng,z);
      const key=Math.floor(p.x/CELL)+":"+Math.floor(p.y/CELL);
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(e);
    });
    groups.forEach(list=>{
      if(list.length===1){list[0].marker.addTo(layer);return;}
      const lat=list.reduce((s,e)=>s+e.latlng.lat,0)/list.length;
      const lng=list.reduce((s,e)=>s+e.latlng.lng,0)/list.length;
      const m=L.marker([lat,lng],{icon:clusterIcon(list.length),title:String(list.length)});
      m.on("click",()=>expand(list));
      m.addTo(layer);
    });
  }
  function expand(list){
    const bounds=L.latLngBounds(list.map(e=>e.latlng));
    const spread=map.distance(bounds.getSouthWest(),bounds.getNorthEast());
    // ほぼ同じ場所（約60m以内）なら、ズームせずに一覧から選んでもらいます
    if(spread<60||map.getZoom()>=map.getMaxZoom()-1){clusterHandler(list.map(e=>e.item));return;}
    map.fitBounds(bounds,{padding:[50,50],maxZoom:17});
  }
  function setFacilities(items,onSelect,onCluster){
    clusterHandler=onCluster||(()=>{});
    entries=items.map(item=>{
      const marker=L.marker([item.latitude,item.longitude],{icon:makeIcon(item.type),title:item.name_ja});
      marker.on("click",()=>onSelect(item));
      return {item,latlng:L.latLng(item.latitude,item.longitude),marker};
    });
    map.on("zoomend",render);
    render();
  }
  function filter(type){currentType=type;render();}
  function showLocation(lat,lon){map.setView([lat,lon],12);}
  function showFacility(item){map.setView([item.latitude,item.longitude],Math.max(map.getZoom(),14));}
  return {setFacilities,filter,showLocation,showFacility};
})();
