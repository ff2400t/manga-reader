import { LitElement, PropertyValueMap, PropertyValues } from 'lit';
type Mode = 'horizontal-rtl' | 'horizontal-ltr' | 'vertical';
type ScaleType = 'fitWidth' | 'fitHeight';
/**
 * Manga Reader component
 */
export declare class MangaReader extends LitElement {
    #private;
    pages: string[];
    mode: Mode;
    currentPage: number;
    scaleType: ScaleType;
    container: HTMLDivElement;
    observer: IntersectionObserver;
    connectedCallback(): void;
    disconnectedCallback(): void;
    shouldUpdate(changedProperties: PropertyValues<this>): boolean;
    attributeChangedCallback(name: string, _: string, newValue: string): void;
    updated(changedProperties: PropertyValueMap<any>): void;
    render(): import("lit").TemplateResult<1>;
    /**
     * Go to a Page with a particular page number
     * This will return Boolean to indicate whether the page change was successfull
     */
    gotoPage(num: number): boolean;
    setUpHorizontalIntersectionObserver(): void;
    setUpVerticalIntersectionObserver(): void;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'manga-reader': MangaReader;
    }
}
export {};
