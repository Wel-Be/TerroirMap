// 使い方: node tools/csv-to-json.js 入力.csv [出力.json]
// CSV(UTF-8)を facilities.json 形式に変換します。1列目が # で始まる行（説明行）は読み飛ばします。
// brands は | で区切って複数入力。memo 列は出力されません。
// latitude / longitude が空欄の行は、国土地理院の住所検索API（msearch.gsi.go.jp）で address_ja から座標を取得します。
// ※自動取得した座標は「概略位置」(approximate_area) として扱い、地図で確認できたものだけ手で exact にしてください。
// ※インターネット接続が必要です（Node.js 18以上）。住所は検索のためにこのAPIへ送信されます。
const fs=require("fs");
const [,, inPath, outPath="data/facilities.json"]=process.argv;
if(!inPath){console.log("入力CSVを指定してください");process.exit(1);}
let text=fs.readFileSync(inPath,"utf8").replace(/^\uFEFF/,"");
const rows=[];let row=[],cell="",q=false;
for(let i=0;i<text.length;i++){
  const c=text[i];
  if(q){ if(c==='"'){ if(text[i+1]==='"'){cell+='"';i++;} else q=false; } else cell+=c; }
  else if(c==='"') q=true;
  else if(c===","){row.push(cell);cell="";}
  else if(c==="\n"||c==="\r"){ if(c==="\r"&&text[i+1]==="\n")i++; row.push(cell);cell=""; if(row.some(x=>x.trim()!==""))rows.push(row); row=[]; }
  else cell+=c;
}
if(cell!==""||row.length){row.push(cell);if(row.some(x=>x.trim()!==""))rows.push(row);}
const head=rows.shift().map(h=>h.trim());
const list=[];
const todo=[];
rows.forEach(r=>{
  if((r[0]||"").trim().startsWith("#"))return;
  const o={};head.forEach((h,i)=>{o[h]=(r[i]||"").trim();});
  const item={
    id:o.id,type:o.type,name_ja:o.name_ja,name_en:o.name_en,
    address_ja:o.address_ja,address_en:o.address_en,
    latitude:o.latitude===""?null:Number(o.latitude),
    longitude:o.longitude===""?null:Number(o.longitude),
    website:o.website,
    brands:o.brands?o.brands.split("|").map(s=>s.trim()).filter(Boolean):[],
    source_url:o.source_url,location_accuracy:o.location_accuracy||"approximate_area"
  };
  if(item.latitude===null||item.longitude===null||Number.isNaN(item.latitude)||Number.isNaN(item.longitude)){
    item.latitude=null;item.longitude=null;item.location_accuracy="approximate_area";todo.push(item);
  }
  list.push(item);
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function geocode(address){
  const url="https://msearch.gsi.go.jp/address-search/AddressSearch?q="+encodeURIComponent(address);
  const res=await fetch(url);
  if(!res.ok)throw new Error("HTTP "+res.status);
  const hits=await res.json();
  if(!Array.isArray(hits)||hits.length===0)return null;
  const best=hits.find(h=>h.properties&&h.properties.title===address)||hits[0];
  const [lng,lat]=best.geometry.coordinates;
  return {lat,lng,title:best.properties&&best.properties.title,exact:!!(best.properties&&best.properties.title===address)};
}
(async()=>{
  for(const item of todo){
    try{
      const g=await geocode(item.address_ja);
      if(g){item.latitude=g.lat;item.longitude=g.lng;
        console.log(`座標取得: ${item.name_ja} → ${g.lat}, ${g.lng}（検索結果: ${g.title}${g.exact?"":"／住所と完全一致ではありません。要確認"}）`);}
      else console.log(`見つかりません: ${item.name_ja}（${item.address_ja}）。住所を確認するか、座標を手入力してください`);
    }catch(e){console.log(`取得に失敗: ${item.name_ja}（${e.message}）。座標を手入力してください`);}
    await sleep(1000);
  }
  fs.writeFileSync(outPath,JSON.stringify(list,null,2),"utf8");
  console.log(`${list.length}件を ${outPath} に出力しました。続けて node tools/check-facilities.js ${outPath} で検査してください。`);
})();
