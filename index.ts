import { readdir, stat } from "fs/promises"
import { homedir, platform } from "os"
import { join } from "path"
import prettyBytes from "pretty-bytes"

const cachePaths: {
  name: string
  paths: { [_ in NodeJS.Platform]?: string }
}[] = [
  {
    name: "npm",
    paths: {
      linux: ".npm/_cacache",
      win32: "AppData/npm-cache/_cacache",
    },
  },
  {
    name: "pnpm",
    paths: {
      linux: ".local/share/pnpm/store",
      win32: "AppData/Local/pnpm/store",
      darwin: "Library/pnpm/store",
    },
  },
  {
    name: "yarn",
    paths: {
      linux: ".cache/yarn",
      win32: "AppData/Local/Yarn/Cache",
      darwin: "Library/Caches/Yarn",
    },
  },
  {
    name: "berry",
    paths: {
      linux: ".local/share/yarn/berry",
      win32: "AppData/Local/Yarn/Berry",
      darwin: ".yarn/berry",
    },
  },
]

async function size(path: string): Promise<number> {
  const stats = await stat(path)

  if (stats.isDirectory()) {
    const dirPaths = await readdir(path)
    const dirSizes = await Promise.all(
      dirPaths.map((subpath) => size(join(path, subpath))),
    )
    return dirSizes.reduce((i, size) => i + size, 0)
  } else {
    return stats.size
  }
}

cachePaths.forEach(async ({ name, paths }) => {
  try {
    const cachePath = join(homedir(), paths[platform()] ?? paths.linux!)
    console.log(name, prettyBytes(await size(cachePath)))
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      (error as NodeJS.ErrnoException).code !== "ENOENT"
    ) {
      throw error
    }
  }
})
