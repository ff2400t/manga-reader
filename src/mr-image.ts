import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { choose } from 'lit/directives/choose.js';
import debounce from './debounce.js';
import './mr-progress-ring.ts';
import './mr-spinner.ts';

// the four state are made as such
// waiting: before the element is visible
// start: we show the spinner, but we before the fetching starts
// fetching: When the fetching has started and we can show the progress bar
// done: show the actual image
type ImageState = "idle" | "fetching" | "done" | 'failure'
type ImageOrientation = 'portrait' | 'landscape';

@customElement('mr-image')
export default class MRImage extends LitElement {

  @property()
  state: ImageState = 'idle';

  @property()
  src: string = ""

  @state()
  fetchingProgress = 0;

  @state()
  objectURL!: string;

  @property({ reflect: true })
  orientation!: ImageOrientation;

  // function which is debounced and which sets the  
  setFetchProgress(newValue: number) {
    this.fetchingProgress = newValue;
  }

  willUpdate(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (changedProperties.has('src')
      && changedProperties.get('src') !== undefined
      && this.src
      && this.src !== "") {
      this.state = 'idle';
      this.fetchingProgress = 0;
      this.objectURL = "";
    }
  }

  // this only here to prevent triggering multiple promises while one is in flight in some senarios
  #inFlightpromise: undefined | Promise<Response>;

  async load() {
    if (this.state !== 'idle' && this.state !== 'failure' && this.#inFlightpromise !== undefined) return;

    const setProgress = debounce(this.setFetchProgress.bind(this), 300)

    try {
      const fetchPromise = fetch(this.src);
      this.#inFlightpromise = fetchPromise
      const response = await fetchPromise

      if (!response.ok) throw Error("Unable to fetch");


      this.state = 'fetching'!;
      const reader = response.body!.getReader();

      const contentLength = +response.headers.get('Content-Length')!;

      let receivedLength = 0;
      let chunks = [];
      while (true) {
        const { done, value } = await reader.read();

        if (done) break

        chunks.push(value);
        receivedLength += value.length;

        const newPercentage = +((receivedLength * 100) / contentLength).toFixed(0);
        setProgress(newPercentage)
      }

      this.#inFlightpromise = undefined;

      let blob = new Blob(chunks)
      this.objectURL = URL.createObjectURL(blob)
      this.state = 'done'

    } catch {
      this.state = 'failure'
    }
  }

  render() {
    if (this.state === 'done') return html`<img @load=${this.loadHandler} part='img' src=${this.objectURL}/>`
    return html`<div part='container' class='image-container'>${choose(this.state, [
      ['idle', () => html`<mr-spinner></mr-spinner>`],
      ['fetching', () => html`<mr-progress-ring value="${this.fetchingProgress}"><mr-progress-ring >`],
      ['failure', () => html`<button class='retry-btn' @click=${this.retry}>Retry</button>`]
    ])} 
      </div>`
  }

  @eventOptions({ passive: true })
  loadHandler(e: Event) {
    const img = e.target as HTMLImageElement;
    const dpr = window.devicePixelRatio;
    const width = img.naturalWidth / dpr;
    const height = img.naturalHeight / dpr;
    this.orientation = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait'
    img.style.setProperty('--natural-width', width + "px");
    img.style.setProperty('--natural-height', height + "px");
    const event = new CustomEvent('mr-image-load', {
      detail: {
        target: this
      },
      composed: true,
      bubbles: true
    })
    this.dispatchEvent(event)
  }

  async retry() {
    this.state = 'idle'
    return this.load()
  }

  static styles = css`


  :host{ 
    --mr-loader-size: 64px;
    --mr-loader-color: hotpink;
    --mr-loader-track-width: 8px;
    --mr-loader-track-color: var(--mr-bg);
    --mr-loader-animation-duration: 2s;
    --indicator-transition-duration: 300ms;

    --mr-retry-btn-bg: var(--mr-loader-color);
    --mr-retry-btn-color: white;
  }
  
  .image-container{
    box-sizing: border-box;
    width: calc(var(--mr-width) / 2) ;
    height: var(--mr-height); 
    margin-inline: auto;
    padding-top: calc(var(--mr-height) * 0.3);
    display: grid;
    align-content: start;
    justify-content: center;
  }

  .retry-btn{
    background-color: var(--mr-loader-color);
    color: white;
    font-size: 1.5em;
    padding: 0.5rem 1rem;
    border-radius: 2.5rem;
    border: none;
  }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'mr-image': MRImage;
  }
}
