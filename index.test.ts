import { Registry } from "@/registry";
import { Tokenizer } from "@/tokenizer";
import { readWhile } from "@/tools";

const registry = new Registry();
registry.add({
    type: "var",
    kind: "class",
    regex: /^--[a-z][a-z0-9-_]+/i,
    priority: 10,
    reader({ index, content }) {
        let nextIndex = readWhile(content, index + 2, /[a-z0-9-_]/);
        return [index, nextIndex];
    },
});

const tokenizer = new Tokenizer(registry);


const content = `--primary`;
const result = tokenizer.tokenize(content);

console.log(result.toArray()); 
console.log(JSON.stringify(result.toTokenTree(content), null, 2));