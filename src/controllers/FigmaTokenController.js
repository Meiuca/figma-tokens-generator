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
        const _path = path.normalize(`${process.cwd()}/src/assets/properties/`);
        if (brand === 'global') {
            return `${_path}/globals/`
        } else {
            return `${_path}/brands/${brand.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}/default`;
        }
    }

    writeTokensToDisk(json, fileName, brand){
        const _path = this.getDirectory(brand);
        fse.outputFileSync(path.normalize(`${_path}/${fileName}.json`), JSON.stringify(json, 0, 4));
    }

    async getTokens(fileId, brand) {
        const figmaAPI = new FigmaService(this.authenticationToken);
        const tokensApiData = await figmaAPI.getFigmaTokens(fileId);
        const tokens = this.mapTokens(tokensApiData['children'], brand);
        return tokens;
    }

    writeFinalTokens(tokensJson, brand) {
        Object.keys(tokensJson).forEach(token => {
            let json = token.includes('color') ? tokensJson[token] : { [token]: tokensJson[token] };
            this.writeTokensToDisk(json, token, brand)
        });
    }

    mapTokens(children, brand) {
        const figmaToken = new FigmaToken(brand);
        const tokensNode = children.find(child => child.name.toLowerCase().indexOf(brand) >= 0);
        const tokens = figmaToken.findTokensNode(tokensNode && tokensNode.children);
        figmaToken.makeTokens(tokens.children);
        const tokensJson = figmaToken.splitTokens(figmaToken.tokens);
        this.writeFinalTokens(tokensJson, brand);
    }
}

module.exports = FigmaTokenController;