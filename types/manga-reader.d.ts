import { LitElement, PropertyValueMap, PropertyValues } from 'lit';
import './mr-image';
import MRImage from './mr-image';
type Mode = 'horizontal' | 'vertical' | 'double-page' | 'double-page-odd' | 'webtoon';
type ReadingDirection = 'rtl' | 'ltr';
export type ScaleType = 'fit-screen' | 'fit-width' | 'fit-height' | 'stretch' | 'original-size' | "smart-fit";
/**
 * Manga Reader component
 */
export declare class MangaReader extends LitElement {
    #private;
    pages: string[];
    mode: Mode;
    dir: ReadingDirection;
    currentPage: number;
    scaleType: ScaleType;
    showTouchIndicator: boolean;
    webtoonPadding: number;
    handleMiddleClick: () => void;
    /**
     * No of images to preload after the current Image
     * The default is to preload the next page
     */
    preloadNo: number;
    container: HTMLDivElement;
    touchIndicator: HTMLDivElement;
    /**
     * Amount to scroll during a click event in webtoon Mode
     * Number between 0 and 1
     */
    webtoonScrollAmount: number;
    observer: IntersectionObserver;
    resizeObserver: ResizeObserver | undefined;
    connectedCallback(): void;
    disconnectedCallback(): void;
    shouldUpdate(changedProperties: PropertyValues<this>): boolean;
    willUpdate(changedProperties: PropertyValues<this>): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    firstUpdated(): void;
    updated(changedProperties: PropertyValueMap<any>): void;
    render(): import("lit").TemplateResult<1>;
    /**
     * Go to a Page with a particular page number
     * and this also checks if the page should exist or not
     * This will return Boolean to indicate whether the page changed was successfull
     */
    gotoPage(num: number): boolean;
    setUpHorizontalIntersectionObserver(): void;
    setUpWebtoonIntersectionObserver(): void;
    setUpResizeObserver(): void;
    resizeImage(image: MRImage): void;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'manga-reader': MangaReader;
    }
}
export {};
