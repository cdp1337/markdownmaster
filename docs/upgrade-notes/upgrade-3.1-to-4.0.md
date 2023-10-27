# Upgrade from 3.1 to 4.0

---

Tags and other lists in Markdown files now expect to be YAML-compatible lists

* `tags: blah, foo` => `tags: [blah, foo]`
* Dates listed as `date: 2023-01-01` will be rendered as Date objects,
  switch to `date: '2023-01-01'` (with quotes) for best results

---

Banners and images no longer auto-resolve as URLs, instead `src` or `href` needs to be
used in YAML data

* `banner: somefile.jpg` => `banner: { src: somefile.jpg }`

---

Moved some plugins to built-in

* `site.enablePlugin(['pagelist'])` => N/A (built-in)
* `site.enablePlugin(['search'])` => N/A (built-in)
* `site.enablePlugin(['remarkable'])` NEW RENDERER

---