import { chromium } from "playwright"
import path from "node:path"
import { fileURLToPath } from "node:url"
import fs from "node:fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const publicIconsDir = path.join(projectRoot, "public/icons")

const sizes = [16, 32, 48, 128, 256]

function getHtml(size) {
  const padding = Math.max(1, Math.round(size * 0.04))
  const innerSize = size - padding * 2
  const strokeWidth = Math.max(1.5, Math.round(size * 0.055))
  const fontSize = Math.round(innerSize * 0.54)
  const borderRadius = Math.round(innerSize * 0.28)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${size}px;
    height: ${size}px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .icon-container {
    width: ${innerSize}px;
    height: ${innerSize}px;
    border-radius: ${borderRadius}px;
    background: linear-gradient(145deg, #161b2c 0%, #0c101c 55%, #070912 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 ${strokeWidth}px rgba(0, 210, 255, 0.75),
                inset 0 1.5px 3px rgba(255, 255, 255, 0.5),
                0 ${Math.max(1, Math.round(size * 0.04))}px ${Math.max(2, Math.round(size * 0.1))}px rgba(0, 0, 0, 0.75);
  }
  .ring-accent {
    position: absolute;
    inset: 0;
    border-radius: ${borderRadius}px;
    background: linear-gradient(135deg, rgba(0, 210, 255, 0.4) 0%, transparent 40%, rgba(255, 196, 0, 0.45) 100%);
    pointer-events: none;
  }
  .glow {
    position: absolute;
    width: 65%;
    height: 65%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(0, 210, 255, 0.25) 0%, rgba(255, 196, 0, 0.12) 55%, transparent 75%);
    border-radius: 50%;
    pointer-events: none;
  }
  .kanji {
    font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif;
    font-size: ${fontSize}px;
    font-weight: 900;
    line-height: 1;
    color: #ffffff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95),
                0 0 ${Math.max(2, Math.round(size * 0.08))}px rgba(0, 210, 255, 0.65);
    z-index: 2;
    transform: translateY(-${Math.max(0.5, Math.round(size * 0.015))}px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="icon-container">
    <div class="ring-accent"></div>
    <div class="glow"></div>
    <div class="kanji">新</div>
  </div>
</body>
</html>`
}

async function generate() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  for (const size of sizes) {
    await page.setViewportSize({ width: size, height: size })
    const html = getHtml(size)
    await page.setContent(html)
    const outputPath = path.join(publicIconsDir, `icon-${size}.png`)
    await page.screenshot({
      path: outputPath,
      omitBackground: true,
    })
    console.log(`Generated ${outputPath} (${size}x${size})`)
  }

  // Also create a favicon in public
  const faviconPath = path.join(projectRoot, "public/favicon.png")
  fs.copyFileSync(path.join(publicIconsDir, "icon-48.png"), faviconPath)
  console.log(`Created favicon at ${faviconPath}`)

  await browser.close()
}

generate().catch((err) => {
  console.error("Error generating icons:", err)
  process.exit(1)
})
