#!/usr/bin/env node

const arg = require("arg");
const fs = require('fs');

const FigmaService = require("./services");
const FigmaBrand = require("./models/FigmaBrandModel");
const FigmaTokenModel = require("./models/FigmaTokenModel");

async function getBrandTokens(fileId) {
    const figmaAPI = new FigmaService();
    const tokensApiData = await figmaAPI.getFigmaBrandTokens(fileId);

    console.log(tokensApiData['children']);
    mapBrandTokens(tokensApiData['children'], 'estácio');
    //this.setJson(this.brandTokens);

    //console.log(this.brandTokens);
} 

function mapBrandTokens(children, brand) {
    const _brand = new FigmaBrand(children, brand);
    if (_brand.isBrand) {
        Array.prototype.push.apply([], findTokens(_brand.getChildren));
    }
}

function findTokens(children) {
    return new FigmaTokenModel(children).tokens;
}

function setJson(tokens) {
    const jsonList = new StyleDictionaryModel(tokens).getJson;
    this.splitJson(jsonList);
}

function splitJson(jsonList) {
    const brandTokensJson = jsonList["brandTokens"];
    const globalTokensJson = jsonList["globalTokens"];

    this.writeBrandTokensJsonToDisk(brandTokensJson);
    this.writeGlobalTokensJsonToDisk(globalTokensJson);
}

function writeBrandTokensJsonToDisk(brandTokens, format = '') {
    if (format == 'detail')
        Object.keys(brandTokens).forEach(key => {
            this.writeTokensToDisk(brandTokens[key], key);
        });        
    else
        this.writeTokensToDisk(brandTokens, 'brand');        
}

function writeGlobalTokensJsonToDisk(globalTokens, format = '') {
    if (format == 'detail')
        Object.keys(globalTokens).forEach(key => {
            this.writeTokensToDisk(globalTokens[key], key);
        });        
    else
        this.writeTokensToDisk(globalTokens, 'global');
}

function writeTokensToDisk(json, name){
    fs.writeFileSync(`src/assets/tokens/${name}.json`, JSON.stringify(json));
}

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
    getBrandTokens(args.fileId);
}

main();