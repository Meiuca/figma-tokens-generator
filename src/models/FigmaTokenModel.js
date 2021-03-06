const path = require('path');

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

const FigmaBrand = require("./FigmaBrand");

class FigmaToken {

    tokens = [];
    tokensChildren = [];
    figmaTextList = [];
    figmaModel = new FigmaBrand();

    constructor() { }

    get tokens() {
        return this.tokens;
    }

    getBrandData(figmaPageNodes){
        return this.getFigmaNodeByName(figmaPageNodes, BRAND_LAYER_NAME);
    }

    getFigmaNodeByName(page, name) {
        let nodeNames = [];
        
        const _layerNames = this.populateFigmaModel(page.children, name);

        _layerNames.forEach(layerName => {
            if (nodeNames.indexOf(layerName) < 0)
                nodeNames.push(layerName)
        });

        return nodeNames;
    }

    populateFigmaModel(layers, nameToCompare) {
        layers.forEach((layer, index) => {
            const layerContent = layer.characters;
            const layerName = helpers.convertToCleanUpperCase(layer.name);

            if (layer.children && layer.children.length > 0) {
                return this.populateFigmaModel(layer.children, nameToCompare);
            } else if (layerName === nameToCompare) {
                this.figmaTextList.push(layer.characters);

                if(layerName === BRAND_LAYER_NAME){
                    const brandContent = helpers.convertToKebabCase(layerContent);
                    const themeContent = helpers.convertToKebabCase(layers[index + OFFSET_VALUE_TO_THEME_VALUE]?.characters);
                    const modeContent = helpers.convertToKebabCase(layers[index + OFFSET_VALUE_TO_MODE_VALUE]?.characters)

                    const themeLayerName = helpers.convertToCleanUpperCase(layers[index + OFFSET_VALUE_TO_THEME_VALUE]?.name);
                    const modeLayerName = helpers.convertToCleanUpperCase(layers[index + OFFSET_VALUE_TO_MODE_VALUE]?.name);

                    this.figmaModel.addNewBrand(brandContent);

                    if(layers[index + OFFSET_VALUE_TO_THEME_VALUE] && themeLayerName === THEME_LAYER_NAME){
                        this.figmaModel.addNewtheme(brandContent, themeContent);
                    }

                    if(layers[index + OFFSET_VALUE_TO_MODE_VALUE] && modeLayerName === MODE_LAYER_NAME){
                        this.figmaModel.addNewMode(brandContent, themeContent, modeContent);
                    }
                }
                
            }
        });

        return this.figmaTextList;
    }

    findTokensByPage(layers) {
        if (layers && layers.length > 0) {
            layers.forEach(layer => {
                if (layer.name.toUpperCase() === TOKENS_LAYER_NAME) {
                    this.tokensChildren.push(layer);
                } 
            });

            if(this.tokensChildren.length === 0){
                layers.forEach(layer => {
                    return this.findTokensByPage(layer.children || []);
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

    createDiskPathsByBrand(brands, brand){
        const results = [];

        const currentBrandIndex = brands.findIndex(element => element.name == brand);
        const currentBrand= brands[currentBrandIndex];

        if(currentBrand.themes.length > 0){
            for(let themeIndex in currentBrand.themes){
                const currentTheme = currentBrand.themes[themeIndex]; 
               
                if(currentTheme.modes.length > 0){
                    for(let modeIndex in currentTheme.modes){
                        const currentMode = currentTheme.modes[modeIndex];
                        results.push(path.join(currentBrand.name, currentTheme.name, currentMode.name))
                    }
               } else {
                  results.push(path.join(currentBrand.name, currentTheme.name))
               }
            }
        } else {
            results.push(path.join(currentBrand.name, "default"))
        }

        return results;
    }
}

module.exports = FigmaToken;