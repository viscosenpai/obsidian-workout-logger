import { App, TFile, normalizePath, TFolder } from "obsidian";
import { calculateVolume, calculate1RM } from "./utils";

/**
 * Ensures that all directories in the given path exist.
 * Logs and creates folders if missing.
 */
async function ensureFolderExists(app: App, folderPath: string): Promise<void> {
  const normalizedPath = normalizePath(folderPath);
  const folders = normalizedPath.split("/");

  let currentPath = "";

  for (const folder of folders) {
    if (folder === "") continue;

    currentPath = currentPath === "" ? folder : `${currentPath}/${folder}`;
    const abstractFile = app.vault.getAbstractFileByPath(currentPath);

    if (!abstractFile) {
      await app.vault.createFolder(currentPath);
    } else if (!(abstractFile instanceof TFolder)) {
      throw new Error(`${currentPath} is not a folder.`);
    }
  }
}

/**
 * Gets an existing exercise note or creates a new one with the appropriate frontmatter.
 */
export async function getOrCreateExerciseNote(
  app: App,
  exerciseFolder: string,
  exerciseName: string,
  targetMuscle: string = "",
  equipment: string = "",
): Promise<TFile> {
  // Ensure the extension is .md
  const fileName = exerciseName.endsWith(".md")
    ? exerciseName
    : `${exerciseName}.md`;
  const filePath = normalizePath(`${exerciseFolder}/${fileName}`);

  let file = app.vault.getAbstractFileByPath(filePath);

  if (file instanceof TFile) {
    return file;
  }

  // File doesn't exist, create it. First make sure the folder exists.
  await ensureFolderExists(app, exerciseFolder);

  // Frontmatter template definition
  const template = `---
target_muscle: ${targetMuscle ? `["${targetMuscle}"]` : "[]"}
equipment: "${equipment}"
is_assisted: false
---

# ${exerciseName.replace(".md", "")}

## Log
`;

  file = await app.vault.create(filePath, template);

  if (!(file instanceof TFile)) {
    throw new Error(`Failed to create file: ${filePath}`);
  }

  return file;
}

/**
 * Appends a log entry to the file in a Dataview-friendly format.
 */
export async function appendLog(
  app: App,
  file: TFile,
  sets: { weight: number; reps: number }[],
  setType: string,
  logDate: string,
): Promise<void> {
  const logLines = sets
    .map((set) => {
      const volume = calculateVolume(set.weight, set.reps);
      const oneRM = calculate1RM(set.weight, set.reps);
      return `- [date:: ${logDate}] | [weight:: ${set.weight}] kg x [reps:: ${set.reps}] | [volume:: ${volume}] | [rm:: ${oneRM}] | [set_type:: ${setType}]`;
    })
    .join("\n");

  await app.vault.process(file, (data) => {
    // If it doesn't have a new line at the end, append one first
    const separator = data.endsWith("\n") ? "" : "\n";
    return `${data}${separator}${logLines}\n`;
  });
}
