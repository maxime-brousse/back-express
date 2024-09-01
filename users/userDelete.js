const bcrypt = require('bcryptjs');
require('dotenv').config();
const transporter = require('../mailer/transporter');
const validateUser = require('../validation/validateUser');

module.exports = function(app, pool, authenticateToken) {
    app.delete('/user/:id', authenticateToken, (req, res) => {
        const { id } = req.params;

        // Vérifier si l'utilisateur existe, déjà
        const checkUserSql = 'SELECT * FROM utilisateur WHERE idUtilisateur = ?';
        pool.query(checkUserSql, [id], (err, results) => {
            if (err) {
                console.error('Erreur lors de la vérification de l\'utilisateur:', err);
                return res.status(500).send('Erreur du serveur');
            }

            if (results.length < 1) {
                return res.status(500).send('erreur du serveur');
            }


            // modification du nouvel utilisateur dans la base de données
            const modifyUserSql = `
                DELETE FROM utilisateur WHERE idUtilisateur = ?
            `;

            const query = pool.query(modifyUserSql, [id], (err, result) => {
                if (err) {
                    console.error('Erreur lors de la modification de l\'utilisateur:', err);
                    return res.status(500).send('Erreur du serveur');
                }

                // Afficher la requête SQL générée (pour débogage)
                console.log('Requête SQL générée:', query.sql);

                const mailOptions = {
                    from: 'autoTournament@example.com',
                    to: result[0].mail,
                    subject: 'autoTournament : suppression',
                    text: 'Votre compte a été supprimer : ' + result.pseudonyme,
                    html: '<p>Votre compte a été bannis : ' + result.pseudonyme + '</p>'
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.error('Erreur lors de l\'envoi de l\'email:', error);
                    }
                    console.log('Email envoyé avec succès:', info.response);
                });

                res.status(201).json({ message: 'Utilisateur delete avec succès' });
            });
        });
    });
}