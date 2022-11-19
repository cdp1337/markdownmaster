export default class {

  constructor() {

  }

  init() {

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
    document.addEventListener('cms:route', event => {
      document.querySelectorAll('[data-plugin="cms:search"]').forEach(el => {
        if (el.dataset.loaded !== '1') {
          el.addEventListener('keyup', e => {
            if (e.key === 'Enter') {
              event.detail.cms.search(e.target.dataset.type, e.target.value);
            }
          });
        }
      });
    });
  }
}

