/**
 * Please see README.md for usage information.
 *
 * TODO: Better JSDoc type hinting for arguments and return types
 */

import { detach, insert, noop } from 'svelte/internal';


/**
 * Creates an object where each property represents the slot name and each value represents a Svelte-specific slot
 * object containing the lifecycle hooks for each slot. This wraps our slot elements and is passed to Svelte itself.
 *
 * Much of this witchcraft is from svelte issue - https://github.com/sveltejs/svelte/issues/2588
 */
function createSvelteSlots(slots) {
	const svelteSlots = {};
	for(const slotName in slots) {
		svelteSlots[slotName] = [createSlotFn(slots[slotName])];
	}

	function createSlotFn(element) {
		return function() {
			return {
				c: noop,
				m: function mount(target, anchor) {
					insert(target, element.cloneNode(true), anchor);
				},
				d: function destroy(detaching) {
					if (detaching) {
						detach(element);
					}
				},
				l: noop,
			};
		};
	}

	return svelteSlots;
}

export default function(opts) {
	class Wrapper extends HTMLElement {
		constructor() {
			super();
			this.slotcount = 0;
			let root = opts.shadow ? this.attachShadow({ mode: 'open' }) : this;
			// link generated style
			if (opts.href && opts.shadow) {
				let link = document.createElement('link');
				link.setAttribute('href', opts.href);
				link.setAttribute('rel', 'stylesheet');
				root.appendChild(link);
			}
			if (opts.shadow) {
				this._root = document.createElement('div');
				root.appendChild(this._root);
			} else {
				this._root = root;
			}
		}

		static get observedAttributes() {
			return opts.attributes || [];
		}

		connectedCallback() {
			// Props passed to Svelte component constructor.
			let props = {
				$$scope: {}
				// $$slots: initialized below
				// All other props are pulled from element attributes (see below).
			};

			// Populate custom element attributes into the props object.
			// TODO: Inspect component and normalize to lowercase for Lit-style props (https://github.com/crisward/svelte-tag/issues/16)
			let slots;
			Array.from(this.attributes).forEach(attr => props[attr.name] = attr.value);

			if (opts.shadow) {
				slots = this.getShadowSlots();
				this.observer = new MutationObserver(this.processMutations.bind(this, { root: this._root, props }));
				this.observer.observe(this, { childList: true, subtree: true, attributes: false });
			} else {
				slots = this.getSlots();
			}
			this.slotcount = Object.keys(slots).length;
			props.$$slots = createSvelteSlots(slots);

			this.elem = new opts.component({ target: this._root, props });
		}

		disconnectedCallback() {
			if (this.observer) {
				this.observer.disconnect();
			}

			// Double check that element has been initialized already. This could happen in case connectedCallback (which
			// is async) hasn't fully completed yet.
			if (this.elem) {
				try {
					// destroy svelte element when removed from domn
					this.elem.$destroy();
				} catch(err) {
					console.error(`Error destroying Svelte component in '${this.tagName}'s disconnectedCallback(): ${err}`);
				}
			}
		}

		/**
		 * Carefully "unwraps" the custom element tag itself from its default slot content (particularly if that content
		 * is just a text node). Only used when not using shadow root.
		 *
		 * @param {HTMLElement} from
		 *
		 * @returns {DocumentFragment}
		 */
		unwrap(from) {
			let node = document.createDocumentFragment();
			while(from.firstChild) {
				node.appendChild(from.firstChild);
			}
			return node;
		}

		getSlots() {
			const namedSlots = this.querySelectorAll('[slot]');
			let slots = {};
			namedSlots.forEach(n => {
				slots[n.slot] = n;
				this.removeChild(n);
			});
			if (this.innerHTML.length) {
				slots.default = this.unwrap(this);
				this.innerHTML = '';
			}
			return slots;
		}

		getShadowSlots() {
			const namedSlots = this.querySelectorAll('[slot]');
			let slots = {};
			let htmlLength = this.innerHTML.length;
			namedSlots.forEach(n => {
				slots[n.slot] = document.createElement('slot');
				slots[n.slot].setAttribute('name', n.slot);
				htmlLength -= n.outerHTML.length;
			});
			if (htmlLength > 0) {
				slots.default = document.createElement('slot');
			}
			return slots;
		}

		// TODO: Primarily used only for shadow DOM, however, MutationObserver would likely also be useful for IIFE-based
		//  light DOM, since that is not deferred and technically slots will be added after the wrapping tag's connectedCallback()
		//  during initial browser parsing and before the closing tag is encountered.
		processMutations({ root, props }, mutations) {
			for(let mutation of mutations) {
				if (mutation.type === 'childList') {
					let slots = this.getShadowSlots();
					if (Object.keys(slots).length) {
						props.$$slots = createSvelteSlots(slots);
						this.elem.$set({ '$$slots': createSvelteSlots(slots) });
						// do full re-render on slot count change - needed for tabs component
						if (this.slotcount !== Object.keys(slots).length) {
							Array.from(this.attributes).forEach(attr => props[attr.name] = attr.value); // TODO: Redundant, repeated on connectedCallback().
							this.slotcount = Object.keys(slots).length;
							root.innerHTML = '';
							this.elem = new opts.component({ target: root, props });
						}
					}
				}
			}
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (this.elem && newValue !== oldValue) {
				this.elem.$set({ [name]: newValue });
			}
		}
	}

	window.customElements.define(opts.tagname, Wrapper);
}
