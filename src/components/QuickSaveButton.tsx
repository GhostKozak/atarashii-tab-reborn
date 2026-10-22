import { useState } from "react"
import { FaDownload } from "react-icons/fa"
import type { ImageData } from "../types/ImageData"
import { recordDownload } from "../stores/DownloadsStore"
import { downloadWallpaper } from "../utils/downloadWallpaper"

export function QuickSaveButton({ data }: { data: ImageData | null }) {
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  const saveCurrentWallpaper = async () => {
    if (!data || saving) return

    setSaving(true)
    setMessage("")
    try {
      const id = await downloadWallpaper(data.url, data.title)
      recordDownload({ id, url: data.url, title: data.title })
      setMessage("Wallpaper saved.")
    } catch (error) {
      console.error("[!] Failed to download wallpaper:", error)
      setMessage("Download failed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <span className="quick-save">
      <button
        type="button"
        className="quick-save-button"
        aria-label="Save current wallpaper"
        disabled={!data || saving}
        onClick={saveCurrentWallpaper}
      >
        <FaDownload size={14} />
        {saving ? "Saving…" : "Save"}
      </button>
      {message && <span role="status">{message}</span>}
    </span>
  )
}
