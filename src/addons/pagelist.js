import { renderLayout } from '../templater';


export default class PageList {
  constructor() {
  }
  
  init() {
    document.addEventListener('cms:route', (e) => {
      document.querySelectorAll('[data-plugin="cms:pagelist"]').forEach(el => {
        if (el.dataset.loaded !== '1') {
          // Only process nodes which have not already been loaded.
          this.execNode(e.detail.cms, el);
        }
      });
    });
  }

  /**
   * Display help text to the browser's console when something bad happened.
   */
  help() {
    console.info('Using pagelist plugin: <div data-plugin="cms:pagelist" ...attributes></div>');
    console.table([
      {attribute: 'data-type', required: true, example: 'posts', description: 'Type of content to retrieve, must match config parameters'},
      {attribute: 'data-layout', required: false, example: 'post-list', description: 'Layout filename to render content'},
      {attribute: 'data-link', required: false, example: '^posts/subdirectory/.+', description: 'Regex or URL fragment to filter results'}
    ]);
  }

  /**
   * Execute the plugin on a given node to render the requested content inside it
   * 
   * @param {CMS} CMS 
   * @param {Node} el 
   */
  execNode(CMS, el) {
    // Failsafe to prevent this from running twice per node
    el.dataset.loaded = '1';

    let type = el.dataset.type,
      layout = el.dataset.layout || null,
      filterLink = el.dataset.link || null,
      collection, config;

    if (typeof(type) === 'undefined') {
      // "type" is a required attribute
      console.error('cms:pagelist plugin error: data-type is REQUIRED');
      this.help();
      return;
    }

    if (typeof(CMS.collections[type]) === 'undefined') {
      // "type" must match a valid collection type
      let validTypes = CMS.config.types.map(t => { return t.name; });
      console.error(
        'cms:pagelist plugin error: data-type is not a valid registered content type',
        { type, validTypes }
      );
      this.help();
      return;
    }

    collection = CMS.collections[type];

    if (layout === null) {
      // Default for this collection
      layout = collection.layout.list;
    }

    // Support filters
    if (filterLink !== null) {
      collection.filterByPermalink(filterLink);
    }

    // Setup new config to override rendering of this content
    config = {
      container: el,
      webpath: collection.config.webpath,
      layoutDirectory: collection.config.layoutDirectory
    };
    
    // Use templater to render the requested content
    renderLayout(layout, config, collection, () => {});
  }
}
