import type { RedditPost } from "../stores/HistoryStore"

export const RECENT_WALLPAPER_LIMIT = 20

export function selectWallpaper(
  posts: RedditPost[],
  recentIds: ReadonlySet<string>,
  random: () => number = Math.random,
) {
  const eligiblePosts = posts.filter((post) => !recentIds.has(post.id))
  const choices = eligiblePosts.length ? eligiblePosts : posts

  if (!choices.length) return undefined

  return choices[Math.floor(random() * choices.length)]
}
