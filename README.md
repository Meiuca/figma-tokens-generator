# figma-tokens-generator

## Motivação

Este projeto tem por objetivo consumir tokens criados no Figma. 

O processo é realizado através da api do Figma. Três parâmetros são necessários para a exportação dos tokens, são eles:

**Parâmetro 1**: --authenticationToken 

Token de autenticação gerado através [dessa url do Figma](https://www.figma.com/developers/api#authentication)

![image](https://user-images.githubusercontent.com/32777538/157046217-fc57181a-6027-477b-b2ae-46241d53c11a.png)

**Parâmetro 2**: --brandTokensFileId

O id do seu arquivo Figma: 

https://www.figma.com/file/**EtYaLp3IbxzYgMC76ULk82**/Brand-Tokens---Tokens-Generator-Template

![image](https://user-images.githubusercontent.com/32777538/157044489-ffcd26be-63c4-40bb-84e5-43e80f8fc464.png)

**Parâmetro 3**: --globalTokensFileId

![image](https://user-images.githubusercontent.com/32777538/157044650-5a40ca62-f4c7-423a-b57c-0ec32326e117.png)

Para gerar os tokens de forma simples, basta executar o comando à seguir na sua linha de comando ou adicioná-la em um dos scripts no seu package.json:

```
npm init @meiuca/figma-tokens-generator -- --authenticationToken=[SEU_TOKEN_DE_AUTENTICACAO] --brandTokensFileId=[BRAND_TOKEN_ID] --globalTokensFileId=[GLOBAL_TOKEN_ID]
```

Caso deseje exportar múltiplas folhas de marca, chamadas aqui de brandTokens, basta que, no argumento ```--brandTokensFileId```, os tokens de cada arquivo sejam separados por vírgula. Exemplo:

```javascript
"scripts": {
    "build-tokens": "figma-tokens-generator --authenticationToken=[SEU_TOKEN_DE_AUTENTICACAO] --brandTokensFileId=[BRAND_TOKEN_ID],[BRAND_TOKEN_ID] --globalTokensFileId=[GLOBAL_TOKEN_ID]"
}
```
