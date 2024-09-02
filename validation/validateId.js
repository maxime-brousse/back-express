module.exports = function validateId(id) {

    const isIdValid = Number.isInteger(id);

    return isIdValid;
}