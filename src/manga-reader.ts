import { LitElement, PropertyValueMap, PropertyValues, css, html, nothing, render, unsafeCSS } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';
import './mr-image';
import MRImage from './mr-image';
import styles from './styles.css?inline';
import debounce from './debounce';

type Mode = 'horizontal' | 'vertical' | 'double-page' | 'double-page-odd' | 'webtoon';
type ReadingDirection = 'rtl' | 'ltr'
/*
for fit-screen, we assume that the layout is fit-height as default, but when we have to switch to fit-width
*/
type ScaleType = 'fit-screen' | 'fit-width' | 'fit-height' | 'stretch' | 'original-size' | "smart-fit";

type OverflowState = "none" | "vertical" | "horizontal"
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

  @property()
  showTouchIndicator = false;

  /*
  ** Padding used to control the webtoon mode it can be anything between 0 and 80
  */
  @property()
  webtoonPadding = 0;

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

  @query('.container', true)
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

  resizeObserver!: ResizeObserver;

  #pageCache: Map<string, MRImage> = new Map();

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
    const isSinglePropUpdate = changedProperties.size === 1
    if (isSinglePropUpdate && changedProperties.has("currentPage")) return false
    // undefined check is to ensure that this is not the first render
    if (
      changedProperties.has('preloadNo')
      && changedProperties.get('preloadNo') !== undefined
      && this.preloadNo > changedProperties.get('preloadNo')
    ) {
      this.#preloadImages();
      if (isSinglePropUpdate) return false
    }
    // undefined check is to ensure that this is not the first render
    if (
      changedProperties.has('showTouchIndicator')
      && changedProperties.get('showTouchIndicator') !== undefined
    ) {
      if (this.showTouchIndicator) {
        this.touchIndicator.style.display = 'grid';
        this.touchIndicator.addEventListener('click', this.#touchIndicatorHandler.bind(this))
      }
      else {
        this.touchIndicator.style.display = 'none'
        this.touchIndicator.removeEventListener('click', this.#touchIndicatorHandler.bind(this))
      }
      if (isSinglePropUpdate) return false
    }
    return true
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    // when we have just changed to doublePagedMode
    // this is to cache and prevent unnecessary renders
    if (changedProperties.has('mode') && this.#isDoublePageMode()) {
      const arr = []
      const isOdd = this.mode.endsWith('odd');
      if (isOdd) arr.push([{ url: this.pages[0], index: 0 }])
      for (let i = isOdd ? 1 : 0; i < this.pages.length; i += 2) {
        const temp = [{ url: this.pages[i], index: i }];
        if (this.pages.length > i + 1) temp.push({ url: this.pages[i + 1], index: i + 1 })
        arr.push(temp)
      }
      this.#doublePagedArr = arr
    }

    if (changedProperties.has('pages')) {
      this.#pageCache.clear();
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
    this.container.addEventListener('mr-image-load', (e) => {
      if(this.scaleType === 'fit-screen') this.resizeImage(e.detail.target)
    })
  }

  updated(changedProperties: PropertyValueMap<any>) {
    if (changedProperties.has("mode")) {
      const prevMode: Mode | undefined = changedProperties.get('mode')
      if (this.mode === 'webtoon') {
        this.observer?.disconnect()
        this.setUpWebtoonIntersectionObserver()
      }
      else {
        // i wanted to make some optimizaiton here, but we also need to reattach the listners
        // when moving between single page to double-page mode  and even between the two double-page variants
        this.observer?.disconnect()
        this.setUpHorizontalIntersectionObserver()
      }

      // from others to others is the default case 
      let currentPage = this.currentPage;
      const isDoublePage = this.#isDoublePageMode()

      // from double-page to others
      if (prevMode && prevMode.startsWith('double-page') && !isDoublePage) {
        currentPage =
          this.mode.endsWith('odd')
            ? (this.currentPage * 2) - 2
            : (this.currentPage * 2) - 1;
      }
      // from others to double page
      else if (prevMode && !prevMode.startsWith('double-page') && isDoublePage) {
        currentPage =
          this.mode.endsWith('odd')
            ? Math.floor(currentPage / 2) + 1
            : currentPage = Math.ceil(currentPage / 2)
      }
      this.gotoPage(currentPage)
    }
    if (
      changedProperties.has('webtoonPadding')
    ) {
      if (!(this.webtoonPadding > 45)) this.container.style.setProperty('--mr-webtoon-padding', this.webtoonPadding + "%")
    }

    if (changedProperties.has('scaleType')) {
      if (this.scaleType === 'fit-screen') {
        this.setUpResizeObserver();
      }
      if (changedProperties.get('scaleType') === 'fit-screen') this.resizeObserver.disconnect();
    }
  }

  #listTemplate() {
    return this.pages.map((url, index) => html`
      <div class='page' data-page-no=${index + 1}>
      ${this.#renderPage(url, index)}
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
      this.#renderPage(url, index))} 
      </div>`)
  }

  #renderPage(url: string, index: number) {
    if (this.#pageCache.has(url)) {
      const element = this.#pageCache.get(url)!;
      if (+element.id.replace('page-', "") !== index) {
        element.id = `page-${index}`
      }
      return element
    }
    const div = document.createElement('div');
    render(html`<mr-image id="page-${index + 1}"  src=${url}></mr-image>`, div);
    const element = div.firstElementChild as MRImage;
    this.#pageCache.set(url, element);
    return element;
  }

  render() {
    const classes = {
      vertical: this.mode === 'vertical',
      webtoon: this.mode === 'webtoon',
      "double-page": this.#isDoublePageMode()
    }
    return html`
      <div style='position: relative'>
        <div
          part='container'
          @click=${this.#clickHandler}
          class='container ${classMap(classes)}'
          dir=${this.dir}
          data-scale-type=${this.scaleType}
          >
          ${this.#isDoublePageMode()
        ? this.#doublePageTemplate()
        : this.#listTemplate()
      }
        </div>
        <div id="touch-indicator">
          <p id="touch-indicator-prev">Previous</p>
          <p id="touch-indicator-next">Next</p>
        </div>
      </div>
      `
  }

  /**
   * Go to a Page with a particular page number
   * and this also checks if the page should exist or not
   * This will return Boolean to indicate whether the page changed was successfull
   */
  gotoPage(num: number) {
    const page = this.#getPage(num)
    if (!page) return false
    page?.scrollIntoView()
    this.currentPage = num
    this.#dispatchPageChangeEvent(num)
    this.#preloadImages()
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
      if (action === Action.Middle) {
        if (typeof this.handleMiddleClick === "function") this.handleMiddleClick()
      } else {
        let change = action === Action.Prev ? -1 : 1;
        change *= this.dir === 'rtl' ? -1 : 1
        this.gotoPage(this.currentPage + change)
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
          const pageNo = +el.target.dataset?.vPageNo!
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

  setUpResizeObserver() {
    const resizeListener = debounce(() => {
      const pages = this.container.querySelectorAll('mr-image')
      for (const page of pages) {
        this.resizeImage(page)
      }
    }, 200)

    const cb = () => {
      this.resizeImage(this.#getImage(this.currentPage)!)
      resizeListener();
    }
    this.resizeObserver = new ResizeObserver(cb)
    cb();
    this.resizeObserver.observe(this.container)
  }

  resizeImage(page: MRImage) {
    if (page.scrollHeight > page.clientHeight) {
      page.classList.remove('fit-width')
    }
    else if (page.scrollWidth > page.clientWidth) {
      page.classList.add('fit-width')
    }
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

  #getPage(num: number | string): null | HTMLDivElement {
    return this.container.querySelector(`[data-page-no="${num}"]`)
  }

  #getImage(num: number | string): null | MRImage {
    return this.container.querySelector("#page-" + num)
  }

  #preloadImages() {
    const image = this.#getPage(this.currentPage)?.firstElementChild as MRImage;

    if (!image) return

    // this is so that if current page is loaded we move on to loading the others right away
    if (image.state === 'done') this.#preloadCallBack()
    // this is so that the current image loads before loading others
    else if (image.state === 'idle') {
      image.load()
      image.addEventListener('mr-image-load', () => this.#preloadCallBack())
    }
    else image.addEventListener('mr-image-load', () => this.#preloadCallBack())
  }

  #preloadCallBack() {
    let currentPage = !this.#isDoublePageMode()
      ? this.currentPage
      : (this.mode.endsWith('odd')
        ? (this.currentPage * 2) - 2
        : (this.currentPage * 2) - 1);

    let num = 1
    while (num <= this.preloadNo) {
      let nextPage = currentPage + num
      const image = (this.container.querySelector('#page-' + nextPage) as MRImage)
      if (image && image.state === 'idle') image.load();
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
  #touchIndicatorHandler() {
    this.touchIndicator.animate([{ opacity: 0 }], { duration: 500 }).onfinish = () => {
      this.showTouchIndicator = false;
    }
  }

  static styles = css`${unsafeCSS(styles)}`
}

declare global {
  interface HTMLElementTagNameMap {
    'manga-reader': MangaReader
  }
}
