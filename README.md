# PictureToPlan

画像から予定情報を読み取り、Googleカレンダーへの登録をサポートするWebアプリです。

イベントのチラシや案内画像などをアップロードすると、Google Geminiが画像内の情報を解析し、予定の件名・日時・場所・詳細を抽出します。抽出結果は画面上で確認・修正でき、Googleカレンダーの予定作成ページへ引き継げます。

> Note: Googleカレンダーに予定を直接・自動登録するアプリではありません。予定情報が入力されたGoogleカレンダーの作成ページを開き、ユーザー自身が内容を確認して保存します。

## 主な機能

- 画像のアップロード：ファイル選択またはドラッグ＆ドロップに対応
- 画像プレビュー：アップロード前に選択した画像を確認
- AIによる予定情報の抽出：Geminiを利用して件名、詳細、開始・終了日時、場所を取得
- 抽出結果の編集：AIの解析結果をフォーム上で修正可能
- Googleカレンダーとの連携：入力内容を反映した予定作成ページを別タブで開く
- レスポンシブ対応：PC・スマートフォンの画面サイズに合わせて表示

対応画像形式：`JPG` / `JPEG` / `PNG` / `GIF` / `WebP`（最大4.5 MB）

## 使い方

1. 予定が記載された画像を選択するか、アップロードエリアにドラッグ＆ドロップします。
2. 画像のプレビューを確認し、「サーバーに送って予測する」を押します。
3. AIが抽出した件名・詳細・開始日時・終了日時・場所を確認します。
4. 必要に応じてフォームの内容を修正します。
5. 「Googleカレンダーに追加」を押し、開いたGoogleカレンダーのページで予定を保存します。

AIの抽出結果には誤りが含まれる場合があります。特に日付や時刻は登録前に確認してください。

## 使用技術

| 分野 | 技術 |
| --- | --- |
| フロントエンド | Next.js 16 / React 19 / TypeScript |
| スタイリング | Tailwind CSS 4 / CSS |
| バックエンド | Python / FastAPI / Pydantic |
| AI | Google Gemini API (`gemini-3.1-flash-lite`) |
| カレンダー連携 | Googleカレンダーの予定作成URL |
| デプロイ設定 | Vercel |

## システム構成

```text
画像を選択
    ↓
Next.js（アップロード・プレビュー）
    ↓ POST /api/predict
FastAPI（画像の受信）
    ↓ 画像 + プロンプト
Gemini API（予定情報をJSONで抽出）
    ↓
Next.js（抽出結果の表示・編集）
    ↓ Googleカレンダーの予定作成URLを生成
Googleカレンダー（ユーザーが内容を確認・保存）
```

バックエンドは、画像と指示文をGemini APIに送信し、構造化されたJSONを受け取ります。フロントエンドでは、この結果をフォームに反映します。

## ローカルでの起動方法

### 必要なもの

- Node.js / npm（Next.js 16に対応するバージョン）
- Python 3 と `pip`
- Google Gemini APIキー

### 1. リポジトリをクローン

```bash
git clone https://github.com/sstt126/PictureToPlan.git
cd PictureToPlan
```

### 2. フロントエンドの依存パッケージをインストール

```bash
npm install
```

### 3. Pythonの仮想環境と依存パッケージを準備

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r api/requirements.txt
pip install uvicorn
```

※ 上記の仮想環境の有効化コマンドはmacOS/Linux向けです。

### 4. APIキーを設定

プロジェクトのルートディレクトリに `.env` ファイルを作成し、次の内容を設定します。

```dotenv
GOOGLE_API_KEY=your_google_api_key
```

APIキーは公開リポジトリにコミットしないでください。`.env` を含む環境変数ファイルは `.gitignore` で除外されています。

### 5. バックエンドを起動

```bash
uvicorn api.main:app --reload --port 8000
```

### 6. 別のターミナルでフロントエンドを起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスします。

開発時は `next.config.ts` のrewrite設定により、フロントエンドからの `/api/*` リクエストが `http://127.0.0.1:8000/api/*` に転送されます。そのため、フロントエンドとバックエンドの両方を起動する必要があります。

## ディレクトリ構成

主要なファイルは次のとおりです。

```text
PictureToPlan/
├── api/
│   ├── main.py           # 画像解析API・Gemini呼び出し
│   └── requirements.txt  # Python依存パッケージ
├── app/
│   ├── page.tsx          # アップロード・解析結果編集・カレンダー連携
│   ├── layout.tsx        # 共通レイアウト・メタデータ
│   └── globals.css       # スタイル・レスポンシブ対応
├── public/               # 静的ファイル
├── next.config.ts        # Next.js設定・開発時のAPI転送
├── package.json          # フロントエンドの依存関係・実行スクリプト
├── vercel.json           # Vercelのビルド・ルーティング設定
└── README.md
```

## API

### `POST /api/predict`

画像を受け取り、Geminiを使用して予定情報を解析します。

- リクエスト：`multipart/form-data`（フィールド名：`file`）
- レスポンス：JSON（件名・詳細・開始/終了日時・場所）

レスポンスで扱う主なフィールド：

| フィールド | 内容 |
| --- | --- |
| `text` | 予定の件名 |
| `details` | 予定の詳細 |
| `year_start`, `month_start`, `date_start` | 開始日 |
| `hours_start`, `minutes_start` | 開始時刻 |
| `year_end`, `month_end`, `date_end` | 終了日 |
| `hours_end`, `minutes_end` | 終了時刻 |
| `location` | 開催場所 |

## 注意事項

- 画像から読み取れない情報は、AIが空欄にしたり、基準日から推測して補完したりすることがあります。
- 日付・時刻の入力値は登録前に確認してください。
- カレンダー作成URLのタイムゾーンは `Asia/Tokyo` に設定されています。
- 画像は解析のためにGemini APIへ送信されます。現行コードには画像をアプリ独自のストレージへ保存する処理はありませんが、外部API側のデータ取り扱いについてはGoogleの規約・ポリシーを確認してください。
- GoogleアカウントへのOAuthログインやGoogle Calendar APIを使った直接登録は実装していません。

## リンク

- [GitHubリポジトリ](https://github.com/sstt126/PictureToPlan)
- [Webアプリ（Vercel）](https://picture-to-plan.vercel.app/) ※公開設定によってはアクセスが制限される場合があります。