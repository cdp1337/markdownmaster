# Installation Instructions

## 1. JS Library

Include the Matomo init snippet in `index.html` within the `<head>` tag.

Take care to comment out the initial `trackPageView` as this will be handled within 
`cms:route`.

```html
<!-- Matomo -->
<script>
    var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    //_paq.push(['trackPageView']); // Handled within the CMS
    _paq.push(['enableLinkTracking']);
    (function() {
        var u="//YOURTRACKING.DOMAIN/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', 'YOUR-MATOMO-SITE-ID']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
</script>
<!-- End Matomo Code -->
```

Include the following in `index.html` at the end of the `</body>` tag:

```html
<!-- Include Matomo extra logic -->
<script src="/extras/matomo/js/matomo.js"></script>
```

## 2. Privacy Policy Page

An example privacy policy page has been created within `pages/privacy-no-pii.md`.
Feel free to copy this to your `pages/` directory and edit as needed.
