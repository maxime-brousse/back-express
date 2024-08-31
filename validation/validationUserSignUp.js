module.exports = function validateUserSignUp(user) {
    const { mail, password, pseudonyme } = user;

    const isMailValid = typeof mail === 'string';
    const isPseudoValid = typeof pseudonyme === 'string';
    const isPasswordValid = typeof password === 'string';

    return isMailValid && isPseudoValid && isPasswordValid;
}