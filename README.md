<img src="logo/svelte-retag.svg" width="348">

# svelte-retag

![Node.js Package](https://github.com/patricknelson/svelte-retag/workflows/Node.js%20Package/badge.svg)

A web component wrapper for Svelte. Embeds your Svelte app or components inside custom elements using the light DOM _or_
shadow DOM. Automatically forwards all slots and attributes to your Svelte app.

## Why?

Svelte 3 already allows you to compile your components to custom elements. However, it has a couple of flaws:

* All of your nested components have to be implemented as custom elements, since the render flag applies to everything.
* You have to use shadow DOM.
* You have to deal with lots of bugs.
* You loose many features Svelte has for inter-component communication.

## Core features

* **"Light" DOM:** Allows you to render your Svelte 3 components in the light DOM as usual, taking full advantage of
  global styles while still maintaining encapsulation of your component specific styles, utilizing web fonts and so on.
* **Flexibility:** Pick and choose the only components that need to be defined as custom element tags. Use your
  component normally within Svelte (e.g. `<ExampleComponent />`) and as a custom element outside of Svelte (
  e.g. `<example-component></example-component>`).
* **Portability:** Freedom to utilize your Svelte components in legacy applications that cannot be fully migrated to
  Svelte.
* **Vite HMR:** Compatible with Vite's HMR and avoids the infamous
  error `Uncaught DOMException: Failed to execute 'define' on 'CustomElementRegistry': the name "example-component" has already been used with this registry`

## How do I use it?

```bash
npm install svelte-retag
```

```javascript
import SvelteRetag from 'svelte-retag'
import HelloWorld from 'hello-world.svelte'

new SvelteRetag({
	component: HelloWorld,
	tagname: 'hello-world',

	// Optional:
	attributes: ['greeting', 'name'],
	shadow: false,
	href: '/your/stylesheet.css', // Only necessary if shadow is true
})
```

Now anywhere you use the `<hello-world>` custom element tag, you'll get a Svelte app. Note that you must set your tag
name
to [anything containing a dash](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements).

```html
<hello-world name="Cris"></hello-world>
```

| Option     | Default      | Description                                                                                                                                       |
|------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| component  | _(required)_ | The constructor for your Svelte component (from `import`)                                                                                         |
| tagname    | _(required)_ | The custom element tag name to use ([must contain a dash](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)) |
| attributes | `[]`         | array -  List of attributes to reactively forward to your component (does not reflect changes inside the component)                               |
| shadow     | `false`      | boolean - Should this component use shadow dom                                                                                                    |
| href       | `''`         | link to your stylesheet - Allows you to ensure your styles are included in the shadow DOM (thus only required when `shadow` is set to `true`).    |

**Note:** For portability, the `svelte-retag` API is backward compatible
with [`svelte-tag@^1.0.0`](https://github.com/crisward/svelte-tag).

## To Do

On the immediate horizon:

- [x] Migrate to Vitest for unit testing
- [ ] Update logo
- [ ] Fix nested slot support (see https://github.com/crisward/svelte-tag/issues/7)
- [ ] Support Lit-style lowercase props (see https://github.com/crisward/svelte-tag/issues/16)
- [ ] Better support for slots during early execution of IIFE compiled packages (i.e. use `MutationObserver` to watch
  for light DOM slots during initial parsing)
- [ ] Support context (see https://github.com/crisward/svelte-tag/issues/8)

## Support & Contribution

**Please Note:** The API for this library is intentionally minimal. However, if you have any suggestions or any bugs
at all, please be sure to [open an issue](https://github.com/patricknelson/svelte-retag/issues) first. If you'd like
to contribute, please feel free to open a PR, **however**, please make sure you attach it to an existing issue to ensure
that discussion regarding your pull request isn't lost (in case it cannot be merged for whatever reason).

## Attribution

* Logo - Rich Harris, MIT <http://opensource.org/licenses/mit-license.php>, via Wikimedia Commons
* `svelte-tag` - Chris Ward (@crisward). Forked and modified from https://github.com/crisward/svelte-tag
