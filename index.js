/*
Usage - convert svelte app to web component
import component from "svelte-tag"
new component({component:App,tagname:"hello-world",href="/your/stylesheet.css",attributes:["name"]})
*/

// witchcraft from svelte issue - https://github.com/sveltejs/svelte/issues/2588
import { detach, insert, noop } from 'svelte/internal';

// TODO: Really what we're doing here is is creating a Svelte slot, not a slot per se, or: A slot object that is consumed
//  by Svelte itself in the `$$slots` prop. So, IMHO this should be refactored to `createSvelteSlots` to reduce ambiguity
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

      console.log(this.tagName, 'constructor', this); // TODO: WIP: Remove/abstract once completed.
    }

    static get observedAttributes() {
      return opts.attributes || [];
    }

    connectedCallback() {
      console.log(this.tagName, 'connectedCallback', this); // TODO: WIP: Remove/abstract once completed.
      let props = opts.defaults ? opts.defaults : {};
      this.slotEls = {}; // Retains original slot elements (prior to processing and handing off to Svelte)

      props.$$scope = {};
      Array.from(this.attributes).forEach(attr => props[attr.name] = attr.value);
      //props.$$scope = {};
      if (opts.shadow) {
        this.slotEls = this.getShadowSlots();
        //let props = opts.defaults ? opts.defaults : {};
        //props.$$scope = {};
        this.observer = new MutationObserver(this.processMutations.bind(this, { root: this._root, props }));
        this.observer.observe(this, { childList: true, subtree: true, attributes: false });
      } else {

        // TODO: WIP: Use mutation observer for light DOM as well. This will facilitate better handling of slots
        //  during initialization. Must be enabled only during document.readyState === 'loading' and disengaged
        //  prior to instantiation of the Svelte component. That way, we can use IIFE (to reduce CLS on page
        //  load) and still ensure lots are accounted for, as connectedCallback will run DURING parsing and
        //  before all slots are actually known. This will require refactor/reuse of existing already duplicated code.
        if (document.readyState === 'loading') {
          let testObserver = new MutationObserver((mutations) => {
            // TODO: Filter out slot specific changes (like processMutations does right now).
            console.log(this.tagName, 'LIGHT DOM mutations', mutations);
          });
          testObserver.observe(this, { childList: true, subtree: true, attributes: false });
          document.addEventListener('DOMContentLoaded', () => {
            // TODO: Prevent any further observations/mutations and proceed with initialization. We must wait
            //  until now to do this because we must also mutate the DOM (including slots) since we're in
            //  the "light" DOM directly under the element tag instead of the shadow DOM.
            testObserver.disconnect();
          });
        }

        this.slotEls = this.getSlots();
      }
      this.slotcount = Object.keys(this.slotEls).length;
      props.$$slots = createSlots(this.slotEls);
      this.elem = new opts.component({ target: this._root, props });
      console.log(this.tagName, 'slotEls', this.slotEls);
    }

    disconnectedCallback() {
      console.log(this.tagName, 'disconnectedCallback', this); // TODO: WIP: Remove/abstract once completed.
      if (this.observer) {
        this.observer.disconnect();
      }

      // Double check that element has been initialized already. This could happen in case connectedCallback (which
      // is async) hasn't fully completed yet.
      if (this.elem) {
        try {
          // destroy svelte element when removed from dom
          this.elem.$destroy();
        } catch(err) {
          console.error(`Error destroying Svelte component in '${this.tagName}'s disconnectedCallback(): ${err}`);
        }
      }

      if (!opts.shadow) {
        // Go through originally removed slots and restore back to the custom element. This is necessary in case
        // we're just being appended elsewhere in the DOM (likely if we're nested under another custom element
        // that initializes after this custom element, thus causing *another* round of construct/connectedCallback
        // on this one).
        for(let slotName in this.slotEls) {
          let slotEl = this.slotEls[slotName];
          this.appendChild(slotEl);
        }
      }
    }

    // Carefully "unwraps" the custom element tag itself from its default slot content (particularly if that content
    // is just a text node). Only used when not using shadow root.
    unwrap(from) {
      let node = document.createDocumentFragment();
      while(from.firstChild) {
        node.appendChild(from.firstChild);
      }
      return node;
    }

    /**
     * Traverses DOM to find the first custom element that the provided slot belongs to.
     *
     * @param {Element} slot
     * @returns {HTMLElement|null}
     */
    findSlotParent(slot) {
      let parentEl = slot.parentElement;
      while(parentEl) {
        if (parentEl.tagName.indexOf('-') !== -1) return parentEl;
        parentEl = parentEl.parentElement;
      }
      return null;
    }

    getSlots() {
      let slots = {};
      let hasNamedSlots = false;

      // Look for named slots below this element. IMPORTANT: This may return slots nexted deeper (see check in forEach below).
      const queryNamedSlots = this.querySelectorAll('[slot]');
      queryNamedSlots.forEach(candidate => {

        // Traverse parents and find first custom element and ensure its tag name matches this one. That way, we
        // can ensure we aren't inadvertently getting nested slots that apply to other custom elements.
        let slotParent = this.findSlotParent(candidate);
        if (slotParent === null) return;
        if (slotParent.tagName !== this.tagName) return;

        slots[candidate.slot] = candidate;
        this.removeChild(candidate);
        hasNamedSlots = true;
      });

      // Default slots are allowed alongside named slots (https://github.com/sveltejs/svelte/issues/4561), however
      // we shouldn't be setting default slots *with* named slots if the remaining content isn't wrapped/declared
      // somehow, effectively meaning that you'd need to also define a slot="default", thus making these two
      // sections mutually exclusive. This check also helps ensure we don't unnecessarily set a default slot for
      // components that don't expect it and ensures developers keep their code clean (i.e. don't introduce
      // whitespace in between tags that don't have default slots).
      if (!hasNamedSlots && this.innerHTML.length !== 0) {
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
      console.log(this.tagName, 'SHADOW DOM mutations', mutations); // TODO: WIP: Remove/abstract once completed.
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
