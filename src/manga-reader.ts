import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';

type mode = 'horizontal' | 'vertical'

/**
 * Manga Reader component
 */
@customElement('manga-reader')
export class MangaReader extends LitElement {

  @property()
  pages: string[] = [];

  @property()
  mode: mode = 'horizontal'

  render() {
    const classes = {
      horizontal: this.mode === 'horizontal',
      vertical: this.mode === 'vertical'
    }
    return html`
        <div class='container ${classMap(classes)}'>
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
    justify-items: center
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
