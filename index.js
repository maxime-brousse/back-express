const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = 3333;

var mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query("SELECT 1 + 1 AS solution", function (error, results, fields) {
  if (error) throw error;
  console.log("The solution is: ", results[0].solution);
});

// create application/json parser
const jsonParser = bodyParser.json();
app.use(jsonParser);
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);

app.use(cors());

app.get("/topScores", (req, res) => {
  const sql = "SELECT pseudonyme, point FROM utilisateur ORDER BY point DESC LIMIT 3";

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).send("Erreur du serveur");
    }

    res.json(results);
  });
});

app.get("/tournament", (req, res) => {
  const sql = "SELECT * FROM tournoi";

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).send("Erreur du serveur");
    }
    res.json(results);
  });
});

require("./controllers/login")(app, pool);
require("./controllers/signup")(app, pool);

// route protégées
const authenticateToken = require("./authMiddleware");
const validateUser = require("./validation/validateUser");

// CRUD USER ADMIN
app.get("/users", authenticateToken, (req, res) => {
  const sql = "SELECT u.idUtilisateur,u.mail, u.pseudonyme, u.point, u.isAdmin FROM utilisateur u";

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).send("Erreur du serveur");
    }
    res.json(results);
  });
});

app.post('/users/create', (req, res) => {
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

        res.status(201).json({ message: 'Utilisateur créé avec succès' });
      });
    });
  });
});

// CRUD TOURNAMENT ADMIN

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
