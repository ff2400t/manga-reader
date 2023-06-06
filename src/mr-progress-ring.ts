import { customElement, property, query, state } from 'lit/decorators.js';
import { LitElement, css, html } from 'lit';

@customElement('mr-progress-ring')
export default class MRProgressRing extends LitElement{

  @query('.progress-ring__indicator') indicator!: SVGCircleElement;

  @state() indicatorOffset!: string;

  /** The current progress as a percentage, 0 to 100. */
  @property({ type: Number, reflect: true }) value = 0; 

  updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);

    //
    // This block is only required for Safari because it doesn't transition the circle when the custom properties
    // change, possibly because of a mix of pixel + unit-less values in the calc() function. It seems like a Safari bug,
    // but I couldn't pinpoint it so this works around the problem.
    //
    if (changedProps.has('value')) {
      const radius = parseFloat(getComputedStyle(this.indicator).getPropertyValue('r'));
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (this.value / 100) * circumference;

      this.indicatorOffset = `${offset}px`;
    }
  }

  render() {
    return html`
      <div
        class="progress-ring"
        role="progressbar"
        aria-label="Progress"
        aria-describedby="label"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${this.value}"
        style="--percentage: ${this.value / 100}"
      >
        <svg class="progress-ring__image">
          <circle class="progress-ring__track"></circle>
          <circle class="progress-ring__indicator" style="stroke-dashoffset: ${this.indicatorOffset}"></circle>
        </svg> 
      </div>
    `;
  }

  static styles = css`
  :host { 
    display: inline-flex;
  }

  .progress-ring {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .progress-ring__image {
    width: var(--mr-loader-size);
    height: var(--mr-loader-size);
    rotate: -90deg;
    transform-origin: 50% 50%;
  }

  .progress-ring__track,
  .progress-ring__indicator {
    --radius: calc(var(--mr-loader-size) / 2 - max(var(--mr-track-width), var(--mr-track-width)) * 0.5);
    --circumference: calc(var(--radius) * 2 * 3.141592654);

    fill: none;
    r: var(--radius);
    cx: calc(var(--mr-loader-size) / 2);
    cy: calc(var(--mr-loader-size) / 2);
  }

  .progress-ring__track {
    stroke: var(--mr-bg);
    stroke-width: var(--mr-track-width);
  }

  .progress-ring__indicator {
    stroke: var(--mr-loader-color);
    stroke-width: var(--mr-track-width);
    stroke-linecap: round;
    transition-property: stroke-dashoffset;
    transition-duration: var(--indicator-transition-duration);
    stroke-dasharray: var(--circumference) var(--circumference);
    stroke-dashoffset: calc(var(--circumference) - var(--percentage) * var(--circumference));
  }
	`
}

declare global {
  interface HTMLElementTagNameMap {
    'mr-progress-ring': MRProgressRing;
  }
}
