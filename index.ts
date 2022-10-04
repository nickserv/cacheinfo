import { readdir, stat } from "fs/promises"
import { homedir, platform } from "os"
import { join } from "path"
import prettyBytes from "pretty-bytes"

const cachePaths = {
  npm: {
    linux: ".npm/_cacache",
    win32: "AppData/npm-cache / _cacache",
  },
  pnpm: {
    linux: ".local/share/pnpm/store",
    win32: "AppData/Local/pnpm/store",
    darwin: "Library/pnpm/store",
  },
  yarn: {
    linux: ".cache/yarn",
    win32: "AppData/Local/Yarn/Cache",
    darwin: "Library/Caches/Yarn",
  },
  berry: {
    linux: ".local/share/yarn/berry",
    win32: "AppData/Local/Yarn/Berry",
    darwin: ".yarn/berry",
  },
}

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

for (const [pm, paths] of Object.entries(cachePaths)) {
  const cachePath = join(homedir(), paths[platform()] ?? paths.linux)
  console.log(pm, prettyBytes(await size(cachePath)))
}
