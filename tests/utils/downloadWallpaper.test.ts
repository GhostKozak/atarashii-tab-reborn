import { describe, expect, it, vi } from "vite-plus/test"
import { downloadWallpaper } from "../../src/utils/downloadWallpaper"

describe("downloadWallpaper", () => {
  it("downloads an i.redd.it image with a safe filename", async () => {
    const download = vi.fn((_options, callback: (id: number) => void) => callback(7))
    vi.stubGlobal("chrome", { downloads: { download }, runtime: {} })

    await expect(downloadWallpaper(
      "https://i.redd.it/wallpaper.webp?width=1920",
      'A/B: "Wallpaper"',
    )).resolves.toBe(7)

    expect(download).toHaveBeenCalledWith(
      {
        url: "https://i.redd.it/wallpaper.webp?width=1920",
        filename: "Wallpapers/A B Wallpaper.webp",
        saveAs: true,
      },
      expect.any(Function),
    )
  })

  it("uses Firefox's Promise-based downloads API when available", async () => {
    const download = vi.fn().mockResolvedValue(9)
    vi.stubGlobal("browser", { downloads: { download } })

    await expect(
      downloadWallpaper("https://i.redd.it/wallpaper.jpg", "Wallpaper"),
    ).resolves.toBe(9)

    expect(download).toHaveBeenCalledWith({
      url: "https://i.redd.it/wallpaper.jpg",
      filename: "Wallpapers/Wallpaper.jpg",
      saveAs: true,
    })
  })

  it("rejects unsupported image hosts", async () => {
    await expect(
      downloadWallpaper("https://example.com/wallpaper.jpg", "Wallpaper"),
    ).rejects.toThrow("Only HTTPS i.redd.it wallpapers can be saved")
  })

  it("reports browser download API errors", async () => {
    const download = vi.fn((_options, callback: (id: number) => void) => callback(3))
    vi.stubGlobal("chrome", {
      downloads: { download },
      runtime: { lastError: { message: "Permission denied" } },
    })

    await expect(
      downloadWallpaper("https://i.redd.it/wallpaper.jpg", "Wallpaper"),
    ).rejects.toThrow("Permission denied")
  })

  it("propagates Firefox downloads API errors", async () => {
    const download = vi.fn().mockRejectedValue(new Error("Download denied"))
    vi.stubGlobal("browser", { downloads: { download } })

    await expect(
      downloadWallpaper("https://i.redd.it/wallpaper.jpg", "Wallpaper"),
    ).rejects.toThrow("Download denied")
  })
})
