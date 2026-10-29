import path from "node:path";
import fs from "node:fs";
import { writeFile, readFile } from "node:fs/promises";

export function newJsonDb(fileName, seed = []) {
  const filePath = path.join(import.meta.dirname, "../..", "/data", `/${fileName}.json`);

  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), { encoding: "utf8" });

  const read = async () => {
    const data = await readFile(filePath);

    return JSON.parse(data);
  };

  const save = async (data) => {
    const dataString = JSON.stringify(data, null, 2);

    await writeFile(filePath, dataString, { encoding: "utf8" });
  };

  return {
    read,
    save,
  };
}
