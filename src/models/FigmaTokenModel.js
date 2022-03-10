const { 
    OFFSET_VALUE_TO_TOKEN_VALUE, 
    CHARACTER_TO_INDICATE_VARIABLE,
    TOKENS_LAYER_NAME,
    BRAND_LAYER_NAME,
    THEME_LAYER_NAME,
    MODE_LAYER_NAME
} = require('../utils/constants');

class FigmaToken {

    tokens = [];
    tokensChildren = [];
    figmaTextList = [];
    figmaBrandsModel = {
        brands: [
            {
                name: "Marca A",
                themes: [
                    {
                        name: "Default",
                        modes: [
                            {
                                name: "Dark"
                            }
                        ]
                    }
                ]
            },
            {
                name: "Marca B",
                themes: [
                    {
                        name: "Default"
                    }
                ]
            }
        ]
    }

    constructor() { }

    get tokens() {
        return this.tokens;
    }

    getModeNames(figmaPageNodes){
        return this.getFigmaNodeByName(figmaPageNodes, MODE_LAYER_NAME);
    }

    getThemeNames(figmaPageNodes){
        return this.getFigmaNodeByName(figmaPageNodes, THEME_LAYER_NAME);
    }

    getBrandNames(figmaPageNodes){
        return this.getFigmaNodeByName(figmaPageNodes, BRAND_LAYER_NAME);
    }

    getFigmaNodeByName(figmaPageNodes, name) {
        let nodeNames = [];
        figmaPageNodes.forEach(page => {
            const _nodeNames = this.findLayerByName(page.children, name);
            _nodeNames.forEach(nodeName => {
                if (nodeNames.indexOf(nodeName) < 0)
                    nodeNames.push(nodeName)
            });
        });

        return nodeNames;
    }

    findLayerByName(layers, nameToCompare) {
        layers.forEach(layer => {
            const layerContent = layer.characters;
            const layerName = layer.name.toUpperCase().replace(' ', '');

            //console.log(layerName, layerContent)

            if (layer.children && layer.children.length > 0) {
                return this.findLayerByName(layer.children, nameToCompare);
            } else if (layerName === nameToCompare && this.figmaTextList.indexOf(layerContent) < 0) {
                this.figmaTextList.push(layer.characters);
            }
        });

        return this.figmaTextList;
    }

    findTokensNode(children, brand, tokensNode = null) {
        if (children && children.length > 0) {
            children.forEach(child => {
                if (child.characters && child.characters.toLowerCase() === brand.toLowerCase()) {
                    this.tokensChildren.push(tokensNode);
                } else if (child.name.toUpperCase() === TOKENS_LAYER_NAME) {
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
                if (child.name.includes(CHARACTER_TO_INDICATE_VARIABLE)) {
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