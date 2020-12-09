<img src="svelte-tag.svg" width="150">

# Svelte-tag

![Node.js Package](https://github.com/crisward/svelte-tag/workflows/Node.js%20Package/badge.svg)

A webcomponet wrapper for svelte.

This embeds your svelte app inside a single component.
It also forwards all slots and attributes into your svelte app.

## Why?

Svelte already allows you to create webcomponents. However it has a couple of flaws:

* All of your nested components have to be webcomponents as the render flag applies to everything.
* You have to use shadow dom.
* You have to deal with lots of bugs.
* You loose many features svelte has for inter-component communication.

## How do I use it?

```bash
npm install svelte-tag
```

```javascript
import component from "svelte-tag"
import App from "your-app.svelte"
new component({component:App,tagname:"hello-world",href="/your/stylesheet.css",attributes:["name"]})
```
Now anywhere you use the `<hello-world>` tag you'll get a svelte app. Obviously you can set 
your tag name to anything containing a dash.

```html 
<hello-world name="Cris"></hello-world>
```


| Option     | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| component  | Your svelte component                                              |
| tagname    | The webcomponent tag-name, must contain a dash                     |
| href       | link to your stylesheet - optional, but required with shadow dom   |
| attributes | array -  attributes you like your tag to forward to your component |
| shadow     | boolean - should this component use shadow dom                     |

## Todo

- [x] Upload Tests
- [x] Setup CI 

## Support

Be aware, I don't have a lot of time to support this package. I've mainly open sourced it
because I've noticed lots of people with similar use cases. If you open an issue I'll respond
but it may not be super quick. I'll accept pull requests to fix any issues, but I'd prefer
not to add additional functionality.

## Attribution

Logo - Rich Harris, MIT <http://opensource.org/licenses/mit-license.php>, via Wikimedia Commons
