# 🏋️‍♂️ Obsidian Workout Logger

**Workout Logger** is an Obsidian plugin designed to efficiently log your daily strength training sessions and visualize your progress through a built-in dashboard. Log entries are written in a [Dataview](https://github.com/blacksmithgu/obsidian-dataview)-compatible inline metadata format, making it easy to build custom queries on top of your data.

## ✨ Features

1. **Dashboard view** — A dedicated sidebar view (opened via the ribbon or `Open Dashboard` command) showing charts for body metrics, calories burned, and per-exercise performance across selectable time ranges (Week / Month / Year / All Time).
2. **Logger modal** — Quickly open the log form with the `Open Logger` command to record a workout session.
3. **Strength training logging**:
   - Log multiple sets per session, each with weight, reps, and an optional RPE (6–10 in 0.5 steps).
   - Volume (`weight × reps`, rounded to integer) and estimated 1RM (Epley formula) are calculated automatically.
4. **Cardio logging** — When the target muscle is set to `有酸素` (Cardio), the form switches to speed (km/h), incline (%), and duration (min) inputs. Calories are calculated using a VO₂-based walking formula.
5. **Exercise autocomplete** — Existing notes in the exercise folder are suggested as you type. Selecting a note pre-fills the target muscle and equipment fields from frontmatter.
6. **Auto-create exercise notes** — If the exercise note does not exist, it is created automatically with a YAML frontmatter template.
7. **Calorie calculation** (optional) — Enable in settings to record duration and calorie data per set. Total exercise duration is divided equally across sets.
8. **Daily body metrics logging** (when calorie calculation is enabled) — Body weight and body fat percentage are appended to a dedicated note once per day. Duplicate entries on the same date are skipped automatically.
9. **Internationalization** — UI language follows the Obsidian display language. Supported: English (default), Japanese, Chinese, Korean.

## 🚀 Installation

This plugin is not yet available in the Obsidian community plugin registry. Install it manually by building from source.

### Steps

1. **Clone and place the repository**

   Create a folder (e.g. `workout-logger`) inside your vault's `.obsidian/plugins/` directory and place the project files there:

   ```text
   YourVault/.obsidian/plugins/workout-logger/
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the plugin**

   ```bash
   npm run build
   ```

   This produces `main.js` in the same directory as `manifest.json`.

4. **Enable the plugin in Obsidian**

   Go to **Settings → Community plugins**, find **Workout Logger**, and toggle it on. If this is your first community plugin, you may need to disable Safe Mode first.

## ⚙️ Settings

Open **Settings → Workout Logger** to configure the following options.

| Setting | Description | Default |
| --- | --- | --- |
| **Exercise Folder** | Vault folder where exercise notes are stored | `Gym/Exercises` |
| **Calculate Calories Burned** | Toggle calorie calculation on/off | Off |
| **Default Body Weight (kg)** | Body weight used for calorie calculation *(shown when calorie calculation is on)* | `60` |
| **Default Body Fat Percentage (%)** | Body fat % recorded with each entry *(shown when calorie calculation is on)* | `0` |
| **Body Metrics Note** | Path to the note where daily body weight and body fat % are recorded *(shown when calorie calculation is on)* | `Gym/BodyMetrics` |

## 📝 Log Format

### Exercise notes — e.g. `Gym/Exercises/Bench Press.md`

New exercise notes are created with the following YAML frontmatter template:

```yaml
---
target_muscle: ["Chest"]
equipment: "Barbell"
is_assisted: false
---

# Bench Press

## Log
```

**Strength log entry format:**

```text
- [date:: 2026-04-05] | [weight:: 80] kg x [reps:: 5] | [volume:: 400] | [rm:: 93.3] | [rpe:: 8.5]
- [date:: 2026-04-05] | [weight:: 80] kg x [reps:: 5] | [volume:: 400] | [rm:: 93.3] | [duration:: 10] | [calories:: 52]
```

**Cardio log entry format:**

```text
- [date:: 2026-04-05] | [speed:: 6] | [incline:: 2] | [duration:: 30] | [calories:: 180]
```

**Field reference:**

| Field | Description |
| --- | --- |
| `date` | Workout date (YYYY-MM-DD) |
| `weight` | Weight used per set (kg or lbs) |
| `reps` | Repetitions per set |
| `volume` | Volume = `weight × reps` (rounded to integer) |
| `rm` | Estimated 1RM using the Epley formula |
| `rpe` | Rate of Perceived Exertion (6–10, 0.5 steps). Omitted if not selected |
| `duration` | Time in minutes. Per-set value (total duration ÷ number of sets). Only when calorie calculation is enabled |
| `calories` | Estimated calories burned. Only when calorie calculation is enabled |
| `speed` | Cardio speed in km/h |
| `incline` | Treadmill incline in % |

### Body metrics note — e.g. `Gym/BodyMetrics.md`

When calorie calculation is enabled, body weight and body fat % are automatically appended once per day when a workout is logged. If an entry for that date already exists, it is skipped.

```text
# Body Metrics

## Log
- [date:: 2026-04-04] | [body_weight:: 70] | [body_fat_percentage:: 15]
- [date:: 2026-04-05] | [body_weight:: 69.8] | [body_fat_percentage:: 14.9]
```

## 📊 Dataview Query Examples

Install and enable the [Dataview](https://github.com/blacksmithgu/obsidian-dataview) community plugin to query your workout data.

### Best 1RM and total volume by date

```dataview
TABLE
  max(rm) AS "Best 1RM",
  sum(volume) AS "Total Volume"
FROM "Gym/Exercises"
WHERE date
GROUP BY date
SORT date DESC
```

### Per-exercise history (paste inside an exercise note)

```dataview
TABLE
  max(rows.weight) AS "Weight (kg)",
  max(rows.reps) AS "Reps",
  max(rows.volume) AS "Volume",
  max(rows.rm) AS "1RM",
  max(rows.rpe) AS "RPE"
FROM "Gym/Exercises"
FLATTEN file.lists AS L
WHERE L.date AND file.path = this.file.path
GROUP BY L.date
SORT L.date DESC
```

### Body weight and body fat over time

```dataview
TABLE
  body_weight AS "Weight (kg)",
  body_fat_percentage AS "Body Fat (%)"
FROM "Gym/BodyMetrics"
FLATTEN file.lists AS L
WHERE L.date
SORT L.date DESC
```

## License

MIT
