import { AppStore, LoadState } from "../src/stores/AppStore"
import { CacheStore } from "../src/stores/CacheStore"
import { ConfigStore } from "../src/stores/ConfigStore"
import { HistoryStore } from "../src/stores/HistoryStore"
import { DownloadsStore } from "../src/stores/DownloadsStore"
import type { ImageData } from "../src/types/ImageData"

export function resetStores() {
  AppStore.loaded = LoadState.FETCH_NEW
  AppStore.showRollOverlay = false
  AppStore.fetchError = null

  CacheStore.lastUpdated = -1
  CacheStore.data = []

  Object.assign(ConfigStore, {
    source: "reddit",
    num: undefined,
    q: `flair:"Desktop"`,
    wallhavenQ: "",
    wallhavenApiKey: "",
    wallhavenCategories: { general: false, anime: true, people: false },
    wallhavenPurity: { sfw: true, sketchy: false, nsfw: false },
    wallhavenSorting: "toplist",
    wallhavenOrder: "desc",
    wallhavenTopRange: "1M",
    wallhavenResolution: "",
    wallhavenExactResolution: "",
    wallhavenRatio: "",
    wallhavenColor: "",
    wallhavenFileType: "",
    sort: "top",
    t: "year",
    savedSearches: [],
    nsfw: false,
    incognito: false,
    hideGui: false,
    pinned: false,
    isMenuVisible: false,
  })
  ConfigStore.theme.primary = "#ffc400"
  ConfigStore.settings.backgroundFit = "cover"
  ConfigStore.settings.backgroundPosition = "center"
  ConfigStore.settings.backgroundBlur = 0

  HistoryStore.history = []
  HistoryStore.i = -1
  DownloadsStore.recent = []
}

export function makePost(overrides: Record<string, unknown> = {}) {
  return {
    id: "abc123",
    title: "Wallpaper [1920x1080] (Artist)",
    thumbnail: "default",
    url: "https://i.redd.it/wallpaper.jpg",
    ...overrides,
  }
}

export function makeListing(
  children: Array<Record<string, unknown>>,
  after: string | null = null,
) {
  return {
    data: {
      after,
      children: children.map((data) => ({ data })),
    },
  }
}

export function makeImageData(overrides: Partial<ImageData> = {}): ImageData {
  return {
    title: "Wallpaper • Artist",
    res: "1920 × 1080",
    url: "https://i.redd.it/wallpaper.jpg",
    link: "https://redd.it/abc123",
    nums: [0, 1],
    ...overrides,
  }
}
