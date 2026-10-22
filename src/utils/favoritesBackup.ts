import type { ImageData } from "../types/ImageData"

type FavoritesBackup = {
  version: 1
  favorites: ImageData[]
}

const isHttpUrl = (value: unknown, hosts: string[]) => {
  if (typeof value !== "string") return false

  try {
    const url = new URL(value)
    return url.protocol === "https:" && hosts.includes(url.hostname)
  } catch {
    return false
  }
}

const isImageData = (value: unknown): value is ImageData => {
  if (!value || typeof value !== "object") return false
  const image = value as Record<string, unknown>

  return (
    typeof image.title === "string" &&
    typeof image.res === "string" &&
    isHttpUrl(image.url, ["i.redd.it"]) &&
    isHttpUrl(image.link, ["redd.it"]) &&
    Array.isArray(image.nums) &&
    image.nums.length === 2 &&
    image.nums.every((number) => Number.isInteger(number) && number >= 0) &&
    image.favorite === true &&
    (image.backgroundUrl === undefined ||
      isHttpUrl(image.backgroundUrl, ["i.redd.it", "preview.redd.it"])) &&
    (image.thumbnailUrl === undefined ||
      isHttpUrl(image.thumbnailUrl, ["i.redd.it", "preview.redd.it"]))
  )
}

export function exportFavorites(history: readonly ImageData[]) {
  const backup: FavoritesBackup = {
    version: 1,
    favorites: history.filter(({ favorite }) => favorite),
  }
  return JSON.stringify(backup, null, 2)
}

export function parseFavoritesBackup(json: string): ImageData[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (error) {
    throw new Error("The selected file is not valid JSON", { cause: error })
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("version" in parsed) ||
    parsed.version !== 1 ||
    !("favorites" in parsed) ||
    !Array.isArray(parsed.favorites) ||
    !parsed.favorites.every(isImageData)
  ) {
    throw new Error("This file is not a valid wallpaper favorites backup")
  }

  return parsed.favorites
}
