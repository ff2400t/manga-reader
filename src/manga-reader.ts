import { LitElement, PropertyValueMap, PropertyValues, css, html, nothing } from 'lit'
import { customElement, eventOptions, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';
import './mr-image';
import MRImage from './mr-image';

type Mode = 'horizontal' | 'vertical' | 'double-page' | 'double-page-odd' | 'webtoon';
type ReadingDirection = 'rtl' | 'ltr'
type ScaleType = 'fit-width' | 'fit-height' | 'stretch' | 'original-size';

enum Action {
  Prev,
  Next,
  Middle
}

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
  scaleType: ScaleType = 'fit-height'

  showTouchIndicatorOnModeChange = false

  /*
  ** Function to Call if the Touch Action is Middle
  */
  handleMiddleClick!: () => void;

  /**
   * No of images to preload after the current Image
   * The default is to preload the next page
   */
  @property()
  preloadNo: number = 1;

  @query('#container', true)
  container!: HTMLDivElement;

  @query('#touch-indicator', true)
  touchIndicator!: HTMLDivElement;

  #doublePagedArr: Array<{ url: string, index: number }[]> = []

  /**
   * Amount to scroll during a click event in webtoon Mode
   * Number between 0 and 1
   */
  @property()
  webtoonScrollAmount = 0.75

  observer!: IntersectionObserver;

  connectedCallback() {
    super.connectedCallback()
    this.tabIndex = 0;
    this.addEventListener('keydown', this.#keyHandler.bind(this))
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.#keyHandler.bind(this))
  }

  shouldUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.size === 1 && changedProperties.has("currentPage")) return false
    return true
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    // when we have just changed to doublePagedMode
    // this is to cache and prevent unnecessary renders
    if (changedProperties.has('mode') && this.#isDoublePageMode()) {
      const arr = []
      const isOdd = this.mode.endsWith('odd');
      if (isOdd) arr.push([{ url: this.pages[0], index: 1 }])
      for (let i = isOdd ? 1 : 0; i < this.pages.length; i += 2) {
        const temp = [{ url: this.pages[i], index: i + 1 }];
        if (this.pages.length > i + 1) temp.push({ url: this.pages[i + 1], index: i + 2 })
        arr.push(temp)
      }
      this.#doublePagedArr = arr
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'current-page') {
      if (this.gotoPage(+newValue)) this.currentPage = +newValue
      return;
    }
    super.attributeChangedCallback(name, oldValue, newValue)
  }

  firstUpdated() {
    const currentPage = this.getAttribute('current-page');
    if (currentPage) this.gotoPage(+currentPage)
    this.#preloadImages()
  }

  updated(changedProperties: PropertyValueMap<any>) {
    if (changedProperties.has("mode")) {

      // the nullish operator is here to prevent it from exploding on the first render
      this.observer?.disconnect()

      // do show this on the initial load of the element
      if (changedProperties.get("mode") !== undefined
        && this.showTouchIndicatorOnModeChange) this.showTouchIndicator()

      if (this.mode === 'webtoon') this.setUpWebtoonIntersectionObserver()
      else {
        this.setUpHorizontalIntersectionObserver()
      }
    }
  }

  #listTemplate() {
    return this.pages.map((url, index) => html`
      <div class='page' data-page-no=${index + 1}>
        <mr-image id="page-${index + 1}" src=${url}></mr-image>
        ${this.mode === 'webtoon'
        ? html`<div data-v-page-no=${index + 1}></div>`
        : nothing
      }
      </div>`)
  }

  #doublePageTemplate() {
    return this.#doublePagedArr.map((arr, index) => html`
      <div class='page' data-page-no=${index + 1}>
      ${arr.map(({ url, index }) =>
      html`<img id="page-${index + 1}" loading='lazy' src=${url} />`)} 
      </div>`)
  }

  render() {
    const classes = {
      vertical: this.mode === 'vertical',
      webtoon: this.mode === 'webtoon',
    }
    return html`
      <div style='position: relative'>
        <div 
          part='container'
          @click=${this.#clickHandler}
          id='container'
          class='${classMap(classes)}'
          dir=${this.dir}
          data-scale-type=${this.scaleType}
          >
          ${this.#isDoublePageMode()
        ? this.#doublePageTemplate()
        : this.#listTemplate()
      }
        </div>
        <div @click=${this.touchIndicatorHandler} id="touch-indicator">
          <p id="touch-indicator-prev">Previous</p>
          <p id="touch-indicator-next">Next</p>
        </div>
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
    this.#dispatchPageChangeEvent(num)
    return true
  }

  #dispatchPageChangeEvent(pageNo: number) {
    const e = new CustomEvent('pagechange', {
      detail: { pageNo },
      composed: true
    })
    this.dispatchEvent(e)
  }

  #clickHandler(event: MouseEvent) {
    const action = this.#getTouchAction(event)
    if (this.mode === 'webtoon') {
      if (action === Action.Middle) {
        if (typeof this.handleMiddleClick === "function") this.handleMiddleClick()
      }
      else {
        const multiplier = action === Action.Next ? 1 : -1
        const scrollAmount = this.container.offsetHeight * this.webtoonScrollAmount * multiplier
        this.container.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        })
      }
    } else {
      if (action === Action.Prev) this.gotoPage(this.currentPage - 1)
      else if (action === Action.Next) this.gotoPage(this.currentPage + 1)
      else {
        if (typeof this.handleMiddleClick === "function") this.handleMiddleClick()
      }
    }
  }

  #keyHandler(event: KeyboardEvent) {
    const key = event.key
    if (this.mode === 'webtoon') {
      const scrollAmount = this.container.offsetHeight * this.webtoonScrollAmount
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
    } else {
      let change;
      if (key === "ArrowLeft") change = -1
      else if (key === "ArrowRight") change = 1
      if (change !== undefined) {
        change *= this.dir === 'rtl' ? -1 : 1
        this.gotoPage(this.currentPage + change)
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
            this.#dispatchPageChangeEvent(pageNo)
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

  setUpWebtoonIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      for (const el of entries) {
        if (el.isIntersecting && el.target instanceof HTMLElement) {
          const pageNo = +el.target.dataset?.pageNo!
          if (this.currentPage !== pageNo) {
            this.currentPage = pageNo
            this.#dispatchPageChangeEvent(pageNo)
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
    const arr = this.#isDoublePageMode() ? this.#doublePagedArr : this.pages
    if (num < arr.length - 1) {
      this.#getPage(num + 2)!.scrollTop = 0
    }
  }

  #getPage(num: number | string): null | MRImage {
    return this.container.querySelector(`[data-page-no="${num}"]`)
  }

  #preloadImages() {
    const image = this.#getPage(this.currentPage)?.firstElementChild as MRImage;
    // this is so that if current page is loaded we move on to loading the others right away
    if (!image) return
    if (image.state === 'done') this.#preloadCallBack()
    // this is so that the current image loads before loading others
    else if (image.state === 'idle') {
      image.load()
      image.addEventListener('mr-image-load', () => this.#preloadCallBack())
    }
    else image.addEventListener('mr-image-load', () => this.#preloadCallBack())


  }

  #preloadCallBack() {
    let num = 1
    while (num <= this.preloadNo) {
      let nextPage: number;
      if (this.dir === "ltr") nextPage = this.currentPage + num
      else nextPage = this.currentPage - num
      const image = (this.container.querySelector('#page-' + nextPage) as MRImage)
      if (image && image.state !== 'done') image.load();
      num++
    }
  }

  #isDoublePageMode() {
    return this.mode.startsWith('double-page')
  }

  /*
  ** this caculates the action for the touch event,
  ** the Screen is divided into 9 zones and with N, P and Nothing in the middle 
  ** Prev Prev Prev
  ** Prev      Next
  ** Next Next Next
  */
  #getTouchAction(event: MouseEvent): Action {
    const { clientX: cX, clientY: cY } = event
    const rect = this.container.getBoundingClientRect()

    const x = cX - rect.left;
    const y = cY - rect.top;
    const containeHeight = rect.height;
    const containerWidth = rect.width;

    let result;

    if (y < containeHeight / 3) result = Action.Prev
    else if (y > containeHeight * (2 / 3)) result = Action.Next
    //middle section of the screen
    else if (x < containerWidth / 3) result = Action.Prev
    else if (x > containerWidth * (2 / 3)) result = Action.Next
    else result = Action.Middle

    if (this.dir === 'rtl') {
      if (result === Action.Next) result = Action.Prev
      if (result === Action.Prev) result = Action.Next
    }

    return result
  }

  /*
  ** This will shows the touch area grid and the action 
  ** When clicked it will trigger an opacity animation. The duration of the animatin can be customized by passing that as the first argument
  */
  showTouchIndicator() {
    this.touchIndicator.style.display = 'grid';
  }

  hideTouchIndicator() {
    this.touchIndicator.style.display = 'none'
  }

  touchIndicatorHandler() {
    this.touchIndicator.animate([{ opacity: 0 }], { duration: 500 }).onfinish = () => {
      this.touchIndicator.style.display = 'none'
    }
  }

  static styles = css`

  :host{
    overflow: hidden;
    --mr-width: 100vw;
    --mr-height: 100vh;
    --mr-indicator-prev-color: orangered;
    --mr-indicator-next-color: green;
    --mr-bg: black;  
  }

  #container{
    display: grid;
    height: var(--mr-height);
    width: var(--mr-width);
    background: var(--mr-bg)
  }

  #container:not(.webtoon) {
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    grid-auto-flow: column;
    grid-auto-columns: var(--mr-width);
  }

  #container.vertical{
    scroll-snap-type: y mandatory;
    grid-auto-flow: row;
    grid-auto-rows: var(--mr-height); 
  }

  #container:not(.webtoon) .page {
    scroll-snap-align: center;
    width: var(--mr-width);
    height: var(--mr-height);
    overflow-y: scroll;
    display: flex;  
  /*
   There is a problem with scrolling when this is used, this can be resolved with
   using the safe keyword but chrome and safari don't support that yet;
   so instead we are using margin for solving this and 
   justify-content: center;
  */
  }
  
  #container:not(.webtoon) .page img {
    display: block;
    width: auto;
    height: 100%;
    margin-block:auto;
  }

  #container .page img:first-child{
    margin-inline-start: auto;
  }

  #container .page img:last-child {
    margin-inline-end: auto;
  }

  /*
  fit-height is the Default mode for Horizontal Reader so we just
  don't add any additional css to make that work
  */ 

  #container:not(.webtoon)[data-scale-type="fit-width"] .page  img{
    width: 100%; 
    height: auto;
  }    

  #container:not(.webtoon)[data-scale-type="stretch"] .page  img{
    width: 100%; 
  }    

  #container:not(.webtoon)[data-scale-type="original-size"] .page  img{
    width: var(--natrual-width); 
    height: var(--natrual-height); 
  }    

  #container.webtoon {
    width: var(--mr-width);
    height: var(--mr-height);
    justify-items: center;
    overflow-y: scroll;
  }

  .webtoon .page {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center; 
  }

  .webtoon .page img {
    width: 100%;
    height: 100%;
  }

  /* Touch Idicator styles*/
  #touch-indicator{
    color: white;
    position: absolute;
    inset: 0;
    display: none;
    /* well the display is grid, but we let the javascript add that and remove that as it is needed*/
    opacity: 0.75;
    grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr; 
    height: var(--mr-height);
    width: var(--mr-width)
  }

  #touch-indicator-prev, #touch-indicator-next{ 
    display: grid;
    place-content: center;
    font-size: 3rem;
    margin: 0px; 
    grid-column: span 3;
  }

  #touch-indicator-prev{
    background: var(--mr-indicator-prev-color);
  }

  #touch-indicator-next{
    grid-row: 3;
    background: var(--mr-indicator-next-color);
  }

  #touch-indicator::before{
    content: "";
    background: var(--mr-indicator-prev-color);
    grid-row: 2;
  }

  #touch-indicator::after{
    content: "";
    background: var(--mr-indicator-next-color);
    grid-column: 3
  }

  ::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  } 
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'manga-reader': MangaReader
  }
}
