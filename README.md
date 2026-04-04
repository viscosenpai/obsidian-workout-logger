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
5. **RPE（主観的運動強度）の記録**:
   - 各セットに RPE（6〜10、0.5刻み）をドロップダウンで入力できます。未選択の場合はログに出力されません。
6. **カロリー消費の計算**（オプション）:
   - METs・体重・ワークアウト時間からカロリー消費量を自動計算します。
   - 設定からオン/オフを切り替えられます。
7. **体重・体脂肪率の日次記録**（カロリー計算オン時）:
   - トレーニングのログ保存時に、体重・体脂肪率を専用ノートへ日次で自動記録します。
   - 同じ日の記録がすでに存在する場合は重複して追記しません。
8. **Dataview親和性の高いフォーマット**:
   - 記録内容はDataviewのインラインメタデータ形式でノート末尾に追記されるため、クエリで簡単に集計できます。

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

| 設定項目 | 説明 | デフォルト |
| --- | --- | --- |
| **Exercise Folder** | 種目ノートを保存するフォルダパス | `Gym/Exercises` |
| **Calculate Calories Burned** | カロリー計算機能のオン/オフ | オフ |
| **Default Body Weight (kg)** | カロリー計算に使用する体重 ※カロリー計算オン時のみ表示 | `60` |
| **Default Body Fat Percentage (%)** | 体脂肪率の初期値 ※カロリー計算オン時のみ表示 | `0` |
| **Body Metrics Note** | 体重・体脂肪率を日次記録するノートのパス ※カロリー計算オン時のみ表示 | `Gym/BodyMetrics` |

## 📝 記録フォーマット

### 種目ノート（例: `Gym/Exercises/Bench Press.md`）

新規作成時はYAMLフロントマター付きのテンプレートが自動生成されます。

```yaml
---
target_muscle: ["胸"]
equipment: "フリーウェイト"
is_assisted: false
---

# Bench Press

## Log
- [date:: 2026-04-04] | [weight:: 80] kg x [reps:: 5] | [volume:: 400] | [rm:: 93.3] | [rpe:: 8.5]
- [date:: 2026-04-04] | [weight:: 80] kg x [reps:: 5] | [volume:: 400] | [rm:: 93.3] | [rpe:: 8]
- [date:: 2026-04-04] | [weight:: 75] kg x [reps:: 8] | [volume:: 600] | [rm:: 100] | [duration:: 45] | [calories:: 315]
```

各フィールドの意味:

| フィールド | 内容 |
| --- | --- |
| `date` | トレーニング日（YYYY-MM-DD） |
| `weight` | 使用重量（kg または lbs） |
| `reps` | 回数 |
| `volume` | ボリューム（`weight × reps`） |
| `rm` | 推定1RM（Epley公式） |
| `rpe` | 主観的運動強度（6〜10、0.5刻み）。未選択時は省略 |
| `duration` | 運動時間（分）。カロリー計算オン時のみ |
| `calories` | 消費カロリー（kcal）。カロリー計算オン時のみ |

### 体重・体脂肪率ノート（例: `Gym/BodyMetrics.md`）

カロリー計算がオンの場合、トレーニングログ保存時に自動作成・追記されます。同じ日の記録が既に存在する場合は追記されません。

```markdown
# Body Metrics

## Log
- [date:: 2026-04-04] | [body_weight:: 70] | [body_fat_percentage:: 15]
- [date:: 2026-04-05] | [body_weight:: 69.8] | [body_fat_percentage:: 14.9]
```

## 📊 Dataviewクエリ例

Dataviewプラグインをインストール＆有効化することで、以下のクエリを活用できます。

### 日別の最高1RM・総ボリューム

```dataview
TABLE
  max(rm) AS "Best 1RM",
  sum(volume) AS "Total Volume"
FROM "Gym/Exercises"
WHERE date
GROUP BY date
SORT date DESC
```

### 種目ごとの詳細履歴（種目ノート内に貼り付けて使用）

```dataview
TABLE
  max(rows.weight) AS "weight(kg)",
  max(rows.reps) AS "reps",
  max(rows.volume) AS "volume",
  max(rows.rm) AS "1rm",
  max(rows.rpe) AS "RPE"
FROM "Gym/Exercises"
FLATTEN file.lists AS L
WHERE L.date AND file.path = this.file.path
GROUP BY L.date
SORT L.date DESC
```

### 体重・体脂肪率の推移

```dataview
TABLE
  body_weight AS "体重(kg)",
  body_fat_percentage AS "体脂肪率(%)"
FROM "Gym/BodyMetrics"
FLATTEN file.lists AS L
WHERE L.date
SORT L.date DESC
```

## ライセンス

MIT
