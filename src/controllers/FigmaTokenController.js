const fse = require('fs-extra');
const path = require('path');

const FigmaService = require("../services");
const FigmaToken = require("../models/FigmaTokenModel");

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
            return `${_path}/brands/${_brand}/default`;
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

    mapTokens(children, isGlobalTokens) {
        isGlobalTokens ? this.getGlobalTokens(children) : this.getBrandTokens(children);
    }

    getBrandTokens(children) {
        let figmaToken = new FigmaToken();
        const brandNames = figmaToken.getBrandNames(children);
        /*const themeNames = figmaToken.getThemeNames(children);
        const modeNames = figmaToken.getModeNames(children);

        console.log(brandNames, themeNames, modeNames);*/

        brandNames.forEach(brand => {
            figmaToken = new FigmaToken();
            const tokens = figmaToken.findTokensNode(children, brand);
            tokens.forEach(token => figmaToken.makeTokens(token && token.children));
            const tokensJson = figmaToken.splitTokens(figmaToken.tokens);
            this.writeFinalTokens(tokensJson, brand);
        });
    }

    getGlobalTokens(children) {
        const figmaToken = new FigmaToken();
        const tokens = figmaToken.findTokensNode(children, 'global');
        tokens.forEach(token => figmaToken.makeTokens(token && token.children));
        const tokensJson = figmaToken.splitTokens(figmaToken.tokens);
        this.writeFinalTokens(tokensJson, 'global');
    }
}

module.exports = FigmaTokenController;