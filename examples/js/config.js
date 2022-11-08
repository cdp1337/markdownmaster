// Config
var config = {

  // ID of element to attach CMS.js to
  elementId: 'cms',

  // Mode 'GITHUB' for Github Pages, 'SERVER' for Self Hosted
  // Defaults to Server mode if not specified
  mode: 'SERVER',

  // When in SERVER mode, set this to the web path to use for the URL.
  // for example, if your site is located in https://domain.tld/cms/
  // your webpath should be '/cms/'
  // NOTE, a trailing slash is REQUIRED.
  webpath: '/',

  // If Github mode is set, your Github username, repo name,
  // and branch to get files from.
  github: {
    username: 'yourusername',
    repo: 'yourrepo',
    branch: 'gh-pages',
    host: 'https://api.github.com',
    // Use prefix option if your site is located in a subdirectory.
    // prefix: 'subdirectory',
  },

  // Customize the markdown engine here. For example, if you choose to use the
  // Marked library just specify the marked function.
  markdownEngine: marked.parse,

  // The name of the layouts directory.
  layoutDirectory: 'layouts',

  // The error layout template name.
  errorLayout: 'error',

  // The URL that will be the default view that will initially load
  // For example, this could a list view or a could be a specific view
  // like a single page.
  defaultView: 'posts',

  // These are the types of content to load. Each type name is a directory or
  // folder where the files, pages or posts are located. Each type has a list
  // and single layout template that will determine how the file will be rendered.
  types: [
    {
      // for example, layouts/post-list.html
      name: 'posts',
      layout: { 
        list: 'post-list', 
        single: 'post',
        title: 'Posts'
      },
    },
    {
      name: 'pages',
      layout: { 
        list: 'page-list', 
        single: 'page',
        title: 'Pages'
      },
    },
  ],

  // Set to true to enable debug logging, (will log to the console)
  debug: false,
};

// Initialize CMS.js
var site = CMS(config);

/**
 * Called immediately upon successful initialization of the CMS
 * 
 * When using function() syntax, 'this' will point to the CMS object,
 * arrow function syntax 'site.onload = () => { ... }' will be anonymous and detached.
 * 
 * Either option is acceptable, just depending on your needs/preferences.
 * @method
 */
site.onload = function() {
  this.debuglog('CMS initialized and ready to run user-specific code!');
}

/**
 * Called after any page load operation
 * 
 * When using function() syntax, 'this' will point to the CMS object,
 * arrow function syntax 'site.onroute = () => { ... }' will be anonymous and detached.
 * 
 * Either option is acceptable, just depending on your needs/preferences.
 * @method
 * @param {FileCollection[]|null} view.collection Collection of files to view for listing pages
 * @param {File|null} view.file Single file to view when available
 * @param {string} view.mode Type of view, usually either "list", "single", or error.
 * @param {string} view.query Any search query
 * @param {string} view.tag Any tag selected to view
 * @param {string} view.type Content type selected
 */
site.onroute = function(view) {
  this.debuglog('Page being displayed', view);

  let search = document.getElementById('search');
  if (search) {
    search.addEventListener('keyup', e => {
      if (e.key === 'Enter') {
        this.search(e.target.dataset.type, e.target.value);
      }
    });
  }
}

site.init();
