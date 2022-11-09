/**
 * Automatically manages classes to the body based on the current page being viewed
 */
class PageBodyClass {
  constructor() {
    // Used to track dynamic classes when browsing between pages
    this.classes = [];

    document.addEventListener('cms:route', e => {
      let newClasses = [],
        remClasses = [];

      if (e.detail.type && e.detail.mode) {
        newClasses.push(['page', e.detail.type, e.detail.mode].join('-'));

        if (e.detail.search) {
          newClasses.push(['page', e.detail.type, 'search'].join('-'));
        }

        if (e.detail.tag) {
          newClasses.push(['page', e.detail.type, 'tag'].join('-'));
        }

        if (e.detail.file) {
          // Translate the file URL to a valid class name
          // Omit the web path prefix
          let fileTag = e.detail.file.permalink.substring(e.detail.cms.config.webpath.length);
          // Omit the file extension (.html)
          fileTag = fileTag.substring(0, fileTag.length - 5)
            // Replace slashes with dashes
            .replaceAll('/', '-')
            // Lowercase
            .toLowerCase();

          newClasses.push('page-' + fileTag);
        }
      }

      // Strip classes which are no longer needed on the body.
      // These are handled in bulk to minimize the number of CSS rendering required by the engine
      this.classes.forEach(c => {
        if (newClasses.indexOf(c) === -1) {
          remClasses.push(c);
        }
      });

      if (remClasses.length > 0) {
        document.body.classList.remove(...remClasses);
      }

      if (newClasses.length > 0) {
        document.body.classList.add(...newClasses);
      }

      // Remember the dynamic classes for the next pageload so they can be removed if necessary
      // otherwise browsing through different pages will simply keep adding more and more class tags.
      this.classes = newClasses;
    });
  }
}

export default PageBodyClass;