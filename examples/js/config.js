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
  // Examples:
  // 'posts' -- Set default view to /posts.html
  // 'pages/home' -- Set default view to /pages/home.html
  defaultView: 'posts',

  // These are the types of content to load. Each type name is a directory or
  // folder where the files, pages or posts are located. Each type has a list
  // and single layout template that will determine how the file will be rendered.
  // Each type expects the following format:
  // {
  //    name: 'posts', // Key name for this content type
  //    layout: {
  //      list: 'post-list', // Template file to use for listing this content type
  //      single: 'post',    // Template file to use for rendering a single page
  //      title: 'Posts'     // Page title set automatically when browsing the listing page
  //    },
  //  },
  types: [
    {
      name: 'posts',
      layout: {
        list: 'post-list',
        single: 'post',
        sort: 'datetime-r',
        title: 'Posts'
      },
    },
    {
      name: 'pages',
      layout: { 
        list: 'page-list', 
        single: 'page',
        sort: 'title',
        title: 'Pages'
      },
    },
  ],

  // Set to true to enable debug logging, (will enable logging events to the console)
  debug: false,
};

// Initialize CMS.js
var site = CMS(config);

/**
 * Called immediately upon successful initialization of the CMS
 * 
 * @param {CMS} event.detail.cms The CMS object passed for reference
 */
document.addEventListener('cms:load', event => {
  event.detail.cms.debuglog('CMS initialized and ready to run user-specific code!', event.detail.cms);
});

/**
 * Called after any page load operation
 * 
 * @param {CMS} event.detail.cms CMS object for reference if needed
 * @param {FileCollection[]|null} event.detail.collection Collection of files to view for listing pages
 * @param {File|null} event.detail.file Single file to view when available
 * @param {string} event.detail.mode Type of view, usually either "list", "single", or error.
 * @param {string} event.detail.search Any search query
 * @param {string} event.detail.tag Any tag selected to view
 * @param {string} event.detail.type Content type selected
 */
document.addEventListener('cms:route', event => {
  event.detail.cms.debuglog('Page being displayed', event.detail);
});

site.init();

// Load some plugins
site.enablePlugin(['pagebodyclass', 'pagelist']);
