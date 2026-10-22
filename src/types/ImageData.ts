export type ImageData = {
  title: string
  res: string
  redditId?: string
  source?: "reddit" | "wallhaven"
  sourceId?: string
  url: string
  link: string
  nums: readonly [i: number, total: number]

  backgroundUrl?: string
  thumbnailUrl?: string

  favorite?: boolean
}
