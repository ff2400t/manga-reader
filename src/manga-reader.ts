import { LitElement, PropertyValueMap, PropertyValues, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';

type mode = 'horizontal' | 'vertical'

/**
 * Manga Reader component
 */
@customElement('manga-reader')
export class MangaReader extends LitElement {

  containerRef: Ref<HTMLDivElement> = createRef();

  @property()
  pages: string[] = [];

  @property()
  mode: mode = 'horizontal'

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
    console.log(changedProperties)
    if (changedProperties.has("mode")) {
      // entered into horizontal mode
      if (this.mode === 'horizontal') this.setUpHorizontalIntersectionObserver()
      // exited horizontal mode
      else if (changedProperties.get('mode') === 'horizontal') this.observer.disconnect() 
    }
  }

  render() {
    const classes = {
      horizontal: this.mode === 'horizontal',
      vertical: this.mode === 'vertical'
    }
    return html`
        <div ${ref(this.containerRef)} @click=${this.#clickHandler} class='container ${classMap(classes)}'>
          ${this.pages.map((url, index) => html`
        <div class='page' data-page-no=${index + 1}>
          <img src=${url} />
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
    switch (this.mode) {
      case 'horizontal': {
        const middle = window.innerWidth / 2
        if (event.clientX < middle) {
          this.gotoPage(this.currentPage - 1)
        }
        if (event.clientX > middle) {
          this.gotoPage(this.currentPage + 1)
        }
      }
        break;
      case 'vertical': {
        const middle = window.innerHeight / 2
        const scrollAmount = middle * (event.clientY < middle ? -1 : 1)
        this.containerRef.value?.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        })
      }
        break;
      default:
        throw Error("This is not a valid mode for manga-reader")
    }
  }

  #keyHandler(event: KeyboardEvent) {
    switch (this.mode) {
      case 'horizontal': {
        if (event.key === "ArrowLeft") {
          this.gotoPage(this.currentPage + 1)
        }
        else if (event.key === "ArrowRight") {
          this.gotoPage(this.currentPage + 1)
        }
      }
        break;
      case 'vertical': {
        if (event.key === "ArrowUp") {
          const middle = window.innerHeight / 2
          this.containerRef.value?.scrollBy({
            top: -1 * middle,
            behavior: 'smooth'
          })
        }
        else if (event.key === "ArrowDown") {
          const middle = window.innerHeight / 2
          this.containerRef.value?.scrollBy({
            top: middle,
            behavior: 'smooth'
          })
        }
      }
        break;
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
