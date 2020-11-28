# Svelte-tag

A webcomponet wrapper for svelte.

Be aware, I don't have a lot of time to support this package. I've mainly open sourced it
because I've noticed lots of people with similar use cases.

## Why?

Svelte already allows you to create webcomponents. However it has a couple of flaws:
* All of your nested components have to be webcomponents as the render flag applies to everything.
* You have to use shadow dom.
* You have to deal with lots of bugs.
* You loose many features svelte has for inter-component communication.

This solves this by just embedding your app inside a single component.

## How do I use it?

```javascript
import component from "svelte-tag"
import App from "your-app.svelte"
new component({component:App,tagname:"hello-world",href="/your/stylesheet.css",attributes:["name"]})
```

Now anywhere you use the `<hello-world>` tag you'll get a svelte app. Obviously you can set 
your tag name to anything.

## Todo

- [ ] Upload Tests
- [ ] Setup CI 