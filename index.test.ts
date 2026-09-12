import { Registry } from "@/registry";
import { Tokenizer } from "@/tokenizer";

const registry = new Registry();
const tokenizer = new Tokenizer(registry);


const content = `.hallo {\npadding: 10px 20px;\nmargin: 5px;\n}\n\n@media (max-width: 600px) {\n  .hallo {\n    padding: 5px;\n  }\n}`;
const tuples = tokenizer.tokenize(content);

console.log(tuples);