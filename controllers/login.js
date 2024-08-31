const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const validateUserSignUp = require('../validation/validationUserSignIn');

module.exports = function(app, pool) {
    // Méthode de login
    app.post('/login', (req, res) => {
      const { mail, password } = req.body;

      if (!mail || !password) {
        return res.status(400).send('Email et mot de passe sont requis');
      }
      if(!validateUserSignUp({ mail, password })) {
        return res.status(400).send('l\'utilisateur doit avoir être valide');
      }

      const sql = 'SELECT * FROM utilisateur WHERE mail = ?';

      // Utilisation du pool pour faire une requête à la base de données
      const query = pool.query(sql, [mail], (err, results) => {
        if (err) {
          console.error('Erreur lors de la requête:', err);
          return res.status(500).send('Erreur du serveur');
        }
  
        // Afficher la requête SQL générée
        console.log('Requête SQL générée:', query.sql, 'nb res',results.length);
  
        if (results.length === 0) {
          return res.status(400).send('Email ou mot de passe incorrect');
        }
  
        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error('Erreur lors de la comparaison des mots de passe:', err);
            return res.status(500).send('Erreur du serveur');
          }
  
          if (!isMatch) {
            return res.status(400).send('Email ou mot de passe incorrect');
          }
  
          // Création du token JWT
          const token = jwt.sign(
            { userPseudonyme : user.pseudonyme, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
          );

          res.json({ token });
        });
      });
    });
  };