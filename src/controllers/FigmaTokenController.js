const FigmaService = require("../services");
const FigmaToken = require("../models/FigmaTokenModel");

class FigmaTokenController {
    
    constructor() {}

    async getTokens(fileId) {
        const figmaAPI = new FigmaService();
        const tokensApiData = await figmaAPI.getFigmaTokens(fileId);
    
        return this.mapTokens(tokensApiData['children'], 'estácio');
    }

    mapTokens(children, brand) {
        const figmaToken = new FigmaToken(brand);
        const tokensNode = children.find(child => child.name.toLowerCase().indexOf(brand) >= 0);
        const tokens = figmaToken.lookForHeaderNode(tokensNode && tokensNode.children);
        figmaToken.makeTokens(tokens.children);
        return figmaToken.tokens;
    }  

    findTokens(children) {
        return new FigmaToken(children).tokens;
    }  
}

module.exports = FigmaTokenController;