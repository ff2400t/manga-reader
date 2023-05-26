import { LitElement, PropertyValueMap, PropertyValues, css, html, nothing } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';
// import { Ref, createRef, ref } from 'lit/directives/ref.js';

type Mode = 'horizontal' | 'vertical';
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
      if (this.mode === 'horizontal') this.setUpHorizontalIntersectionObserver()
      else if (this.mode === 'vertical') this.setUpVerticalIntersectionObserver()
    }
  }

  render() {
    const classes = {
      horizontal: this.mode === 'horizontal',
      vertical: this.mode === 'vertical'
    }
    return html`
        <div 
          @click=${this.#clickHandler}
          id='container'
          class='${classMap(classes)}'
          dir=${this.dir}
          data-scale-type=${this.scaleType}
          >
          ${this.pages.map((url, index) => html`
            <div class='page' data-page-no=${index + 1}>
              <img loading='lazy' src=${url} />
            ${this.mode === 'vertical' ?
        html`<div data-v-page-no=${index + 1}></div>`
        : nothing
      }
          </div>`)}
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
    if (this.mode === 'horizontal') {
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
    if (this.mode = 'horizontal') {
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
    // this is so that if current page is loaded we move on to loading the others right away
    if (image.complete)  this.#preloadCallBack() 
    // this is so that the current page loads before loading others
    image.addEventListener('load', () => this.#preloadCallBack())
  }

  #preloadCallBack() {
    let num = 1
    while (num <= this.preloadNo) {
      const elm = (this.#getPage(this.currentPage + num)?.firstElementChild as HTMLImageElement)
      if (!elm.complete) elm.loading = 'eager'
      num++
    }
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
    justify-content: center;
  }
  
  .horizontal .page img {
    display: block;
    width: auto;
    height: 100%;
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

  .horizontal[data-scale-type="fitWidth"] .page {
    display: block;
  }

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
