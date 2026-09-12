import { Registry } from "@/registry";
import { Tokenizer } from "@/tokenizer";

const registry = new Registry();
const tokenizer = new Tokenizer(registry);


const content = `10px 20px`;
const tuples = tokenizer.tokenize(content);

console.log(tuples);