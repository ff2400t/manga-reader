/**
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 */
export default function debounce(func: any, wait?: number, immediate?: boolean): {
    (...args: any[]): any;
    clear(): void;
    flush(): void;
};
