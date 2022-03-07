# tokens-generator
Este projeto tem por objetivo consumir o tokens criados no Figma. O processo é realizado através da api do Figma, onde é possível automatizar todo o trabalho manual. Três parâmetros são necessários para o funcionamento, são eles:

**Parâmetro 1**: --authenticationToken

![image](https://user-images.githubusercontent.com/32777538/157046217-fc57181a-6027-477b-b2ae-46241d53c11a.png)

**Parâmetro 2**: --brandTokensFileId

![image](https://user-images.githubusercontent.com/32777538/157044489-ffcd26be-63c4-40bb-84e5-43e80f8fc464.png)

**Parâmetro 3**: --globalTokensFileId

![image](https://user-images.githubusercontent.com/32777538/157044650-5a40ca62-f4c7-423a-b57c-0ec32326e117.png)

Para gerar os tokens de forma simples basta instalar a lib, como demonstrado a seguir:

```
npm install @meiuca/tokens-generator -D
```

Após a instalação adicionar a chave no package.json:

```javascript
"scripts": {
    "build-tokens": "tokens-generator --authenticationToken=[SEU_TOKEN_DE_AUTENTICACAO] --brandTokensFileId=[BRAND_TOKEN_ID] --globalTokensFileId=[GLOBAL_TOKEN_ID]"
}
```
