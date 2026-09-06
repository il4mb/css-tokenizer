export type ReaderContext = {
    content: string;
    index: number;
    deepReader: (ranges: TRange, startAt?: number) => Tuple[]
}



export interface CharModel {
    kind: "char";
    char: string;
}
export interface CharRegexModel {
    kind: "char";
    regex: RegExp;
}

export interface KeywordModel {
    kind: "keyword";
    exp: Exp[];
    reader: (ctx: ReaderContext & { matched: Exp }) => TRange[] | TRange | Tuple[];
}

export interface ClassModel {
    kind: "class";
    regex: RegExp;
    reader?: (ctx: ReaderContext) => TRange[] | TRange | Tuple[];
}

export type Model = CharModel | CharRegexModel | KeywordModel | ClassModel;

export type ModelDefinition<T extends Model = Model> = {
    type: string;
    priority?: number;
} & T;

export type Token = {
    type: string;
    start: number;
    end: number;
    value: string;
}

export type TokenTree = Token & {
    children?: TokenTree[]
}

export type Exp = string | RegExp;
export type Tuple = [type: number, start: number, end: number];
export type TRange = [start: number, end: number];