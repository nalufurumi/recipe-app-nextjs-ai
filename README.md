# レシピ本

断片的なレシピ文章を貼り付けると、AIが補完して構造化し、シェフAIが実際に作れるかをチェックしてから保存できる、自分専用のレシピ本アプリ。

## セットアップ

### 1. Supabase プロジェクトを作成

1. https://supabase.com でプロジェクトを新規作成（無料枠でOK）
2. ダッシュボードの SQL Editor で `supabase/schema.sql` の内容を実行し、`recipes` テーブルを作成
3. Project Settings → API から `Project URL` と `service_role` キーを取得

### 2. Anthropic API キーを用意

https://console.anthropic.com でAPIキーを発行する。

### 3. 環境変数を設定

`.env.local.example` を `.env.local` にコピーして値を埋める。

```
ANTHROPIC_API_KEY=      # Anthropic APIキー
SUPABASE_URL=           # SupabaseのProject URL
SUPABASE_SERVICE_ROLE_KEY=  # Supabaseのservice roleキー
APP_PASSWORD=           # アプリ全体にかける簡易パスワード
```

### 4. ローカル起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開き、`APP_PASSWORD` に設定したパスワードでログインする。

## 使い方

1. 「+ レシピを追加」からレシピ文章（断片的でOK）を貼り付ける
2. 「AIで完成させる」を押すと、AIが欠けている情報を補完し、続けてシェフAIが実現可能性をチェックする
3. 内容を確認して「レシピ本に保存する」を押すと、ホーム画面のレシピ一覧に追加される

## デプロイ (Vercel)

Vercelにプロジェクトをインポートし、上記と同じ環境変数（`ANTHROPIC_API_KEY` / `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `APP_PASSWORD`）を設定してデプロイする。
