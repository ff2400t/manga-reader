import { LitElement, PropertyValueMap, PropertyValues, css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';
// import { Ref, createRef, ref } from 'lit/directives/ref.js';

type Mode = 'horizontal' | 'vertical' | 'double-page' | 'double-page-odd';
type ReadingDirection = 'rtl' | 'ltr'
type ScaleType = 'fitWidth' | 'fitHeight';

/**
 * Manga Reader component
 */
@customElement('manga-reader')
export class MangaReader extends LitElement {

  @property()
  pages: string[] = [];

  @property()
  mode: Mode = 'horizontal'

  @property()
  dir: ReadingDirection = 'ltr'

  @property({ attribute: 'current-page', type: Number })
  currentPage: number = 1;

  @property()
  scaleType: ScaleType = 'fitHeight'

  /**
   * No of images to preload after the current Image
   * The default is to preload the next page
   */
  @property()
  preloadNo: number = 1;

  @query('#container', true)
  container!: HTMLDivElement;

  @state()
  doublePagedArr: Array<{ url: string, index: number }[]> = []

  /**
   * Amount to scroll during a click event in vertical Mode
   * Number between 0 and 1
   */
  @property()
  verticalScrollAmount = 0.75

  observer!: IntersectionObserver;

  connectedCallback() {
    super.connectedCallback()
    addEventListener('keydown', this.#keyHandler.bind(this))
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener('keydown', this.#keyHandler.bind(this))
  }

  shouldUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.size === 1 && changedProperties.has("currentPage")) return false
    return true
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    // when we have just changed to doublePagedMode
    // this is to cache and prevent unnecessary renders
    if (changedProperties.has('mode') && this.#isDoublePageMode()) {
      if (this.doublePagedArr.length === 0) {
        const arr = []
        const isOdd = this.mode.endsWith('odd');
        if (isOdd) arr.push([{ url: this.pages[0], index: 1 }])
        for (let i = isOdd ? 1 : 0; i < this.pages.length; i += 2) {
          const temp = [{ url: this.pages[i], index: i + 1 }];
          if (this.pages.length > i + 1) temp.push({ url: this.pages[i + 1], index: i + 2 })
          arr.push(temp)
        }
        this.doublePagedArr = arr
      }
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'currentpage') {
      if (this.gotoPage(+newValue)) this.currentPage = +newValue
      return;
    }
    super.attributeChangedCallback(name, oldValue, newValue)
  }

  updated(changedProperties: PropertyValueMap<any>) {
    if (changedProperties.has("mode")) {
      // the nullish operator is here to prevent it from exploding on the first render
      this.observer?.disconnect()
      if (this.mode === 'horizontal' || this.#isDoublePageMode()) this.setUpHorizontalIntersectionObserver()
      else if (this.mode === 'vertical') this.setUpVerticalIntersectionObserver()
    }
  }

  #listTemplate() {
    return this.pages.map((url, index) => html`
      <div class='page' data-page-no=${index + 1}>
        <img id="page-${index}" loading='lazy' src=${url} />
        ${this.mode === 'vertical'
        ? html`<div data-v-page-no=${index + 1}></div>`
        : nothing
      }
      </div>`)
  }

  #doublePageTemplate() {
    return this.doublePagedArr.map((arr, index) => html`
      <div class='page' data-page-no=${index + 1}>
      ${arr.map(({ url, index }) =>
      html`<img id="page-${index}" loading='lazy' src=${url} />`)} 
        ${this.mode === 'vertical'
        ? html`<div data-v-page-no=${index + 1}></div>`
        : nothing
      }
      </div>`)
  }

  render() {
    const isDoublePageMode = this.#isDoublePageMode()
    const classes = {
      horizontal: this.mode === 'horizontal' || isDoublePageMode,
      vertical: this.mode === 'vertical',
      'double-page': isDoublePageMode
    }
    return html`
        <div 
          @click=${this.#clickHandler}
          id='container'
          class='${classMap(classes)}'
          dir=${this.dir}
          data-scale-type=${this.scaleType}
          >
          ${isDoublePageMode
        ? this.#doublePageTemplate()
        : this.#listTemplate()
      }
        </div>
      `
  }

  /**
   * Go to a Page with a particular page number
   * This will return Boolean to indicate whether the page change was successfull
   */
  gotoPage(num: number) {
    if (num < 1 || num > this.pages.length) return false;
    const page = this.#getPage(num)
    page?.scrollIntoView()
    this.currentPage = num
    return true
  }

  #clickHandler(event: MouseEvent) {
    if (this.mode === 'horizontal' || this.#isDoublePageMode()) {
      const middle = window.innerWidth / 2
      let change = event.clientX < middle ? -1 : 1;
      change *= this.dir === 'rtl' ? -1 : 1
      this.gotoPage(this.currentPage + change)
    }
    else if ('vertical') {
      const middle = window.innerHeight * this.verticalScrollAmount
      const scrollAmount = middle * (event.clientY < middle ? -1 : 1)
      this.container.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  #keyHandler(event: KeyboardEvent) {
    const key = event.key
    if (this.mode === 'horizontal' || this.#isDoublePageMode()) {
      let change;
      if (key === "ArrowLeft") change = -1
      else if (key === "ArrowRight") change = 1
      if (change !== undefined) {
        change *= this.dir === 'rtl' ? -1 : 1
        this.gotoPage(this.currentPage + change)
      }
    }
    else if ('vertical') {
      const scrollAmount = window.innerHeight * this.verticalScrollAmount
      if (key === "ArrowUp") {
        this.container.scrollBy({
          top: -1 * scrollAmount,
          behavior: 'smooth'
        })
      }
      else if (key === "ArrowDown") {
        this.container.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        })
      }
    }
  }

  setUpHorizontalIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      for (const el of entries) {
        if (el.isIntersecting && el.target instanceof HTMLElement) {
          const pageNo = +el.target.dataset?.pageNo!
          if (this.currentPage !== pageNo) {
            this.currentPage = pageNo
            this.#scrollReset()
            this.#preloadImages()
          }
        }
      }
    }, {
      root: this.container,
      threshold: 0.75
    })
    this.container.querySelectorAll('div[data-page-no]').forEach(el => this.observer.observe(el))
  }

  setUpVerticalIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      for (const el of entries) {
        if (el.isIntersecting && el.target instanceof HTMLElement) {
          const pageNo = +el.target.dataset?.pageNo!
          if (this.currentPage !== pageNo) {
            this.currentPage = pageNo
            this.#preloadImages()
          }
        }
      }
    }, {
      root: this.container,
    })
    this.container.querySelectorAll('[data-v-page-no]').forEach(el => this.observer.observe(el))
  }

  /*
  ** This resets the Scroll position for the elements 2 elements before and after the current page
  ** So if the current page is 1, it will set the scroll position for page 3 to 0
  ** and if page is 5, it reset the scroll positions for page 3 and 7
  */
  #scrollReset() {
    const num = this.currentPage;
    if (num > 2) {
      this.#getPage(num - 2)!.scrollTop = 0
    }
    if (num < this.pages.length - 1) {
      this.#getPage(num + 2)!.scrollTop = 0
    }
  }

  #getPage(num: number | string) {
    return this.container.querySelector(`[data-page-no="${num}"]`)
  }

  #preloadImages() {
    const image = this.#getPage(this.currentPage)?.firstElementChild as HTMLImageElement
    console.log(image)
    // this is so that if current page is loaded we move on to loading the others right away
    if (image.complete) this.#preloadCallBack()
    // this is so that the current page loads before loading others
    image.addEventListener('load', () => this.#preloadCallBack())
  }

  #preloadCallBack() {
    let num = 1
    while (num <= this.preloadNo) {
      const image = (this.container.querySelector('#page-' + (this.currentPage + num)) as HTMLImageElement)
      if (image && !image.complete) image.loading = 'eager'
      num++
    }
  }

  #isDoublePageMode() {
    return this.mode.startsWith('double-page')
  }


  static styles = css`

  :host{
    overflow: hidden;
  }

  #container{
    container: mr / inline-size; 
    display: grid;
  }

  #container.horizontal {
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    grid-auto-flow: column;
    grid-auto-columns: 100vw;
  }

  .horizontal .page {
    scroll-snap-align: center;
    width: 100vw;
    height: 100vh;
    overflow-y: scroll;
    display: flex;  
  /*
   There is a problem with scrolling when this is used, this can be resolved with
   using the safe keyword but chrome and safari don't support that yet;
   so instead we are using margin for solving this and 
   justify-content: center;
  */
  }
  
  .horizontal .page img {
    display: block;
    width: auto;
    height: 100%;
    margin-block:auto;
  }

  .horizontal .page img:first-child{
    margin-left: auto;
  }

 .horizontal .page img:last-child {
    margin-right: auto;
  }
  
  #container.vertical {
    width: 100vw;
    height: 100vh;
    justify-items: center;
    overflow-y: scroll;
  }

  .vertical .page {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center; 
  }

  .vertical .page img {
    display: block;
    width: 100%;
    height: 100%;
  }

  /*
  fitHeight is the Default mode for Horizontal Reader so we just
  don't add any additional css to make that work
  */ 

  .horizontal[data-scale-type="fitWidth"] .page  img{
    width: 100%; 
    height: auto;
  }    
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'manga-reader': MangaReader
  }
}
