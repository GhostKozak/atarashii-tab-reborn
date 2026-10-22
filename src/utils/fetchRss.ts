import type { ConfigState } from "../stores/ConfigStore"
import type { RedditPost } from "../stores/HistoryStore"

export const RSS_LIMIT = 25

const PREVIEW_WIDTH = 640
const PREVIEW_HEIGHT = 360

const parseResolution = (title: string) => {
  const match = title.match(/(\d{3,5})\s*[x×*]\s*(\d{3,5})/i)
  if (!match) return null

  return { width: Number(match[1]), height: Number(match[2]) }
}

export const parseRssFeed = (xml: string): RedditPost[] => {
  const doc = new DOMParser().parseFromString(xml, "application/xml")

  if (doc.querySelector("parsererror")) {
    throw new Error("Could not parse the Reddit feed")
  }

  const posts: RedditPost[] = []

  for (const entry of Array.from(doc.querySelectorAll("entry"))) {
    const id = entry.querySelector("id")?.textContent?.trim().replace(/^t3_/, "") || ""
    const title = entry.querySelector("title")?.textContent?.trim() || ""
    const content = entry.querySelector("content")?.textContent || ""

    if (!id || !title || !content) continue

    const html = new DOMParser().parseFromString(content, "text/html")
    const url =
      html.querySelector('a[href*="i.redd.it"]')?.getAttribute("href") || ""
    const preview = html.querySelector("img")?.getAttribute("src")

    // Text posts have no image, they are not wallpapers.
    if (!url) continue

    const resolution = parseResolution(title)

    posts.push({
      id,
      title,
      url,
      preview: {
        images: [
          {
            source: {
              url,
              width: resolution?.width ?? 3840,
              height: resolution?.height ?? 2160,
            },
            resolutions: preview
              ? [{ url: preview, width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }]
              : [],
          },
        ],
      },
    })
  }

  return posts
}

export async function fetchRssPosts(config: ConfigState) {
  const query = new URLSearchParams({
    q: config.q,
    sort: config.sort,
    t: config.t,
    restrict_sr: "1",
    include_over_18: config.nsfw ? "on" : "off",
    limit: String(RSS_LIMIT),
  })

  const res = await fetch(
    `https://www.reddit.com/r/Animewallpaper/search.rss?${query}`,
  )

  if (!res.ok) {
    throw new Error(`Reddit responded with status ${res.status}`)
  }

  return parseRssFeed(await res.text())
}
