export declare function csvFrom(file: {
    name: string;
    mime: string;
    arrayBuffer: () => Promise<ArrayBuffer>;
}): Promise<string>;
export declare function csvParse(text: string): Record<string, string>[];
