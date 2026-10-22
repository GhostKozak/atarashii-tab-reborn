import { persist } from "valtio-persist"
import type { WallpaperPost } from "./HistoryStore"

export type CacheStore = {
  lastUpdated: number
  data: WallpaperPost[]
}

export const { store: CacheStore } = await persist<CacheStore>(
  {
    lastUpdated: -1,
    data: [],
  },
  "cache"
)

export const clearCache = () => {
  CacheStore.data = []
  CacheStore.lastUpdated = -1
}
