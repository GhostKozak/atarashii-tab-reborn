import { describe, expect, it } from "vite-plus/test"
import { exportFavorites, parseFavoritesBackup } from "../../src/utils/favoritesBackup"
import { makeImageData } from "../helpers"

describe("favoritesBackup", () => {
  it("exports only favorites and can parse the backup", () => {
    const favorite = makeImageData({ favorite: true })
    const backup = exportFavorites([favorite, makeImageData()])

    expect(JSON.parse(backup)).toMatchObject({
      version: 1,
      favorites: [favorite],
    })
    expect(parseFavoritesBackup(backup)).toEqual([favorite])
  })

  it("imports Wallhaven favorites", () => {
    const favorite = makeImageData({
      source: "wallhaven",
      sourceId: "abc123",
      url: "https://w.wallhaven.cc/full/ab/wallhaven-abc123.jpg",
      backgroundUrl: "https://w.wallhaven.cc/full/ab/wallhaven-abc123.jpg",
      thumbnailUrl: "https://th.wallhaven.cc/small/ab/abc123.jpg",
      link: "https://wallhaven.cc/w/abc123",
      favorite: true,
    })

    expect(parseFavoritesBackup(exportFavorites([favorite]))).toEqual([favorite])
  })

  it("rejects invalid JSON, unsupported versions, and unsafe image hosts", () => {
    expect(() => parseFavoritesBackup("{")).toThrow("not valid JSON")
    expect(() => parseFavoritesBackup('{"version":2,"favorites":[]}')).toThrow(
      "not a valid wallpaper favorites backup",
    )
    expect(() =>
      parseFavoritesBackup(JSON.stringify({
        version: 1,
        favorites: [makeImageData({ favorite: true, url: "https://example.com/x.jpg" })],
      })),
    ).toThrow("not a valid wallpaper favorites backup")
  })
})
