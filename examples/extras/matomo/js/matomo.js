/**
 * Called after any page load operation
 *
 * Track Matomo/Piwik events on pageload
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
    let _paq = window._paq || [];

    if (event.detail.tag !== null) {
        // Track tag listings as search events
        // trackSiteSearch(keyword, [category], [resultsCount])
        _paq.push(['trackSiteSearch', 'tag:' + event.detail.tag, event.detail.type, event.detail.collection.totalResults]);
    }
    else if(event.detail.search !== null) {
        // Track search events
        // trackSiteSearch(keyword, [category], [resultsCount])
        _paq.push(['trackSiteSearch', event.detail.search, event.detail.type, event.detail.collection.totalResults]);
    }
    else {
        // Track page views
        _paq.push(['setCustomUrl', window.location.pathname + window.location.search]);
        _paq.push(['setDocumentTitle', document.title]);
        _paq.push(['trackPageView']);
    }
});


/**
 * Sent a ping periodically to notify Matomo that the user is still on the page.
 */
setInterval(() => {
    let _paq = window._paq || [];
    _paq.push(['ping']);
}, 30000);


/**
 * Create a custom element to handle opting in and out of Matomo tracking.
 */
class MatomoOptInOutLink extends HTMLAnchorElement {

    constructor() {
        // Always call super first in constructor
        super();

        this.update();

        this.addEventListener('click', event => {
            let _paq = window._paq || [];

            if( this.dataset['mode'] === 'optin' ) {
                _paq.push(['forgetUserOptOut']);
            }
            else if( this.dataset['mode'] === 'optout' ) {
                _paq.push(['optUserOut']);
            }
            else {
                alert('Unable to connect to our Analytics software, you are probably running Ad-Block so there is nothing to do.');
            }

            event.preventDefault();
            this.update();
        });
    }

    update() {
        let element = this;

        if(Object.hasOwn(window, '_paq')) {
            _paq.push([function() {
                if( this.isUserOptedOut() ) {
                    element.innerText = '❌ You are currently opted out. Click here to opt in.';
                    element.dataset['mode'] = 'optin';
                }
                else {
                    element.innerText = '✓ You are currently opted in. Click here to opt out.';
                    element.dataset['mode'] = 'optout';
                }
            }]);
        }
        else {
            element.innerText = 'You are either running adblock or the Analytics system cannot be reached.';
            element.dataset['mode'] = 'unavail';
        }
    }
}

customElements.define('matomo-opt-inout', MatomoOptInOutLink, {extends: 'a'});
