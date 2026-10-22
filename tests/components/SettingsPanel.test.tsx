import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vite-plus/test"
import Menu from "../../src/components/Menu"
import { ConfigStore } from "../../src/stores/ConfigStore"
import { HistoryStore } from "../../src/stores/HistoryStore"
import { makeImageData, resetStores } from "../helpers"

const historyFixture = Array.from({ length: 100 }, (_, index) =>
  makeImageData({
    title: `Wallpaper ${index}`,
    res: `${1920 + index} × 1080`,
    url: `https://example.com/${index}.jpg`,
    thumbnailUrl: `https://example.com/thumb-${index}.jpg`,
    favorite: index % 4 === 0,
  }),
)

function seedSettingsPanel() {
  resetStores()
  ConfigStore.isMenuVisible = true
  HistoryStore.history = historyFixture.map((item) => ({ ...item }))
  HistoryStore.i = HistoryStore.history.length - 1
}

describe("settings panel performance drift", () => {
  it("renders the settings panel", () => {
    seedSettingsPanel()
    render(<Menu />)
    fireEvent.click(screen.getByRole("button", { name: /settings/i }))
    expect(screen.getByLabelText("Settings")).toBeVisible()
  })

  it("applies theme settings", () => {
    seedSettingsPanel()
    render(<Menu />)
    fireEvent.click(screen.getByRole("button", { name: /settings/i }))
    fireEvent.click(screen.getByRole("button", { name: /set primary color to #7c5cff/i }))
    fireEvent.change(document.querySelector(".dim-opacity-slider") as HTMLInputElement, {
      target: { value: "0.5" },
    })
    expect(ConfigStore.theme.primary).toBe("#7c5cff")
    expect(ConfigStore.theme.backgroundDim).toBe(0.5)
  })

  it("toggles reroll settings", () => {
    seedSettingsPanel()
    render(<Menu />)
    fireEvent.click(screen.getByRole("button", { name: /settings/i }))
    fireEvent.click(screen.getByRole("button", { name: /reroll jingle/i }))
    fireEvent.click(screen.getByRole("button", { name: /large flash/i }))
    expect(ConfigStore.settings.soundEffects).toBe(false)
    expect(ConfigStore.settings.rerollFlash).toBe(false)
  })
})
