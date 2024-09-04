const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const transporter = require('../mailer/transporter');
const validateProfil = require('../validation/validateProfil');

module.exports = function(app, pool, authenticateToken) {
    app.put('/profil/modify', authenticateToken, (req, res) => {
        const { mail, password, pseudonyme } = req.body;

        if(!req.user.mail) {
            return res.status(400).send("manque mail");
        }
        if (!mail || !password || !pseudonyme) {
            return res.status(400).send('Email, pseudonyme et mot de passe sont requis');
        }
        if(!validateProfil({ mail, password, pseudonyme })) {
            return res.status(400).send('l\'utilisateur doit avoir être valide');
        }

        // Vérifier si l'utilisateur avec cet email existe déjà
        const checkUserSql = 'SELECT * FROM utilisateur WHERE mail = ?';
        pool.query(checkUserSql, [mail], (err, results) => {
            if (err) {
                console.error('Erreur lors de la vérification de l\'utilisateur:', err);
                return res.status(500).send('Erreur du serveur');
            }
            if (results.length > 0) {
                if(results[0].mail !== req.user.mail) {
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
                    password = ?
                    WHERE mail = ?;
                `;

                const query = pool.query(modifyUserSql, [mail, pseudonyme, hashedPassword, req.user.mail], (err, result) => {
                    if (err) {
                        console.error('Erreur lors de la modification de l\'utilisateur:', err);
                        return res.status(500).send('Erreur du serveur');
                    }

                    // Création du token JWT
                    const token = jwt.sign(
                        { mail: mail, isAdmin: req.user.isAdmin },
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRES_IN }
                    );
                    // Afficher la requête SQL générée (pour débogage)
                    console.log('Requête SQL générée:', query.sql);

                    const mailOptions = {
                        from: 'autoTournament@example.com',
                        to: mail,
                        subject: 'autoTournament : modifcation compléte',
                        text: 'Votre compte a été modifier avec succés : ' + pseudonyme,
                        html: '<p>Votre compte a été créer avec succés :' + pseudonyme + '</p>'
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.error('Erreur lors de l\'envoi de l\'email:', error);
                        }
                        console.log('Email envoyé avec succès:', info.response);
                    });

                    res.status(201).json({ token, message: 'Utilisateur modifier avec succès' });
                });
            });
        });
    });
}