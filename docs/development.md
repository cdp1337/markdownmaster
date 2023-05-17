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


## Coding Guidelines

When writing code, it is **highly** recommended to do so in a 
[test driven development](https://en.wikipedia.org/wiki/Test-driven_development) 
approach, this means:

1. Add a test for expected functionality or change to expect
    * The adding of a new feature begins by writing a test that passes if the feature's 
    specifications are met. The developer can discover these specifications by asking about 
    use cases and user stories. A key benefit of test-driven development is that it makes 
    the developer focus on requirements before writing code.
2. Run all tests. The new test should fail because the feature is not implemented
    * This shows that new code is actually needed for the desired feature. 
    It validates that the test harness is working correctly. 
    It rules out the possibility that the new test is flawed and will always pass.
3. Write the simplest code that passes the new test
    * Inelegant or hard code is acceptable, as long as it passes the test. 
    The code will be honed anyway in Step 5. 
    No code should be added beyond the tested functionality.
4. All tests should now pass
    * If any fail, the new code must be revised until they pass. 
    This ensures the new code meets the test requirements and does not break existing features.
5. Refactor as needed, using tests after each refactor to ensure that functionality is preserved

This provides a boilerplate in the project for what the code is _supposed_ to do
to allow you to easily see when the feature is working as expected, and ensures that 
any future work does not introduce any regression bugs.

All tests **MUST** pass before a commit can be accepted!  This is enforced from husky
in a pre-commit hook.
