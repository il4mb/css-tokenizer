import { COLOR_FUNCTIONS, CSS_NAMED_COLORS, CSS_UNITS, findFunctionEnd, HEX_COLOR, readWhile } from "./tools";
import { Exp, ModelDefinition } from "./type";

export class Registry implements Iterable<ModelDefinition> {

    private readonly items: ModelDefinition[] = [
        {
            type: "symbol",
            kind: "char",
            regex: /[\s\S]/,
            priority: 0
        },
        {
            type: "escape",
            kind: "class",
            regex: /^\\[0-9a-f]{1,6}\s?/i,
            priority: 110,
            reader({ index, content }) {
                let nextIndex = index + 1;
                let count = 0;
                while (nextIndex < content.length && /[0-9a-f]/i.test(content[nextIndex]) && count < 6) {
                    nextIndex++;
                    count++;
                }
                // Optional single whitespace after escape
                if (nextIndex < content.length && /\s/.test(content[nextIndex])) {
                    nextIndex++;
                }
                return [index, nextIndex];
            }
        },
        {
            type: "unicode-range",
            kind: "keyword",
            exp: [/^u\+[0-9a-f?]{1,6}(-[0-9a-f]{1,6})?/i],
            priority: 110,
            reader({ index, content, matched }) {
                const match = matched instanceof RegExp ? matched.exec(content.slice(index)) : null;
                if (!match) return [index, index + 1];
                return [index, index + match[0].length];
            }
        },
        {
            type: "punctuation",
            kind: "class",
            regex: /^[{}()\[\],;:.]/,
            priority: 80,
            reader({ index, content }) {
                return [index, index + 1];
            }
        },
        {
            type: "operator",
            kind: "class",
            regex: /^[+\-*/=<>!~^|&]+/,
            priority: 80,
            reader({ index, content }) {
                let nextIndex = index;
                while (nextIndex < content.length && /[+\-*/=<>!~^|&]/.test(content[nextIndex])) {
                    nextIndex++;
                }
                return [index, nextIndex];
            }
        },
        {
            type: "variable",
            kind: "keyword",
            exp: [/^--[a-zA-Z0-9-_]+/],
            priority: 110,
            reader({ index, content, matched }) {
                const match = matched instanceof RegExp ? matched.exec(content.slice(index)) : null;
                if (!match) return [index, index + 1];
                return [index, index + match[0].length];
            }
        },
        {
            type: "comment",
            kind: "class",
            regex: /^\/\*/,
            priority: 90,
            reader({ index, content }) {
                let nextIndex = index + 2;
                while (nextIndex < content.length && !(content[nextIndex] === '*' && content[nextIndex + 1] === '/')) {
                    nextIndex++;
                }
                // Include the closing */
                if (nextIndex < content.length) nextIndex += 2;
                return [index, nextIndex];
            }
        },
        {
            type: "whitespace",
            kind: "class",
            regex: /^\s+/,
            priority: 90,
            reader({ index, content }) {
                let nextIndex = index;
                while (nextIndex < content.length && /\s/.test(content[nextIndex])) {
                    nextIndex++;
                }
                return [index, nextIndex];
            }
        },
        {
            type: "url",
            kind: "class",
            regex: /^\"https?:\/\/[^\"]+/i,
            priority: 50,
            reader({ index, content }) {
                let nextIndex = index + 1;
                while (nextIndex < content.length && content[nextIndex] !== '"') {
                    nextIndex++;
                }
                if (nextIndex < content.length && content[nextIndex] === '"') {
                    nextIndex++;
                }

                return [index, nextIndex];
            }
        },
        {
            type: "string",
            kind: "class",
            regex: /^\"[^\"]*\"|^\'[^\']*\'/,
            priority: 20,
            reader({ index, content }) {
                const quoteChar = content[index];
                let nextIndex = index + 1;
                while (nextIndex < content.length && content[nextIndex] !== quoteChar) {
                    nextIndex++;
                }
                if (nextIndex < content.length && content[nextIndex] === quoteChar) {
                    nextIndex++;
                }

                return [index, nextIndex];
            }
        },
        {
            type: "atrule",
            kind: "keyword",
            exp: [/^@[a-z]+/i],
            priority: 100,
            reader({ index, content, deepReader }) {
                const match = /^@[\w-]+/.exec(content.slice(index));
                if (!match) return [index, index + 1];
                const value = match[0];
                const nextIndex = index + value.length;
                return deepReader([index, nextIndex]);
            }
        },
        {
            type: "function",
            kind: "keyword",
            exp: [/^[a-z][a-z0-9-]*\(/i],
            priority: 150,
            reader({ index, content, deepReader }) {
                const match = /^[a-z][a-z0-9-]*\(/i.exec(content.slice(index));
                if (!match) return [index, index + 1];
                const end = findFunctionEnd(content, index);
                return deepReader([index, end]);
            }
        },
        {
            type: "dimension",
            kind: "keyword",
            exp: [/^[+-]?[0-9]+[a-z]+/],
            priority: 110,
            reader({ index, content, deepReader }) {
                let end = index;
                if (content[end] === "-" || content[end] === "+") end++;
                while (end < content.length && /[0-9]/.test(content[end])) end++;

                if (content[end] === "." && /[0-9]/.test(content[end + 1] ?? "")) {
                    end++;
                    while (end < content.length && /[0-9]/.test(content[end])) end++;
                }

                while (end < content.length && /[a-zA-Z%]/.test(content[end])) end++;
                return deepReader([index, end]);
            }
        },
        {
            type: "number",
            kind: "class",
            regex: /^[0-9]/,
            priority: 5,
            reader({ index, content }) {
                let nextIndex = index;
                while (/^[0-9]$/.test(content[nextIndex])) {
                    nextIndex++;
                }
                return [index, nextIndex];
            }
        },
        {
            type: "unit",
            kind: "keyword",
            exp: CSS_UNITS.map(unit => new RegExp(`^${unit}\\b`, "i")),
            priority: 10,
            reader({ index, content, matched }) {
                const match = matched instanceof RegExp ? matched.exec(content.slice(index)) : null;
                if (!match) return [index, index + 1];
                return [index, index + match[0].length];
            }
        },
        {
            type: "word",
            kind: "class",
            regex: /^[a-z]/i, // Constrained to single char match
            priority: 5,
            reader({ index, content }) {
                let nextIndex = readWhile(content, index, /[a-z0-9_-]+/);
                return [index, nextIndex];
            },
        },
        {
            type: "hash",
            kind: "class",
            regex: /^#[a-z0-9]+/i,
            priority: 50,
            reader({ index, content }) {
                let nextIndex = index + 1;
                while (nextIndex < content.length && /^[a-z0-9]+/i.test(content[nextIndex])) {
                    nextIndex++
                }
                return [index, nextIndex];
            },
        },
        {
            type: "color",
            kind: "keyword",
            priority: 120,
            exp: [...CSS_NAMED_COLORS, HEX_COLOR, ...COLOR_FUNCTIONS],
            reader({ index, content, matched, deepReader }) {
                if (matched instanceof RegExp) {
                    const match = matched.exec(content.slice(index));
                    if (!match) return [index, index + 1];
                    const value = match[0];
                    if (value.endsWith('(')) {
                        const end = findFunctionEnd(content, index);
                        return deepReader([index, end], index + value.length - 1);
                    }
                }
                const nextIndex = readWhile(content, index + 1, /[a-zA-Z0-9_-]/);
                return [index, nextIndex];
            },
        }
    ];

    constructor(models: ModelDefinition[] = []) {
        this.items.push(...models);
        this.sort();
    }

    all() {
        return [...this.items];
    }
    
    add(def: ModelDefinition) {
        this.items.push({ priority: 0, ...def });
        this.sort();
    }

    get(index: number) {
        return this.items[index];
    }

    get length() {
        return this.items.length;
    }

    [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }

    indexOf(item: ModelDefinition) {
        return this.items.indexOf(item);
    }

    sort() {
        this.items.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }

    sortExps(exps: Exp[]): Exp[] {
        return [...exps].sort((a, b) => {
            const aIsRegex = a instanceof RegExp;
            const bIsRegex = b instanceof RegExp;
            if (aIsRegex !== bIsRegex) return aIsRegex ? -1 : 1;
            if (aIsRegex && bIsRegex) return 0;
            return (b as string).length - (a as string).length;
        });
    }
}