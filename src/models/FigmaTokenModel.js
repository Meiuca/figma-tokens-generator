const { 
    OFFSET_VALUE_TO_TOKEN_VALUE, 
    CHARACTER_TO_INDICATE_VARIABLE 
} = require('../utils/constants');

class FigmaToken {

    brand = '';
    tokens = [];
    tokensChildren = [];

    constructor(brand, type) {
        this.brand = brand;
    }

    get tokens() {
        return this.tokens;
    }

    findTokensNode(children) {
        if (children && children.length > 0) {
            children.forEach(child => {
                if (child.name === 'Tokens') {
                    this.tokensChildren = child;
                }
            });

            if (this.tokensChildren.length === 0) {
                children.forEach(child => {
                    return this.findTokensNode(child.children || []);
                });
            }
        }
        return this.tokensChildren;
    }

    makeTokens(children) {
        let designToken = {};
        if (children && children.length > 0) {
            children.forEach((child, index) => {
                if (child.name.includes(CHARACTER_TO_INDICATE_VARIABLE)) 
                {
                    designToken.name = child.name.toLowerCase().replace(CHARACTER_TO_INDICATE_VARIABLE, '');
                    designToken.value = children[index + OFFSET_VALUE_TO_TOKEN_VALUE].characters;
                }
            });

            if (!designToken.name || !designToken.value) {
                children.forEach(child => {
                    this.makeTokens(child.children || []);
                });
            } else {
                this.pushDesignToken(designToken);
            }
        }
    }

    pushDesignToken(designToken) {
        if (!this.tokens.some(token => token.name === designToken.name)) {
            this.tokens.push(designToken);
        }
    }

    makeJson(partsOfToken, value, index = 0) {
        if (index === partsOfToken.length - 1) {
            return {
                [partsOfToken[index]]: {
                    "value": value,
                    "type": "color"
                }
            };
        }
        return {
            [partsOfToken[index]]: this.makeJson(partsOfToken, value, index + 1)
        };
    }

    splitTokens(tokens) {
        let fileName = '';
        let tokenJson = {};

        tokens.forEach(token => {
            const partsOfToken = token.name.split('-');
            fileName = partsOfToken[0];
            const json = this.makeJson(partsOfToken, token.value);
            tokenJson = this.deepMerge(tokenJson, json);
        });

        return tokenJson;
    }

    deepMerge(source, target) {
        return void Object.keys(target).forEach(key => {
            source[key] instanceof Object && target[key] instanceof Object
                ? source[key] instanceof Array && target[key] instanceof Array
                    ? void (source[key] = Array.from(new Set(source[key].concat(target[key]))))
                    : !(source[key] instanceof Array) && !(target[key] instanceof Array)
                        ? void this.deepMerge(source[key], target[key])
                        : void (source[key] = target[key])
                : void (source[key] = target[key]);
        }) || source;
    }
}

module.exports = FigmaToken;