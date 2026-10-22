import { persist } from "valtio-persist"

export const RECENT_DOWNLOAD_LIMIT = 20

export type RecentDownload = {
  id: number
  url: string
  title: string
  startedAt: number
  startedAtIso: string
  startedAtLabel: string
}

export type DownloadsState = {
  recent: RecentDownload[]
}

export const { store: DownloadsStore } = await persist<DownloadsState>(
  { recent: [] },
  "downloads",
)

export const recordDownload = (
  download: Omit<
    RecentDownload,
    "startedAt" | "startedAtIso" | "startedAtLabel"
  >,
  now = Date.now(),
) => {
  DownloadsStore.recent = [
    {
      ...download,
      startedAt: now,
      startedAtIso: new Date(now).toISOString(),
      startedAtLabel: new Date(now).toLocaleString(),
    },
    ...DownloadsStore.recent.filter(({ id }) => id !== download.id),
  ].slice(0, RECENT_DOWNLOAD_LIMIT)
}
