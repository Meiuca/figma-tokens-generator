const axios = require('axios');

class FigmaService{

  authenticationToken = '';

  constructor(authenticationToken){
    this.restApi = axios.create({
      baseURL: 'https://api.figma.com/v1/',
      headers: {
        'X-Figma-Token': authenticationToken
      }
    });
  }

  async getFigmaTokens(fileId) {
    const figmaResponse = await this.restApi.get(`files/${fileId}`);
    return figmaResponse.data['document'];
  } 
}

module.exports = FigmaService;