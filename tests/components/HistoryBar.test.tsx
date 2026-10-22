import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useEffect } from "react"
import { describe, expect, it, vi } from "vite-plus/test"
import Menu from "../../src/components/Menu"
import { AppStore, LoadState, setLoaded } from "../../src/stores/AppStore"
import { ConfigStore } from "../../src/stores/ConfigStore"
import { HistoryStore } from "../../src/stores/HistoryStore"
import { CacheStore } from "../../src/stores/CacheStore"
import { DownloadsStore, recordDownload } from "../../src/stores/DownloadsStore"
import { makeImageData, makePost, resetStores } from "../helpers"
import { exportFavorites } from "../../src/utils/favoritesBackup"

function setup() {
  return {
    user: userEvent.setup(),
    ...render(<Menu />),
  }
}

function AppLoadWatcher() {
  useEffect(() => {
    if (ConfigStore.pinned && AppStore.loaded === LoadState.FETCH_NEW) {
      setLoaded(LoadState.LOADING)
    }
  })

  return null
}

describe("Menu", () => {
  it("renders cards from HistoryStore", () => {
    resetStores()
    HistoryStore.history = [makeImageData({ url: "https://example.com/1.jpg" }), makeImageData({ url: "https://example.com/2.jpg" })]

    setup()

    const cards = document.querySelectorAll(".history-panel .card")
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveClass("card")
    expect(cards[1]).toHaveClass("card")
    expect((cards[0].querySelector("img") as HTMLImageElement).src).toContain("https://example.com/2.jpg")
  })

  it("visible class follows ConfigStore.isMenuVisible", async () => {
    resetStores()
    setup()

    expect(document.querySelector(".menu")).not.toHaveClass("visible")

    ConfigStore.isMenuVisible = true

    await waitFor(() => {
      expect(document.querySelector(".menu")).toHaveClass("visible")
    })
  })

  it("shows recent downloads in the downloads tab", async () => {
    resetStores()
    recordDownload(
      { id: 7, title: "Saved wallpaper", url: "https://i.redd.it/saved.jpg" },
      1_700_000_000_000,
    )
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /downloads/i }))

    expect(screen.getByRole("heading", { name: /recent downloads/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Saved wallpaper" })).toHaveAttribute(
      "href",
      "https://i.redd.it/saved.jpg",
    )
    expect(DownloadsStore.recent[0].startedAtIso).toBe(
      "2023-11-14T22:13:20.000Z",
    )
  })

  it("clicking an unpinned card pins it and loads the selection", async () => {
    resetStores()
    HistoryStore.history = [makeImageData({ url: "https://example.com/1.jpg" }), makeImageData({ url: "https://example.com/2.jpg" })]
    const { user } = setup()

    AppStore.loaded = LoadState.LOADED

    await user.click(document.querySelectorAll(".history-panel .card")[1] as HTMLElement)

    expect(ConfigStore.pinned).toBe(true)
    expect(HistoryStore.i).toBe(0)
    expect(AppStore.loaded).toBe(LoadState.LOADING)

    render(<AppLoadWatcher />)

    await waitFor(() => {
      expect(AppStore.loaded).toBe(LoadState.LOADING)
    })
  })

  it("pinned current card has pinned class and does not change selection on click", async () => {
    resetStores()
    HistoryStore.history = [makeImageData({ url: "https://example.com/1.jpg" }), makeImageData({ url: "https://example.com/2.jpg" })]
    ConfigStore.pinned = true
    HistoryStore.i = 0

    const { user } = setup()

    expect(document.querySelectorAll(".history-panel .card")[1]).toHaveClass("pinned")

    await user.click(document.querySelectorAll(".history-panel .card")[1] as HTMLElement)

    expect(ConfigStore.pinned).toBe(false)
    expect(HistoryStore.i).toBe(0)
  })

  it("marks card images loaded and uses fallback title, image url, and status labels", () => {
    resetStores()
    HistoryStore.history = [
      makeImageData({
        title: "",
        res: undefined,
        thumbnailUrl: "https://example.com/thumb.jpg",
        url: "https://example.com/full.jpg",
      }),
      makeImageData({ title: "Newest Wallpaper", url: "https://example.com/new.jpg" }),
    ]

    setup()

    expect(screen.getByText("Untitled Wallpaper")).toBeInTheDocument()
    expect(screen.getByText("NEW")).toBeInTheDocument()

    const fallbackCardImage = document.querySelectorAll(".history-panel .card img")[1] as HTMLImageElement
    expect(fallbackCardImage.src).toContain("https://example.com/thumb.jpg")

    fireEvent.load(fallbackCardImage)
    expect(fallbackCardImage).toHaveClass("loaded")
  })

  it("favorite filtering, favorite toggling, removal, and clear all update history", async () => {
    resetStores()
    HistoryStore.history = [
      makeImageData({ title: "First", favorite: true }),
      makeImageData({ title: "Second", favorite: false }),
      makeImageData({ title: "Third", favorite: false }),
    ]
    ConfigStore.pinned = true
    HistoryStore.i = 1
    const { user } = setup()

    const historyActions = screen.getByRole("navigation", { name: /history actions/i })
    await user.click(within(historyActions).getByRole("button", { name: /favorites/i }))

    expect(screen.getByText("First")).toBeInTheDocument()
    expect(screen.queryByText("Second")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /remove first from favorites/i }))
    expect(HistoryStore.history[0].favorite).toBe(false)

    await user.click(within(historyActions).getByRole("button", { name: /favorites/i }))
    await user.click(screen.getByRole("button", { name: /remove second from history/i }))

    expect(ConfigStore.pinned).toBe(false)
    expect(HistoryStore.history.map(({ title }) => title)).toEqual(["First", "Third"])

    await user.click(screen.getByRole("button", { name: /^clear$/i }))
    expect(HistoryStore.history).toEqual([])
  })

  it("settings color presets and custom color update the theme store", async () => {
    resetStores()
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /settings/i }))
    await user.click(screen.getByRole("button", { name: /set primary color to #ff6b6b/i }))

    expect(ConfigStore.theme.primary).toBe("#ff6b6b")
    expect(screen.getByRole("button", { name: /set primary color to #ff6b6b/i })).toHaveClass("active")

    const customColor = screen
      .getByLabelText(/choose custom primary color/i)
      .querySelector("input") as HTMLInputElement
    fireEvent.change(customColor, { target: { value: "#123456" } })

    expect(ConfigStore.theme.primary).toBe("#123456")
    await waitFor(() => {
      expect(screen.getByLabelText(/choose custom primary color/i)).toHaveClass("active")
    })
  })

  it("settings dim slider and effect toggles update config", async () => {
    resetStores()
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /settings/i }))

    const dimSlider = document.querySelector(".dim-opacity-slider") as HTMLInputElement
    fireEvent.change(dimSlider, { target: { value: "0.5" } })

    expect(ConfigStore.theme.backgroundDim).toBe(0.5)
    await waitFor(() => {
      expect(document.querySelector(".range-picker-row strong")?.textContent).toBe("50%")
    })

    await user.click(screen.getByRole("button", { name: /reroll jingle/i }))
    expect(ConfigStore.settings.soundEffects).toBe(false)

    await user.click(screen.getByRole("button", { name: /large flash/i }))
    expect(ConfigStore.settings.rerollFlash).toBe(false)
  })

  it("applies a search phrase and refreshes the post cache", async () => {
    resetStores()
    CacheStore.data = [makePost()]
    CacheStore.lastUpdated = Date.now()
    AppStore.loaded = LoadState.LOADED
    ConfigStore.pinned = true
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /settings/i }))
    await user.clear(screen.getByRole("searchbox", { name: /search phrase/i }))
    await user.type(
      screen.getByRole("searchbox", { name: /search phrase/i }),
      "  cyberpunk  ",
    )
    await user.click(screen.getByRole("button", { name: /^search$/i }))

    expect(ConfigStore.q).toBe("cyberpunk")
    expect(CacheStore.data).toEqual([])
    expect(CacheStore.lastUpdated).toBe(-1)
    expect(AppStore.loaded).toBe(LoadState.FETCH_NEW)
    expect(ConfigStore.pinned).toBe(false)
  })

  it("switches wallpaper source and refreshes with a source-specific query", async () => {
    resetStores()
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /settings/i }))
    await user.selectOptions(
      screen.getByLabelText(/wallpaper source/i),
      "wallhaven",
    )

    expect(ConfigStore.source).toBe("wallhaven")
    expect(screen.getByRole("searchbox", { name: /search phrase/i })).toHaveValue("")
    expect(AppStore.loaded).toBe(LoadState.FETCH_NEW)

    await user.clear(screen.getByRole("searchbox", { name: /search phrase/i }))
    await user.type(screen.getByRole("searchbox", { name: /search phrase/i }), "landscape")
    await user.click(screen.getByRole("button", { name: /^search$/i }))

    expect(ConfigStore.wallhavenQ).toBe("landscape")
    expect(ConfigStore.q).toBe('flair:"Desktop"')
  })

  it("shows Wallhaven filters and saves the API key and filter values", async () => {
    resetStores()
    ConfigStore.wallhavenSorting = "random"
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /settings/i }))
    await user.selectOptions(
      screen.getByLabelText(/wallpaper source/i),
      "wallhaven",
    )

    expect(screen.getByRole("heading", { name: "Wallhaven filters" })).toBeVisible()
    expect(screen.getByRole("option", { name: "Wallhaven" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /wallhaven · anime/i })).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText(/wallhaven api key/i))
    await user.type(screen.getByLabelText(/wallhaven api key/i), "wallhaven-key")
    await user.click(screen.getByLabelText("NSFW"))
    await user.selectOptions(screen.getByLabelText(/minimum resolution/i), "1920x1080")
    await user.selectOptions(screen.getByLabelText(/exact resolution/i), "1920x1200")
    await user.selectOptions(screen.getByLabelText(/aspect ratio/i), "16x10")
    await user.selectOptions(screen.getByLabelText(/file type/i), "png")
    await user.selectOptions(screen.getByLabelText(/^order$/i), "asc")
    await user.click(screen.getByRole("button", { name: /apply wallhaven filters/i }))

    expect(ConfigStore.wallhavenApiKey).toBe("wallhaven-key")
    expect(ConfigStore.wallhavenPurity.nsfw).toBe(true)
    expect(ConfigStore.wallhavenSorting).toBe("random")
    expect(ConfigStore.wallhavenResolution).toBe("1920x1080")
    expect(ConfigStore.wallhavenExactResolution).toBe("1920x1200")
    expect(ConfigStore.wallhavenRatio).toBe("16x10")
    expect(ConfigStore.wallhavenFileType).toBe("png")
    expect(ConfigStore.wallhavenOrder).toBe("asc")
    expect(AppStore.loaded).toBe(LoadState.FETCH_NEW)
  })

  it("saves, applies, and deletes search profiles in settings", async () => {
    resetStores()
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /settings/i }))
    const queryInput = screen.getByRole("searchbox", { name: /search phrase/i })
    await user.clear(queryInput)
    await user.type(queryInput, "cyberpunk")
    await user.click(screen.getByRole("button", { name: /^search$/i }))
    await user.type(screen.getByLabelText(/save current search/i), "Cyberpunk")
    await user.click(screen.getByRole("button", { name: /^save$/i }))

    expect(ConfigStore.savedSearches).toHaveLength(1)

    await user.clear(queryInput)
    await user.type(queryInput, "other")
    await user.click(screen.getByRole("button", { name: /^search$/i }))
    await user.selectOptions(
      screen.getByLabelText(/saved searches/i),
      "cyberpunk",
    )

    expect(ConfigStore.q).toBe("cyberpunk")
    expect(queryInput).toHaveValue("cyberpunk")
    await user.click(
      screen.getByRole("button", { name: /delete selected profile/i }),
    )
    expect(ConfigStore.savedSearches).toEqual([])
  })

  it("updates background fit, position, and blur settings", async () => {
    resetStores()
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /settings/i }))
    await user.selectOptions(screen.getByLabelText(/image fit/i), "contain")
    await user.selectOptions(screen.getByLabelText(/image position/i), "top")
    fireEvent.change(screen.getByLabelText(/background blur/i), {
      target: { value: "6" },
    })

    expect(ConfigStore.settings.backgroundFit).toBe("contain")
    expect(ConfigStore.settings.backgroundPosition).toBe("top")
    expect(ConfigStore.settings.backgroundBlur).toBe(6)
  })

  it("downloads a history wallpaper without selecting its card", async () => {
    resetStores()
    HistoryStore.history = [makeImageData({ title: "Wallpaper" })]
    const download = vi.fn((_options, callback: (id: number) => void) => callback(1))
    vi.stubGlobal("chrome", { downloads: { download }, runtime: {} })
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: /save wallpaper/i }))

    expect(download).toHaveBeenCalled()
    expect(screen.getByRole("status")).toHaveTextContent("Wallpaper saved.")
    expect(ConfigStore.pinned).toBe(false)
    expect(DownloadsStore.recent[0]).toMatchObject({
      id: 1,
      title: "Wallpaper",
      url: "https://i.redd.it/wallpaper.jpg",
    })
  })

  it("exports favorite backups and imports them without duplicates", async () => {
    resetStores()
    const favorite = makeImageData({
      title: "Favorite wallpaper",
      url: "https://i.redd.it/favorite.jpg",
      favorite: true,
    })
    HistoryStore.history = [favorite]
    const { user } = setup()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    await user.click(screen.getByRole("button", { name: /export/i }))

    expect(clickSpy).toHaveBeenCalled()
    expect(screen.getByRole("status")).toHaveTextContent("backup exported")

    const imported = makeImageData({
      title: "Imported wallpaper",
      url: "https://i.redd.it/imported.jpg",
      favorite: true,
    })
    const file = new File(
      [exportFavorites([favorite, imported])],
      "favorites.json",
      { type: "application/json" },
    )
    Object.defineProperty(file, "text", {
      value: async () => exportFavorites([favorite, imported]),
    })
    fireEvent.change(screen.getByLabelText(/import favorite wallpapers/i), {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(HistoryStore.history).toHaveLength(2)
      expect(screen.getByRole("status")).toHaveTextContent("Imported 1 new favorite")
    })
    expect(HistoryStore.history[1]).toMatchObject({
      url: imported.url,
      favorite: true,
    })
  })
})
