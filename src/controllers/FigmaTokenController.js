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

    writeTokensToDisk(json, fileName, brand){
        const _path = this.getDirectory(brand);
        fse.outputFileSync(path.normalize(`${_path}/${fileName}.json`), JSON.stringify(json, 0, 4));
    }

    async getTokens(fileId, brand) {
        const figmaAPI = new FigmaService();
        const tokensApiData = await figmaAPI.getFigmaTokens(fileId);
        const tokens = this.mapTokens(tokensApiData['children'], brand);
        return tokens;
    }

    writeFinalTokens(tokenJson, brand) {
        const finalTokensJson = [];
        Object.keys(tokenJson).forEach(token => {
            const json = {
                [token]: tokenJson[token]
            }            
            finalTokensJson.push(json);
            this.writeTokensToDisk(json, token, brand)
        });

        return finalTokensJson;
    }

    mapTokens(children, brand) {
        const figmaToken = new FigmaToken(brand);
        const tokensNode = children.find(child => child.name.toLowerCase().indexOf(brand) >= 0);
        const tokens = figmaToken.findTokensNode(tokensNode && tokensNode.children);
        figmaToken.makeTokens(tokens.children);
        const tokenJson = figmaToken.splitTokens(figmaToken.tokens);
        this.writeFinalTokens(tokenJson, brand);
    }
}

module.exports = FigmaTokenController;