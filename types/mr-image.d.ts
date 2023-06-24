import { LitElement, PropertyValueMap } from 'lit';
import './mr-progress-ring.ts';
import './mr-spinner.ts';
type ImageState = "idle" | "fetching" | "done" | 'failure';
type ImageOrientation = 'portrait' | 'landscape';
export type MRImageLoad = CustomEvent<MRImage>;
export default class MRImage extends LitElement {
    #private;
    state: ImageState;
    src: string;
    fetchingProgress: number;
    objectURL: string;
    orientation: ImageOrientation;
    setFetchProgress(newValue: number): void;
    willUpdate(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    load(): Promise<void>;
    render(): import("lit").TemplateResult<1>;
    loadHandler(e: Event): void;
    retry(): Promise<void>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'mr-image': MRImage;
    }
}
export {};
