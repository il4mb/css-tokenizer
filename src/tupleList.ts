import { Registry } from "./registry";
import { PlainToken, IToken } from "./type";

export class TupleList {


    constructor(protected registry: Registry, protected items: IToken[] = []) { }

    push(...items: IToken[]) {
        items.forEach(item => {
            this.items.push(item);
        });
    }

    toArray() {
        return [...this.items];
    }

    sort() {
        this.items.sort((a, b) => a[1] !== b[1] ? a[1] - b[1] : b[2] - a[2]);
    }

    toPlainList(content: string): PlainToken[] {
        return this.toArray().map(([type, start, end]) => {
            return {
                type,
                start,
                end,
                value: content.slice(start, end),
            } as PlainToken
        });
    }

    // toTokenList(content: string): TokenList {
    //     this.sort();
    //     const plainList = this.toPlainList(content);
    //     return new TokenList(plainList);
    // }

    toJSON() {
        return [...this.items]
    }
}