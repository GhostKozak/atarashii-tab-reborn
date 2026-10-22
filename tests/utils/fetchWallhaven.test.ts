import { describe, expect, it, vi } from "vite-plus/test"
import { fetchPosts } from "../../src/utils/fetchPosts"

const wallpaper = {
  id: "abc123",
  url: "https://wallhaven.cc/w/abc123",
  path: "https://w.wallhaven.cc/full/ab/wallhaven-abc123.jpg",
  resolution: "1920x1080",
  thumbs: {
    small: "https://th.wallhaven.cc/small/ab/abc123.jpg",
  },
}

describe("fetchPosts with Wallhaven", () => {
  it("fetches anime SFW wallpapers and maps them into history posts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [wallpaper] }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const posts = await fetchPosts({
      source: "wallhaven",
      wallhavenQ: "landscape",
      sort: "top",
      t: "month",
      wallhavenCategories: { general: false, anime: true, people: false },
      wallhavenPurity: { sfw: true, sketchy: false, nsfw: false },
      wallhavenSorting: "toplist",
      wallhavenOrder: "desc",
      wallhavenTopRange: "1M",
      nsfw: false,
    } as never)

    const url = new URL(
      fetchMock.mock.calls[0]?.[0] as string,
      "https://wallhaven.cc",
    )
    expect(url.searchParams.get("q")).toBe("landscape")
    expect(url.searchParams.get("categories")).toBe("010")
    expect(url.searchParams.get("purity")).toBe("100")
    expect(url.searchParams.get("sorting")).toBe("toplist")
    expect(url.searchParams.get("topRange")).toBe("1M")
    expect(posts).toEqual([{
      id: "abc123",
      title: "Wallhaven #abc123",
      source: "wallhaven",
      url: wallpaper.path,
      link: wallpaper.url,
      thumbnailUrl: wallpaper.thumbs.small,
      resolution: "1920 × 1080",
    }])
  })

  it("excludes results with non-Wallhaven image URLs", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          wallpaper,
          { ...wallpaper, id: "external", path: "https://example.com/image.jpg" },
        ],
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const posts = await fetchPosts({
      source: "wallhaven",
      wallhavenQ: "anime",
      sort: "new",
      t: "all",
      nsfw: false,
    } as never)

    expect(posts).toHaveLength(1)
    expect(new URL(
      fetchMock.mock.calls[0]?.[0] as string,
      "https://wallhaven.cc",
    ).searchParams.get("sorting"))
      .toBe("date_added")
  })

  it("uses selected filters and sends the API key only when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [wallpaper] }),
    })
    vi.stubGlobal("fetch", fetchMock)

    await fetchPosts({
      source: "wallhaven",
      wallhavenQ: "",
      wallhavenApiKey: "test-api-key",
      wallhavenCategories: { general: true, anime: false, people: true },
      wallhavenPurity: { sfw: true, sketchy: true, nsfw: true },
      wallhavenSorting: "toplist",
      wallhavenOrder: "desc",
      wallhavenTopRange: "6M",
      wallhavenResolution: "1920x1200",
      wallhavenExactResolution: "1920x1080",
      wallhavenRatio: "16x9",
      wallhavenColor: "663399",
      wallhavenFileType: "png",
    } as never)

    const url = new URL(fetchMock.mock.calls[0]?.[0] as string, "https://wallhaven.cc")
    expect(url.searchParams.get("q")).toBe("type:png")
    expect(url.searchParams.has("type")).toBe(false)
    expect(url.searchParams.get("categories")).toBe("101")
    expect(url.searchParams.get("purity")).toBe("111")
    expect(url.searchParams.get("sorting")).toBe("toplist")
    expect(url.searchParams.get("topRange")).toBe("6M")
    expect(url.searchParams.get("atleast")).toBe("1920x1200")
    expect(url.searchParams.get("resolutions")).toBe("1920x1080")
    expect(url.searchParams.get("ratios")).toBe("16x9")
    expect(url.searchParams.get("colors")).toBe("663399")
    expect(url.searchParams.get("order")).toBe("desc")
    expect(url.searchParams.has("apikey")).toBe(false)
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: { "X-API-Key": "test-api-key" },
    })
  })

  it("requires an API key when NSFW results are enabled", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(fetchPosts({
      source: "wallhaven",
      wallhavenQ: "anime",
      wallhavenApiKey: "",
      wallhavenCategories: { general: false, anime: true, people: false },
      wallhavenPurity: { sfw: true, sketchy: false, nsfw: true },
      wallhavenSorting: "toplist",
      wallhavenOrder: "desc",
      wallhavenTopRange: "1M",
      wallhavenResolution: "",
      wallhavenExactResolution: "",
      wallhavenRatio: "",
      wallhavenColor: "",
    } as never)).rejects.toThrow("Enter a Wallhaven API key")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("uses the development proxy for browser CORS", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [wallpaper] }),
    })
    vi.stubGlobal("fetch", fetchMock)

    await fetchPosts({
      source: "wallhaven",
      wallhavenQ: "anime",
      wallhavenApiKey: "",
      wallhavenCategories: { general: false, anime: true, people: false },
      wallhavenPurity: { sfw: true, sketchy: false, nsfw: false },
      wallhavenSorting: "toplist",
      wallhavenOrder: "desc",
      wallhavenTopRange: "1M",
      wallhavenResolution: "",
      wallhavenExactResolution: "",
      wallhavenRatio: "",
      wallhavenColor: "",
    } as never)

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/api/wallhaven/search?q=anime&categories=010&purity=100&sorting=toplist&order=desc&topRange=1M&page=1",
    )
  })

  it("surfaces Wallhaven API errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }))

    await expect(fetchPosts({
      source: "wallhaven",
      wallhavenQ: "anime",
      sort: "top",
      t: "year",
      nsfw: false,
      wallhavenCategories: { general: false, anime: true, people: false },
      wallhavenPurity: { sfw: true, sketchy: false, nsfw: false },
      wallhavenSorting: "toplist",
      wallhavenOrder: "desc",
      wallhavenTopRange: "1M",
    } as never)).rejects.toThrow("Wallhaven rate limit reached")
  })

  it("fetches up to five pages and reuses the random seed", async () => {
    const responses = Array.from({ length: 5 }, (_, index) => ({
      ok: true,
      json: async () => ({
        data: [{ ...wallpaper, id: `abc12${index}` }],
        meta: { last_page: 18, seed: "seed01" },
      }),
    }))
    const fetchMock = vi.fn()
    responses.forEach((response) => fetchMock.mockResolvedValueOnce(response))
    vi.stubGlobal("fetch", fetchMock)

    const posts = await fetchPosts({
      source: "wallhaven",
      wallhavenQ: "anime",
      wallhavenCategories: { general: false, anime: true, people: false },
      wallhavenPurity: { sfw: true, sketchy: false, nsfw: false },
      wallhavenSorting: "random",
      wallhavenOrder: "desc",
      wallhavenTopRange: "1M",
      wallhavenApiKey: "",
      wallhavenResolution: "",
      wallhavenExactResolution: "",
      wallhavenRatio: "",
      wallhavenColor: "",
      wallhavenFileType: "",
    } as never)

    expect(fetchMock).toHaveBeenCalledTimes(5)
    expect(posts).toHaveLength(5)
    expect(new URL(fetchMock.mock.calls[1]?.[0] as string, "https://wallhaven.cc")
      .searchParams.get("page")).toBe("2")
    expect(new URL(fetchMock.mock.calls[1]?.[0] as string, "https://wallhaven.cc")
      .searchParams.get("seed")).toBe("seed01")
  })

  it("converts invalid-key and rate-limit responses into actionable messages", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: ["Invalid key"] }) })
      .mockResolvedValueOnce({ ok: false, status: 429 })
    vi.stubGlobal("fetch", fetchMock)
    const config = {
      source: "wallhaven",
      wallhavenQ: "anime",
      wallhavenApiKey: "key",
      wallhavenCategories: { general: false, anime: true, people: false },
      wallhavenPurity: { sfw: true, sketchy: false, nsfw: true },
      wallhavenSorting: "toplist",
      wallhavenOrder: "desc",
      wallhavenTopRange: "1M",
    } as never

    await expect(fetchPosts(config)).rejects.toThrow("Check your Wallhaven API key")
    await expect(fetchPosts(config)).rejects.toThrow("rate limit reached")
  })
})
