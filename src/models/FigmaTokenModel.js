const { 
    OFFSET_VALUE_TO_TOKEN_VALUE, 
    CHARACTER_TO_INDICATE_VARIABLE 
} = require('../utils/constants');

class FigmaToken {

    tokens = [];
    tokensChildren = [];
    brandNames = [];

    constructor() { }

    get tokens() {
        return this.tokens;
    }

    getBrandNames(headerNodes) {
        let brandNames = [];
        headerNodes.forEach(header => {
            const _brandNames = this.findBrandName(header.children);
            _brandNames.forEach(brandName => {
                if (brandNames.indexOf(brandName) < 0)
                    brandNames.push(brandName)
            });
        });
        return brandNames;
    }

    findBrandName(children) {
        children.forEach(child => {
            const brandName = child.characters;
            const layerName = child.name.toLowerCase().replace(' ', '');

            if (child.children && child.children.length > 0) {
                return this.findBrandName(child.children);
            } else if (layerName === 'brandname' && this.brandNames.indexOf(brandName) < 0) {
                this.brandNames.push(child.characters);
            }
        });
        return this.brandNames;
    }

    findTokensNode(children, brand, tokensNode = null) {
        if (children && children.length > 0) {
            children.forEach(child => {
                if (child.characters && child.characters.toLowerCase() === brand.toLowerCase()) {
                    this.tokensChildren.push(tokensNode);
                } else if (child.name.toLowerCase() === 'tokens') {
                    tokensNode = child;
                }
            });

            if (this.tokensChildren.length === 0) {
                children.forEach(child => {
                    return this.findTokensNode(child.children || [], brand, tokensNode);
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
            return value.includes('#') ? {
                [partsOfToken[index]]: {
                    'value': value,
                    'type': 'color'
                }
            } : { 
                [partsOfToken[index]]: {
                    'value': value
                }
            };
        }
        return {
            [partsOfToken[index]]: this.makeJson(partsOfToken, value, index + 1)
        };
    }

    splitTokens(tokens) {
        let tokenJson = {};
        tokens.forEach(token => {
            const partsOfToken = token.value.includes('#') ? (`colors-${token.name}`).split('-') : token.name.split('-');
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