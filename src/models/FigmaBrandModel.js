class FigmaBrand {

    brand = '';
    brandChildren = [];

    constructor(children, brand = '') {
        this.brand = brand;
        this.findBrand(children);
    }

    get isBrand() {
        return (this.brandChildren || []).length > 0;
    }

    get getChildren() {
        return this.brandChildren;
    }

    findBrand(children) {
        children.forEach(child => {
            const found = this.checkCharacters(child);
            if (found) {
                console.log('Encontrou!');
                return true;
            }
        });

        return false;
    }

    checkCharacters(child) {
        if (child.name === 'Tokens')
            this.brandChildren = child.children;

        if (child.characters && child.characters.toLowerCase() === this.brand.toLowerCase())
            return true;
        else
            return this.findBrand(child.children || []);
    }
}

module.exports = FigmaBrand;