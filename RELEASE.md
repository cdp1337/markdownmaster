# Release Notes


## New Features

* Add 'random' as supported sort parameter
* Paginate now supports 'page' parameter
* Page-list now supports 'limit' parameter

## Fixes

* Fix cms-* plugins trying to run before CMS was initialized
* Switch example site to use minified version of app by default
* Include default config for Apache expiry headers (for caching)
* Fix paragraph stealing extended attributes for simple blocks

## Changes

* Mastodon Share is now an element as opposed to a plugin
* Switch to `is=...` for all custom elements


## Upgrade Notes

* [From 2.x](docs/upgrade-notes/upgrade-2.x-to-3.0.md)
* [From 3.0](docs/upgrade-notes/upgrade-3.0-to-3.1.md)
* [From 3.1](docs/upgrade-notes/upgrade-3.1-to-4.0.md)
* [From 4.0](docs/upgrade-notes/upgrade-4.0-to-4.1.md)