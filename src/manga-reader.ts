import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * Manga Reader component
 */
@customElement('manga-reader')
export class MangaReader extends LitElement {

  @property()
  pages: string[] = [];

  render() {
    return html`
        <div class='container'>
          ${this.pages.map(url => html`
        <div class='page'>
          <img src=${url} />
        </div>`)}
        </div>
      `
  }

  static styles = css`

  :host{
    overflow: hidden;
  }

  .container {
    display: grid;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    grid-auto-flow: column;
    grid-auto-columns: 100vw;
  }

  .page {
    scroll-snap-align: center;
    width: 100vw;
    height: 100vh;
    overflow-y: scroll;
    display: flex;
    justify-content: center;
  }
  
  .page img {
    display: block;
    width: auto;
    height: 100%;
  }
    
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'manga-reader': MangaReader
  }
}
