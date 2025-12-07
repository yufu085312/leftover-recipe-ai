# 🍳 Leftover Recipe AI

余った食材からAIが美味しいレシピを提案してくれるWebアプリケーションです。Google Gemini APIを使用して、冷蔵庫の残り物から創造的で実用的なレシピを生成します。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF.svg?logo=vite)

## ✨ 主な機能

### 🤖 AI駆動のレシピ生成
- **Google Gemini API**を使用した高度なレシピ提案
- 複数のGeminiモデルから選択可能
  - `gemini-2.5-flash`（推奨・最新高速）
  - `gemini-2.5-flash-lite`（超軽量・最速）

### �️ 料理画像の自動表示
- **Unsplash API**統合により、レシピカードに美しい料理画像を表示
- デモキー使用時：50リクエスト/時間
- 独自キー使用時：5,000リクエスト/時間
- 写真家クレジットの自動表示（Unsplash規約準拠）

### 🎯 柔軟な制約設定
- 調理時間の指定
- 難易度の選択
- 人数の設定
- アレルギー・除外食材の指定

### 🔔 詳細なエラー通知
- **レート制限エラー**：しばらく待つよう案内
- **利用枠超過エラー**：APIキーの使用状況確認を促す
- **APIキーエラー**：正しいキーの入力を案内
- わかりやすいアイコンと説明付き

### 📱 モダンなUI/UX
- レスポンシブデザイン（PC・タブレット・スマホ対応）
- 温かみのある料理サイト風カラーパレット
- スムーズなアニメーションとトランジション
- 折りたたみ式のAPIキー取得手順

## 🚀 セットアップ

### 必要要件
- Node.js 18以上
- Gemini APIキー（無料で取得可能）
- Unsplash APIキー（オプション、画像表示用）

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/leftover-recipe-ai.git
cd leftover-recipe-ai
```

2. 依存関係をインストール
```bash
npm install
```

3. 開発サーバーを起動
```bash
npm run dev
```

4. ブラウザで開く
```
http://localhost:3001
```

## 🔑 APIキーの取得

### Gemini APIキー（必須）

1. [Google AI Studio](https://aistudio.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Create API key」または「Get API key」をクリック
4. 「Create API key in new project」を選択
5. 生成されたAPIキー（`AIza...`で始まる）をコピー
6. アプリの設定から入力

**無料枠**: 1日1,500リクエストまで無料

### Unsplash APIキー（任意）

1. [Unsplash Developers](https://unsplash.com/developers)にアクセス
2. 開発者登録を行う（無料）
3. 「New Application」をクリック
4. アプリケーション名と説明を入力
5. Access Keyをコピー
6. アプリの設定から入力

**メリット**: デモキー（50リクエスト/時）→ 独自キー（5,000リクエスト/時）

## 📖 使い方

1. **APIキーを設定**
   - 右上の設定ボタン（⚙️）をクリック
   - Gemini APIキーを入力して保存
   - （任意）Unsplash APIキーを入力

2. **食材を追加**
   - 余っている食材を入力
   - 複数の食材を追加可能

3. **制約を設定**（オプション）
   - 調理時間、難易度、人数を指定
   - アレルギーや除外したい食材を入力

4. **レシピを生成**
   - 「✨ レシピを生成」ボタンをクリック
   - AIが複数のレシピを提案
   - 各レシピには料理画像、材料、手順が表示されます

5. **詳細を確認**
   - 「詳細を見る」をクリックで材料と作り方を表示
   - お気に入りに保存可能

## 🛠️ 技術スタック

### フロントエンド
- **Vite** - 高速なビルドツール
- **Vanilla JavaScript (ES6+)** - モジュール構造
- **CSS3** - カスタムプロパティ、グラデーション、アニメーション

### AI/API
- **@google/genai** - Google Gemini API SDK
- **Gemini 2.5 Flash** - デフォルトモデル（高速）
- **Unsplash API** - 高品質な料理画像

### データ管理
- **LocalStorage** - APIキー、お気に入りレシピの永続化

## 📁 プロジェクト構造

```
leftover-recipe-ai/
├── index.html              # メインHTML
├── src/
│   ├── main.js            # アプリケーションエントリーポイント
│   ├── components/
│   │   ├── IngredientForm.js    # 食材入力フォーム
│   │   ├── ConstraintsForm.js   # 制約設定フォーム
│   │   └── RecipeDisplay.js     # レシピ表示コンポーネント
│   ├── services/
│   │   ├── geminiService.js     # Gemini API連携
│   │   └── unsplashService.js   # Unsplash API連携
│   ├── utils/
│   │   └── storage.js           # LocalStorage管理
│   └── styles/
│       └── main.css             # メインスタイル
├── package.json
└── README.md
```

## 🎨 主な特徴

### レスポンシブデザイン
- モバイルファースト設計
- ブレークポイント: 768px, 1024px
- すべてのデバイスで快適な操作性

### アクセシビリティ
- セマンティックHTML
- ARIA属性の使用
- キーボードナビゲーション対応

### パフォーマンス
- 非同期画像読み込み
- ローディングスピナー
- エラーハンドリング

## 🔒 セキュリティとプライバシー

- APIキーはブラウザのLocalStorageに保存
- サーバーには送信されません
- 個人情報は収集しません

⚠️ **注意**: APIキーを他人と共有しないでください

## 📝 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📧 お問い合わせ

質問やフィードバックがあれば、GitHubのissueでお知らせください。

---

Made with ❤️ and 🍳 using Google Gemini AI
