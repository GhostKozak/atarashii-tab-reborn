import { describe, expect, it } from "vite-plus/test"
import { CacheStore, clearCache } from "../../src/stores/CacheStore"
import { makePost } from "../helpers"

describe("CacheStore helpers", () => {
  it("clearCache resets cache data and timestamp", () => {
    CacheStore.data = [makePost({ id: "x" })]
    CacheStore.lastUpdated = 12345

    clearCache()

    expect(CacheStore.data).toEqual([])
    expect(CacheStore.lastUpdated).toBe(-1)
  })
})
