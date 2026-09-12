import { Registry } from "./registry";
import { IExp, ModelDefinition, IRange, IToken } from "./type";

export class Tokenizer {

    constructor(public registry: Registry) { }

    getReader(def: ModelDefinition, match?: IExp) {
        const type = def.type;
        return ((content: string, index: number): IToken[] => {
            if (def.kind === "char") {
                // char only single character so just + 1 for nextIndex
                return [[type, index, index + 1]];
            }

            const createTuple = (range: IRange, value?: string): IToken => {
                const contentValue = value ?? content.slice(range[0], range[1]);
                const hit = this.findMatch(contentValue, range[0]);
                return [hit?.[0] ?? 'unknown', range[0], range[1]];
            }

            const deepReader = (ranges: IRange | IRange[], startAt?: number): IToken[] => {
                const tuples: IToken[] = this.isRange(ranges) ? [[type, ...ranges]] : ranges.map<IToken>((r, i) => (i === 0 ? [type, r[0], r[1]] : r.length == 2 ? createTuple(r) : r) as IToken);
                const firstRange = tuples[0];
                const startRange = startAt ?? firstRange[1];
                const rangeContent = content.slice(startRange, firstRange[2]);
                const others = this.tokenize(rangeContent, { ignoreTypes: [type] }).map(([type, start, end]) => [type, start + startRange, end + startRange] as IToken);

                tuples.push(...others);
                return tuples;
            }


            if (def.kind === "class") {
                if ('reader' in def && def.reader) {
                    const ranges = def.reader({ content, index, deepReader, createTuple });
                    if (this.isRange(ranges)) {
                        return [[type, ranges[0], ranges[1]]];
                    }
                    return ranges.map((range: any) => range.length === 2 ? [type, range[0], range[1]] : range) as IToken[];
                }

                const start = index;
                let nextIndex = start + 1;

                // Added length check and optional chaining to prevent infinite loops and crashes
                while (nextIndex < content.length) {
                    const nextMatch = this.findMatch(content, nextIndex);
                    if (nextMatch && type === nextMatch[0]) {
                        nextIndex++;
                    } else {
                        break;
                    }
                }

                return [[type, start, nextIndex]];
            }

            // Keyword fallback check (in case reader is undefined)
            if (!def.reader) {
                const length = typeof match === "string" ? match.length : 1;
                return [[type, index, index + length]];
            }

            const ranges = def.reader({ content, index, matched: match, deepReader, createTuple });
            if (this.isRange(ranges)) {
                return [[type, ranges[0], ranges[1]]];
            }
            return ranges.map((range: any) => range.length === 2 ? [type, range[0], range[1]] : range) as IToken[];
        });
    }

    findMatch(content: string, index: number, ignoreTypes?: string[]): [string, (c: string, i: number) => IToken[]] | undefined {
        for (const def of this.registry) {
            // Bypass ignored rules so fallback tokens get a chance
            if (ignoreTypes && ignoreTypes.includes(def.type)) {
                continue;
            }

            const match = this.tryMatch(def, content, index);
            if (match) return [def.type, match];
        }
        return undefined;
    }

    tryMatch(def: ModelDefinition, content: string, index: number) {
        // Guard against out-of-bounds indexing
        if (index >= content.length) return false;

        if (def.kind === "keyword") {
            const right = content.slice(index);
            const matched = this.registry.sortExps(def.exp).find(exp =>
                exp instanceof RegExp ? exp.test(right) : right.startsWith(exp as string)
            );

            return matched ? this.getReader(def, matched) : false;
        }

        if (def.kind === "class") {
            if (!def.regex.test(content.slice(index))) return false;
            return this.getReader(def);
        }

        if (def.kind === "char") {
            if ('regex' in def) {
                if (!def.regex.test(content.slice(index))) return false;
                return this.getReader(def);
            }
            return def.char === content[index] ? this.getReader(def) : false;
        }
        return false;
    }

    tokenize(content: string, options?: { ignoreTypes?: string[] }): IToken[] {
        const tupleList = [];
        let i = 0;

        while (i < content.length) {
            let hit = this.findMatch(content, i, options?.ignoreTypes);
            if (hit) {
                const results = hit[1](content, i);
                if (results && results.length > 0) {
                    const nextIndex = Math.max(i, ...results.map(tuple => tuple[2]));
                    if (nextIndex <= i) {
                        tupleList.push([-1, i, i + 1]);
                        i++;
                        continue;
                    }

                    tupleList.push(...results);
                    i = nextIndex;
                    continue;
                }
            }

            tupleList.push([-1, i, i + 1]);
            i++;
        }
        tupleList.sort();
        return tupleList;
    }

    isRange(data: any): data is IRange {
        return Array.isArray(data) && data.length === 2 && data.every(t => typeof t === "number");
    }

    isTuple(data: any): data is IToken {
        return Array.isArray(data) && data.length === 3 && data.every((t, i) => typeof t === (i === 0 ? "string" : "number"));
    }
}