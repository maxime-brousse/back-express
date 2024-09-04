const containsSQL = require('./SQL/containsSQL');

module.exports = function validateUser(user) {
    const { mail, password, pseudonyme } = user;

    const isMailValid = typeof mail === 'string' && !containsSQL(mail);
    const isPseudoValid = typeof pseudonyme === 'string' && !containsSQL(pseudonyme) && pseudonyme.length < 50;
    const isPasswordValid = typeof password === 'string' && !containsSQL(password) && password.length > 6 && password.length < 20;

    return isMailValid && isPseudoValid && isPasswordValid;
}