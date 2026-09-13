import { tokenizeImpl } from "@il4mb/css-tokenizer";

const css = `
body {
    background-color: #f0f0f0;
    color: #333;
    font-family: Arial, sans-serif;
}
`;

const tokens = tokenizeImpl(css);
console.log(tokens);