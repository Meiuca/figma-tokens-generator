#!/usr/bin/env node

const arg = require("arg");
const FigmaTokenController = require("./controllers/FigmaTokenController");

function getParameters() {
    const args = arg(
        {
            '--authenticationToken': String,
            '--brandTokensFileId': String,
            '--globalTokensFileId': String
        }
    );
    return {
        authenticationToken: args['--authenticationToken'],
        brandTokensFileId: args['--brandTokensFileId'],
        globalTokensFileId: args['--globalTokensFileId']
    };
}

function main() {
    const args = getParameters();
    const figmaTokenController = new FigmaTokenController(args.authenticationToken);

    if(args.brandTokensFileId){
        const brandTokenIds = splitTokenParams(args.brandTokensFileId);

        brandTokenIds.forEach(id => {
            figmaTokenController.getTokens(id);
        })
    }

    if(args.globalTokensFileId){
        figmaTokenController.getTokens(args.globalTokensFileId, true);
    }

    
}

function splitTokenParams(tokens = ""){
    return tokens.split(",");
}

module.exports = {
    main
}