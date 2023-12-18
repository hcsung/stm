# Simple Task Manager

[Demo](https://hcsung.com/stm/)

This is a no-database task manager that stores all your data in the browser locally with `localStorage` API in JavaScript (in plain text, without encryption), so it's relatively safe and private.

In gengeral, each site should have its own unique local-storage area so the data stores in it shouldn't be accessed by other sites, but there are no guarantees about that behavior ([Window: localStorage property](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)). Consider using this tool in a trusted environment if your data is confidential.
