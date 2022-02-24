#!/usr/bin/env node

const arg = require("arg");
const FigmaTokenController = require("./controllers/FigmaTokenController");

function getParameters() {
    const args = arg(
    {
        '--fileId': String
    }
    );
    return {
        fileId: args['--fileId']
    };
}

function main() {
    const args = getParameters();
    const figmaTokenController = new FigmaTokenController();
    figmaTokenController.getTokens(args.fileId);
}

main();