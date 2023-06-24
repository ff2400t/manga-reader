import { LitElement } from 'lit';
export default class MRSpinner extends LitElement {
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'mr-spinner': MRSpinner;
    }
}
