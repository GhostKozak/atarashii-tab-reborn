import { chromium } from "playwright"
import path from "node:path"
import http from "node:http"
import fs from "node:fs"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const chromeDist = path.join(projectRoot, "dist/chrome")

// 1. High quality wallpaper 1: Reborn Cyber City Dawn (base64 data URI)
const artworkPath = path.join(__dirname, "artwork_reborn.jpg")
const artworkBase64 = fs.readFileSync(artworkPath).toString("base64")
const artwork1Url = `data:image/jpeg;base64,${artworkBase64}`

// 2. High quality wallpaper 2: Cosmic Twilight Sakura Hill (base64 data URI)
const twilightPath = path.join(__dirname, "artwork_twilight.jpg")
const twilightBase64 = fs.readFileSync(twilightPath).toString("base64")
const artwork2Url = `data:image/jpeg;base64,${twilightBase64}`

// 3. High quality wallpaper 3: Synthwave Neon Skyline (SVG data URI)
const artwork3Url = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0f24"/>
      <stop offset="45%" stop-color="#1b1c3a"/>
      <stop offset="75%" stop-color="#4d1b58"/>
      <stop offset="100%" stop-color="#ff597b"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky)"/>
  <circle cx="960" cy="560" r="260" fill="#ff758c" opacity="0.9"/>
  <!-- Skyline silhouettes -->
  <path d="M0,1080 L0,760 L140,760 L140,630 L220,630 L220,800 L300,800 L300,680 L420,680 L420,830 L550,830 L550,590 L640,590 L640,730 L740,730 L740,660 L850,660 L850,830 L980,830 L980,600 L1080,600 L1080,750 L1200,750 L1200,620 L1320,620 L1320,800 L1450,800 L1450,690 L1580,690 L1580,830 L1700,830 L1700,590 L1800,590 L1800,770 L1920,770 L1920,1080 Z" fill="#080c1b"/>
  <rect y="860" width="1920" height="220" fill="#050711"/>
  <line x1="0" y1="860" x2="1920" y2="860" stroke="#00d2ff" stroke-width="4" opacity="0.9"/>
</svg>
`)}`

const historyItems = [
  {
    url: artwork1Url,
    backgroundUrl: artwork1Url,
    source: "wallhaven",
    sourceId: "m3k8q9",
    title: "Cyber City Sunrise • Neon Dawn",
    res: "3840 × 2160",
    nums: [0, 64],
    link: "https://wallhaven.cc/w/m3k8q9",
    favorite: true,
  },
  {
    url: artwork2Url,
    backgroundUrl: artwork2Url,
    source: "reddit",
    redditId: "cosmic_twilight_hill",
    title: "Twilight Sakura Hill & Cosmic Galaxy",
    res: "3840 × 2160",
    nums: [1, 64],
    link: "https://reddit.com/r/animewallpaper/comments/twilight_galaxy",
    favorite: true,
  },
  {
    url: artwork3Url,
    backgroundUrl: artwork3Url,
    source: "wallhaven",
    sourceId: "9d8x2w",
    title: "Synthwave Nightfall • Cityscape",
    res: "2560 × 1440",
    nums: [2, 64],
    link: "https://wallhaven.cc/w/9d8x2w",
    favorite: false,
  },
]

const recentDownloads = [
  {
    id: 101,
    url: "https://wallhaven.cc/w/m3k8q9",
    title: "Cyber City Sunrise • Neon Dawn (3840×2160)",
    startedAt: Date.now() - 1000 * 60 * 15,
    startedAtIso: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    startedAtLabel: "15 minutes ago",
  },
  {
    id: 102,
    url: "https://reddit.com/r/animewallpaper/comments/twilight_galaxy",
    title: "Twilight Sakura Hill & Cosmic Galaxy (3840×2160)",
    startedAt: Date.now() - 1000 * 60 * 60 * 2,
    startedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    startedAtLabel: "2 hours ago",
  },
]

function startServer(port = 8765) {
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
  }

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split("?")[0]
    if (reqPath === "/") reqPath = "/index.html"
    const filePath = path.join(chromeDist, reqPath)

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath)
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      })
      fs.createReadStream(filePath).pipe(res)
    } else {
      res.writeHead(404)
      res.end("Not found")
    }
  })

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server))
  })
}

async function captureScreenshots() {
  const server = await startServer(8765)
  console.log("Static server running on http://127.0.0.1:8765")

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()

  const baseConfig = {
    source: "wallhaven",
    q: `flair:"Desktop"`,
    wallhavenQ: "anime cyber scenery",
    wallhavenApiKey: "",
    wallhavenCategories: { general: false, anime: true, people: false },
    wallhavenPurity: { sfw: true, sketchy: false, nsfw: false },
    wallhavenSorting: "toplist",
    wallhavenOrder: "desc",
    wallhavenTopRange: "1M",
    wallhavenResolution: "3840x2160",
    wallhavenExactResolution: "",
    wallhavenRatio: "16x9",
    wallhavenColor: "",
    wallhavenFileType: "",
    sort: "top",
    t: "month",
    nsfw: false,
    incognito: false,
    hideGui: false,
    pinned: true,
    isMenuVisible: false,
    searchProfiles: [
      { id: "1", name: "Cyberpunk", q: "cyberpunk city", sort: "top" },
      { id: "2", name: "Starry Sky", q: "galaxy scenery", sort: "top" },
      { id: "3", name: "Anime Meadow", q: "clouds summer", sort: "top" },
    ],
    theme: {
      primary: "#ffc400",
      backgroundDim: 0.32,
    },
    settings: {
      soundEffects: true,
      rerollFlash: true,
      backgroundFit: "cover",
      backgroundPosition: "center",
      backgroundBlur: 0,
    },
  }

  async function loadState(configOverride, historyIndex = 0) {
    const config = { ...baseConfig, ...configOverride }
    const historyState = {
      history: historyItems,
      i: historyIndex,
    }
    const downloadsState = {
      recent: recentDownloads,
    }

    await page.goto("http://127.0.0.1:8765")
    await page.evaluate(({ cfg, hist, dl }) => {
      localStorage.setItem("config", JSON.stringify(cfg))
      localStorage.setItem("history", JSON.stringify(hist))
      localStorage.setItem("downloads", JSON.stringify(dl))
    }, { cfg: config, hist: historyState, dl: downloadsState })

    await page.reload({ waitUntil: "networkidle" })
    await page.waitForTimeout(600)
  }

  // 1. Screenshot 1: Main View (Wallhaven, clean UI, quick save, v0.2.0 credits)
  console.log("Capturing Screenshot 1: Main Wallhaven view...")
  await loadState({
    source: "wallhaven",
    isMenuVisible: false,
  }, 0)
  await page.screenshot({ path: path.join(__dirname, "screenshots_1.png") })

  // 2. Screenshot 2: History & Favorites Drawer Open
  console.log("Capturing Screenshot 2: History & Favorites drawer open...")
  await loadState({
    source: "wallhaven",
    isMenuVisible: true,
  }, 0)
  await page.click('button:has-text("History")')
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(__dirname, "screenshots_2.png") })

  // 3. Screenshot 3: Settings Drawer Open (Wallhaven filters, colors, sliders, profiles)
  console.log("Capturing Screenshot 3: Settings & customization panel...")
  await loadState({
    source: "wallhaven",
    isMenuVisible: true,
  }, 0)
  await page.click('button:has-text("Settings")')
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(__dirname, "screenshots_3.png") })

  // 4. Screenshot 4: Reddit source mode with Cosmic Twilight wallpaper & Purple accent theme
  console.log("Capturing Screenshot 4: Reddit source mode with Galaxy Twilight & Purple theme...")
  await loadState({
    source: "reddit",
    isMenuVisible: false,
    theme: {
      primary: "#7c5cff",
      backgroundDim: 0.28,
    },
  }, 1)
  await page.screenshot({ path: path.join(__dirname, "screenshots_4.png") })

  // 5. Screenshot 5: Downloads tab with recent wallpapers & Cyan theme
  console.log("Capturing Screenshot 5: Downloads drawer...")
  await loadState({
    source: "wallhaven",
    isMenuVisible: true,
    theme: {
      primary: "#00d2ff",
      backgroundDim: 0.35,
    },
  }, 0)
  await page.click('button:has-text("Downloads")')
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(__dirname, "screenshots_5.png") })

  await browser.close()
  server.close()
  console.log("All 5 screenshots captured successfully!")
}

captureScreenshots().catch((err) => {
  console.error("Error capturing screenshots:", err)
  process.exit(1)
})
