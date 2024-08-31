module.exports = function validateUserSignIn(user) {
    const { mail, password } = user;

    const isMailValid = typeof mail === 'string';
    const isPasswordValid = typeof password === 'string';

    return isMailValid && isPasswordValid;
}