# Installation Instructions

## 1. JS Library

Include the library in the body footer of `index.html`:

```html
<!-- FS Lightbox -->
<script src="/extras/fslightbox-basic/js/fslightbox.min.js"></script>
```

## 2. JS Initialization

In `/js/config.js` add the following to within the 
`document.addEventListener ('cms:route', event => {` block:

```js
// Initialize FS Lightbox on page load
refreshFsLightbox();
```

## 3. Page Template

Insert the following code into the page template (within `layouts/`) that you would
like to have the gallery available.  (For example `layouts/page.html`):

```html
<% if(data.gallery) { %>
    <div class="page-gallery">
        <% data.gallery.forEach(function(img) { %>
            <a 
                href="<%= img.href ?? img.src %>"
                data-fslightbox="gallery"
                title="<%= img.title %>"
            >
                <img src="<%= img.src %>" alt="<%= img.title %>"/>
            </a>
        <% }) %>
    </div>
<% } %>
```


## 4. CSS

Add the following code to `css/styles.css`:

```css
.page-gallery a {
    text-decoration: none;
}

.page-gallery img {
    max-width: 150px;
}
```

## 5. Add Gallery Items

In the Markdown page which will have the lightbox gallery, add the following to the front 
matter schema (edited with your data as necessary):

```yaml
gallery:
  - src: /images/image1.jpg
    title: Some image title
  - src: /images/image2.jpg
    title: Another image
  - src: /images/image3.jpg
    title: A third image, this list can be repeated as necessary
  - src: /images/videopreview.png
    title: Open a youtube video
    href: https://www.youtube.com/watch?v=xshEZzpS4CQ
```

If you prefer to use images relative to the page being rendered, the images do not
need to be absolutely resolved, (omit the leading `/`).
