const containsSQL = require('./SQL/containsSQL');

module.exports = function validateUserSignIn(user) {
    const { mail, password } = user;

    const isMailValid = typeof mail === 'string' && !containsSQL(mail);
    const isPasswordValid = typeof password === 'string' && !containsSQL(password) && password.length > 6 && password.length < 20;

    return isMailValid && isPasswordValid;
}