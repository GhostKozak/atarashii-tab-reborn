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
