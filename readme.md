# css-tokenizer

Modular, extensible CSS tokenizer for parsing CSS-like strings into tuple lists and token trees.

## Get started

Install:

```bash
npm install @il4mb/css-tokenizer
```

## Quick usage

```ts
import { tokenize } from "@il4mb/css-tokenizer";

const content = "width: 10px";
const result = tokenize(content);

// Tuple list entries are [type, start, end]
console.log(result.toArray());

// Convert tuples to a structured token tree (useful for walking semantic tokens)
console.log(JSON.stringify(result.toTokenTree(content), null, 2));
```

Example token tree (for the value `10px`):

```json
[
    {
        "type": "dimension",
        "start": 7,
        "end": 11,
        "value": "10px",
        "children": [
            { "type": "number", "start": 7, "end": 9, "value": "10" },
            { "type": "word", "start": 9, "end": 11, "value": "px" }
        ]
    }
]
```

## Custom token types

You can register custom token readers with a `Registry` and use a `Tokenizer` built from that registry.

```ts
import { Registry, Tokenizer, readWhile } from "@il4mb/css-tokenizer";

const registry = new Registry();

registry.add({
    type: "var",           // token name
    kind: "class",        // category hint (class|char|keyword)
    regex: /^--[a-z][a-z0-9-_]+/i,
    priority: 10,
    reader({ index, content }) {
        // advance past the leading `--`
        const nextIndex = readWhile(content, index + 2, /[a-z0-9-_]/i);
        return [index, nextIndex];
    },
});

const tokenizer = new Tokenizer(registry);
const content = `--primary`;
const result = tokenizer.tokenize(content);

console.log(result.toArray());
console.log(JSON.stringify(result.toTokenTree(content), null, 2));
```

## API (high level)

- `tokenize(content: string)` — tokenize using the default registry
- `Registry` — create and customize token definitions
- `Tokenizer` — tokenizer instance that uses a `Registry`
- helpers: `readWhile`, `findFunctionEnd` and others from the `tools` export

## Contributing

PRs and issues welcome. Please add tests for new token readers.

## License

MIT
