require('dotenv').config();
const validateTournament = require('../validation/validateTournament');

module.exports = function(app, pool, authenticateToken) {
    app.post('/tournament/create', authenticateToken, (req, res) => {
        const { jeux, dateTournoi, descriptionTournoi, récompensePoint, isSolo, titreTournoi } = req.body;
        const formatedDateTournoi = new Date(dateTournoi);

        if (!jeux || !dateTournoi || !titreTournoi || !récompensePoint) {
            return res.status(400).send('jeux, dateTournoi, titreTournoi et récompensePoint sont requis');
        }
        if(!validateTournament({ jeux, formatedDateTournoi, descriptionTournoi, récompensePoint, isSolo, titreTournoi })) {
            return res.status(400).send('le tournoi doit avoir être valide');
        }

        // Insertion du nouvel tournoi dans la base de données
        const insertTournoiSql = `
        INSERT INTO tournoi (jeux, dateTournoi, descriptionTournoi, récompensePoint, isSolo, titreTournoi)
        VALUES (?, ?, ?, ?, ?, ?)
            `;

        const query = pool.query(insertTournoiSql, [jeux, formatedDateTournoi, descriptionTournoi, récompensePoint, isSolo, titreTournoi], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion du tournoi :', err);
                return res.status(500).send('Erreur du serveur');
            }

            // Afficher la requête SQL générée (pour débogage)
            console.log('Requête SQL générée:', query.sql);

            res.status(201).json({ message: 'tournoi créer avec succès' });
        });
    });
}