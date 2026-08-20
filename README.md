# koreno

レシート画像をアップロードするだけで、Claude Vision APIが店名・日付・金額・カテゴリを自動抽出する家計簿アプリ（MVP）。

## 技術スタック

- Next.js 15 (App Router, TypeScript) / Tailwind CSS
- Supabase（Auth・Postgres・Storage）
- Anthropic Claude API（`claude-haiku-4-5`, Vision + Structured Outputs）
- recharts（カテゴリ別内訳グラフ）

## セットアップ手順

### 1. Supabaseプロジェクトを作成

[supabase.com](https://supabase.com) で新規プロジェクトを作成し、**Project Settings → API** から以下を控えます。

- Project URL
- `anon` `public` key
- `service_role` key（`.env.local`に設定するが、通常のアプリ動作では未使用）

### 2. DBスキーマを適用

Supabaseダッシュボードの **SQL Editor** で `supabase/migrations/0001_init.sql` の内容をそのまま実行してください。
`categories` / `receipts` テーブル、RLSポリシー、`receipts` Storageバケットとそのポリシーが一括で作成されます。

### 3. Authのマジックリンク設定を確認

- **Authentication → Providers** で Email（Magic Link）が有効になっていることを確認
- **Authentication → URL Configuration** の Redirect URLs に以下を追加
  - `http://localhost:3000/auth/callback`（開発用）
  - 本番URLの `https://<your-domain>/auth/callback`（デプロイ後）

### 4. Anthropic APIキーを取得

[console.anthropic.com](https://console.anthropic.com) でAPIキーを発行します。

### 5. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` を開き、上記で取得した値を設定してください。

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key（クライアント公開可、RLSで保護） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key（サーバー専用、絶対にクライアントへ露出しないこと） |
| `ANTHROPIC_API_KEY` | Anthropic APIキー（サーバー専用） |
| `NEXT_PUBLIC_SITE_URL` | マジックリンクのリダイレクト先構築に使用。本番デプロイ時はデプロイ先のURLに変更 |

### 6. 依存関係のインストールと起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスすると `/login` にリダイレクトされます。

## 動作確認手順

1. `/login` でメールアドレスを入力し送信 → 受信メールのリンクをクリックしてログイン
2. 「レシート追加」から画像をアップロード → 「解析中...」表示後、AIの抽出結果がフォームにプリセットされる
3. 内容を確認・修正して保存 → レシート一覧に反映されることを確認
4. 「支出レポート」→「月次サマリー」で当月の合計金額を確認
5. 「支出レポート」→「カテゴリ別内訳」でカテゴリ別の円グラフを確認
6. レシート詳細から削除 → 一覧・サマリー・グラフから消えることを確認

## 本番デプロイ（Vercel）

1. Vercelでプロジェクトを作成し、このリポジトリを接続
2. 上記の環境変数をVercelのProject Settings → Environment Variablesに登録
   - `NEXT_PUBLIC_SITE_URL` は本番ドメイン（例: `https://your-app.vercel.app`）に変更
3. Supabaseの **Authentication → URL Configuration** に本番ドメインの `/auth/callback` をRedirect URLsとして追加
4. デプロイ

## スコープについて

本リポジトリはMVP（レシートアップロード・AI自動抽出・確認修正・一覧/詳細・月次サマリー・カテゴリ別内訳・削除）のみを実装しています。
カメラ直接撮影、品目明細編集、期間フィルタ、カテゴリ管理、検索などはv1.0以降のスコープです（`requirements.md` 参照）。
