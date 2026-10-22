import { describe, expect, it } from "vite-plus/test"
import { selectWallpaper } from "../../src/utils/selectWallpaper"
import { makePost } from "../helpers"

describe("selectWallpaper", () => {
  it("avoids wallpapers from recent history", () => {
    const recent = makePost({ id: "recent" })
    const next = makePost({ id: "next" })

    expect(selectWallpaper([recent, next], new Set(["recent"]), () => 0)).toBe(next)
  })

  it("allows a repeat only when every result was recently shown", () => {
    const posts = [makePost({ id: "one" }), makePost({ id: "two" })]

    expect(selectWallpaper(posts, new Set(["one", "two"]), () => 0.75)).toBe(posts[1])
  })

  it("returns no wallpaper when there are no results", () => {
    expect(selectWallpaper([], new Set())).toBeUndefined()
  })
})
