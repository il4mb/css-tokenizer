import { findFunctionEnd, readWhile } from "./tools";
import { ModelDefinition } from "./type";

const CSS_NAMED_COLORS = [
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure",
    "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet",
    "brown", "burlywood", "cadetblue", "chartreuse", "chocolate",
    "coral", "cornflowerblue", "cornsilk", "crimson", "cyan",
    "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgrey",
    "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen",
    "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
    "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise",
    "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey",
    "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia",
    "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey",
    "green", "greenyellow", "honeydew", "hotpink", "indianred",
    "indigo", "ivory", "khaki", "lavender", "lavenderblush",
    "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
    "lightgoldenrodyellow", "lightgray", "lightgrey", "lightgreen",
    "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
    "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow",
    "lime", "limegreen", "linen", "magenta", "maroon",
    "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
    "mediumseagreen", "mediumslateblue", "mediumspringgreen",
    "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream",
    "mistyrose", "moccasin", "navajowhite", "navy", "oldlace",
    "olive", "olivedrab", "orange", "orangered", "orchid",
    "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
    "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
    "purple", "rebeccapurple", "red", "rosybrown", "royalblue",
    "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell",
    "sienna", "silver", "skyblue", "slateblue", "slategray",
    "slategrey", "snow", "springgreen", "steelblue", "tan", "teal",
    "thistle", "tomato", "turquoise", "violet", "wheat", "white",
    "whitesmoke", "yellow", "yellowgreen", "transparent", "currentcolor",
];

const COLOR_FUNCTIONS = [
    /^rgba?\(/i, /^hsla?\(/i, /^hwb\(/i, /^lab\(/i, /^lch\(/i,
    /^oklab\(/i, /^oklch\(/i, /^color\(/i, /^color-mix\(/i
];

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;



export class Registry implements Iterable<ModelDefinition> {

    private items: ModelDefinition[] = [
        {
            type: "symbol",
            kind: "char",
            regex: /[\s\S]/,
            priority: 0
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
                        const fnName = value.slice(0, -1);
                        const innerStart = index + value.length;
                        const innerEnd = Math.max(innerStart, end);
                        return deepReader([index, end]);
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