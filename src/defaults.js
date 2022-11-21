const defaults = {
  elementId: null,
  layoutDirectory: null,
  defaultView: null,
  errorLayout: null,
  mode: 'SERVER',
  github: null,
  types: [],
  frontMatterSeperator: /^---$/m,
  listAttributes: ['tags'],
  dateParser: /\d{4}-\d{2}(?:-\d{2})?/,
  dateFormat: (date) => {
    return [(date.getMonth() + 1), date.getDate(), date.getFullYear()].join('/');
  },
  extension: '.md',
  sort: undefined,
  markdownEngine: null,
  debug: false,
  messageClassName: 'cms-messages',
  webpath: '/',
  titleSearchResults: 'Search Results',
};

export default defaults;
