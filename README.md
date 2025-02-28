<img src="svelte-tag.svg" width="150">

# Svelte-tag

![Node.js Package](https://github.com/crisward/svelte-tag/workflows/Node.js%20Package/badge.svg)

A web component wrapper for Svelte. Embeds your Svelte app or components inside custom elements using the light DOM _or_
shadow DOM. Automatically forwards all slots and attributes to your Svelte app.

## Why?

Svelte already allows you to create web components. However, it has a couple of flaws:

* All of your nested components have to be web components as the render flag applies to everything.
* You have to use shadow DOM.
* You have to deal with lots of bugs.
* You loose many features Svelte has for inter-component communication.

## How do I use it?

For svelte 3 & 4 use version 1 of the tag, for svelte 5, use version 5. 

```bash
# eg svelte 4
npm install svelte-tag@1

# eg svelte 5
npm install svelte-tag@5
```

```javascript
import SvelteTag from "svelte-tag"
import App from "your-app.svelte"

new SvelteTag({
	component: App,
	tagname: "hello-world",
	href: "/your/stylesheet.css",
	attributes: ["name"]
})
```
Now anywhere you use the `<hello-world>` custom element tag, you'll get a Svelte app. Note that you must set your tag
name to [anything containing a dash](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements).

```html
<hello-world name="Cris"></hello-world>
```


| Option     | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| component  | Your Svelte component                                              |
| tagname    | The webcomponent tag-name, must contain a dash                     |
| href       | link to your stylesheet - optional, but required with shadow dom   |
| attributes | array -  attributes you like your tag to forward to your component |
| shadow     | boolean - should this component use shadow dom                     |


## Support

Be aware, I don't have a lot of time to support this package. I've mainly open sourced it
because I've noticed lots of people with similar use cases. If you open an issue I'll respond
but it may not be super quick. I'll accept pull requests to fix any issues, but I'd prefer
not to add additional functionality.

## Note:

The svelte 5 version was only recently created and has had significant changes to fall in-line with new apis. Please specify which
version you're using if you encounter any issues.

## Attribution

Logo - Rich Harris, MIT <http://opensource.org/licenses/mit-license.php>, via Wikimedia Commons
