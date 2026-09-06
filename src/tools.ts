export const CSS_NAMED_COLORS = [
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

export const COLOR_FUNCTIONS = [
    /^rgba?\(/i, /^hsla?\(/i, /^hwb\(/i, /^lab\(/i, /^lch\(/i,
    /^oklab\(/i, /^oklch\(/i, /^color\(/i, /^color-mix\(/i
];

export const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;

export const CSS_UNITS = [
    // Absolute lengths
    "px", "cm", "mm", "q", "in", "pt", "pc",
    // Relative lengths (font-relative)
    "em", "ex", "ch", "rem", "lh", "rlh", "cap", "ic",
    // Viewport units
    "vw", "vh", "vi", "vb", "vmin", "vmax",
    "svw", "svh", "svi", "svb", "svmin", "svmax",
    "lvw", "lvh", "lvi", "lvb", "lvmin", "lvmax",
    "dvw", "dvh", "dvi", "dvb", "dvmin", "dvmax",
    // Container query units
    "cqw", "cqh", "cqi", "cqb", "cqmin", "cqmax",
    // Percentage
    "%",
    // Angles
    "deg", "grad", "rad", "turn",
    // Time
    "s", "ms",
    // Frequency
    "hz", "khz",
    // Resolution
    "dpi", "dpcm", "dppx", "x",
    // Flex
    "fr"
];

export const findFunctionEnd = (source: string, index: number): number => {
    let depth = 0;
    let cursor = index;
    let inString = false;
    let stringChar = '';

    while (cursor < source.length) {
        const char = source[cursor];

        // Handle strings
        if (!inString && (char === '"' || char === "'")) {
            inString = true;
            stringChar = char;
        } else if (inString && char === stringChar) {
            inString = false;
        }

        // Only count parentheses outside of strings
        if (!inString) {
            if (char === '(') depth++;
            else if (char === ')') {
                depth--;
                if (depth === 0) return cursor + 1;
            }
        }

        cursor++;
    }
    return source.length;
}

export const readWhile = (content: string, index: number, test: RegExp) => {
    let nextIndex = index;
    while (nextIndex < content.length && test.test(content[nextIndex])) nextIndex++;
    return nextIndex;
}