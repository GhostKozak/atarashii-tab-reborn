# Privacy Policy

**Last updated: October 23, 2026**

Atarashii Tab Reborn replaces the browser's new-tab page with wallpapers from Wallhaven or Reddit's r/Animewallpaper. This policy explains what information the extension handles and where it goes.

## Information stored in your browser

The extension stores its data in the browser's local storage for the extension. This can include:

- Your selected wallpaper source, search phrases, filters, and saved search profiles.
- Wallpaper history, favorites, cached wallpaper results, and recent download records. Recent download records are limited to the 20 most recent and include the wallpaper URL, title, and download time.
- Your appearance preferences.
- An optional Wallhaven API key, if you enter one.

This information is stored in your browser profile and is not sent to an Atarashii Tab Reborn server. The extension does not encrypt this local storage; protect access to your browser profile accordingly. Saved search profiles do not contain the Wallhaven API key.

You can remove this information by clearing the storage associated with the extension in your browser or by uninstalling the extension. The exact controls depend on your browser. Downloaded wallpaper files are stored separately in the location chosen through your browser's download interface; removing extension data does not delete those files.

## Information sent to third parties

When you search for wallpapers, the extension sends your search phrase and the relevant source filters to the selected provider:

- **Reddit:** search requests go to `www.reddit.com` for its JSON or RSS search results.
- **Wallhaven:** search requests go to `wallhaven.cc`. If you enter an API key, it is sent to Wallhaven in the `X-API-Key` request header when making API requests. It is not added to the search URL.

The extension also loads wallpaper images and thumbnails from Reddit or Wallhaven hosts. If you choose to download a wallpaper, the browser downloads it directly from the image host.

These requests are necessary for the extension's wallpaper search and display features. Reddit and Wallhaven may receive technical information such as your IP address and request metadata, and handle information according to their own privacy policies and terms. Atarashii Tab Reborn does not control their data practices.

## Analytics, advertising, and sale of data

The extension does not include its own analytics, advertising, or tracking service. It does not send search history, settings, or other extension data to an Atarashii Tab Reborn server, and the project maintainer does not sell this information.

## Children's privacy

The extension is not designed to collect personal information from children. Wallhaven can provide mature content if a user enables it with an API key; users and guardians should select content settings appropriate to their circumstances.

## Changes to this policy

This policy may be updated when the extension's behavior changes. The latest version will be published in this repository, with its updated date shown above.

## Contact

For privacy questions or concerns, open an issue in the [project repository](https://github.com/GhostKozak/atarashii-tab-reborn/issues).
