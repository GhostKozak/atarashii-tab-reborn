import { proxy } from "valtio"

export const LoadState = {
  FETCH_NEW: 0,
  LOADING: 1,
  LOADED: 2,
} as const
export type LoadState = (typeof LoadState)[keyof typeof LoadState]

export type AppStore = {
  loaded: LoadState
  showRollOverlay: boolean
  fetchError: string | null
}

export const AppStore = proxy<AppStore>({
  loaded: LoadState.FETCH_NEW,
  showRollOverlay: false,
  fetchError: null,
})

export const setLoaded = (state: LoadState) => {
  AppStore.loaded = state
}

export const setShowRollOverlay = (show: boolean) => {
  AppStore.showRollOverlay = show
}

export const setFetchError = (error: string | null) => {
  AppStore.fetchError = error
}
