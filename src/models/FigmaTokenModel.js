const { OFFSET_VALUE_TO_TOKEN_VALUE, CHARACTER_TO_INDICATE_VARIABLE } = require('../utils/constants');

class FigmaColor {

    colorTokens = [];

    constructor(children, type) {
        this.findTokens(children);
    }

    get tokens() {
        return this.colorTokens;
    }

    findTokens(children) {
        this.makeTokens(children);
    }

    makeTokens(children) {
        let designToken = {};
        children.forEach((child, index) => {
            if (child.name.includes(CHARACTER_TO_INDICATE_VARIABLE)) 
            {
                designToken.name = child.name.toLowerCase().replace(CHARACTER_TO_INDICATE_VARIABLE, '');
                designToken.value = children[OFFSET_VALUE_TO_TOKEN_VALUE + index].characters;
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

    pushDesignToken(designToken) {
        if (!this.colorTokens.some(font => font.name === designToken.name)) {
            this.colorTokens.push(designToken);
        }
    }
}

module.exports = FigmaColor;