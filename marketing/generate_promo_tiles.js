import { chromium } from "playwright"
import path from "node:path"
import { fileURLToPath } from "node:url"
import fs from "node:fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const artworkPath = path.join(__dirname, "artwork_reborn.jpg")
const artworkBase64 = fs.readFileSync(artworkPath).toString("base64")
const artworkDataUri = `data:image/jpeg;base64,${artworkBase64}`

const tiles = [
  {
    name: "marquee_promo_tile.png",
    width: 1400,
    height: 560,
    kanjiSize: "130px",
    rebornSize: "48px",
    subtitleSize: "20px",
    badgeSize: "16px",
    spacing: "16px",
  },
  {
    name: "large_promo_tile.png",
    width: 920,
    height: 680,
    kanjiSize: "120px",
    rebornSize: "44px",
    subtitleSize: "19px",
    badgeSize: "15px",
    spacing: "18px",
  },
  {
    name: "small_promo_tile.png",
    width: 440,
    height: 280,
    kanjiSize: "64px",
    rebornSize: "24px",
    subtitleSize: "12px",
    badgeSize: "10px",
    spacing: "8px",
  },
]

function generateHtml(tile) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    width: ${tile.width}px;
    height: ${tile.height}px;
    overflow: hidden;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
    background-color: #0d1117;
  }
  .bg {
    position: absolute;
    inset: -10px;
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    object-fit: cover;
    object-position: center 38%;
    filter: brightness(0.68) contrast(1.1) saturate(1.15) blur(2.5px);
  }
  .overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(10, 14, 20, 0.45) 0%, rgba(10, 14, 20, 0.78) 100%);
  }
  .accent-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70%;
    height: 70%;
    background: radial-gradient(ellipse at center, rgba(255, 196, 0, 0.16) 0%, rgba(0, 210, 255, 0.12) 40%, transparent 70%);
    pointer-events: none;
  }
  .content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 2;
    gap: ${tile.spacing};
  }
  .kanji {
    font-size: ${tile.kanjiSize};
    font-weight: 800;
    letter-spacing: 3px;
    color: #ffffff;
    line-height: 1;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.9),
      0 6px 20px rgba(0, 0, 0, 0.8),
      0 0 35px rgba(255, 255, 255, 0.4);
  }
  .reborn-tag {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .reborn-text {
    font-size: ${tile.rebornSize};
    font-weight: 800;
    letter-spacing: 5px;
    color: #ffffff;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.9),
      0 4px 16px rgba(0, 0, 0, 0.85);
  }
  .reborn-highlight {
    color: #ffc400;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.9),
      0 0 25px rgba(255, 196, 0, 0.65),
      0 4px 16px rgba(0, 0, 0, 0.85);
  }
  .subtitle {
    font-size: ${tile.subtitleSize};
    font-weight: 600;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.92);
    text-shadow:
      0 2px 6px rgba(0, 0, 0, 0.9),
      0 4px 14px rgba(0, 0, 0, 0.8);
  }
</style>
</head>
<body>
  <img class="bg" src="${artworkDataUri}" alt="Background" />
  <div class="overlay"></div>
  <div class="accent-glow"></div>
  <div class="content">
    <div class="kanji">「新しい」</div>
    <div class="reborn-tag">
      <span class="reborn-text">NEW TAB <span class="reborn-highlight">REBORN</span></span>
    </div>
    <div class="subtitle">WALLHAVEN &bull; REDDIT &bull; 4K ANIME WALLPAPERS</div>
  </div>
</body>
</html>`
}

async function renderTiles() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  for (const tile of tiles) {
    console.log(`Generating ${tile.name} (${tile.width}x${tile.height})...`)
    await page.setViewportSize({ width: tile.width, height: tile.height })
    const html = generateHtml(tile)
    await page.setContent(html, { waitUntil: "networkidle" })
    await page.screenshot({
      path: path.join(__dirname, tile.name),
      type: "png",
    })
  }

  await browser.close()
  console.log("Promo tiles generated successfully!")
}

renderTiles().catch((err) => {
  console.error("Error generating tiles:", err)
  process.exit(1)
})
