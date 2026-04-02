# 🏋️‍♂️ Obsidian Workout Logger

**Workout Logger** は、日常の筋トレセッションをObsidian内で効率的に記録し、Dataviewプラグインを活用して簡単に集計・分析を行えるように設計されたObsidian用プラグインです。

## ✨ 主な機能

1. **モーダルUIによる記録**:
   - `Open Logger` コマンドやリボンアイコン（ダンベル）から素早く記録画面を呼び出せます。
2. **種目（Exercise）のオートコンプリート**:
   - 指定したフォルダ（デフォルト: `Gym/Exercises/`）内の既存ファイル名から種目を検索・選択できます。
3. **新規種目の自動作成**:
   - 入力した種目のノートが存在しない場合、テンプレート（YAMLフロントマター付き）を含んだ新規ノートを自動生成します。
4. **自動計算**:
   - 入力された重量(Weight)と回数(Reps)から、**ボリューム**（`Weight × Reps`）と**1RMの推定値**（Epley公式に基づく）を自動計算します。
5. **Dataview親和性の高いフォーマット**:
   - 記録内容は以下のようなインラインメタデータのリスト形式でノート末尾に追記されるため、Dataviewのクエリで簡単にデータを集計できます。
     `- [date:: 2024-04-02] | [weight:: 60] kg x [reps:: 10] | [volume:: 600] | [rm:: 80] | [set_type:: normal]`

## 🚀 インストール・セットアップ手順

本プラグインはまだコミュニティプラグインとして公開されていないため、ローカルでビルドしてインストールする必要があります。

### 手順

1. **リポジトリのクローン・配置**:
   - ObsidianのVault内にある `.obsidian/plugins/` フォルダ配下に、新しく `workout-logger` などの名前でフォルダを作成し、本プロジェクトのファイル一式（またはリポジトリ）を配置します。
     （例： `YourVault/.obsidian/plugins/workout-logger/`）

2. **依存パッケージのインストール**:
   - ターミナルで配置したフォルダ（上記の場所）へ移動し、以下のコマンドを実行します。

     ```bash
     npm install
     ```

3. **プラグインのビルド**:
   - 以下のコマンドを実行して、TypeScriptコードをJavaScript(`main.js`)へビルドします。

     ```bash
     npm run build
     ```

   - 成功すると、フォルダ内に `main.js` が生成されます（`manifest.json` と同じ階層）。

4. **Obsidianでのプラグイン有効化**:
   - Obsidianを開き、「設定 (Settings)」 > 「コミュニティプラグイン (Community plugins)」に移動します。
   - インストール済みプラグイン一覧にある「Workout Logger」をオンにして有効化してください。
   - ※ オフラインでのインストール後はじめて読み込む場合、「コミュニティプラグインのセーフモードをオフ」にする必要があります。

## ⚙️ 設定 (Settings)

Obsidianの設定画面の「Workout Logger」タブから、以下の設定を変更できます。

- **Exercise Folder**: 筋トレの種目（Exercise）ノートを保存するVault内のフォルダパスを指定します。（デフォルト: `Gym/Exercises`）

## 📊 Dataviewを用いたダッシュボードサンプル

Dataviewプラグインをインストール＆有効化することで、以下のクエリを用いて筋トレの履歴（その日の最高1RMや合計ボリューム等）を集計するダッシュボードを作成できます。
任意のノート（例: `Dashboard.md`）にコードブロックを貼り付けてご利用ください。

\`\`\`dataview
TABLE
  max(1rm) AS "Personal Best (1RM)",
  sum(volume) AS "Total Volume"
FROM "Gym/Exercises"
WHERE date
GROUP BY date
SORT date desc
\`\`\`

## ライセンス

MIT
