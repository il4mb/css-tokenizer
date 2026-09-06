import { Registry } from "./registry";
import { Tokenizer } from "./tokenizer";

export type * from "./type";
export * from "./registry";
export * from "./tokenizer";
export * from "./tools";
export * from "./tupleList";


const tokenizer = new Tokenizer(new Registry());
export const tokenizeImpl = (content: string) => tokenizer.tokenize(content);