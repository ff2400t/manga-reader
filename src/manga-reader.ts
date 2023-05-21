import { LitElement, css, html } from 'lit'
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

  connectedCallback() {
    super.connectedCallback()
    addEventListener('keydown', this.#keyHandler.bind(this))
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener('keydown', this.#keyHandler.bind(this))
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

  gotoPage(num: number) {
    if (num < 1 || num > this.pages.length) return;
    const selector = `[data-page-no="${num}"]`
    this.containerRef.value?.querySelector(selector)?.scrollIntoView()
  }

  #clickHandler(event: MouseEvent) {
    switch (this.mode) {
      case 'horizontal': {
        const middle = window.innerWidth / 2
        if (event.clientX < middle && this.currentPage > 1) {
          const currentPage = this.currentPage - 1;
          this.gotoPage(currentPage)
          this.currentPage = currentPage
        }
        if (event.clientX > middle && this.currentPage < this.pages.length) {
          const currentPage = this.currentPage + 1;
          this.gotoPage(currentPage)
          this.currentPage = currentPage
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
        if (event.key === "ArrowLeft" && this.currentPage > 1) {
          const currentPage = this.currentPage - 1;
          this.gotoPage(currentPage)
          this.currentPage = currentPage
        }
        else if (event.key === "ArrowRight" && this.currentPage < this.pages.length) {
          const currentPage = this.currentPage + 1;
          this.gotoPage(currentPage)
          this.currentPage = currentPage
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
