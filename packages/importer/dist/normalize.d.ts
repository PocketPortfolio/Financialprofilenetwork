export declare function toISO(value: string, locale: string): string;
export declare function toNumber(value: string | number, locale: string): number;
export declare function toTicker(value: string): string;
export declare function hashRow(obj: Record<string, unknown>): string;
export declare function inferCurrency(row: Record<string, any>, fallback: string): any;
