const fse = require('fs-extra');
const path = require('path');

const FigmaService = require("../services");
const FigmaToken = require("../models/FigmaTokenModel");

class FigmaTokenController {
    
    constructor() {}

    getDirectory(brand) {
        const _path = path.normalize(`${process.cwd()}/src/assets/properties/`);
        if (brand === 'global') {
            return `${_path}/globals/`
        } else {
            return `${_path}/brands/${brand}/default`;
        }
    }

    writeTokensToDisk(json, name, brand){
        const _path = this.getDirectory(brand);
        fse.outputFileSync(path.normalize(`${_path}/${name}.json`), JSON.stringify(json));
    }

    async getTokens(fileId, brand) {
        const figmaAPI = new FigmaService();
        const tokensApiData = await figmaAPI.getFigmaTokens(fileId);
        const tokens = this.mapTokens(tokensApiData['children'], brand);
        this.writeTokensToDisk(tokens, 'tokens', brand);
        return tokens;
    }

    mapTokens(children, brand) {
        const figmaToken = new FigmaToken(brand);
        const tokensNode = children.find(child => child.name.toLowerCase().indexOf(brand) >= 0);
        const tokens = figmaToken.lookForHeaderNode(tokensNode && tokensNode.children);
        figmaToken.makeTokens(tokens.children);
        return figmaToken.tokens;
    }
}

module.exports = FigmaTokenController;