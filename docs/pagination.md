---
title: Listing Pagination
author: Charlie Powell
tags: [Howto, HTML, Authoring]
---

Pagination is not enabled by default, but is available from within listing layouts.

## Enable Pagination

Add a line in the appropriate list layout with the requested number of results-per-page.
In this example, we will set the number of pages to 10.

```html
<% data.paginate(10) %>
```

## Display Pager

Pages without a pager is less than beneficial, so adding a pager somewhere
on the listing page would make sense.  There is no system pager which allows
you to customize your own.

Renders `« Page 2 of 5 »`

```html
<% if (data.totalPages > 1) { %>
    <!-- Only render if there is more than 1 page, as available from `totalPages` -->

    <% if (data.page > 1) { %>
        <!-- If current page is > 1, display previous -->
        <a href="<%= data.getPreviousPageUrl() %>" title="Previous Page">
            &laquo;
        </a>
    <% } %>

    <!-- Display current page and total number of pages -->
    Page <%= data.page %> of <%= data.totalPages %>

    <% if (data.page < data.totalPages) { %>
        <!-- If current page is < last page, display next -->
        <a href="<%= data.getNextPageUrl() %>" title="Next Page">
            &raquo;
        </a>
    <% } %>
<% } %>
```

Another option is to display each page.

Renders `1 2 3 4 5` (with current page being a span)

```html

<% if (data.totalPages > 1) { %>
    <!-- Only render if there is more than 1 page, as available from `totalPages` -->

    <% for(let i = 1; i <= data.totalPages; i++) { %>
        <!-- Display 1 ... total with a link -->
        <% if (data.page !== i) { %>
            <a href="<%= data.getPageUrl(i) %>" title="Go to page <%= i %>">
                <%= i %>
            </a>
        <% } else { %>
            <span>
                <%= i %>
            </span>
        <% } %>
    <% } %>
<% } %>
```
