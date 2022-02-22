class StyleDictionaryModel {

    tokens = [];
    tokensJson = {};

    constructor(tokens) {
        this.tokens = tokens;
        this.buildJson();
    }

    get getJson() {
        return this.tokensJson;
    }

    buildJson() {
        this.buildTokensJson("brandTokens");
        this.buildTokensJson("globalTokens");
    }

    buildTokensJson(typeTokens) {
        const tokensJsonList = [];
        const _tokens = this.getTokens(typeTokens);

        _tokens.forEach(token => {
            tokensJsonList.push(this.makeJson(token));
        });

        this.splitTokens(typeTokens, tokensJsonList);
    }

    splitTokens(typeTokens, tokensJsonList) {
        let _tokensJson = {};
        tokensJsonList
        .forEach(token => {
            _tokensJson = this.deepMerge(_tokensJson, token);
        });
        this.tokensJson[typeTokens] = _tokensJson;
    }
    
    deepMerge(source, target) {
        return void Object.keys(target).forEach(key => {
            source[key] instanceof Object && target[key] instanceof Object
                ? source[key] instanceof Array && target[key] instanceof Array
                    ? void (source[key] = Array.from(new Set(source[key].concat(target[key]))))
                    : !(source[key] instanceof Array) && !(target[key] instanceof Array)
                        ? void this.deepMerge(source[key], target[key])
                        : void (source[key] = target[key])
                : void (source[key] = target[key]);
        }) || source;
    }

    getTokens(nodeTokens) {
        const _tokens = [...this.tokens[nodeTokens]];
        let _tokensResult = [];

        _tokens.forEach(token => {
            const _token = {
                value: token.value,
                props: []
            };

            token.name.split('-')
            .forEach(key => {
                if (!_token.props.includes(key.toLowerCase()))
                    _token.props.push(key.toLowerCase());
            });
            
            _tokensResult.push(_token);
        });

        return _tokensResult;
    }

    makeJson(token, index = 0) {
        if (index === token.props.length - 1) {
            return {
                [token.props[index]]: {
                    "value": token.value,
                    "type": "color"
                }
            };
        }

        return {
            [token.props[index]]: this.makeJson(token, index + 1)
        };
    }
}

module.exports = StyleDictionaryModel;