import testtag from "/testtag.svelte";
import component from "/src/index.js"
import {expect} from 'chai';
import {fireEvent} from "@testing-library/svelte"
import {waitFor,findByText,findByTitle,findByLabelText} from "@testing-library/dom"


const pause = async (ms=10)=>{
  return new Promise((resolve)=>{
    setTimeout(resolve,ms)
  })
}

var el = null

describe("Component Wrapper shadow false", () => {

  before(()=>{
    component({component:testtag,tagname:"test-tag",shadow:false})
  })

  afterEach(()=>{
    el.remove()
  })


  it("without slots", async () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag></test-tag>`
    document.body.appendChild(el)
    expect(el.innerHTML).to.equal('<test-tag><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></test-tag>')
  })

  it("with just default slot", () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag>BOOM!</test-tag>`
    document.body.appendChild(el)
    expect(el.innerHTML).to.equal('<test-tag><h1>Main H1</h1> <div class="content">BOOM! <div>Inner Default</div></div></test-tag>')
  })

  it("with just inner slot", () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag><div slot="inner">HERE</div></test-tag>`
    document.body.appendChild(el)
    expect(el.innerHTML).to.equal('<test-tag><h1>Main H1</h1> <div class="content">Main Default <div>HERE</div></div></test-tag>')
  })

  it("both slots", () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag>BOOM!<div slot="inner">HERE</div></test-tag>`
    document.body.appendChild(el)
    expect(el.innerHTML).to.equal('<test-tag><h1>Main H1</h1> <div class="content">BOOM! <div>HERE</div></div></test-tag>')
  })

  it("nested tags", () => {
    el = document.createElement('div')
    el.innerHTML = `<test-tag><h2>Nested</h2><div slot="inner">HERE</div></test-tag>`
    document.body.appendChild(el)
    expect(el.innerHTML).to.equal('<test-tag><h1>Main H1</h1> <div class="content"><h2>Nested</h2> <div>HERE</div></div></test-tag>')
  })

  it("Unknown slot gets ignored", () => {
    let tmp = console.warn
    console.warn = function(){}
    el = document.createElement('div')
    el.innerHTML = `<test-tag><div slot="unknown">HERE</div></test-tag>`
    document.body.appendChild(el)
    expect(el.innerHTML).to.equal('<test-tag><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></test-tag>')
    console.warn = tmp
  })

})

describe("Component Wrapper shadow true", () => {

  before(()=>{
    component({component:testtag,tagname:"test-shad",shadow:true})
  })


  it("without slots", () => {
    el = document.createElement('div')
    el.innerHTML = `<test-shad></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(shadowhtml).to.equal('<div><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></div>')
  })

  it("with just default slot", () => {
    el = document.createElement('div')
    el.innerHTML = `<test-shad>Boom</test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(shadowhtml).to.equal('<div><h1>Main H1</h1> <div class="content"><slot></slot> <div>Inner Default</div></div></div>')
    expect(el.querySelector('test-shad').innerHTML).to.equal("Boom")
  })

  it("with just inner slot", () => {
    el = document.createElement('div')
    el.innerHTML = `<test-shad><div slot="inner">HERE</div></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(shadowhtml).to.equal('<div><h1>Main H1</h1> <div class="content">Main Default <div><slot name="inner"></slot></div></div></div>')
  })

  it("both slots", () => {
    el = document.createElement('div')
    el.innerHTML = `<test-shad>BOOM!<div slot="inner">HERE</div></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(shadowhtml).to.equal('<div><h1>Main H1</h1> <div class="content"><slot></slot> <div><slot name="inner"></slot></div></div></div>')
  })

  it("Unknown slot gets ignored", () => {
    let tmp = console.warn
    console.warn = function(){}
    el = document.createElement('div')
    el.innerHTML = `<test-shad><div slot="unknown">HERE</div></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = el.querySelector('test-shad').shadowRoot.innerHTML
    expect(shadowhtml).to.equal('<div><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></div>')
    console.warn = tmp
  })

  it("dynamically adding content to component",async()=>{
    el = document.createElement('div')
    el.innerHTML = `<test-shad></test-shad>`
    document.body.appendChild(el)
    let shadowhtml = document.querySelector('test-shad').shadowRoot.innerHTML
    expect(shadowhtml).to.equal('<div><h1>Main H1</h1> <div class="content">Main Default <div>Inner Default</div></div></div>')
    document.querySelector('test-shad').innerHTML = "New Content"
    await pause()
    shadowhtml = document.querySelector('test-shad').shadowRoot.innerHTML
    expect(shadowhtml).to.equal('<div><h1>Main H1</h1> <div class="content"><slot></slot> <div>Inner Default</div></div></div>')
  })
  
})

