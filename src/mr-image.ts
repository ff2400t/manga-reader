import { customElement, property, state } from 'lit/decorators.js';
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
type ImageState = 'idle' | "start" | "fetching" | "done" | 'failure'

@customElement('mr-image')
export default class MRImage extends LitElement {

  @property()
  state: ImageState = 'start';

  @property()
  src: string = ""

  @state()
  fetchingProgress = 20;

  @state()
  objectURL!:string;

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.get('state') === "idle" && this.state === 'start') {
      this.load()
    }
  }

  // function which is debounced and which sets the  
  setFetchProgress(newValue: number) {
    this.fetchingProgress = newValue;
    this.requestUpdate();
  }

  async load() {
    const setProgress = debounce(this.setFetchProgress.bind(this), 300)

    if (this.state !== 'start') this.state = 'start'
    try {
      // Step 1: start the fetch and obtain a reader
      const response = (await fetch(this.src))!;
      this.state = 'fetching'!;

      if (!response.ok) throw Error("Unable to fetch");
      const reader = response.body!.getReader();

      // Step 2: get total length
      const contentLength = +response.headers.get('Content-Length')!;

      // Step 3: read the data
      let receivedLength = 0; // received that many bytes at the moment
      let chunks = []; // array of received binary chunks (comprises the body)
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        const newPercentage = +((receivedLength * 100) / contentLength).toFixed(0);
        setProgress(newPercentage) 
      } 

      let blob = new Blob(chunks) 
      this.objectURL = URL.createObjectURL(blob)
      this.state = 'done'

      // Step 5: decode into a string
    } catch { 
      this.state = 'failure'
      console.log(this.state)
    }
  }

  render() {
    if (this.state === 'done') return html`<img part='img' src=${this.objectURL}/>`
    return html`<div class='image-container'>${choose(this.state, [
      ['start', () => html`<mr-spinner></mr-spinner>`],
      ['fetching', () => html`<mr-progress-ring value="${this.fetchingProgress}"><mr-progress-ring >`],
      ['failure', () => html`<button class='retry-btn' @click=${this.load}>Retry</button>`]
    ], () => html`<div class='idle'></div>`)} 
      </div>`
  }

  static styles = css`
  :host{ 
    --mr-loader-size: 64px;
    --mr-track-width: 8px;
    --mr-loader-color: hotpink;
    --indicator-transition-duration: 300ms;
    --mr-retyry-but-bg: var(--mr-loader-color);
    --mr-retry-btn-color: white;
  }
  
  .image-container{
    box-sizing: border-box;
    width: var(--mr-width);
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
