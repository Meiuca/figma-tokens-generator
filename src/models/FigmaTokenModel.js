const { 
    OFFSET_VALUE_TO_TOKEN_VALUE, 
    CHARACTER_TO_INDICATE_VARIABLE 
} = require('../utils/constants');

class FigmaToken {

    brand = '';
    tokens = [];
    brandChildren = [];

    constructor(brand, type) {
        this.brand = brand;
    }

    get tokens() {
        return this.tokens;
    }

    lookForHeaderNode(children) {
        if (children && children.length > 0) {
            children.forEach(child => {
                if (child.name === 'Tokens') {
                    this.brandChildren = child;
                }
            });

            if (this.brandChildren.length === 0) {
                children.forEach(child => {
                    return this.lookForHeaderNode(child.children || []);
                });
            }
        }
        return this.brandChildren;
    }

    findBrand(children) {
        children.forEach((child, index) => {
            if (child.name === 'Header') {
                this.brandChildren = children[index + 1];
            }
        });
        return this.brandChildren;
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