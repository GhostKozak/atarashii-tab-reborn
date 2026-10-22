import { spawnSync } from "node:child_process"
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const buildDirectory = path.join(projectRoot, "dist")
const manifestPath = path.join(buildDirectory, "manifest.json")
const packageNames = {
  chrome: "atarashii-tab-reborn-chrome.zip",
  firefox: "atarashii-tab-reborn-firefox.zip",
}

const baseManifest = JSON.parse(await readFile(manifestPath, "utf8"))
const buildEntries = (await readdir(buildDirectory, { withFileTypes: true }))
  .filter(({ name }) => !["chrome", "firefox", ...Object.values(packageNames)].includes(name))

for (const [browser, archiveName] of Object.entries(packageNames)) {
  const browserDirectory = path.join(buildDirectory, browser)
  await rm(browserDirectory, { recursive: true, force: true })
  await mkdir(browserDirectory, { recursive: true })

  for (const { name } of buildEntries) {
    await cp(
      path.join(buildDirectory, name),
      path.join(browserDirectory, name),
      { recursive: true },
    )
  }

  const manifest = { ...baseManifest }
  if (browser === "chrome") delete manifest.browser_specific_settings
  await writeFile(
    path.join(browserDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )

  const archivePath = path.join(buildDirectory, archiveName)
  await rm(archivePath, { force: true })
  const result = spawnSync(
    "zip",
    ["-q", "-r", archivePath, "."],
    { cwd: browserDirectory, stdio: "inherit" },
  )
  if (result.error) {
    throw new Error(
      `Could not create ${archiveName}. Install the zip command-line utility and try again.`,
      { cause: result.error },
    )
  }
  if (result.status !== 0) {
    throw new Error(`Could not create ${archiveName} (zip exited with ${result.status}).`)
  }

  console.log(`Created ${path.relative(projectRoot, archivePath)}`)
}
