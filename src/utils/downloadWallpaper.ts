type DownloadOptions = {
  url: string
  filename: string
  saveAs: boolean
}

type ChromeDownloads = {
  downloads: {
    download: (
      options: DownloadOptions,
      callback: (downloadId: number) => void,
    ) => void
  }
  runtime: {
    lastError?: { message?: string }
  }
}

const getFilename = (url: URL, title: string) => {
  const safeTitle = Array.from(title)
    .filter((character) => {
      const code = character.charCodeAt(0)
      return code >= 32 && code !== 127
    })
    .join("")
    .replace(/[<>:"/\\|?*]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100)
  const extension = url.pathname.match(/\.(avif|gif|jpe?g|png|webp)$/i)?.[0] || ""

  return `Wallpapers/${safeTitle || "wallpaper"}${extension}`
}

export function downloadWallpaper(imageUrl: string, title: string) {
  const url = new URL(imageUrl)
  if (url.protocol !== "https:" || url.hostname !== "i.redd.it") {
    return Promise.reject(new Error("Only HTTPS i.redd.it wallpapers can be saved"))
  }

  const chromeApi = (globalThis as typeof globalThis & { chrome?: ChromeDownloads })
    .chrome
  if (!chromeApi?.downloads) {
    return Promise.reject(new Error("The browser downloads API is unavailable"))
  }

  return new Promise<void>((resolve, reject) => {
    chromeApi.downloads.download(
      {
        url: url.href,
        filename: getFilename(url, title),
        saveAs: true,
      },
      (downloadId) => {
        if (chromeApi.runtime.lastError) {
          reject(new Error(chromeApi.runtime.lastError.message || "Wallpaper download failed"))
        } else if (downloadId === undefined) {
          reject(new Error("The browser did not start the wallpaper download"))
        } else {
          resolve()
        }
      },
    )
  })
}
