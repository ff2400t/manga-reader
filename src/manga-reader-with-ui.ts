import { customElement, property, query } from 'lit/decorators.js';
import { LitElement, PropertyValues, css, html, nothing } from 'lit';
import { MangaReader, ScaleType } from './manga-reader';
import { when } from 'lit/directives/when.js';

const props: (keyof MangaReaderWithUI)[] = ["mode", "dir", "scaleType", 'webtoonPadding']

MangaReader

@customElement('manga-reader-with-ui')
export default class MangaReaderWithUI extends LitElement {

	@query('manga-reader')
	reader!: MangaReader;

	@query('.controls')
	controls!: HTMLFormElement;

	@property()
	pages = []

	@property()
	mode = "horizontal"

	@property()
	dir = 'ltr'

	@property()
	scaleType: ScaleType = "fit-height"

	@property()
	webtoonPadding = 0;

	@property()
	showTouchIndicator = false;

	constructor() {
		super();
		for (const prop of props) {
			const value = localStorage.getItem("mr-" + prop)
			if (value) {
				// @ts-ignore
				this[prop] = value
			}
		}
	}

	willUpdate(changedProperties: PropertyValues) {
		if (changedProperties.has('mode')) {
			if (this.mode.startsWith('double') && (this.scaleType === 'fit-screen' || this.scaleType === 'smart-fit')) {
				this.scaleType = 'fit-height'
			}
		}
	}

	firstUpdated() {
		this.reader.handleMiddleClick = () => {
			this.controls.classList.toggle('open')
		}
	}

	updated(changedProperties: PropertyValues) {
		for (const prop of props) {
			if (changedProperties.has(prop)) {
				// @ts-ignore
				localStorage.setItem("mr-" + prop, this[prop])
				// @ts-ignore
				this.reader[prop] = this[prop]
			}
		}

		if (changedProperties.has('pages') && this.pages.length > 0) {
			this.reader.pages = this.pages
		}
	}

	render() {
		return html`<manga-reader
				.pages=${this.pages}
				.mode=${this.mode}
				.dir=${this.dir}
				.scaleType=${this.scaleType}
				.webtoonPadding=${this.webtoonPadding}
				.showTouchIndicator=${this.showTouchIndicator}>
			</manga-reader>
			
      <form class='controls' @input=${this.handleInput}> 
          <label  for='mode'>Mode: </label>
          <select .value=${this.mode} name='mode' id='mode' selected='horizontal'>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="webtoon">Webtoon</option>
            <option value="double-page">Double Page</option>
            <option value="double-page-odd">Double Page Odd</option>
          </select>

			${when(
			this.mode === 'webtoon',
			() => html`
          <label for='webtoonPadding'>Padding</label>
          <input .value=${this.webtoonPadding} name='webtoonPadding' id='webtoonPadding' type='range' min="0" max='45' />
        ` ,
			() => html`
          <label for='dir'>Direction </label>
          <select .value=${this.dir} name='dir' id='dir' default='ltr'>
            <option value="ltr">Left to right</option>
            <option value="rtl">Right to Left</option>
          </select>
          <label for='scaleType'>Scale Type</label>
          <select .value=${this.scaleType} name='scaleType' id='scaleType' default='fit-height' >
            <option value="fit-height">Fit Height</option>
            <option value="fit-width">Fit Width</option>
            <option value="stretch">Stretch</option>
            <option value="original-size">Original Size</option>
            
						${when(!this.mode.startsWith('double'),
				() => html`<option value="smart-fit">Smart Fit</option>
								<option value="fit-screen">Fit screen</option>`,
				() => nothing)
				} 
		          </select>`)
			}
			</form>
			`
	}

	handleInput(event: InputEvent) {
		// @ts-ignore
		const prop: keyof this = event.target?.id!
		const val: string = (event.target as HTMLInputElement).value;
		this[prop] = val;
	}

	static styles = css`  
  .controls {
	  position: fixed;
	  bottom: 0;
	  background: orangered;
	  width: min(450px, 100%);
	  left: 50%;
	  translate: -50% 100%;
	  padding: 0.5rem 1rem 1rem;
	  font-size: 1.5rem;
	  color: white;
	  accent-color: blue;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		border-radius: 15px 15px 0px 0px;
		transition: translate 300ms ease-in-out;
	}
	
	.controls.open {
		translate: -50% 0%
	}
	
	`
}

declare global {
	interface HTMLElementTagNameMap {
		'manga-reader-with-ui': MangaReaderWithUI;
	}
}
