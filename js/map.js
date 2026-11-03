// 地図の初期設定とマーカー表示
const TerroirMap = (() => {
  const map = L.map("map", {scrollWheelZoom:true}).setView([36.2,138.2],5);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
  }).addTo(map);
  const markerLayer=L.layerGroup().addTo(map), markers=[];
  function makeIcon(type){
    const letter=type==="winery"?"W":"酒";
    return L.divIcon({className:"",html:`<div class="custom-marker ${type}"><span>${letter}</span></div>`,iconSize:[30,38],iconAnchor:[15,36]});
  }
  function setFacilities(items,onSelect){
    markerLayer.clearLayers();markers.length=0;
    items.forEach(item=>{
      const marker=L.marker([item.latitude,item.longitude],{icon:makeIcon(item.type),title:item.name_ja});
      marker.on("click",()=>onSelect(item));marker.addTo(markerLayer);markers.push({item,marker});
    });
  }
  function filter(type){
    markers.forEach(({item,marker})=>{
      if(type==="all"||item.type===type)marker.addTo(markerLayer);else marker.remove();
    });
  }
  function showLocation(lat,lon){map.setView([lat,lon],12);}
  function showFacility(item){map.setView([item.latitude,item.longitude],Math.max(map.getZoom(),10));}
  return {setFacilities,filter,showLocation,showFacility};
})();
