require('dotenv').config();
const validateTournament = require('../validation/validateTournament');
const validateId = require('../validation/validateId');

module.exports = function(app, pool, authenticateToken) {
    app.put('/tournament/modify/:id', authenticateToken, (req, res) => {
        const { jeux, dateTournoi, descriptionTournoi, récompensePoint, isSolo, titreTournoi } = req.body;
        const formatedDateTournoi = new Date(dateTournoi);
        const { id } = req.params;
        const integerId = parseInt(id);

        if (!jeux || !dateTournoi || !titreTournoi || !récompensePoint) {
            return res.status(400).send('jeux, dateTournoi, titreTournoi et récompensePoint sont requis');
        }
        if(!validateTournament({ jeux, formatedDateTournoi, descriptionTournoi, récompensePoint, isSolo, titreTournoi })) {
            return res.status(400).send('le tournoi doit avoir être valide');
        }
        if(!validateId(integerId)) {
            return res.status(400).send('l\'id doit avoir être valide');
        }


        // modification du nouvel tournoi dans la base de données
        const modifyTournoiSql = `
            UPDATE tournoi
            SET jeux = ?,
            dateTournoi = ?,
            descriptionTournoi = ?,
            récompensePoint = ?,
            isSolo = ?,
            titreTournoi = ?
            WHERE idTournoi = ?;
        `;

        const query = pool.query(modifyTournoiSql, [jeux, formatedDateTournoi, descriptionTournoi, récompensePoint, isSolo, titreTournoi, integerId], (err, result) => {
            if (err) {
                console.error('Erreur lors de la modification de l\'utilisateur:', err);
                return res.status(500).send('Erreur du serveur');
            }

            // Afficher la requête SQL générée (pour débogage)
            console.log('Requête SQL générée:', query.sql);

            res.status(201).json({ message: 'tournoi modifier avec succès' });
        });
    });
}