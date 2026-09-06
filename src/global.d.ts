export declare global {

    export type Exp = string | RegExp;

    export interface TokenPlain {
        id: string;
        type: string;
        value: string;
        start: number;
        end: number;
        number?: number;
        unit?: string;
        children?: TokenPlain[]
    }

    export type Tuple = [type: number, start: number, end: number];
    export type TRange = [start: number, end: number];
}

export { };