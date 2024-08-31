const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const transporter = require('../mailer/transporter');
const validateUserSignUp = require('../validation/validationUserSignUp');

module.exports = function(app, pool) {
  // Méthode de sign up
  app.post('/signup', (req, res) => {
    const { mail, password, pseudonyme } = req.body;

    if (!mail || !password || !pseudonyme) {
      return res.status(400).send('Email, pseudonyme et mot de passe sont requis');
    }
    if(!validateUserSignUp({ mail, password, pseudonyme })) {
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
          VALUES (?, ?, ?, ?, 0)
        `;

        const query = pool.query(insertUserSql, [mail, pseudonyme, hashedPassword, 0], (err, result) => {
          if (err) {
            console.error('Erreur lors de l\'insertion de l\'utilisateur:', err);
            return res.status(500).send('Erreur du serveur');
          }

          // Afficher la requête SQL générée (pour débogage)
          console.log('Requête SQL générée:', query.sql);

          // Création du token JWT
          const token = jwt.sign(
            { userPseudonyme: result.pseudonyme, isAdmin: result.isAdmin ? 1 : 0 },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
          );

          const mailOptions = {
            from: 'autoTournament@example.com',
            to: mail,
            subject: 'autoTournament : Inscription compléte',
            text: 'Votre compte a été créer avec succé : ' + result.pseudonyme,
            html: '<p>Votre compte a été créer avec succé :' + result.pseudonyme + '</p>'
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error('Erreur lors de l\'envoi de l\'email:', error);
            }
            console.log('Email envoyé avec succès:', info.response);
          });

          res.status(201).json({ token, message: 'Utilisateur créé avec succès' });
        });
      });
    });
  });
};