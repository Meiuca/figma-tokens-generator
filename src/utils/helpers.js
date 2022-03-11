//source: https://gist.github.com/thevangelist/8ff91bac947018c9f3bfaad6487fa149
const convertToKebabCase = (string = "") => {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()                          
}

const convertToCleanUpperCase = (string = "") => {
   return string.toUpperCase().replace(' ', '')
}

module.exports = {
    convertToKebabCase,
    convertToCleanUpperCase
}