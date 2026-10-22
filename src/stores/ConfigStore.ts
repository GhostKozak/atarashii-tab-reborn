import { persist } from "valtio-persist"

export const PRIMARY_COLOR_PRESETS = [
  "#ffc400",
  "#ff6b6b",
  "#7c5cff",
  "#00d2ff",
  "#2ee59d",
] as const

export const CONFIG_STATE_PICKABLE_FIELDS_MAP = {
  sort: ["relevance", "hot", "top", "new"],
  t: ["hour", "day", "week", "month", "year", "all"],
}

export type WallpaperSource = "reddit" | "wallhaven"

export const WALLHAVEN_SORT_OPTIONS = [
  "date_added",
  "relevance",
  "random",
  "views",
  "favorites",
  "toplist",
] as const

export const WALLHAVEN_TOP_RANGE_OPTIONS = [
  "1d",
  "3d",
  "1w",
  "1M",
  "3M",
  "6M",
  "1y",
] as const

export const WALLHAVEN_COLOR_OPTIONS = [
  ["660000", "Dark red"],
  ["990000", "Maroon"],
  ["cc0000", "Red"],
  ["cc3333", "Crimson"],
  ["ea4c88", "Pink"],
  ["993399", "Magenta"],
  ["663399", "Purple"],
  ["333399", "Indigo"],
  ["0066cc", "Blue"],
  ["0099cc", "Cyan"],
  ["66cccc", "Light cyan"],
  ["77cc33", "Lime"],
  ["669900", "Green"],
  ["336600", "Dark green"],
  ["666600", "Olive"],
  ["999900", "Yellow green"],
  ["cccc33", "Yellow"],
  ["ffff00", "Bright yellow"],
  ["ffcc33", "Gold"],
  ["ff9900", "Orange"],
  ["ff6600", "Deep orange"],
  ["cc6633", "Burnt orange"],
  ["996633", "Brown"],
  ["663300", "Dark brown"],
  ["000000", "Black"],
  ["999999", "Gray"],
  ["cccccc", "Light gray"],
  ["ffffff", "White"],
  ["424153", "Dark blue gray"],
] as const

export const CONFIG_STATE_TOGGLEABLE_FIELDS = [
  "nsfw",
  "incognito",
  "hideGui",
  "pinned",
] as const

export type SavedSearchProfile = {
  id: string
  name: string
  q: string
  sort: ConfigState["sort"]
  t: ConfigState["t"]
  nsfw: boolean
  source?: WallpaperSource
  wallhaven?: {
    categories: ConfigState["wallhavenCategories"]
    purity: ConfigState["wallhavenPurity"]
    sorting: ConfigState["wallhavenSorting"]
    order: ConfigState["wallhavenOrder"]
    topRange: ConfigState["wallhavenTopRange"]
    minResolution: ConfigState["wallhavenResolution"]
    exactResolution: ConfigState["wallhavenExactResolution"]
    ratio: ConfigState["wallhavenRatio"]
    color: ConfigState["wallhavenColor"]
    fileType: ConfigState["wallhavenFileType"]
  }
}

export type ConfigState = {
  source: WallpaperSource
  num?: number
  q: string
  wallhavenQ: string
  wallhavenApiKey: string
  wallhavenCategories: {
    general: boolean
    anime: boolean
    people: boolean
  }
  wallhavenPurity: {
    sfw: boolean
    sketchy: boolean
    nsfw: boolean
  }
  wallhavenSorting: (typeof WALLHAVEN_SORT_OPTIONS)[number]
  wallhavenOrder: "desc" | "asc"
  wallhavenTopRange: (typeof WALLHAVEN_TOP_RANGE_OPTIONS)[number]
  wallhavenResolution: string
  wallhavenExactResolution: string
  wallhavenRatio: string
  wallhavenColor: string
  wallhavenFileType: "" | "jpg" | "png"
  sort: (typeof CONFIG_STATE_PICKABLE_FIELDS_MAP.sort)[number]
  t: (typeof CONFIG_STATE_PICKABLE_FIELDS_MAP.t)[number]
  savedSearches: readonly SavedSearchProfile[]

  nsfw: boolean
  incognito: boolean
  hideGui: boolean
  pinned: boolean

  isMenuVisible: boolean

  theme: {
    primary: string
    backgroundDim: number
  }

  settings: {
    soundEffects: boolean
    rerollFlash: boolean
    backgroundFit: "cover" | "contain"
    backgroundPosition: "center" | "top" | "bottom" | "left" | "right"
    backgroundBlur: number
  }
}

export type ConfigStatePickableFields = {
  [K in keyof typeof CONFIG_STATE_PICKABLE_FIELDS_MAP]: ConfigState[K]
}

export type ConfigStateToggleableFields = {
  [K in (typeof CONFIG_STATE_TOGGLEABLE_FIELDS)[number]]: ConfigState[K]
}

export const { store: ConfigStore } = await persist<ConfigState>(
  {
    source: "wallhaven",
    num: undefined,
    q: `flair:"Desktop"`,
    wallhavenQ: "",
    wallhavenApiKey: "",
    wallhavenCategories: {
      general: false,
      anime: true,
      people: false,
    },
    wallhavenPurity: {
      sfw: true,
      sketchy: false,
      nsfw: false,
    },
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

    //   toggleNsfw: () => set({ nsfw: !get().nsfw }),
    //   toggleIncognito: () => set({ incognito: !get().incognito }),
    //   toggleHideGui: () => set({ hideGui: !get().hideGui }),
    //   togglePinned: (v) => set({ pinned: v ?? !get().pinned }),

    // set: (data) => set(data),
    // toggle: (key) => set({ [key]: !get()[key] }),

    theme: {
      primary: PRIMARY_COLOR_PRESETS[0],
      backgroundDim: 0.35,
    },

    settings: {
      soundEffects: true,
      rerollFlash: true,
      backgroundFit: "cover",
      backgroundPosition: "center",
      backgroundBlur: 0,
    },
  },
  "config"
)

Object.assign(ConfigStore, {
  source: ConfigStore.source ?? "wallhaven",
  wallhavenQ: ConfigStore.wallhavenQ ?? "",
  wallhavenApiKey: ConfigStore.wallhavenApiKey ?? "",
  wallhavenCategories: ConfigStore.wallhavenCategories ?? {
    general: false,
    anime: true,
    people: false,
  },
  wallhavenPurity: ConfigStore.wallhavenPurity ?? {
    sfw: true,
    sketchy: false,
    nsfw: false,
  },
  wallhavenSorting: ConfigStore.wallhavenSorting ?? "toplist",
  wallhavenOrder: ConfigStore.wallhavenOrder ?? "desc",
  wallhavenTopRange: ConfigStore.wallhavenTopRange ?? "1M",
  wallhavenResolution: ConfigStore.wallhavenResolution ?? "",
  wallhavenExactResolution: ConfigStore.wallhavenExactResolution ?? "",
  wallhavenRatio: ConfigStore.wallhavenRatio ?? "",
  wallhavenColor: ConfigStore.wallhavenColor ?? "",
  wallhavenFileType: ConfigStore.wallhavenFileType ?? "",
})

export const toggle = (key: keyof ConfigStateToggleableFields) => {
  ConfigStore[key] = !ConfigStore[key]
}

// export const togglePin = () => {
//   ConfigStore.num = ConfigStore.num ? undefined : ConfigStore.num
//   ConfigStore.pinned = !ConfigStore.pinned
// }

export const toggleNsfw = () => {
  ConfigStore.nsfw = !ConfigStore.nsfw
}

export const updateSearchQuery = (query: string) => {
  if (ConfigStore.source === "wallhaven") {
    ConfigStore.wallhavenQ = query
  } else {
    ConfigStore.q = query
  }
  ConfigStore.pinned = false
}

export const updateWallpaperSource = (source: WallpaperSource) => {
  ConfigStore.source = source
  if (source === "wallhaven") ConfigStore.nsfw = false
  ConfigStore.pinned = false
}

export const saveSearchProfile = (name: string) => {
  const normalizedName = name.trim()
  if (!normalizedName) return null

  const duplicate = ConfigStore.savedSearches.some(
    (profile) => profile.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase(),
  )
  if (duplicate) return null

  const id = normalizedName.toLocaleLowerCase()
  ConfigStore.savedSearches = [...ConfigStore.savedSearches, {
    id,
    name: normalizedName,
    q: ConfigStore.source === "wallhaven" ? ConfigStore.wallhavenQ : ConfigStore.q,
    sort: ConfigStore.sort,
    t: ConfigStore.t,
    nsfw: ConfigStore.nsfw,
    source: ConfigStore.source,
    ...(ConfigStore.source === "wallhaven"
      ? {
          wallhaven: {
            categories: { ...ConfigStore.wallhavenCategories },
            purity: { ...ConfigStore.wallhavenPurity },
            sorting: ConfigStore.wallhavenSorting,
            order: ConfigStore.wallhavenOrder,
            topRange: ConfigStore.wallhavenTopRange,
            minResolution: ConfigStore.wallhavenResolution,
            exactResolution: ConfigStore.wallhavenExactResolution,
            ratio: ConfigStore.wallhavenRatio,
            color: ConfigStore.wallhavenColor,
            fileType: ConfigStore.wallhavenFileType,
          },
        }
      : {}),
  }]
  return id
}

export const applySearchProfile = (id: string) => {
  const profile = ConfigStore.savedSearches.find((entry) => entry.id === id)
  if (!profile) return false

  const source = profile.source ?? "reddit"
  ConfigStore.source = source
  if (source === "wallhaven") ConfigStore.wallhavenQ = profile.q
  else ConfigStore.q = profile.q
  ConfigStore.sort = profile.sort
  ConfigStore.t = profile.sort === "new" ? "all" : profile.t
  ConfigStore.nsfw = source === "wallhaven" ? false : profile.nsfw
  if (source === "wallhaven" && profile.wallhaven) {
    ConfigStore.wallhavenCategories = { ...profile.wallhaven.categories }
    ConfigStore.wallhavenPurity = { ...profile.wallhaven.purity }
    ConfigStore.wallhavenSorting = profile.wallhaven.sorting
    ConfigStore.wallhavenOrder = profile.wallhaven.order
    ConfigStore.wallhavenTopRange = profile.wallhaven.topRange
    ConfigStore.wallhavenResolution = profile.wallhaven.minResolution
    ConfigStore.wallhavenExactResolution = profile.wallhaven.exactResolution
    ConfigStore.wallhavenRatio = profile.wallhaven.ratio
    ConfigStore.wallhavenColor = profile.wallhaven.color
    ConfigStore.wallhavenFileType = profile.wallhaven.fileType
  }
  ConfigStore.pinned = false
  return true
}

export const removeSearchProfile = (id: string) => {
  const nextProfiles = ConfigStore.savedSearches.filter((profile) => profile.id !== id)
  if (nextProfiles.length === ConfigStore.savedSearches.length) return false

  ConfigStore.savedSearches = nextProfiles
  return true
}

export const unpinWallpaper = () => {
  ConfigStore.pinned = false
}

export const pickValue = <K extends keyof ConfigStatePickableFields>(
  key: K,
  value: ConfigState[K]
) => {
  // Sorting by new on Reddit needs to be all
  if (key === "sort" && value === "new") ConfigStore.t = "all"
  ConfigStore[key] = value
  ConfigStore.pinned = false
}

export const toggleMenu = () => {
  ConfigStore.isMenuVisible = !ConfigStore.isMenuVisible
}
