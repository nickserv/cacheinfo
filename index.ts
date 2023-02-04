import { readdir, stat } from "fs/promises"
import { homedir, platform } from "os"
import { join } from "path"
import { ReadableStream } from "stream/web"

const cachePaths: {
  name: string
  paths: Map<NodeJS.Platform, string>
}[] = [
  {
    name: "npm",
    paths: new Map([
      ["linux", ".npm/_cacache"],
      ["win32", "AppData/Local/npm-cache/_cacache"],
    ]),
  },
  {
    name: "pnpm",
    paths: new Map([
      ["linux", ".local/share/pnpm/store"],
      ["win32", "AppData/Local/pnpm/store"],
      ["darwin", "Library/pnpm/store"],
    ]),
  },
  {
    name: "yarn",
    paths: new Map([
      ["linux", ".cache/yarn"],
      ["win32", "AppData/Local/Yarn/Cache"],
      ["darwin", "Library/Caches/Yarn"],
    ]),
  },
  {
    name: "berry",
    paths: new Map([
      ["linux", ".local/share/yarn/berry"],
      ["win32", "AppData/Local/Yarn/Berry"],
      ["darwin", ".yarn/berry"],
    ]),
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

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    ["errno", "code", "path", "syscall"].some((key) => key in error)
  )
}

export default function cacheinfo() {
  return new ReadableStream<[string, number]>({
    start(controller) {
      let remaining = cachePaths.length

      cachePaths.forEach(async ({ name, paths }) => {
        try {
          const cachePath = paths.get(platform()) ?? paths.get("linux")!
          controller.enqueue([name, await size(join(homedir(), cachePath))])
          if (!--remaining) controller.close()
        } catch (error) {
          if (!isErrnoException(error) || error.code !== "ENOENT") {
            controller.error(error)
          }
        }
      })
    },
  })
}
