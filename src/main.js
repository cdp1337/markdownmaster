/**
 * CMS.js v2.0.0
 * Copyright 2018 Chris Diana
 * https://chrisdiana.github.io/cms.js
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
import CMS from './cms';
import PageBodyClass from './addons/pagebodyclass';
import Pagelist from './addons/pagelist';
import {marked} from 'marked';
import customRenderer from './addons/marked.renderer';

// Load addons
new PageBodyClass();
new Pagelist();

// Load marked addons
marked.use({ renderer: customRenderer });

// Make available in global space
window.marked = marked;

export default (options) => new CMS(window, options);
