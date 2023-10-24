# Installation Instructions

## 1. JS Library and CSS Files

Include one of the following in `index.html` within the `<head>` tag. 
Multiple theme options are included, so use which ever you want (dark/light/auto).

```html
<!-- PrismJS Light Theme-->
<link rel="stylesheet" href="/extras/prismjs/css/light.min.css">

<!-- OR -->

<!-- PrismJS Dark Theme-->
<link rel="stylesheet" href="/extras/prismjs/css/dark.min.css">

<!-- OR -->

<!-- PrismJS AUTO Theme-->
<link rel="stylesheet" href="/extras/prismjs/css/dark.min.css" media="(prefers-color-scheme:dark)">
<link rel="stylesheet" href="/extras/prismjs/css/light.min.css" media="(prefers-color-scheme:light)">
```

Include the following in `index.html` at the end of the `</body>` tag:

```html
<!-- Include PrismJS -->
<script src="/extras/prismjs/js/prism.min.js"></script>
```



## 2. JS Initialization

In `/js/config.js` add the following to within the
`document.addEventListener ('cms:route', event => {` block:

```js
// Initialize PrismJS
if (typeof(window.Prism) !== 'undefined') {
	// Enable line numbers, (remove to omit)
	document.body.classList.add('line-numbers');
	// Run the highlighter
	Prism.highlightAllUnder(document);
}
```
