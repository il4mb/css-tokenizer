export type ReaderContext = {
    content: string;
    index: number;
    deepReader: (ranges: IRange | IRange[], startAt?: number) => IToken[];
    createTuple: (ranges: IRange) => IToken;
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
    exp: IExp[];
    reader: (ctx: ReaderContext & { matched: IExp }) => IRange[] | IRange | IToken[];
}

export interface ClassModel {
    kind: "class";
    regex: RegExp;
    reader?: (ctx: ReaderContext) => IRange[] | IRange | IToken[];
}

export type Model = CharModel | CharRegexModel | KeywordModel | ClassModel;

export type ModelDefinition<T extends Model = Model> = {
    type: string;
    priority?: number;
} & T;

export type PlainToken = {
    type: string;
    start: number;
    end: number;
    value: string;
}

export type TokenTree = PlainToken & {
    children?: TokenTree[]
}

export type IExp = string | RegExp;
export type IRange = [start: number, end: number];
export type IToken = [type: string, ...IRange];
