import { LitElement, PropertyValueMap, PropertyValues, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';

type mode = 'horizontal-rtl' | 'horizontal-ltr' | 'vertical'

/**
 * Manga Reader component
 */
@customElement('manga-reader')
export class MangaReader extends LitElement {

  containerRef: Ref<HTMLDivElement> = createRef();

  @property()
  pages: string[] = [];

  @property()
  mode: mode = 'horizontal-rtl'

  @property()
  currentPage: number = 1;

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

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'currentpage') {
      if (this.gotoPage(+newValue)) this.currentPage = +newValue
    }
  }

  updated(changedProperties: PropertyValueMap<any>) {
    if (changedProperties.has("mode")) {
      // the nullish operator is here to prevent it from exploding on the first render
      this.observer?.disconnect()
      if (this.mode.startsWith('horizontal')) this.setUpHorizontalIntersectionObserver()
      else if (this.mode === 'vertical') this.setUpVerticalIntersectionObserver()
    }
  }

  render() {
    const classes = {
      horizontal: this.mode.startsWith('horizontal'),
      vertical: this.mode === 'vertical'
    }
    return html`
        <div 
          ${ref(this.containerRef)}
          @click=${this.#clickHandler}
          class='container ${classMap(classes)}'
          dir=${this.mode === 'horizontal-rtl' ? 'rtl' : 'ltr'}
          >
          ${this.pages.map((url, index) => html`
            <div class='page' data-page-no=${index + 1}>
              <img src=${url} />
            ${this.mode === 'vertical' && html`<div data-v-page-no=${index + 1}></div>`}
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
    const selector = `[data-page-no="${num}"]`
    const page = this.containerRef.value?.querySelector(selector)
    if (!page) return false
    page.scrollIntoView()
    this.currentPage = num
    return true
  }

  #clickHandler(event: MouseEvent) {
    if (this.mode.startsWith('horizontal')) {
      const middle = window.innerWidth / 2
      let change = event.clientX < middle ? -1 : 1;
      change *= this.mode.endsWith('rtl') ? -1 : 1
      this.gotoPage(this.currentPage + change)
    }
    else if ('vertical') {
      const middle = window.innerHeight / 2
      const scrollAmount = middle * (event.clientY < middle ? -1 : 1)
      this.containerRef.value?.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  #keyHandler(event: KeyboardEvent) {
    const key = event.key
    if (this.mode.startsWith('horizontal')) {
      let change;
      if (key === "ArrowLeft") change = -1
      else if (key === "ArrowRight") change = 1
      if (change !== undefined) {
        change *= this.mode.endsWith('rtl') ? -1 : 1
        this.gotoPage(this.currentPage + change)
      }
    }
    else if ('vertical') {
      const scrollAmount = window.innerHeight / 2
      if (key === "ArrowUp") {
        this.containerRef.value?.scrollBy({
          top: -1 * scrollAmount,
          behavior: 'smooth'
        })
      }
      else if (key === "ArrowDown") {
        this.containerRef.value?.scrollBy({
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
          if (this.currentPage !== +el.target.dataset?.pageNo!) {
            this.currentPage = +el.target.dataset?.pageNo!
          }
        }
      }
    }, {
      root: this.containerRef.value,
      threshold: 0.75
    })
    this.containerRef.value?.querySelectorAll('div[data-page-no]').forEach(el => this.observer.observe(el))
  }

  setUpVerticalIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      for (const el of entries) {
        if (el.isIntersecting && el.target instanceof HTMLElement) {
          if (this.currentPage !== +el.target.dataset?.pageNo!) {
            this.currentPage = +el.target.dataset?.pageNo!
          }
        }
      }
    }, {
      root: this.containerRef.value,
    })
    this.containerRef.value?.querySelectorAll('[data-v-page-no]').forEach(el => this.observer.observe(el))
  }


  static styles = css`

  :host{
    overflow: hidden;
  }

  .container{
    container: mr / inline-size; 
    display: grid;
  }

  .container.horizontal {
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

  .container.vertical {
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

    
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'manga-reader': MangaReader
  }
}
