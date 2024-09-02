module.exports = function validateTournament(tournament) {
    const { jeux, formatedDateTournoi, descriptionTournoi, récompensePoint, isSolo, titreTournoi } = tournament;

    console.log(formatedDateTournoi);
    const isJeuxValid = typeof jeux === 'string';
    const isDateTournoiValid = formatedDateTournoi instanceof Date && !isNaN(formatedDateTournoi);
    const isDescriptionTournoiValid = typeof descriptionTournoi === 'string';
    const isRécompensePointValid = Number.isInteger(récompensePoint);
    const isIsSoloValid = typeof isSolo === 'boolean';
    const isTitreTournoiValid = typeof titreTournoi === 'string';

    console.log("jeux;" + isJeuxValid.valueOf() + " dateTournoi:" + isDateTournoiValid.valueOf() + " description:" + isDescriptionTournoiValid.valueOf() + " récompense:" + isRécompensePointValid.valueOf() + " isSolo:" + isIsSoloValid.valueOf() + " titre:" + isTitreTournoiValid.valueOf())

    return isJeuxValid && isDateTournoiValid && isDescriptionTournoiValid && isRécompensePointValid && isIsSoloValid && isTitreTournoiValid;
}