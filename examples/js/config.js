// Config
var config = {

  // ID of element to attach CMS.js to
  elementId: 'cms',

  // When in SERVER mode, set this to the web path to use for the URL.
  // for example, if your site is located in https://domain.tld/cms/
  // your webpath should be '/cms/'
  // NOTE, a trailing slash is REQUIRED.
  webpath: '/',

  // Customize the markdown engine here. For example, if you choose to use the
  // Marked library just specify the marked function.
  markdownEngine: marked.parse,

  // The name of the layouts directory.
  layoutDirectory: 'layouts',

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
    {
      name: 'authors',
      layout: {
        list: 'author-list',
        single: 'author',
        sort: 'title',
        title: 'Authors'
      },
    },
  ],

  // Specify the date format for displaying dates within.
  // Since this is a method, advanced usage can be implemented like switching formatting based on user's locale, etc.
  dateFormat: (date) => {
    /**
     * Common option parameters:
     * 
     * * weekday - The representation of the weekday. Possible values are:
     *   * "long" (e.g., Thursday)
     *   * "short" (e.g., Thu)
     *   * "narrow" (e.g., T). Two weekdays may have the same narrow style for some locales (e.g. Tuesday's narrow style is also T).
     *   * key ommitted, weekday is not displayed at all
     * 
     * * year - The representation of the year. Possible values are:
     *   * "numeric" (e.g., 2012)
     *   * "2-digit" (e.g., 12)
     * 
     * * month - The representation of the month. Possible values are:
     *   * "numeric" (e.g., 3)
     *   * "2-digit" (e.g., 03)
     *   * "long" (e.g., March)
     *   * "short" (e.g., Mar)
     *   * "narrow" (e.g., M). Two months may have the same narrow style for some locales (e.g. May's narrow style is also M).
     * 
     * * day - The representation of the day. Possible values are:
     *   * "numeric" (e.g., 1)
     *   * "2-digit" (e.g., 01)
     * 
     * For more information about date options, refer to 
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options
     */
    const options = {
      //weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString(window.navigator.language, options);

    // Optionally return a hard-coded format, (if you don't want the UI to vary)
    //return [(date.getMonth() + 1), date.getDate(), date.getFullYear()].join('/');
  },

  // Set to true to enable debug logging, (will enable logging events to the console)
  debug: false,
};

// Initialize CMS.js
const site = CMS(config);

/**
 * Called immediately upon successful initialization of the CMS
 * 
 * @param {CMS} event.detail.cms The CMS object passed for reference
 */
document.addEventListener('cms:load', event => {
  event.detail.cms.log.Debug('config', 'CMS initialized and ready to run user-specific code!', event.detail.cms);
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
  event.detail.cms.log.Debug('config', 'Page being displayed', event.detail);
});

site.init();

// Load some plugins
site.enablePlugin(['pagebodyclass']);
