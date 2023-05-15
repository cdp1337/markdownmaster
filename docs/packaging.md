# Building & Packaging MarkdownMaster CMS

Steps to follow for packaging a new version of MarkdownMaster CMS.

## 1. Development

During development, run `npm run watch` to keep dist/cms.js up to date with your changes.
If running the built-in node http server, `npm run dev` will achieve this automatically.


## 2. RELEASE

It is advisable to keep a running list of changes within [the RELEASE file](../RELEASE.md). 
If there are changes listed from a previously-released version, 
ensure they are copied to [the CHANGELOG](CHANGELOG.md)
under the appropriate version, creating it if necessary.

To get the date of previously released versions, 
look at [the releases archive](https://github.com/cdp1337/markdownmaster/releases) 
or git history for tags.

The RELEASE file is meant to be a human-readable file displayed on the tagged 
release page on Github. 
It should include all relevant information necessary for upgrading to that 
version of the code, along with any notable previous versions if applicable.

This file should contain an H1 header, intro text if necessary, 
and the list of new features and fixes contained in the release.
(The features/fixes and intro text can usually be copied to 
CHANGELOG without much modification.)


## 3. CHANGELOG

At the time of publishing work as a release, 
copy the relevant sections of [RELEASE.md](../RELEASE.md) into [CHANGELOG.md](../CHANGELOG.md)
and create a header to accompany the new version in the format of `## x.y.z - YYYY-MM-DD`

Each change can have `### New Features`, `### Fixes`, and/or `### Changes`
as a bulleted list of items in the change.


## 4. Package JSON

At the time of publishing work as a release, 
bump the version listed in [the Node Package](../package.json) for the project.


## 5. GIT Tag

Lastly once the release, changelog, and package JSON are updated 
with the new version and information and all work has been committed to `main`, 
the final task is to tag a release and push that tag.

```bash
git tag v#.#.#
git push --tags
```

This will upload the new tag to Github and will tag the code for future reference.
The [Github Workflow](../.github/workflows/release.yml) will be used to allow Github 
to detect the tag push and execute the contained code to automatically compile and 
publish a release of a distributable version.
