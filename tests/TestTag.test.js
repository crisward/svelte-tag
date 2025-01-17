import { describe, beforeAll, afterEach, it, expect } from 'vitest';
import { tick } from 'svelte';
import TestTag from './TestTag.svelte'
import svelteTag from '../index.js'

function removeComments(str){
  return str.replace(/<!--.*?-->/g, '')
}

// See vite.config.js for configuration details.

let el = null

describe('Component Wrapper shadow false', () => {

  beforeAll(() => {
    svelteTag({ component: TestTag, tagname: 'test-tag', shadow: false })
  })

  afterEach(() => {
    el.remove()
  })

  it('without slots', async () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag></test-tag>`
    document.body.appendChild(el)
    expect(removeComments(el.innerHTML)).toBe('<test-tag><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></test-tag>')
  })

  it('with just default slot', () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag>BOOM!</test-tag>`
    document.body.appendChild(el)
    expect(removeComments(el.innerHTML)).toBe('<test-tag><h1>Main H1</h1> <div class="content">BOOM! <div>Inner Default</div></div></test-tag>')
  })

  it('with just inner slot', () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag><div slot="inner">HERE</div></test-tag>`
    document.body.appendChild(el)
    expect(removeComments(el.innerHTML)).toBe('<test-tag><h1>Main H1</h1> <div class="content">Main Default <div>HERE</div></div></test-tag>')
  })

  it('both slots', () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag>BOOM!<div slot="inner">HERE</div></test-tag>`
    document.body.appendChild(el)
    expect(removeComments(el.innerHTML)).toBe('<test-tag><h1>Main H1</h1> <div class="content">BOOM! <div>HERE</div></div></test-tag>')
  })

  it('nested tags', () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag><h2>Nested</h2><div slot="inner">HERE</div></test-tag>`
    document.body.appendChild(el)
    expect(removeComments(el.innerHTML)).toBe('<test-tag><h1>Main H1</h1> <div class="content"><h2>Nested</h2> <div>HERE</div></div></test-tag>')
  })

  it('Unknown slot gets ignored', () => {
    let tmp = console.warn
    console.warn = function() {
    }
    el = document.createElement('div')
    el.innerHTML = `<test-tag><div slot="unknown">HERE</div></test-tag>`
    document.body.appendChild(el)
    expect(removeComments(el.innerHTML)).toBe('<test-tag><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></test-tag>')
    console.warn = tmp
  })
})


describe('Component Wrapper shadow true', () => {

  beforeAll(() => {
    svelteTag({ component: TestTag, tagname: 'test-shad', shadow: true })
  })

  it('without slots', () => {
    el = document.createElement('div')
    el.innerHTML = `<test-shad></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(removeComments(shadowhtml)).toBe('<div><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></div>')
  })

  it('with just default slot', () => {
    el = document.createElement('div')
    el.innerHTML = `<test-shad>Boom</test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(removeComments(shadowhtml)).toBe('<div><h1>Main H1</h1> <div class="content"><slot></slot> <div>Inner Default</div></div></div>')
    expect(el.querySelector('test-shad').innerHTML).toBe('Boom')
  })

  it('with just inner slot', () => {
    el = document.createElement('div')
    el.innerHTML = `<test-shad><div slot="inner">HERE</div></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(removeComments(shadowhtml)).toBe('<div><h1>Main H1</h1> <div class="content">Main Default <div><slot name="inner"></slot></div></div></div>')
  })

  it('both slots', () => {
    el = document.createElement('div')
    el.innerHTML = `<test-shad>BOOM!<div slot="inner">HERE</div></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(removeComments(shadowhtml)).toBe('<div><h1>Main H1</h1> <div class="content"><slot></slot> <div><slot name="inner"></slot></div></div></div>')
  })

  it('Unknown slot gets ignored', () => {
    let tmp = console.warn
    console.warn = function() {
    }
    el = document.createElement('div')
    el.innerHTML = `<test-shad><div slot="unknown">HERE</div></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(removeComments(shadowhtml)).toBe('<div><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></div>')
    console.warn = tmp
  })

  it('dynamically adding content to component', async () => {
    el = document.createElement('div')
    el.innerHTML = `<test-shad></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = document.querySelector('test-shad').shadowRoot.innerHTML
    expect(removeComments(shadowhtml)).toBe('<div><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></div>')
    document.querySelector('test-shad').innerHTML = 'New Content'
    await tick()
    shadowhtml = document.querySelector('test-shad').shadowRoot.innerHTML
    expect(removeComments(shadowhtml)).toBe('<div><h1>Main H1</h1> <div class="content"><slot></slot> <div>Inner Default</div></div></div>')
  })

})
