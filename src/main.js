/**
 * CMS.js v2.0.0
 * Copyright 2018 Chris Diana
 * https://chrisdiana.github.io/cms.js
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
// Import base CMS
import CMS from './cms';

// Import marked and marked plugins
import {marked} from 'marked';
import customRenderer from './addons/marked.renderer';

// Import CMS plugins
import MastodonShare from './addons/mastodon_share';
import PageBodyClass from './addons/pagebodyclass';
import Pagelist from './addons/pagelist';
import Search from './addons/search';


// Load marked addons
marked.use({ renderer: customRenderer });

// Make available in global space
window.marked = marked;

// Load addons
let systemPlugins = {
  mastodon_share: new MastodonShare(),
  pagebodyclass: new PageBodyClass(),
  pagelist: new Pagelist(),
  search: new Search()
};

export default (options) => new CMS(window, options, systemPlugins);
