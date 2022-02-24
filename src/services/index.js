const axios = require('axios');

class FigmaService{
  constructor(){
    this.restApi = axios.create({
      baseURL: 'https://api.figma.com/v1/',
      headers: {
        'X-Figma-Token': '219518-1f6551c0-b808-4490-9bb2-62565c780ed2'
      }
    });
  }

  async getFigmaTokens(fileId) {
    const figmaResponse = await this.restApi.get(`files/${fileId}`);
    return figmaResponse.data['document'];
  } 
}

module.exports = FigmaService;