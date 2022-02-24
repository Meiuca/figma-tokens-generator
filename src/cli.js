#!/usr/bin/env node

const arg = require("arg");
const FigmaTokenController = require("./controllers/FigmaTokenController");

function getParameters() {
    const args = arg(
    {
        '--brandTokensFileId': String,
        '--globalTokensFileId': String
    }
    );
    return {
        brandTokensFileId: args['--brandTokensFileId'],
        globalTokensFileId: args['--globalTokensFileId']
    };
}

function main() {
    const args = getParameters();
    const figmaTokenController = new FigmaTokenController();
    args.brandTokensFileId && figmaTokenController.getTokens(args.brandTokensFileId, 'estácio');
    args.globalTokensFileId && figmaTokenController.getTokens(args.globalTokensFileId, 'global');
}

main();