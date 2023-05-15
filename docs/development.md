# Development & Contributing Guide

## Getting Started

These are instructions for development work on the framework itself, 
and not required for normal use of the library in your own site.

When working on the library, do not work within `dist/` or `examples/js/cms.js` 
as these are generated from `src/` files and will get overwritten.

[Jetbrains Webstorm](https://www.jetbrains.com/webstorm/) or 
[Jetbrains IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/)
are recommended editors for working on this framework, as all testing utilities,
coverage mappings, rules, etc work out of the box.


### Setup for Ubuntu, Debian

```bash
# Install dependencies
sudo apt install npm git
# Retrieve development build
git clone git@github.com:cdp1337/markdownmaster.git
# Switch to the directory where the development build is checked out
cd markdownmaster
# Have Node Package Manager install all development assets
NODE_ENV=dev npm install
# Setup husky pre-commit hooks
npm run prepare
```

### Running Locally

Follow the instructions for either [Nginx](INSTALL.nginx.md) or 
[Apache](INSTALL.apache.md) and point a target to examples/.

If setting up a dedicated web server locally is not preferred, `serve` is provided
in the development packages, though when using this method you must browse to the root index
page directly as it tries to remove '.html' from the requests and incorrectly routes.

example of serve issue: 

1. Run `npm run dev` to start serve http server
2. Browse to 'localhost:3000' and it works.
3. Browse to Posts, URL changes to 'localhost:3000/posts.html', still works

This is because the application intercepts the click event and dynamically changes the URL.

If you enter `localhost:3000/posts.html` in the browser and try to open the page,
serve will redirect you to `localhost:3000/posts/` and display a directory listing.


### Node Commands

List of useful npm scripts at your disposal when working on the framework.

---

Watch for updates within src and compile dist/cms.js. 
This one will be your most commonly run command if you use Nginx or Apache.

`npm run watch`

---

Watch for updates within src and start the HTTP server for local development.

`npm run dev`

---

Run all tests and display any errors

`npm run test`

---

Perform syntax checking

`npm run lint`

---

Full build: compile and minify (useful for packaging)

`npm run build`

---

Package the application into a tarball for manual distribution

`npm run pack`

---

Generate JSDoc documentation from source code and save to `docs/jsdoc/`

`npm run docs`

---

Compile src/ into dist/cms.js

`npm run compile`

---

Minify dist/cms.js into minified version

`npm run minify`

---

Run a local server for development, you should probably run `npm run dev` instead

`npm run serve`

---

Prepare the local environment for development work (sets up husky pre-commit hooks)

`npm run prepare`


## Contributing and Merge Requests

Contributions are always welcome, be them bug fixes, feature ideas, design help, etc.
Please make use of the [issue tracker](https://github.com/cdp1337/markdownmaster/issues)
for suggestions or bug reports.

When making a merge request, please branch off the `main` branch and merge back to the same.
If working on multiple features/fixes, it's recommended to use different local branches
for each different feature to keep the merge tidy.

If a request is addressing an issue, (and it should), please reference the issue #
in the merge request title along with a short description of the change.
