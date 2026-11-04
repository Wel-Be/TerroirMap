// 使い方: node tools/check-facilities.js [検査するJSONのパス]（省略時は data/facilities.json）
// data/facilities.json の入力ミスを検査します（SAMPLE-で始まるIDは出典チェックを免除）。
const fs=require("fs");
const list=JSON.parse(fs.readFileSync(process.argv[2]||__dirname+"/../data/facilities.json","utf8"));
const errors=[],warns=[],ids=new Set();
list.forEach((x,i)=>{
  const p=`#${i+1} ${x.id||"(idなし)"}`;
  if(!x.id)errors.push(p+": id がありません");
  else if(ids.has(x.id))errors.push(p+": id が重複しています");
  ids.add(x.id);
  if(!["winery","sake"].includes(x.type))errors.push(p+": type は winery か sake");
  if(!x.name_ja)errors.push(p+": name_ja がありません");
  if(!x.address_ja)errors.push(p+": address_ja がありません");
  if(typeof x.latitude!=="number"||x.latitude<20||x.latitude>46)errors.push(p+": latitude が日本の範囲外");
  if(typeof x.longitude!=="number"||x.longitude<122||x.longitude>154)errors.push(p+": longitude が日本の範囲外");
  if(x.website&&!/^https:\/\//.test(x.website))errors.push(p+": website は https:// で始めてください");
  if(x.brands!==undefined&&!Array.isArray(x.brands))errors.push(p+": brands は配列");
  if(!["exact","approximate_area"].includes(x.location_accuracy))errors.push(p+": location_accuracy は exact か approximate_area");
  if(!String(x.id).startsWith("SAMPLE-")){
    if(!/^https?:\/\//.test(x.source_url||""))errors.push(p+": source_url（確認元）が必要です");
    if(!x.name_en)warns.push(p+": name_en 未登録（日本語を表示します）");
  }
});
warns.forEach(w=>console.log("注意:",w));
errors.forEach(e=>console.log("エラー:",e));
console.log(`${list.length}件を検査: エラー ${errors.length} / 注意 ${warns.length}`);
process.exit(errors.length?1:0);
