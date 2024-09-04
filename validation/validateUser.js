const containsSQL = require('./SQL/containsSQL');

module.exports = function validateUser(user) {
    const { mail, password, pseudonyme, isAdmin, point } = user;

    const isMailValid = typeof mail === 'string' && !containsSQL(mail);
    const isPseudoValid = typeof pseudonyme === 'string' && !containsSQL(pseudonyme);
    const isPasswordValid = typeof password === 'string' && !containsSQL(password) && password.length > 6 && password.length < 20;
    const isAdminValid = typeof isAdmin === 'boolean';
    const isPointValid = Number.isInteger(point);

    return isMailValid && isPseudoValid && isPasswordValid && isAdminValid && isPointValid;
}