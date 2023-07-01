import { LitElement, PropertyValues } from 'lit';
import { MangaReader, ScaleType } from './manga-reader';
export default class MangaReaderWithUI extends LitElement {
    reader: MangaReader;
    container: HTMLDivElement;
    scaleTypeSelect: HTMLSelectElement;
    controls: HTMLFormElement;
    pages: never[];
    mode: string;
    dir: string;
    scaleType: ScaleType;
    webtoonPadding: number;
    showTouchIndicator: boolean;
    constructor();
    willUpdate(changedProperties: PropertyValues): void;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues): void;
    render(): import("lit").TemplateResult<1>;
    handleInput(event: InputEvent): void;
    toggleFullscreen(): void;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'manga-reader-with-ui': MangaReaderWithUI;
    }
}
