require('dotenv').config();
const validateId = require('../validation/validateId');

module.exports = function(app, pool, authenticateToken) {
    app.delete('/tournament/:id', authenticateToken, (req, res) => {
        const { id } = req.params;
        const integerId = parseInt(id);

        if(!validateId(integerId)) {
            return res.status(400).send('l\'id doit avoir être valide');
        }


        // Vérifier si le tournoi existe, déjà
        const checkTournoiSql = 'SELECT * FROM tournoi WHERE idTournoi = ?';
        pool.query(checkTournoiSql, [integerId], (err, results) => {
            if (err) {
                console.error('Erreur lors de la vérification du tournoi :', err);
                return res.status(500).send('Erreur du serveur');
            }

            if (results.length < 1) {
                return res.status(500).send('erreur du serveur');
            }


            // deletion du tournoi dans la base de données
            const deleteTournoiSql = `
                DELETE FROM tournoi WHERE idTournoi = ?
            `;

            const query = pool.query(deleteTournoiSql, [id], (err, result) => {
                if (err) {
                    console.error('Erreur lors de la deletion du tournoi :', err);
                    return res.status(500).send('Erreur du serveur');
                }

                // Afficher la requête SQL générée (pour débogage)
                console.log('Requête SQL générée:', query.sql);

                res.status(201).json({ message: 'tournoi delete avec succès' });
            });
        });
    });
}