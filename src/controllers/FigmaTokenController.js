const fse = require('fs-extra');
const path = require('path');

const FigmaService = require("../services");
const FigmaToken = require("../models/FigmaTokenModel");
const { convertToKebabCase, logFullObject } = require('../utils/helpers');

class FigmaTokenController {
    authenticationToken = '';

    constructor(authenticationToken) {
        this.authenticationToken = authenticationToken;
    }

    getDirectory(brand) {
        const _path = path.normalize(`${process.cwd()}/properties`);
        if (brand === 'global') {
            return `${_path}/globals/`
        } else {
            const _brand = brand && brand.replace(' ', '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '');
            return `${_path}/brands/${_brand}`;
        }
    }

    writeTokensToDisk(json, fileName, brand){
        const _path = this.getDirectory(brand);
        fse.outputFileSync(path.normalize(`${_path}/${fileName}.json`), JSON.stringify(json, 0, 4));
    }

    async getTokens(fileId, isGlobalTokens = false) {
        const figmaAPI = new FigmaService(this.authenticationToken);
        const tokensApiData = await figmaAPI.getFigmaTokens(fileId);
        this.mapTokens(tokensApiData['children'], isGlobalTokens);
    }

    writeFinalTokens(tokensJson, brand) {
        Object.keys(tokensJson).forEach(token => {
            let json = token.includes('color') ? tokensJson[token] : { [token]: tokensJson[token] };
            this.writeTokensToDisk(json, token, brand)
        });
    }

    mapTokens(figmaPages, isGlobalTokens) {
        isGlobalTokens ? this.getGlobalTokens(figmaPages) : this.getBrandTokens(figmaPages);
    }

    getBrandTokens(figmaPages) {
        figmaPages.forEach(page => {
            let figmaToken = new FigmaToken();
            const brandData = figmaToken.getBrandData(page);

            const tokens = figmaToken.findTokensByPage(page.children);
            tokens.forEach(token => figmaToken.makeTokens(token && token.children));
            const tokensJson = figmaToken.splitTokens(figmaToken.tokens);

            logFullObject(brandData)
            /*brandNames.forEach(brand => {
                const tokens = figmaToken.findTokensNode(page.children, brand);
                
                tokens.forEach(token => figmaToken.makeTokens(token && token.children));
                const tokensJson = figmaToken.splitTokens(figmaToken.tokens);
    
                //this.writeFinalTokens(tokensJson, currentPaths);
            });*/
        })

        
    }

    getGlobalTokens(children) {
        const figmaToken = new FigmaToken();
        const tokens = figmaToken.findTokensByPage(children, 'global');
        /*tokens.forEach(token => figmaToken.makeTokens(token && token.children));
        const tokensJson = figmaToken.splitTokens(figmaToken.tokens);
        this.writeFinalTokens(tokensJson, 'global');*/
    }

    
}

module.exports = FigmaTokenController;