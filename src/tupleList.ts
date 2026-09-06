import { Registry } from "./registry";

export type TokenTree = {
    type: string;
    start: number;
    end: number
    value: string;
    children?: TokenTree[]
}

export class TupleList {
    protected items: Tuple[] = [];

    constructor(protected registry: Registry) { }

    push(...items: Tuple[]) {
        items.forEach(item => {
            this.items.push(item);
        });
    }

    toArray() {
        return [...this.items];
    }

    toTokenList(content: string): TokenTree[] {
        return this.items.map(([type, start, end]) => {
            const model = this.registry.get(type);
            return {
                type: model?.type ?? "unknown",
                start,
                end,
                value: content.slice(start, end),
            };
        });
    }

    toTokenTree(content: string): TokenTree[] {
        const tokens = this.toTokenList(content);
        
        tokens.sort((a, b) => {
            if (a.start !== b.start) {
                return a.start - b.start;
            }
            return b.end - a.end;
        });

        const roots: TokenTree[] = [];
        const stack: TokenTree[] = [];

        for (const token of tokens) {
            /*
             * FIXED: Robust parent exit check. 
             * Pop parents whose physical range strictly ends before or exactly where the new token starts.
             * (e.g. `parent.end <= token.start`)
             */
            while (stack.length > 0 && stack[stack.length - 1].end <= token.start) {
                stack.pop();
            }
            const parent = stack[stack.length - 1];

            if (parent) {
                if (!parent.children) parent.children = [];
                parent.children.push(token);
            } else {
                roots.push(token);
            }
            stack.push(token);
        }

        return roots;
    }
}