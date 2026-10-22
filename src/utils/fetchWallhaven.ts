import type { ConfigState } from "../stores/ConfigStore"
import type { WallpaperPost } from "../stores/HistoryStore"

const WALLHAVEN_SEARCH_URL = import.meta.env.DEV
  ? "/api/wallhaven/search"
  : "https://wallhaven.cc/api/v1/search"

type WallhavenWallpaper = {
  id: string
  url: string
  path: string
  resolution: string
  thumbs: {
    small: string
  }
}

type WallhavenSearchResponse = {
  data: unknown
  meta?: {
    current_page?: number
    last_page?: number
    seed?: string | null
  }
}

const MAX_WALLHAVEN_PAGES = 5

const isHttpsHost = (value: unknown, hostname: string): value is string => {
  if (typeof value !== "string") return false
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname === hostname
  } catch {
    return false
  }
}

const isWallhavenWallpaper = (
  value: unknown,
): value is WallhavenWallpaper => {
  if (!value || typeof value !== "object") return false
  const wallpaper = value as Partial<WallhavenWallpaper>
  return (
    typeof wallpaper.id === "string" &&
    /^[a-zA-Z0-9]{6}$/.test(wallpaper.id) &&
    isHttpsHost(wallpaper.url, "wallhaven.cc") &&
    isHttpsHost(wallpaper.path, "w.wallhaven.cc") &&
    typeof wallpaper.resolution === "string" &&
    /^\d{3,5}x\d{3,5}$/.test(wallpaper.resolution) &&
    !!wallpaper.thumbs &&
    isHttpsHost(wallpaper.thumbs.small, "th.wallhaven.cc")
  )
}

const sortingFromLegacyConfig: Record<
  ConfigState["sort"],
  ConfigState["wallhavenSorting"]
> = {
  relevance: "relevance",
  hot: "views",
  top: "toplist",
  new: "date_added",
}

export async function fetchWallhavenPosts(
  config: ConfigState,
): Promise<WallpaperPost[]> {
  const wallhavenCategories = config.wallhavenCategories ?? {
    general: false,
    anime: true,
    people: false,
  }
  const wallhavenPurity = config.wallhavenPurity ?? {
    sfw: true,
    sketchy: false,
    nsfw: false,
  }
  const categories = [
    wallhavenCategories.general ? "1" : "0",
    wallhavenCategories.anime ? "1" : "0",
    wallhavenCategories.people ? "1" : "0",
  ].join("")
  const purity = [
    wallhavenPurity.sfw ? "1" : "0",
    wallhavenPurity.sketchy ? "1" : "0",
    wallhavenPurity.nsfw ? "1" : "0",
  ].join("")

  if (categories === "000") {
    throw new Error("Select at least one Wallhaven category.")
  }
  if (purity === "000") {
    throw new Error("Select at least one Wallhaven content rating.")
  }
  const apiKey = config.wallhavenApiKey?.trim() ?? ""
  if (wallhavenPurity.nsfw && !apiKey) {
    throw new Error("Enter a Wallhaven API key to include NSFW wallpapers.")
  }

  const sorting =
    config.wallhavenSorting ?? sortingFromLegacyConfig[config.sort]
  const searchTerms = (config.wallhavenQ || "").trim()
  const query = new URLSearchParams()
  query.set("q", [
    searchTerms,
    config.wallhavenFileType ? `type:${config.wallhavenFileType}` : "",
  ].filter(Boolean).join(" "))
  query.set("categories", categories)
  query.set("purity", purity)
  query.set("sorting", sorting)
  query.set("order", config.wallhavenOrder ?? "desc")
  if (sorting === "toplist") query.set("topRange", config.wallhavenTopRange ?? "1M")
  if (config.wallhavenResolution) query.set("atleast", config.wallhavenResolution)
  if (config.wallhavenExactResolution) {
    query.set("resolutions", config.wallhavenExactResolution)
  }
  if (config.wallhavenRatio) query.set("ratios", config.wallhavenRatio)
  if (config.wallhavenColor) query.set("colors", config.wallhavenColor)

  const headers = apiKey ? { "X-API-Key": apiKey } : undefined
  const fetchPage = async (page: number, seed?: string) => {
    const pageQuery = new URLSearchParams(query)
    pageQuery.set("page", String(page))
    if (seed) pageQuery.set("seed", seed)

    const response = await fetch(`${WALLHAVEN_SEARCH_URL}?${pageQuery}`, {
      headers,
    })
    if (!response.ok) {
      let details = ""
      try {
        const body: unknown = await response.json()
        if (body && typeof body === "object" && "error" in body) {
          const error = body.error
          if (typeof error === "string") details = `: ${error}`
          else if (Array.isArray(error)) {
            details = `: ${error.filter((item): item is string => typeof item === "string").join(", ")}`
          }
        }
      } catch {
        // The API may return a non-JSON error page.
      }
      const reason = response.status === 401
        ? "Check your Wallhaven API key and account access."
        : response.status === 429
          ? "Wallhaven rate limit reached. Wait a minute and try again."
          : `Wallhaven responded with status ${response.status}${details}`
      throw new Error(reason)
    }

    try {
      const result = (await response.json()) as WallhavenSearchResponse
      if (!Array.isArray(result.data)) {
        throw new Error("Wallhaven returned an invalid search response")
      }
      return {
        data: result.data as unknown[],
        meta: result.meta,
      }
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error("Could not read Wallhaven search results", { cause: error })
    }
  }

  const firstPage = await fetchPage(1)
  const allWallpapers = [...firstPage.data]
  const lastPage = Math.min(
    Math.max(1, firstPage.meta?.last_page ?? 1),
    MAX_WALLHAVEN_PAGES,
  )
  const seed = sorting === "random" ? firstPage.meta?.seed ?? undefined : undefined

  for (let page = 2; page <= lastPage; page += 1) {
    if (sorting === "random" && !seed) break
    const result = await fetchPage(page, seed)
    allWallpapers.push(...result.data)
  }

  return allWallpapers
    .filter(isWallhavenWallpaper)
    .map((wallpaper) => ({
      id: wallpaper.id,
      title: `Wallhaven #${wallpaper.id}`,
      source: "wallhaven",
      url: wallpaper.path,
      link: wallpaper.url,
      thumbnailUrl: wallpaper.thumbs.small,
      resolution: wallpaper.resolution.replace("x", " × "),
    }))
}
