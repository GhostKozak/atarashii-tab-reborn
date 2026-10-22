# Atarashii Tab Reborn

![Atarashii Tab promotional artwork](marketing/marquee_promo_tile.png)

Atarashii Tab Reborn is a new-tab extension that displays wallpapers from Wallhaven or Reddit's [r/Animewallpaper](https://www.reddit.com/r/Animewallpaper/).

[![Build](https://github.com/GhostKozak/atarashii-tab-reborn/actions/workflows/build.yml/badge.svg)](https://github.com/GhostKozak/atarashii-tab-reborn/actions/workflows/build.yml)

## Features

- Wallhaven is the default wallpaper source; switch to Reddit at any time.
- Browse Wallhaven's hot, top, and new results, or configure categories, content ratings, sorting, resolution, aspect ratio, dominant color, and file type.
- Use an optional Wallhaven API key to request NSFW results.
- Search by phrase and save named search profiles.
- Browse wallpaper history, save favorites, and export or import favorite backups.
- Download wallpapers and use reverse-image-search links.
- Customize the accent color, background dimming, fit, position, and blur.
- Supports Chrome and Firefox desktop.

## Build and package

Requirements: Node.js, pnpm, and the `zip` command-line utility.

```sh
pnpm install
pnpm build:packages
```

The command runs the strict TypeScript check and creates store-uploadable ZIP packages:

- Chrome: `dist/atarashii-tab-reborn-chrome.zip`
- Firefox: `dist/atarashii-tab-reborn-firefox.zip`

The build output also contains unpacked browser-specific folders at `dist/chrome` and `dist/firefox`.

### Load a development build

- **Chrome:** open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select `dist/chrome`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `dist/firefox/manifest.json`.

Firefox removes temporary add-ons when it closes. For regular Firefox installations, submit the Firefox package to [AMO](https://addons.mozilla.org/developers/) for signing. Chrome packages can be submitted through the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Releases

Pushing a Git tag starts the GitHub Actions build workflow. It creates both browser packages and attaches them to the GitHub Release. For example:

```sh
git tag v0.2.0
git push origin v0.2.0
```

Use a new, higher version in `package.json` and `public/manifest.json` for each store release.

## Privacy

Wallpaper search phrases are sent directly to the selected provider (Reddit or Wallhaven) to fetch results. The extension does not send search analytics to an Atarashii Tab Reborn server. Settings, wallpaper history, favorites, and an optional Wallhaven API key are stored locally by the extension in the browser. When used, the API key is sent to Wallhaven with API requests and is not included in search URLs or saved search profiles.

Reddit and Wallhaven are third-party services and have their own privacy practices. The extension's Firefox manifest declares the `searchTerms` data-collection permission to describe the search phrases sent to those providers.

## Attribution and acknowledgements

- This project is a continuation and rewrite of [atarashii-tab](https://github.com/cf12/atarashii-tab) by [@cf12](https://github.com/cf12), originally licensed under the MIT License. See [LICENSE](LICENSE).
- Wallpaper results are provided by [r/Animewallpaper](https://www.reddit.com/r/Animewallpaper/) and the [Wallhaven API](https://wallhaven.cc/help/api). Artwork remains the property of its respective artists and creators.
- Promotional artwork: [「GG~ありがと〜！」](https://www.pixiv.net/en/artworks/84017469) by [HOJI](https://www.pixiv.net/en/users/19133926) on [pixiv](https://www.pixiv.net/).

## AI-assisted development

AI tools were used to assist with parts of this fork's implementation, debugging, and documentation. The project maintainer directs and reviews changes and is responsible for the published project.
