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
    document.addEventListener('cms:route', () => {
      document.querySelectorAll('[data-plugin="cms:mastodon_share"]').forEach(el => {
        if (el.dataset.loaded !== '1') {
          el.addEventListener('click', evt => {
            let href = window.localStorage.getItem('mastodon-instance') || '';
            href = prompt('Enter your mastodon instance URL', href);
        
            if (href) {
              // Ensure it's fully resolved
              if (href.indexOf('://') === -1) {
                href = 'https://' + href;
              }
        
              // Remember this for next time
              window.localStorage.setItem('mastodon-instance', href);
        
              window.open(
                href + '/share/?text=' + encodeURIComponent('Check out ' + document.title + ' on ' + window.location.host + '\n\n' + window.location.href),
                '_blank',
                'popup=true,noopener,width=400,height=450'
              );
            }
            
            evt.preventDefault();
          });
        }
      });
    });
  }
}
