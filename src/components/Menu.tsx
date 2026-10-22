import "./styles/Menu.scss"
import {
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  FaCog,
  FaDownload,
  FaEyeDropper,
  FaFileExport,
  FaFileImport,
  FaHistory,
  FaStar,
  FaThumbtack,
  FaTrash,
  FaClock,
} from "react-icons/fa"
import {
  ConfigStore,
  PRIMARY_COLOR_PRESETS,
  WALLHAVEN_COLOR_OPTIONS,
  WALLHAVEN_TOP_RANGE_OPTIONS,
  applySearchProfile,
  removeSearchProfile,
  saveSearchProfile,
  unpinWallpaper,
  updateSearchQuery,
  updateWallpaperSource,
} from "../stores/ConfigStore"
import { useSnapshot } from "valtio"
import {
  clearHistory,
  HistoryStore,
  removeHistoryAt,
  toggleFavoriteAt,
  importFavorites,
} from "../stores/HistoryStore"
import { LoadState, setLoaded } from "../stores/AppStore"
import { clearCache } from "../stores/CacheStore"
import { downloadWallpaper } from "../utils/downloadWallpaper"
import { exportFavorites, parseFavoritesBackup } from "../utils/favoritesBackup"
import { DownloadsStore, recordDownload } from "../stores/DownloadsStore"

type MenuTab = "history" | "downloads" | "settings"

type MenuCardProps = {
  data: (typeof HistoryStore.history)[number]
  index: number
  isCurrent: boolean
  isEntering: boolean
  isNewest: boolean
  isPinned: boolean
  onFavorite: () => void
  onRemove: () => void
}

function MenuCard({
  data,
  index,
  isCurrent,
  isEntering,
  isNewest,
  isPinned,
  onFavorite,
  onRemove,
}: MenuCardProps) {
  const [downloadMessage, setDownloadMessage] = useState("")

  const saveWallpaper = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setDownloadMessage("Downloading wallpaper…")

    try {
      const id = await downloadWallpaper(data.url, data.title)
      recordDownload({ id, url: data.url, title: data.title })
      setDownloadMessage("Wallpaper saved.")
    } catch (error) {
      console.error("[!] Failed to download wallpaper:", error)
      setDownloadMessage("Download failed. Check the browser permissions and try again.")
    }
  }

  return (
    <div
      data-index={index}
      className={`card ${isPinned ? "pinned" : ""} ${isCurrent ? "current" : ""} ${isEntering ? "entering" : ""}`}
      onClick={
        () => {
          if (isPinned) {
            ConfigStore.pinned = false
            setLoaded(LoadState.LOADED)
          } else {
            ConfigStore.pinned = true
            HistoryStore.i = index
            setLoaded(isCurrent ? LoadState.LOADED : LoadState.LOADING)
          }
        }
      }
    >
      <div className="card-image">
        <img
          src={data.thumbnailUrl || data.url}
          loading="lazy"
          decoding="async"
          onLoad={(event) => {
            event.currentTarget.classList.add("loaded")
          }}
        />
      </div>

      <p className="card-details">
        <strong title={data.title || "Untitled Wallpaper"}>
          {data.title || "Untitled Wallpaper"}
        </strong>
        {data.res && <small>{data.res}</small>}
      </p>

      <p className="card-status">
        <span>#{String(index + 1).padStart(2, "0")}</span>
        {isPinned ? <FaThumbtack size={14} /> : isNewest ? "NEW" : null}
      </p>

      <div className="card-actions">
        <button
          type="button"
          className="card-action-button card-download-button"
          aria-label={`Save ${data.title || "wallpaper"}`}
          onClick={saveWallpaper}
        >
          <FaDownload size={13} />
        </button>

        <button
          type="button"
          className={`card-action-button card-favorite-button ${data.favorite ? "active" : ""}`}
          aria-label={`${data.favorite ? "Remove" : "Add"} ${data.title || "wallpaper"} ${data.favorite ? "from" : "to"} favorites`}
          onClick={(event) => {
            event.stopPropagation()
            onFavorite()
          }}
        >
          <FaStar size={13} />
        </button>

        <button
          type="button"
          className="card-action-button card-remove-button"
          aria-label={`Remove ${data.title || "wallpaper"} from history`}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          <FaTrash size={13} />
        </button>
      </div>
      {downloadMessage && (
        <span className="download-feedback" role="status">
          {downloadMessage}
        </span>
      )}
    </div>
  )
}

export default function Menu () {
  const { history, i: historyIndex } = useSnapshot(HistoryStore)
  const { recent: recentDownloads } = useSnapshot(DownloadsStore)
  const {
    pinned,
    isMenuVisible,
    theme,
    settings,
    q,
    wallhavenQ,
    source,
    savedSearches,
    wallhavenCategories,
    wallhavenPurity,
    wallhavenSorting,
    wallhavenOrder,
    wallhavenTopRange,
    wallhavenResolution,
    wallhavenExactResolution,
    wallhavenRatio,
    wallhavenColor,
    wallhavenFileType,
    wallhavenApiKey,
  } = useSnapshot(ConfigStore)
  const [activeTab, setActiveTab] = useState<MenuTab>("history")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState(
    source === "wallhaven" ? wallhavenQ : q,
  )
  const [profileName, setProfileName] = useState("")
  const [selectedProfileId, setSelectedProfileId] = useState("")
  const [backupMessage, setBackupMessage] = useState("")
  const previousHistoryLength = useRef(history.length)
  const [enteringIndex, setEnteringIndex] = useState<number | null>(null)
  const primaryColor = theme.primary
  const isCustomPrimaryColor = !PRIMARY_COLOR_PRESETS.includes(
    primaryColor as (typeof PRIMARY_COLOR_PRESETS)[number]
  )
  const backgroundDim = theme.backgroundDim ?? 0.35
  const historyCards = [...history]
    .map((data, index) => ({ data, index }))
    .filter(({ data }) => !showFavoritesOnly || data.favorite)
    .reverse()

  useEffect(() => {
    if (history.length > previousHistoryLength.current) {
      setEnteringIndex(history.length - 1)
    }

    previousHistoryLength.current = history.length
  }, [history.length])

  const clearAllHistory = () => {
    unpinWallpaper()
    clearHistory()
  }

  const removeHistoryCard = (index: number) => {
    if (pinned && historyIndex === index) unpinWallpaper()
    removeHistoryAt(index)
  }

  const toggleHistoryFavorite = (index: number) => {
    toggleFavoriteAt(index)
  }

  const applySearchQuery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextQuery = searchQuery.trim()
    const currentQuery = source === "wallhaven" ? wallhavenQ : q
    if (nextQuery === currentQuery) return
    updateSearchQuery(nextQuery)
    clearCache()
    setLoaded(LoadState.FETCH_NEW)
  }

  const applyWallhavenSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    ConfigStore.pinned = false
    clearCache()
    setLoaded(LoadState.FETCH_NEW)
  }

  const saveCurrentProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const profileId = saveSearchProfile(profileName)
    if (!profileId) return

    setSelectedProfileId(profileId)
    setProfileName("")
  }

  const selectProfile = (profileId: string) => {
    if (!profileId || !applySearchProfile(profileId)) return

    const profile = ConfigStore.savedSearches.find(({ id }) => id === profileId)
    if (!profile) return

    setSearchQuery(profile.q)
    clearCache()
    setLoaded(LoadState.FETCH_NEW)
  }

  const deleteSelectedProfile = () => {
    if (!selectedProfileId) return

    removeSearchProfile(selectedProfileId)
    setSelectedProfileId("")
  }

  const exportFavoriteWallpapers = () => {
    const backup = exportFavorites(history)
    const anchor = document.createElement("a")
    anchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(backup)}`
    anchor.download = "atarashii-wallpaper-favorites.json"
    anchor.click()
    setBackupMessage("Favorites backup exported.")
  }

  const importFavoriteWallpapers = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    try {
      const favorites = parseFavoritesBackup(await file.text())
      const count = importFavorites(favorites)
      setBackupMessage(`Imported ${count} new favorite${count === 1 ? "" : "s"}.`)
    } catch (error) {
      console.error("[!] Failed to import favorite wallpapers:", error)
      setBackupMessage(
        error instanceof Error ? error.message : "Could not import this backup file.",
      )
    } finally {
      input.value = ""
    }
  }

  return (
    <div className={`menu ${isMenuVisible ? "visible" : ""}`}>
      <aside className="menu-sidebar" aria-label="Menu tabs">
        <button
          type="button"
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory size={16} />
          History
        </button>

        <button
          type="button"
          className={activeTab === "downloads" ? "active" : ""}
          onClick={() => setActiveTab("downloads")}
        >
          <FaClock size={16} />
          Downloads
        </button>

        <button
          type="button"
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          <FaCog size={16} />
          Settings
        </button>

      </aside>

      <div className="menu-content">
        {activeTab === "history" ? (
          <section className="history-panel" aria-label="History">
            <div className="cards-container">
              {historyCards.map(({ data, index }) => {
                const isPinned = pinned && historyIndex === index
                const isCurrent = historyIndex === index
                const isEntering = enteringIndex === index
                const isNewest = index === history.length - 1

                return (
                  <MenuCard
                    key={`menu-card-${index}`}
                    data={data}
                    index={index}
                    isCurrent={isCurrent}
                    isEntering={isEntering}
                    isNewest={isNewest}
                    isPinned={isPinned}
                    onFavorite={() => toggleHistoryFavorite(index)}
                    onRemove={() => removeHistoryCard(index)}
                  />
                )
              })}
            </div>

            <nav className="history-actions" aria-label="History actions">
              <button
                type="button"
                className={showFavoritesOnly ? "active" : ""}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <FaStar size={14} />
                Favorites
              </button>

              <button
                type="button"
                disabled={!history.some(({ favorite }) => !favorite)}
                onClick={clearAllHistory}
              >
                <FaTrash size={14} />
                Clear
              </button>

              <button
                type="button"
                disabled={!history.some(({ favorite }) => favorite)}
                onClick={exportFavoriteWallpapers}
              >
                <FaFileExport size={14} />
                Export
              </button>

              <label className="import-favorites-button">
                <FaFileImport size={14} />
                Import
                <input
                  type="file"
                  accept="application/json,.json"
                  aria-label="Import favorite wallpapers"
                  onChange={importFavoriteWallpapers}
                />
              </label>
            </nav>
            {backupMessage && <p className="backup-feedback" role="status">{backupMessage}</p>}
          </section>
        ) : activeTab === "downloads" ? (
          <section className="downloads-panel" aria-label="Recent downloads">
            <h2>Recent Downloads</h2>
            {recentDownloads.length ? (
              <ul>
                {recentDownloads.map((download) => (
                  <li key={download.id}>
                    <a href={download.url} target="_blank" rel="noreferrer">
                      {download.title || "Untitled wallpaper"}
                    </a>
                    <time dateTime={download.startedAtIso}>
                      {download.startedAtLabel}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No downloads yet. Save a wallpaper to see it here.</p>
            )}
          </section>
        ) : (
          <div className="settings-panel" aria-label="Settings">
            <section className="settings-section">
              <div className="settings-header">
                <h2>Search Wallpapers</h2>
                <p>Choose a source, then search its available wallpapers.</p>
              </div>

              <label
                className="search-query-form source-select-form"
                htmlFor="wallpaper-source"
              >
                Wallpaper source
                <select
                  id="wallpaper-source"
                  className="source-select"
                  value={source}
                  onChange={(event) => {
                    const nextSource = event.currentTarget.value as typeof source
                    updateWallpaperSource(nextSource)
                    setSearchQuery(nextSource === "wallhaven" ? wallhavenQ : q)
                    clearCache()
                    setLoaded(LoadState.FETCH_NEW)
                  }}
                >
                  <option value="reddit">Reddit</option>
                  <option value="wallhaven">Wallhaven</option>
                </select>
              </label>

              <form className="search-query-form" onSubmit={applySearchQuery}>
                <label htmlFor="wallpaper-search-query">Search phrase</label>
                <div className="search-query-controls">
                  <input
                    id="wallpaper-search-query"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    placeholder={source === "wallhaven" ? "Tags, e.g. landscape" : 'flair:"Desktop"'}
                  />
                  <button type="submit">Search</button>
                </div>
                <p className="search-query-note">
                  {source === "wallhaven"
                    ? "Search Wallhaven tags. Filters and your API key are saved in this browser."
                    : "Search titles or use Reddit search syntax. If Reddit's JSON API is unavailable, its RSS fallback provides up to 25 results."}
                </p>
              </form>

              {source === "wallhaven" && (
                <section
                  className="settings-section wallhaven-settings"
                  aria-label="Wallhaven settings"
                >
                  <div className="settings-header">
                    <h3>Wallhaven filters</h3>
                    <p>Fine-tune categories, content ratings and image filters.</p>
                  </div>

                  <form className="wallhaven-filter-form" onSubmit={applyWallhavenSettings}>
                    <fieldset>
                      <legend>Categories</legend>
                      {(["general", "anime", "people"] as const).map((category) => (
                        <label key={category}>
                          <input
                            type="checkbox"
                            checked={wallhavenCategories[category]}
                            onChange={(event) => {
                              ConfigStore.wallhavenCategories[category] =
                                event.currentTarget.checked
                            }}
                          />
                          {category === "general"
                            ? "General"
                            : category === "anime"
                              ? "Anime"
                              : "People"}
                        </label>
                      ))}
                    </fieldset>

                    <fieldset>
                      <legend>Content rating</legend>
                      {(["sfw", "sketchy", "nsfw"] as const).map((rating) => (
                        <label key={rating}>
                          <input
                            type="checkbox"
                            checked={wallhavenPurity[rating]}
                            onChange={(event) => {
                              ConfigStore.wallhavenPurity[rating] =
                                event.currentTarget.checked
                            }}
                          />
                          {rating.toUpperCase()}
                        </label>
                      ))}
                    </fieldset>

                    {wallhavenSorting === "toplist" && (
                      <div className="wallhaven-filter-field">
                        <label htmlFor="wallhaven-top-range">Toplist period</label>
                        <select
                          id="wallhaven-top-range"
                          value={wallhavenTopRange}
                          onChange={(event) => {
                            ConfigStore.wallhavenTopRange =
                              event.currentTarget.value as typeof wallhavenTopRange
                          }}
                        >
                          {WALLHAVEN_TOP_RANGE_OPTIONS.map((range) => (
                            <option key={range} value={range}>{range}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="wallhaven-filter-field">
                      <label htmlFor="wallhaven-advanced-sort">Other sort options</label>
                      <select
                        id="wallhaven-advanced-sort"
                        value={
                          ["relevance", "random", "favorites"].includes(wallhavenSorting)
                            ? wallhavenSorting
                            : ""
                        }
                        onChange={(event) => {
                          if (event.currentTarget.value) {
                            ConfigStore.wallhavenSorting =
                              event.currentTarget.value as typeof wallhavenSorting
                            ConfigStore.pinned = false
                            clearCache()
                            setLoaded(LoadState.FETCH_NEW)
                          }
                        }}
                      >
                        <option value="">Use hot / top / new controls above</option>
                        <option value="relevance">Relevance</option>
                        <option value="random">Random</option>
                        <option value="favorites">Favorites</option>
                      </select>
                    </div>

                    <div className="wallhaven-filter-field">
                      <label htmlFor="wallhaven-order">Order</label>
                      <select
                        id="wallhaven-order"
                        value={wallhavenOrder}
                        onChange={(event) => {
                          ConfigStore.wallhavenOrder =
                            event.currentTarget.value as typeof wallhavenOrder
                        }}
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                    </div>

                    <div className="wallhaven-filter-field">
                      <label htmlFor="wallhaven-resolution">Minimum resolution</label>
                      <select
                        id="wallhaven-resolution"
                        value={wallhavenResolution}
                        onChange={(event) => {
                          ConfigStore.wallhavenResolution = event.currentTarget.value
                        }}
                      >
                        <option value="">Any</option>
                        <option value="1920x1080">1920 × 1080</option>
                        <option value="1920x1200">1920 × 1200</option>
                        <option value="1920x1080,1920x1200">Either resolution</option>
                      </select>
                    </div>

                    <div className="wallhaven-filter-field">
                      <label htmlFor="wallhaven-ratio">Aspect ratio</label>
                      <select
                        id="wallhaven-ratio"
                        value={wallhavenRatio}
                        onChange={(event) => {
                          ConfigStore.wallhavenRatio = event.currentTarget.value
                        }}
                      >
                        <option value="">Any</option>
                        <option value="16x9">16:9</option>
                        <option value="16x10">16:10</option>
                      </select>
                    </div>

                    <div className="wallhaven-filter-field">
                      <label htmlFor="wallhaven-exact-resolution">Exact resolution</label>
                      <select
                        id="wallhaven-exact-resolution"
                        value={wallhavenExactResolution}
                        onChange={(event) => {
                          ConfigStore.wallhavenExactResolution = event.currentTarget.value
                        }}
                      >
                        <option value="">Any</option>
                        <option value="1920x1080">1920 × 1080</option>
                        <option value="1920x1200">1920 × 1200</option>
                      </select>
                    </div>

                    <div className="wallhaven-filter-field">
                      <label htmlFor="wallhaven-file-type">File type</label>
                      <select
                        id="wallhaven-file-type"
                        value={wallhavenFileType}
                        onChange={(event) => {
                          ConfigStore.wallhavenFileType =
                            event.currentTarget.value as typeof wallhavenFileType
                        }}
                      >
                        <option value="">Any</option>
                        <option value="jpg">JPG</option>
                        <option value="png">PNG</option>
                      </select>
                    </div>

                    <div className="wallhaven-filter-field">
                      <label htmlFor="wallhaven-color">Dominant color</label>
                      <select
                        id="wallhaven-color"
                        value={wallhavenColor}
                        onChange={(event) => {
                          ConfigStore.wallhavenColor = event.currentTarget.value
                        }}
                      >
                        <option value="">Any</option>
                        {WALLHAVEN_COLOR_OPTIONS.map(([color, label]) => (
                          <option key={color} value={color}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="wallhaven-filter-field wallhaven-api-key">
                      <label htmlFor="wallhaven-api-key">Wallhaven API key</label>
                      <input
                        id="wallhaven-api-key"
                        type="password"
                        autoComplete="off"
                        value={wallhavenApiKey}
                        onChange={(event) => {
                          ConfigStore.wallhavenApiKey = event.currentTarget.value
                        }}
                      />
                    </div>
                    <p className="search-query-note">
                      An API key is required for NSFW results. The key is stored locally and sent to Wallhaven when searching.{" "}
                      <a href="https://wallhaven.cc/settings/account" target="_blank" rel="noreferrer">
                        Get an API key
                      </a>
                    </p>

                    <button type="submit">Apply Wallhaven filters</button>
                  </form>
                </section>
              )}

              <form className="search-query-form" onSubmit={saveCurrentProfile}>
                <label htmlFor="search-profile-name">Save current search</label>
                <div className="search-query-controls">
                  <input
                    id="search-profile-name"
                    type="text"
                    value={profileName}
                    onChange={(event) => setProfileName(event.currentTarget.value)}
                    placeholder="Profile name"
                    maxLength={40}
                  />
                  <button type="submit" disabled={!profileName.trim()}>
                    Save
                  </button>
                </div>
              </form>

              <label className="search-query-form" htmlFor="saved-search-profiles">
                Saved searches
                <select
                  id="saved-search-profiles"
                  value={selectedProfileId}
                  onChange={(event) => {
                    setSelectedProfileId(event.currentTarget.value)
                    selectProfile(event.currentTarget.value)
                  }}
                >
                  <option value="">Choose a profile</option>
                  {savedSearches.map(({ id, name }) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={deleteSelectedProfile}
                disabled={!selectedProfileId}
              >
                Delete selected profile
              </button>
            </section>

            <section className="settings-section">
              <div className="settings-header">
                <h2>Accent Color</h2>
                <p>Customize the primary color used for highlights and links.</p>
              </div>

              <div className="color-presets" aria-label="Primary color presets">
                {PRIMARY_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={primaryColor === color ? "active" : ""}
                    style={{ "--preset-color": color } as CSSProperties}
                    aria-label={`Set primary color to ${color}`}
                    onClick={() => {
                      ConfigStore.theme.primary = color
                    }}
                  />
                ))}
                <label
                  className={
                    "custom-color-button" +
                    (isCustomPrimaryColor ? " active" : "")
                  }
                  style={{ "--preset-color": primaryColor } as CSSProperties}
                  aria-label="Choose custom primary color"
                >
                  <FaEyeDropper size={15} aria-hidden="true" />
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(event) => {
                      ConfigStore.theme.primary = event.currentTarget.value
                    }}
                  />
                </label>
              </div>
            </section>

            <section className="settings-section">
              <div className="settings-header">
                <h2>Background Dim</h2>
                <p>
                  Choose the background dim opacity percentage.
                </p>
              </div>

              <label className="range-picker-row">
                <span>Opacity</span>
                <strong>{Math.round(backgroundDim * 100)}%</strong>
              </label>

              <input
                className="dim-opacity-slider"
                type="range"
                min="0"
                max="0.75"
                step="0.01"
                value={backgroundDim}
                onChange={(event) => {
                  ConfigStore.theme.backgroundDim = Number(
                    event.currentTarget.value
                  )
                }}
              />
            </section>

            <section className="settings-section">
              <div className="settings-header">
                <h2>Reroll Effects</h2>
                <p>Choose which effects play when rolling a new wallpaper.</p>
              </div>

              <span className="small-section">
                <label className="toggle-picker-row">
                  <span>Reroll jingle</span>
                  <button
                    type="button"
                    className={settings.soundEffects ? "active" : ""}
                    onClick={() => {
                      ConfigStore.settings.soundEffects = !ConfigStore.settings.soundEffects
                    }}
                  >
                    {settings.soundEffects ? "on" : "off"}
                  </button>
                </label>

                <label className="toggle-picker-row">
                  <span>Large flash</span>
                  <button
                    type="button"
                    className={settings.rerollFlash ? "active" : ""}
                    onClick={() => {
                      ConfigStore.settings.rerollFlash = !ConfigStore.settings.rerollFlash
                    }}
                  >
                    {settings.rerollFlash ? "on" : "off"}
                  </button>
                </label>
              </span>
            </section>

            <section className="settings-section">
              <div className="settings-header">
                <h2>Background Image</h2>
                <p>Adjust how wallpapers fit and appear on the new tab.</p>
              </div>

              <label className="toggle-picker-row" htmlFor="background-fit">
                <span>Image fit</span>
                <select
                  id="background-fit"
                  value={settings.backgroundFit}
                  onChange={(event) => {
                    ConfigStore.settings.backgroundFit =
                      event.currentTarget.value as "cover" | "contain"
                  }}
                >
                  <option value="cover">Fill screen</option>
                  <option value="contain">Fit image</option>
                </select>
              </label>

              <label className="toggle-picker-row" htmlFor="background-position">
                <span>Image position</span>
                <select
                  id="background-position"
                  value={settings.backgroundPosition}
                  onChange={(event) => {
                    ConfigStore.settings.backgroundPosition =
                      event.currentTarget.value as typeof settings.backgroundPosition
                  }}
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </label>

              <label className="range-picker-row" htmlFor="background-blur">
                <span>Background blur</span>
                <strong>{settings.backgroundBlur}px</strong>
              </label>
              <input
                id="background-blur"
                className="background-blur-slider"
                type="range"
                min="0"
                max="10"
                step="1"
                value={settings.backgroundBlur}
                onChange={(event) => {
                  ConfigStore.settings.backgroundBlur = Number(
                    event.currentTarget.value,
                  )
                }}
              />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
