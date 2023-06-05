// const nanoid = require('nanoid');

// const alphabetRange = '1234567890abcdefghijklmnopqrstuvwxyz';

const crypto = require("crypto");

module.exports = (len) => {
    // return nanoid.customAlphabet(alphabetRange, len)
    return crypto.randomBytes(len).toString("hex")
}
