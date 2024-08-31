module.exports = function validateUser(user) {
    const { mail, password, pseudonyme, isAdmin, point } = user;

    const isMailValid = typeof mail === 'string';
    const isPseudoValid = typeof pseudonyme === 'string';
    const isPasswordValid = typeof password === 'string';
    const isAdminValid = typeof isAdmin === 'boolean';
    const isPointValid = Number.isInteger(point);

    return isMailValid && isPseudoValid && isPasswordValid && isAdminValid && isPointValid;
}