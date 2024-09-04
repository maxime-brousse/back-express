const bcrypt = require('bcryptjs');
require('dotenv').config();
const transporter = require('../mailer/transporter');
const validateUser = require('../validation/validateUser');

module.exports = function(app, pool, authenticateToken) {
    app.put('/user/modify/:id', authenticateToken, (req, res) => {
        const { mail, password, pseudonyme, isAdmin, point } = req.body;
        const { id } = req.params;

        if(!req.user.isAdmin) {
            return res.status(403).send("route interdite");
        }
        if (!mail || !password || !pseudonyme) {
            return res.status(400).send('Email, pseudonyme et mot de passe sont requis');
        }
        if(!validateUser({ mail, password, pseudonyme, isAdmin, point })) {
            return res.status(400).send('l\'utilisateur doit avoir être valide');
        }

        // Vérifier si l'utilisateur existe déjà
        const checkUserSql = 'SELECT * FROM utilisateur WHERE mail = ?';
        pool.query(checkUserSql, [mail], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'utilisateur:', err);
            return res.status(500).send('Erreur du serveur');
        }

        if (results.length > 0) {
            if(results[0].idUtilisateur !== parseInt(id, 10)) {
                return res.status(400).send('Un utilisateur avec cet email existe déjà');
            }
        }

        // Hashage du mot de passe
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Erreur lors du hashage du mot de passe:', err);
                return res.status(500).send('Erreur du serveur');
            }

            // modification du nouvel utilisateur dans la base de données
            const modifyUserSql = `
                UPDATE utilisateur
                SET mail = ?,
                pseudonyme = ?,
                password = ?,
                isAdmin = ?,
                point = ?
                WHERE idUtilisateur = ?;
            `;

            const query = pool.query(modifyUserSql, [mail, pseudonyme, hashedPassword, isAdmin, point, id], (err, result) => {
            if (err) {
                console.error('Erreur lors de la modification de l\'utilisateur:', err);
                return res.status(500).send('Erreur du serveur');
            }

            // Afficher la requête SQL générée (pour débogage)
            console.log('Requête SQL générée:', query.sql);

            const mailOptions = {
                from: 'autoTournament@example.com',
                to: mail,
                subject: 'autoTournament : modifcation compléte',
                text: 'Votre compte a été modifier avec succés : ' + result.pseudonyme + 'et votre mot de passe est : ' + password,
                html: '<p>Votre compte a été créer avec succés :' + result.pseudonyme + 'et votre mot de passe est : ' + password + '</p>'
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.error('Erreur lors de l\'envoi de l\'email:', error);
                }
                console.log('Email envoyé avec succès:', info.response);
            });

            res.status(201).json({ message: 'Utilisateur modifier avec succès' });
            });
        });
        });
    });
}