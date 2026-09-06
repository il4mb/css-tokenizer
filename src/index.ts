/// <reference path="./global.d.ts" />

import { Registry } from "./registry";
import { Tokenizer } from "./tokenizer";

export { Registry } from "./registry";
export { Tokenizer } from "./tokenizer";
export * from "./tools";
export * from "./tupleList";


const tokenizer = new Tokenizer(new Registry());
export const tokenize = (content: string) => tokenizer.tokenize(content);