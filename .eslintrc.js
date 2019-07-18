module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "plugins": ["prettier"],
    "extends": [
        "eslint:recommended",
        "prettier",
        "plugin:@typescript-eslint/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "project": './tsconfig.json'  
    },
    "rules": {
        "prettier/prettier": "error",
        "@typescript-eslint/camelcase": 0,
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/indent": 0,
    }
};