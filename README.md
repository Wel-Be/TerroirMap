# TerroirMap - Version 1.0.0（STEP 4・5 対応版）

## STEP 4（公開準備）で追加・変更した点
- `privacy.html`：プライバシー説明ページ（日本語・英語切り替え）
- GoatCounter を `index.html` と `privacy.html` に設置
- フッターにプライバシーへのリンクを追加（OFUSEリンクは既存のものを維持）
- Google Fonts の読み込みをやめ、端末の日本語フォントを使う方式に変更（外部通信を削減）
- Leaflet を `lib/leaflet/` から読み込む方式に変更（下記の手順が必要）
- 詳細カードに「概略位置」の注記を追加（日英対応）。`location_accuracy` が `exact` 以外のとき表示
- 英語切り替え時に、地図下の著作権表示も切り替わるよう修正
- 非表示指定（hidden）が効かず、銘柄が空でも「代表銘柄」の行が出ていた不具合を修正

## 【重要】Leafletを同梱する手順（1回だけ）
1. https://unpkg.com/leaflet@1.9.4/dist/leaflet.js を開いて保存
2. https://unpkg.com/leaflet@1.9.4/dist/leaflet.css を開いて保存
3. 2つを `lib/leaflet/` に置く（ファイル名はそのまま）
置くまでは自動で unpkg から読み込みます。公開前に置いておくと外部通信が減ります。

## 追加機能：Googleマップで開く
詳細カードに「Googleマップで開く」ボタンを追加しました。押すと、施設名＋住所でGoogleマップを検索して別タブで開きます（住所がないときは座標）。押したときだけ外部サイトへ移動します。プライバシーページにも記載済みです。
仕様書への反映案：5-2 表示項目に「Googleマップへのリンク」を追加、9-3 外部サービスに Google Maps（リンク先としてのみ）を追加。

## 追加機能：訪問した／味わった の記録
詳細カードの「＋ 訪問した」「＋ 味わった」ボタンで、自分の記録を残せます（もう一度押すと解除）。記録した日付も一緒に保存されます。お気に入りと同じく、端末のブラウザ内（localStorage）だけに保存され、運営者には送信されません。
「マイリスト」（旧：お気に入り一覧）から、お気に入り／訪問した／味わった をタブで切り替えて見られます。記録の削除は、一覧の「削除」ボタン（確認あり）です。
※ブラウザのデータ消去や端末の変更で記録は消えます。
仕様書への反映案：6章に「記録機能」を追加、13章の「訪問記録」を実装済みに変更。

## 追加機能：アプリとして追加（アイコン）
`manifest.json`、`sw.js`、`icons/`（192・512・maskable・apple-touch-icon・favicon）を追加しました。スマホのブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」で使えます。
- アイコンは、いただいた画像を元に、角丸の外側まで薄紫で塗った正方形にしています（OS側で角が丸められるため）。
- `sw.js` は、通常は常に最新のファイルを取得し、通信できないときだけ保存済みを使います。更新が反映されない場合は、ブラウザのキャッシュを消してください。
仕様書への反映案：11章の使用技術に PWA（manifest・service worker）を追加。

## STEP 5（施設データ）
### データ項目（`data/facilities.json`）
`id` / `type`(winery|sake) / `name_ja` / `name_en` / `address_ja` / `address_en` / `latitude` / `longitude` / `website` / `brands`（配列）/ `source_url`（確認元）/ `location_accuracy`（`exact` または `approximate_area`）

### 追加手順
1. 公式団体の一覧などで、実在・名称・住所を確認する
2. 公式サイトがあれば `website` に入れる（なければ空文字）
3. 座標は施設の実際の場所を確認できた場合だけ `exact`。確認できなければ `approximate_area`
4. `source_url` に確認元URLを入れる
5. `node tools/check-facilities.js` を実行してエラーがないことを確認（`SAMPLE-` で始まるIDは出典チェック免除）

### 現在のデータ
6件はすべて架空のサンプルです（実在施設ではありません）。公開前に、確認済みの実在施設に置き換えてください。

## 仕様書の修正メモ（次回更新時に反映）
- 8-2 データ項目名を現行コードに合わせる：`name`→`name_ja`、`address`→`address_ja`、`lat/lng`→`latitude/longitude`、`brand/brand_en`→`brands`（配列）
- 8-2 `location_accuracy` の値：`exact` / `approximate_area`
- 11-2 ファイル構成：`favorites.js`・`language.js` は作らず `app.js` に統合、`tools/check-facilities.js` と `lib/leaflet/` を追加
- 9-3 外部通信：Google Fonts は使用しない。Leaflet は自サイト配信（未配置時のみ unpkg）
- 12 STEP4・STEP5の進捗を更新

## 更新方法
GitHubリポジトリに、このフォルダの中身をフォルダ構成ごと上書きしてアップロードしてください。
