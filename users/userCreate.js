const bcrypt = require('bcryptjs');
require('dotenv').config();
const transporter = require('../mailer/transporter');
const validateUser = require('../validation/validateUser');

module.exports = function(app, pool, authenticateToken) {
    app.post('/users/create', authenticateToken, (req, res) => {
        const { mail, password, pseudonyme, isAdmin, point } = req.body;

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
            return res.status(400).send('Un utilisateur avec cet email existe déjà');
        }

        // Hashage du mot de passe
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
            console.error('Erreur lors du hashage du mot de passe:', err);
            return res.status(500).send('Erreur du serveur');
            }

            // Insertion du nouvel utilisateur dans la base de données
            const insertUserSql = `
            INSERT INTO utilisateur (mail, pseudonyme, password, isAdmin, point)
            VALUES (?, ?, ?, ?, ?)
            `;

            const query = pool.query(insertUserSql, [mail, pseudonyme, hashedPassword, isAdmin, point], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion de l\'utilisateur:', err);
                return res.status(500).send('Erreur du serveur');
            }

            // Afficher la requête SQL générée (pour débogage)
            console.log('Requête SQL générée:', query.sql);

            const mailOptions = {
                from: 'autoTournament@example.com',
                to: mail,
                subject: 'autoTournament : Inscription compléte',
                text: 'Votre compte a été créer avec succé : ' + result.pseudonyme + 'et votre mot de passe est : ' + password,
                html: '<p>Votre compte a été créer avec succé :' + result.pseudonyme + 'et votre mot de passe est : ' + password + '</p>'
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.error('Erreur lors de l\'envoi de l\'email:', error);
                }
                console.log('Email envoyé avec succès:', info.response);
            });

            res.status(201).json({ message: 'Utilisateur créé avec succès' });
            });
        });
        });
    });
}