/**
 * Please see README.md for usage information.
 */

// witchcraft from svelte issue - https://github.com/sveltejs/svelte/issues/2588
import { detach, insert, noop } from 'svelte/internal';

function createSlots(slots) {
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
					if (detaching && element.innerHTML) {
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
			let props = opts.defaults ? opts.defaults : {};
			let slots;
			props.$$scope = {};
			Array.from(this.attributes).forEach(attr => props[attr.name] = attr.value);
			props.$$scope = {};
			if (opts.shadow) {
				slots = this.getShadowSlots();
				let props = opts.defaults ? opts.defaults : {};
				props.$$scope = {};
				this.observer = new MutationObserver(this.processMutations.bind(this, { root: this._root, props }));
				this.observer.observe(this, { childList: true, subtree: true, attributes: false });
			} else {
				slots = this.getSlots();
			}
			this.slotcount = Object.keys(slots).length;
			props.$$slots = createSlots(slots);
			this.elem = new opts.component({ target: this._root, props });
		}

		disconnectedCallback() {
			if (this.observe) {
				this.observer.disconnect();
			}
			try {
				this.elem.$destroy();
			} catch(err) {
				// detroy svelte element when removed from dom
			}
		}

		unwrap(from) {
			let node = document.createDocumentFragment();
			while(from.firstChild) {
				node.appendChild(from.removeChild(from.firstChild));
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

		processMutations({ root, props }, mutations) {
			for(let mutation of mutations) {
				if (mutation.type == 'childList') {
					let slots = this.getShadowSlots();
					if (Object.keys(slots).length) {
						props.$$slots = createSlots(slots);
						this.elem.$set({ '$$slots': createSlots(slots) });
						// do full re-render on slot count change - needed for tabs component
						if (this.slotcount != Object.keys(slots).length) {
							Array.from(this.attributes).forEach(attr => props[attr.name] = attr.value);
							this.slotcount = Object.keys(slots).length;
							root.innerHTML = '';
							this.elem = new opts.component({ target: root, props });
						}
					}
				}
			}
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (this.elem && newValue != oldValue) {
				this.elem.$set({ [name]: newValue });
			}
		}
	}

	window.customElements.define(opts.tagname, Wrapper);
}
