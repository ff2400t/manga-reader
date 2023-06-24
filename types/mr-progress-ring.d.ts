import { LitElement } from 'lit';
export default class MRProgressRing extends LitElement {
    indicator: SVGCircleElement;
    indicatorOffset: string;
    /** The current progress as a percentage, 0 to 100. */
    value: number;
    updated(changedProps: Map<string, unknown>): void;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'mr-progress-ring': MRProgressRing;
    }
}
