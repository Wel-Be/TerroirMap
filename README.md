# TerroirMap - Step 1

ワイナリーと日本酒酒蔵を地図に表示するWebアプリの初期版です。

## この段階でできること
- OpenStreetMap + Leaflet の地図表示
- 「すべて／ワイナリー／酒蔵」の表示切り替え
- マーカーを押して施設情報カードを表示
- スマートフォン画面への対応

## 大切な注意
`data/facilities.json` の6件は動作確認用の架空サンプルです。実在する施設ではありません。公開前に、公式サイト等で実在と所在地を確認したデータに置き換えてください。

## GitHub Pagesで公開する手順
1. GitHubで `terroirmap` という名前の新しいリポジトリを作成します。
2. ZIPを解凍し、中にある `index.html`、`css`、`js`、`data`、`README.md` をリポジトリの一番上にアップロードします。
3. リポジトリの Settings → Pages を開きます。
4. Source を `Deploy from a branch` にします。
5. Branch を `main`、フォルダを `/(root)` にして Save を押します。
6. 公開URLは通常 `https://あなたのGitHubユーザー名.github.io/terroirmap/` です。

## 施設データを追加するとき
`data/facilities.json` に施設を追加します。
- `type` はワイナリーなら `winery`、日本酒酒蔵なら `sake`
- `id` は施設ごとに重複しない値
- 緯度は `latitude`、経度は `longitude`
- 公式サイトが不明なら `website` は空文字 `""`
- 代表銘柄が不明なら `brands` は空配列 `[]`

## 地図について
地図画像はOpenStreetMapのタイル配信サーバーから読み込みます。地図表示にはインターネット接続が必要です。OpenStreetMapの著作権表示を残し、タイルの一括取得や大量ダウンロードは行わないでください。利用者が増えた場合は、別のタイル配信サービスへの切り替えを検討してください。
