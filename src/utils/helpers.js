const util = require('util');

//source: https://gist.github.com/thevangelist/8ff91bac947018c9f3bfaad6487fa149
const convertToKebabCase = (string = "") => {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()                          
}

const convertToCleanUpperCase = (string = "") => {
   return string.toUpperCase().replace(' ', '')
}

const logFullObject = object => {
    console.log(util.inspect(object, false, null, true /* enable colors */))
}

module.exports = {
    convertToKebabCase,
    convertToCleanUpperCase,
    logFullObject
}