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
}

module.exports = FigmaToken;