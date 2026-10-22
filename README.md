# Atarashii Tab Page

![marquee promo tile](marketing/marquee_promo_tile.png)

新しい (New) Tab Page displays anime wallpapers from Reddit's r/Animewallpaper or Wallhaven on your new tab page.

[![Build](https://github.com/cf12/atarashii-tab/actions/workflows/build.yml/badge.svg)](https://github.com/cf12/atarashii-tab/actions/workflows/build.yml)

## Features
- HD wallpaper backgrounds from [r/Animewallpaper](https://reddit.com/r/Animewallpaper) or [Wallhaven](https://wallhaven.cc), with Wallhaven category, purity, sort, resolution, aspect ratio, color, and file type filters
- Title, anime, and resolution details pulled from original reddit post
- Filter / sort wallpapers by time span, relevance, & NSFW
- Pin your favorite wallpapers
- Search for source images on SauceNAO, iqdb.org, and ascii2d.net
- Compatible with Chrome and Firefox desktop

## Firefox

Run `pnpm build:packages` to build and zip separate browser packages:

- Chrome: `dist/atarashii-tab-chrome.zip`
- Firefox: `dist/atarashii-tab-firefox.zip`

The command requires the `zip` command-line utility. To load the unpacked build temporarily in Firefox, open `about:debugging#/runtime/this-firefox` and select `dist/firefox/manifest.json`.

Temporary add-ons are removed when Firefox closes. A permanent Firefox installation requires a signed release from Mozilla Add-ons.

Wallpaper search phrases are sent directly to the selected source (Reddit or Wallhaven) to fetch matching posts; the extension does not collect or store search analytics. Wallhaven filters include categories, content ratings, sorting, resolution, aspect ratio, and color. NSFW results require a Wallhaven API key; the key is stored locally in the extension settings and sent to Wallhaven with searches.

## Attribution & Credits
- Posts are fetched from [r/Animewallpaper](https://reddit.com/r/Animewallpaper) or the [Wallhaven API](https://wallhaven.cc/help/api)
- Wallpaper images are directly fetched from [i.redd.it](https://i.redd.it/) or [Wallhaven](https://wallhaven.cc)
- Wallpaper artwork is attributed to original artists & creators
- Promotional image background: [「GG~ありがと〜！」](https://www.pixiv.net/en/artworks/84017469) by [HOJI](https://www.pixiv.net/en/users/19133926) on [pixiv](https://www.pixiv.net/)


[![available in chrome web store](https://wd.imgix.net/image/BrQidfK9jaQyIHwdw91aVpkPiib2/LclHxMxqoswLNRcUW3m5.png)](https://chrome.google.com/webstore/detail/atarashii-new-tab-page/dlhcacedlaiagoocbbgkeclgklanpmim)

## Acknowledgements / Fork Info

This project is a continuation and rewrite of [atarashii-tab](https://github.com/cf12/atarashii-tab) by @cf12, licensed under the MIT License.
