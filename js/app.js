// 施設データ、表示切り替え、施設詳細カード
let facilities = [];
async function startApp() {
  const response = await fetch("./data/facilities.json");
  if (!response.ok) throw new Error("施設データを読み込めませんでした。");
  facilities = await response.json();
  TerroirMap.setFacilities(facilities, showDetail);
  updateCount(facilities.length);
  document.querySelectorAll(".filter-button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-button").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      const type = button.dataset.filter;
      TerroirMap.filter(type);
      updateCount(type === "all" ? facilities.length : facilities.filter(item => item.type === type).length);
    });
  });
  document.getElementById("sheet-close").addEventListener("click", closeDetail);
  document.getElementById("sheet-backdrop").addEventListener("click", closeDetail);
}
function updateCount(count) { document.getElementById("map-count").textContent = `${count}件を表示`; }
function showDetail(item) {
  const type = document.getElementById("detail-type");
  type.textContent = item.type === "winery" ? "WINERY / ワイナリー" : "SAKE BREWERY / 酒蔵";
  type.classList.toggle("sake-type", item.type === "sake");
  document.getElementById("detail-name").textContent = item.name_ja || "";
  document.getElementById("detail-address").textContent = item.address_ja || "住所情報なし";
  const brands = Array.isArray(item.brands) ? item.brands.filter(Boolean) : [];
  document.getElementById("brand-row").hidden = brands.length === 0;
  document.getElementById("detail-brands").textContent = brands.join("、");
  const link = document.getElementById("detail-website");
  if (item.website) { link.href = item.website; link.setAttribute("aria-disabled", "false"); }
  else { link.removeAttribute("href"); link.setAttribute("aria-disabled", "true"); }
  document.getElementById("detail-sheet").classList.add("open");
  document.getElementById("sheet-backdrop").classList.add("open");
}
function closeDetail() {
  document.getElementById("detail-sheet").classList.remove("open");
  document.getElementById("sheet-backdrop").classList.remove("open");
}
startApp().catch(error => {
  console.error(error);
  document.getElementById("map-count").textContent = "データの読み込みに失敗しました";
  alert("施設データを読み込めませんでした。ファイル一式が正しくアップロードされているか確認してください。");
});
