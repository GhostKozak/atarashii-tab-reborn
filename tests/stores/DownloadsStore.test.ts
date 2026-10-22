import { describe, expect, it } from "vite-plus/test"
import {
  DownloadsStore,
  RECENT_DOWNLOAD_LIMIT,
  recordDownload,
} from "../../src/stores/DownloadsStore"
import { resetStores } from "../helpers"

describe("DownloadsStore", () => {
  it("keeps unique downloads newest-first and enforces the history limit", () => {
    resetStores()

    for (let id = 0; id <= RECENT_DOWNLOAD_LIMIT; id += 1) {
      recordDownload(
        { id, title: `Wallpaper ${id}`, url: `https://i.redd.it/${id}.jpg` },
        id,
      )
    }

    recordDownload(
      { id: RECENT_DOWNLOAD_LIMIT, title: "Updated wallpaper", url: "https://i.redd.it/updated.jpg" },
      99,
    )

    expect(DownloadsStore.recent).toHaveLength(RECENT_DOWNLOAD_LIMIT)
    expect(DownloadsStore.recent[0]).toMatchObject({
      id: RECENT_DOWNLOAD_LIMIT,
      title: "Updated wallpaper",
      startedAt: 99,
    })
    expect(DownloadsStore.recent.at(-1)?.id).toBe(1)
  })
})
