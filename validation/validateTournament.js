const containsSQL = require('./SQL/containsSQL');

module.exports = function validateTournament(tournament) {
    const { jeux, formatedDateTournoi, descriptionTournoi, récompensePoint, isSolo, titreTournoi,nbJoueursMax } = tournament;

    const isJeuxValid = typeof jeux === 'string' && !containsSQL(jeux) && jeux.length < 50;
    const isDateTournoiValid = formatedDateTournoi instanceof Date && !isNaN(formatedDateTournoi);
    const isDescriptionTournoiValid = typeof descriptionTournoi === 'string' && !containsSQL(descriptionTournoi) && jeux.length < 250;
    const isRécompensePointValid = Number.isInteger(récompensePoint);
    const isIsSoloValid = typeof isSolo === 'boolean';
    const isTitreTournoiValid = typeof titreTournoi === 'string' && !containsSQL(titreTournoi) && titreTournoi.length < 150;
    const isNbJoueursMaxValid = Number.isInteger(nbJoueursMax);

    return isJeuxValid && isDateTournoiValid && isDescriptionTournoiValid && isRécompensePointValid && isIsSoloValid && isTitreTournoiValid && isNbJoueursMaxValid;
}