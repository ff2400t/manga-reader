import { customElement } from 'lit/decorators.js';
import { LitElement, css, html } from 'lit';

@customElement('mr-spinner')
export default class MRSpinner extends LitElement {  
	render() {
		return html`
      <svg class="spinner" role="progressbar" aria-valuetext="Loading"}>
        <circle class="spinner__track"></circle>
        <circle class="spinner__indicator"></circle>
      </svg>
    `
	}

	static styles = css`
  :host {
    --speed: 2s;

    display: inline-flex;
    font-size: var(--mr-loader-size);
    width: 1em;
    height: 1em;
  }

  .spinner {
    flex: 1 1 auto;
    height: 100%;
    width: 100%;
  }

  .spinner__track,
  .spinner__indicator {
    fill: none;
    stroke-width: var(--mr-track-width);
    r: calc(0.5em - var(--mr-track-width) / 2);
    cx: 0.5em;
    cy: 0.5em;
    transform-origin: 50% 50%;
  }

  .spinner__track {
    stroke: var(--mr-track-color);
    transform-origin: 0% 0%;
  }

  .spinner__indicator {
    stroke: var(--mr-loader-color);
    stroke-linecap: round;
    stroke-dasharray: 150% 75%;
    animation: spin var(--speed) linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      stroke-dasharray: 0.01em, 2.75em;
    }

    50% {
      transform: rotate(450deg);
      stroke-dasharray: 1.375em, 1.375em;
    }

    100% {
      transform: rotate(1080deg);
      stroke-dasharray: 0.01em, 2.75em;
    }
  }
`;
}

declare global {
	interface HTMLElementTagNameMap {
		'mr-spinner': MRSpinner;
	}
}
