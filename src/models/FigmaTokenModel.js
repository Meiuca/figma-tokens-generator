const util = require('util')

const { 
    OFFSET_VALUE_TO_TOKEN_VALUE, 
    OFFSET_VALUE_TO_THEME_VALUE,
    OFFSET_VALUE_TO_MODE_VALUE,
    CHARACTER_TO_INDICATE_VARIABLE,
    TOKENS_LAYER_NAME,
    BRAND_LAYER_NAME,
    THEME_LAYER_NAME,
    MODE_LAYER_NAME
} = require('../utils/constants');

const helpers = require("../utils/helpers");

class FigmaBrand {
    constructor(){
        this.brands = [];
    }

    addNewBrand(brand){
        const brandIndex = this.brands.findIndex(element => element.name === brand);

        if(brandIndex === -1){
            this["brands"].push({
                name: brand,
                themes: []
            })
        } else {
            console.error("A marca já existe");
            return false;
        }
    }

    addNewtheme(brand, theme){
        const brandIndex = this.brands.findIndex(element => element.name === brand);
        const themeIndex = this.brands[brandIndex].themes.findIndex(element => element.name === theme);
        
        if(themeIndex === -1){
            this.brands[brandIndex].themes.push({
                name: theme,
                modes: []
            })
        } else {
            console.error("O tema já existe");
            return false;
        }
    }

    addNewMode(brand, theme, mode){
        const brandIndex = this.brands.findIndex(element => element.name === brand);
        const themeIndex = this.brands[brandIndex].themes.findIndex(element => element.name === theme);
        const modesIndex = this.brands[brandIndex].themes[themeIndex].modes.findIndex(element => element.name === mode);

        if(modesIndex === -1){
            this.brands[brandIndex].themes[themeIndex].modes.push({
                name: mode
            })
        } else{
            console.error("O modo já existe");
            return false;
        }
    }
}

class FigmaToken {

    tokens = [];
    tokensChildren = [];
    figmaTextList = [];
    figmaModel = new FigmaBrand();

    constructor() { }

    get tokens() {
        return this.tokens;
    }

    getBrandNames(figmaPageNodes){
        return this.getFigmaNodeByName(figmaPageNodes, BRAND_LAYER_NAME);
    }

    getFigmaNodeByName(figmaPageNodes, name) {
        let nodeNames = [];
        figmaPageNodes.forEach(page => {
            const _layerNames = this.findLayerByName(page.children, name);

            _layerNames.forEach(layerName => {
                if (nodeNames.indexOf(layerName) < 0)
                    nodeNames.push(layerName)
            });
        });

        return nodeNames;
    }

    findLayerByName(layers, nameToCompare) {
        layers.forEach((layer, index) => {
            const layerContent = layer.characters;
            const layerName = helpers.convertToCleanUpperCase(layer.name);

            if (layer.children && layer.children.length > 0) {
                return this.findLayerByName(layer.children, nameToCompare);
            } else if (layerName === nameToCompare && this.figmaTextList.indexOf(layerContent) < 0) {
                this.figmaTextList.push(layer.characters);
                
                if(layerName === BRAND_LAYER_NAME){
                    const brandContent = helpers.convertToKebabCase(layerContent);
                    const themeContent = helpers.convertToKebabCase(layers[index + OFFSET_VALUE_TO_THEME_VALUE]?.characters);
                    const modeContent = helpers.convertToKebabCase(layers[index + OFFSET_VALUE_TO_MODE_VALUE].characters)

                    const themeLayerName = helpers.convertToCleanUpperCase(layers[index + OFFSET_VALUE_TO_THEME_VALUE]?.name);
                    const modeLayerName = helpers.convertToCleanUpperCase(layers[index + OFFSET_VALUE_TO_MODE_VALUE]?.name);

                    this.figmaModel.addNewBrand(brandContent);

                    if(layers[index + OFFSET_VALUE_TO_THEME_VALUE] && themeLayerName === THEME_LAYER_NAME){
                        this.figmaModel.addNewtheme(brandContent, themeContent);
                    }

                    if(layers[index + OFFSET_VALUE_TO_MODE_VALUE] && modeLayerName === MODE_LAYER_NAME){
                        this.figmaModel.addNewMode(brandContent, themeContent, modeContent);
                    }
                        
                    console.log(util.inspect(this.figmaModel, false, null, true /* enable colors */))
                }
                
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