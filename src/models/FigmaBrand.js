class FigmaBrand {
    constructor(){
        this.brands = [];
    }

    addNewBrand(brand){
        const brandIndex = this.brands.findIndex(element => element.name === brand);

        if(brandIndex === -1){
            this["brands"].push({
                name: brand,
                themes: []
            })
        } else {
            console.error("A marca já existe");
            return false;
        }
    }

    addNewtheme(brand, theme){
        const brandIndex = this.brands.findIndex(element => element.name === brand);
        const themeIndex = this.brands[brandIndex].themes.findIndex(element => element.name === theme);
        
        if(themeIndex === -1){
            this.brands[brandIndex].themes.push({
                name: theme,
                modes: []
            })
        } else {
            console.error("O tema já existe");
            return false;
        }
    }

    addNewMode(brand, theme, mode){
        const brandIndex = this.brands.findIndex(element => element.name === brand);
        const themeIndex = this.brands[brandIndex].themes.findIndex(element => element.name === theme);
        const modesIndex = this.brands[brandIndex].themes[themeIndex].modes.findIndex(element => element.name === mode);

        if(modesIndex === -1){
            this.brands[brandIndex].themes[themeIndex].modes.push({
                name: mode
            })
        } else{
            console.error("O modo já existe");
            return false;
        }
    }
}

module.exports = FigmaBrand;