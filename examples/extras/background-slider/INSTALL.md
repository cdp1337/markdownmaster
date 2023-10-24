# Installation Instructions

## 1. JS Library

Include the library in the body footer of `index.html`:

```html
<!-- Background Slider -->
<script src="/extras/background-slider/js/background-slider.js"></script>
```

## 2. JS Initialization

In `/js/config.js` add the following to within the
`document.addEventListener ('cms:route', event => {` block:

```js
// Initialize background slider on page load
// Set the selector to the element containing the background images
startBackgroundSlides('.page-backgrounds');
```

## 3. Page Template

Insert the following code into the page template (within `layouts/`) that you would 
like to have the slider available.  (For example `layouts/page.html`):

```html
<% if( data.backgrounds ){ %>
    <div class="page-backgrounds">
        <% data.backgrounds.forEach(function(img) { %>
            <img src="<%= img %>"/>
        <% }) %>
    </div>
<% } %>
```



## 4. CSS

Add the following code to `css/styles.css`:

```css
.page-backgrounds {
    position: fixed;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    filter: blur(2px);
    -webkit-filter: blur(2px);
}

.page-backgrounds img {
    display: block;
    object-fit: cover;
    width: 100%;
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 2s ease-in-out;
}

.page-backgrounds img.active {
    opacity: 0.7;
}
```


## 5. Content

In the Markdown page which will have the background slider, add the following to the front
matter:

```yaml
backgrounds:
  - /images/background1.jpg
  - /images/background2.jpg
  - /images/background3.jpg
  - /images/background4.jpg
  - /images/background5.jpg
```