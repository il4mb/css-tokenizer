import { Registry } from "./registry";
import { TupleList } from "./tupleList";
import { Exp, ModelDefinition, TRange, Tuple } from "./type";

export class Tokenizer {

    constructor(public registry: Registry) { }

    getReader(def: ModelDefinition, match?: Exp) {
        const type = this.registry.indexOf(def);
        return ((content: string, index: number): Tuple[] => {
            if (def.kind === "char") {
                // char only single character so just + 1 for nextIndex
                return [[type, index, index + 1]];
            }

            const deepReader = (range: TRange, startAt?: number): Tuple[] => {
                const tuples: Tuple[] = [[type, range[0], range[1]]];
                const rangeContent = content.slice(startAt ?? range[0], range[1]);
                const others = this.tokenize(rangeContent, { ignoreTypes: [type] })
                    .toArray()
                    .map(([type, start, end]) => [type, start + (startAt ?? range[0]), end + (startAt ?? range[0])] as Tuple);

                tuples.push(...others);
                return tuples;
            }

            if (def.kind === "class") {
                if ('reader' in def && def.reader) {
                    let ranges = def.reader({ content, index, deepReader });
                    if (ranges.length > 0 && Array.isArray(ranges[0])) {
                        return ranges.map((range: any) => range.length === 2 ? [type, ...range] : range) as Tuple[];
                    }
                    return [[type, ...(ranges as TRange)]];
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

            const ranges = def.reader({ content, index, matched: match, deepReader });
            if (ranges.length > 0 && Array.isArray(ranges[0])) {
                return ranges.map((range: any) => range.length === 2 ? [type, ...range] : range) as Tuple[];
            }
            return [[type, ...(ranges as TRange)]];
        });
    }

    findMatch(content: string, index: number, ignoreTypes?: number[]): [number, (c: string, i: number) => Tuple[]] | undefined {
        for (let i = 0; i < this.registry.length; i++) {
            // Bypass ignored rules so fallback tokens get a chance
            if (ignoreTypes && ignoreTypes.includes(i)) {
                continue;
            }

            const match = this.tryMatch(this.registry.get(i), content, index);
            if (match) return [i, match];
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

    tokenize(content: string, options?: { ignoreTypes?: number[] }) {
        const tupleList = new TupleList(this.registry);
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

        return tupleList;
    }

    isRange(data: any): data is TRange {
        return Array.isArray(data) && data.length === 2 && data.every(t => typeof t === "number");
    }

    isTuple(data: any): data is Tuple {
        return Array.isArray(data) && data.length === 3 && data.every(t => typeof t === "number");
    }
}