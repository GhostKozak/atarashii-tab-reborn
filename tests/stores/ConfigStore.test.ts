import { describe, expect, it } from "vite-plus/test"
import {
  ConfigStore,
  applySearchProfile,
  pickValue,
  removeSearchProfile,
  saveSearchProfile,
  toggle,
  toggleMenu,
  toggleNsfw,
  updateSearchQuery,
  updateWallpaperSource,
} from "../../src/stores/ConfigStore"

describe("ConfigStore helpers", () => {
  it("toggle flips toggleable fields", () => {
    const initial = ConfigStore.hideGui

    toggle("hideGui")
    expect(ConfigStore.hideGui).toBe(!initial)

    toggle("hideGui")
    expect(ConfigStore.hideGui).toBe(initial)
  })

  it("toggleNsfw flips nsfw", () => {
    const initial = ConfigStore.nsfw

    toggleNsfw()
    expect(ConfigStore.nsfw).toBe(!initial)

    toggleNsfw()
    expect(ConfigStore.nsfw).toBe(initial)
  })

  it("switches sources and keeps search phrases separate", () => {
    ConfigStore.q = "reddit query"
    updateWallpaperSource("wallhaven")
    updateSearchQuery("wallhaven query")

    expect(ConfigStore.source).toBe("wallhaven")
    expect(ConfigStore.wallhavenQ).toBe("wallhaven query")
    expect(ConfigStore.q).toBe("reddit query")

    ConfigStore.nsfw = true
    updateWallpaperSource("wallhaven")
    expect(ConfigStore.nsfw).toBe(false)
  })

  it("pickValue updates pickable fields and sets t=all for sort=new", () => {
    pickValue("t", "month")
    expect(ConfigStore.t).toBe("month")

    pickValue("sort", "new")
    expect(ConfigStore.sort).toBe("new")
    expect(ConfigStore.t).toBe("all")
  })

  it("toggleMenu flips visibility", () => {
    const initial = ConfigStore.isMenuVisible

    toggleMenu()
    expect(ConfigStore.isMenuVisible).toBe(!initial)

    toggleMenu()
    expect(ConfigStore.isMenuVisible).toBe(initial)
  })

  it("saves, applies, and removes named search profiles", () => {
    ConfigStore.q = "cyberpunk"
    ConfigStore.sort = "top"
    ConfigStore.t = "month"
    ConfigStore.nsfw = true
    const id = saveSearchProfile("  Cyberpunk  ")

    expect(id).toBe("cyberpunk")
    expect(saveSearchProfile("CYBERPUNK")).toBeNull()

    ConfigStore.q = "changed"
    ConfigStore.sort = "hot"
    ConfigStore.t = "day"
    ConfigStore.nsfw = false

    expect(applySearchProfile(id!)).toBe(true)
    expect(ConfigStore).toMatchObject({
      q: "cyberpunk",
      sort: "top",
      t: "month",
      nsfw: true,
    })
    expect(removeSearchProfile(id!)).toBe(true)
    expect(ConfigStore.savedSearches).toEqual([])
    expect(applySearchProfile(id!)).toBe(false)
  })

  it("stores Wallhaven search filters in its profile without storing the API key", () => {
    ConfigStore.source = "wallhaven"
    ConfigStore.wallhavenQ = "city night"
    ConfigStore.wallhavenSorting = "random"
    ConfigStore.wallhavenOrder = "asc"
    ConfigStore.wallhavenCategories = {
      general: true,
      anime: true,
      people: false,
    }
    ConfigStore.wallhavenApiKey = "keep-this-out-of-profile"
    const id = saveSearchProfile("Night scenes")

    const profile = ConfigStore.savedSearches.find((item) => item.id === id)
    expect(profile?.wallhaven).toMatchObject({
      sorting: "random",
      order: "asc",
      categories: { general: true, anime: true, people: false },
    })
    expect(JSON.stringify(profile)).not.toContain("keep-this-out-of-profile")

    ConfigStore.wallhavenSorting = "toplist"
    ConfigStore.wallhavenOrder = "desc"
    ConfigStore.wallhavenCategories = {
      general: false,
      anime: true,
      people: false,
    }
    expect(applySearchProfile(id!)).toBe(true)
    expect(ConfigStore.wallhavenQ).toBe("city night")
    expect(ConfigStore.wallhavenSorting).toBe("random")
    expect(ConfigStore.wallhavenOrder).toBe("asc")
    expect(ConfigStore.wallhavenCategories).toEqual({
      general: true,
      anime: true,
      people: false,
    })
    expect(ConfigStore.wallhavenApiKey).toBe("keep-this-out-of-profile")
  })

  it("forces all-time results when applying a new-sort profile", () => {
    ConfigStore.savedSearches = [{
      id: "newest",
      name: "Newest",
      q: "wallpaper",
      sort: "new",
      t: "year",
      nsfw: false,
    }]

    applySearchProfile("newest")

    expect(ConfigStore.sort).toBe("new")
    expect(ConfigStore.t).toBe("all")
  })
})
