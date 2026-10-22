# Atarashii Tab Page

![marquee promo tile](marketing/marquee_promo_tile.png)

新しい (New) Tab Page displays your favorite anime wallpapers from the r/Animewallpaper subreddit on your new tab page.

[![Build](https://github.com/cf12/atarashii-tab/actions/workflows/build.yml/badge.svg)](https://github.com/cf12/atarashii-tab/actions/workflows/build.yml)

## Features
- HD wallpaper backgrounds from [r/Animewallpaper](https://reddit.com/r/Animewallpaper)
- Title, anime, and resolution details pulled from original reddit post
- Filter / sort wallpapers by time span, relevance, & NSFW
- Pin your favorite wallpapers
- Search for source images on SauceNAO, iqdb.org, and ascii2d.net
- Compatible with Chrome and Firefox desktop

## Firefox

Build the extension with `pnpm build`, then open `about:debugging#/runtime/this-firefox` in Firefox and choose **Load Temporary Add-on**. Select `dist/manifest.json`.

Temporary add-ons are removed when Firefox closes. A permanent Firefox installation requires a signed release from Mozilla Add-ons.

Wallpaper search phrases are sent directly to Reddit to fetch matching posts; the extension does not collect or store search analytics.

## Attribution & Credits
- Posts are directly scraped from [r/Animewallpaper](https://reddit.com/r/Animewallpaper)
- Wallpaper images are directly fetched from [i.redd.it](https://i.redd.it/)
- Wallpaper artwork is attributed to original artists & creators
- Promotional image background: [「GG~ありがと〜！」](https://www.pixiv.net/en/artworks/84017469) by [HOJI](https://www.pixiv.net/en/users/19133926) on [pixiv](https://www.pixiv.net/)


[![available in chrome web store](https://wd.imgix.net/image/BrQidfK9jaQyIHwdw91aVpkPiib2/LclHxMxqoswLNRcUW3m5.png)](https://chrome.google.com/webstore/detail/atarashii-new-tab-page/dlhcacedlaiagoocbbgkeclgklanpmim)

## Acknowledgements / Fork Info

This project is a continuation and rewrite of [atarashii-tab](https://github.com/cf12/atarashii-tab) by @cf12, licensed under the MIT License.
