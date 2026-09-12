# css-tokenizer

Modular, extensible CSS tokenizer for parsing CSS-like strings into tuple lists and token trees.

## Get started

Install:

```bash
npm install @il4mb/css-tokenizer
```

## Quick usage

```ts
import { tokenizeImpl } from "@il4mb/css-tokenizer";

const content = "width: 10px";
const result = tokenizeImpl(content);

// Tuple list entries are [type, start, end]
console.log(result);
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

console.log(result);
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
