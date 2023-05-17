# Extra - PrismJS Syntax Highlighter

Prism is a lightweight, extensible syntax highlighter, 
built with modern web standards in mind. It’s used in millions of websites, 
including some of those you visit daily.

## Installation

To install PrismJS, add the following code snippets to your `index.html`.
Multiple theme options are included, so use which ever you want (dark/light/auto).

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <!-- ... -->
        
        <!-- PrismJS Light Theme-->
        <link rel="stylesheet" href="/extras/prismjs/css/light.min.css">
        
        <!-- OR -->
        
        <!-- PrismJS Dark Theme-->
        <link rel="stylesheet" href="/extras/prismjs/css/dark.min.css">

        <!-- OR -->
        
        <!-- PrismJS AUTO Theme-->
        <link rel="stylesheet" href="/extras/prismjs/css/dark.min.css" media="(prefers-color-scheme:dark)">
        <link rel="stylesheet" href="/extras/prismjs/css/light.min.css" media="(prefers-color-scheme:light)">
    </head>
    <body>
        <!-- ... -->
        
        <!-- PrismJS -->
        <script src="/extras/prismjs/js/prism.min.js"></script>
        <script>
        document.addEventListener('cms:route', () => {
            if (typeof(window.Prism) !== 'undefined') {
                document.body.classList.add('line-numbers'); // Enable line numbers, remove to omit
                Prism.highlightAllUnder(document);
            }
        });
        </script>
        <!-- END PrismJS -->
    </body>
</html>
```



* PrismJS 1.29.0 - https://prismjs.com
* License - MIT License