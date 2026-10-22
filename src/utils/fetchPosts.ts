import type { ConfigState } from "../stores/ConfigStore"
import type { WallpaperPost } from "../stores/HistoryStore"
import { fetchRssPosts } from "./fetchRss"
import { fetchWallhavenPosts } from "./fetchWallhaven"

type RedditSearchResponse = {
  data: {
    after: string | null
    children: Array<{ data: WallpaperPost & { thumbnail?: string } }>
  }
}

const fetchJsonPosts = async (config: ConfigState) => {
  let posts: Array<WallpaperPost & { thumbnail?: string }> = []
  let after: string | null = null
  const seenCursors = new Set<string>()

  for (let page = 0; page < 8 && posts.length < 200; page += 1) {
    const query = new URLSearchParams({
      q: config.q.toString(),
      sort: config.sort.toString(),
      t: config.t.toString(),
      show: "all",
      restrict_sr: "1",
      include_over_18: config.nsfw ? "on" : "off",
    })
    if (after) query.set("after", after)

    const res = await fetch(
      `https://www.reddit.com/r/Animewallpaper/search.json?${query}`,
    )
    if (!res.ok) {
      throw new Error(`Reddit responded with status ${res.status}`)
    }

    const json = (await res.json()) as RedditSearchResponse

    posts = posts
      .concat(json.data.children.map((child) => child.data))
      .slice(0, 200)
    after = json.data.after
    if (!after || seenCursors.has(after)) break
    seenCursors.add(after)
  }

  return posts
}

export async function fetchPosts(config: ConfigState) {
  if (config.source === "wallhaven") return fetchWallhavenPosts(config)

  let posts: Array<WallpaperPost & { thumbnail?: string }>
  let usedRssFallback = false

  try {
    posts = await fetchJsonPosts(config)
  } catch (jsonError) {
    try {
      posts = await fetchRssPosts(config)
      usedRssFallback = true
    } catch (rssError) {
      throw new Error(
        `Failed to fetch Reddit posts from both the JSON API and RSS feed: ${String(jsonError)}`,
        { cause: rssError },
      )
    }
  }

  // RSS has no per-post NSFW field; its response already follows include_over_18.
  if (config.nsfw && !usedRssFallback) {
    posts = posts.filter((post) => post.thumbnail === "nsfw")
  }

  return posts.filter((post) => {
    try {
      return new URL(post.url).hostname === "i.redd.it"
    } catch {
      return false
    }
  })
}
