export function findFunctionEnd(source: string, index: number): number {
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