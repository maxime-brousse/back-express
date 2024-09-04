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

  if(!req.user.isAdmin) {
      return res.status(403).send("route interdite");
  }

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).send("Erreur du serveur");
    }
    res.json(results);
  });
});

app.get("/user/:id", authenticateToken, (req, res) => {
  const sql = "SELECT u.idUtilisateur, u.mail, u.pseudonyme, u.point, u.isAdmin FROM utilisateur u WHERE u.idUtilisateur = ?";

  if(!req.user.isAdmin) {
    return res.status(403).send("route interdite");
  }

  pool.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).send("Erreur du serveur");
    }
    res.json(results);
  });
});

//récupération donnés profil
app.get("/profil", authenticateToken, (req, res) => {
    const sql = "SELECT u.mail, u.pseudonyme FROM utilisateur u WHERE u.mail = ?";

    pool.query(sql, [req.user.mail], (err, results) => {
        if (err) {
          console.error("Erreur lors de la récupération des utilisateurs:", err);
          return res.status(500).send("Erreur du serveur");
        }
        res.json(results);
    });
});

require("./users/profilModify")(app, pool, authenticateToken);

require("./users/userCreate")(app, pool, authenticateToken);
require("./users/userModify")(app, pool, authenticateToken);
require("./users/userDelete")(app, pool, authenticateToken);

// CRUD TOURNAMENT ADMIN
app.get("/tournament/:id", authenticateToken, (req, res) => {
  const sql = "SELECT * FROM tournoi t WHERE t.idTournoi = ?";

  if(!req.user.isAdmin) {
    return res.status(403).send("route interdite");
  }

  pool.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).send("Erreur du serveur");
    }
    res.json(results);
  });
});

require("./tournament/tournamentCreate")(app, pool, authenticateToken);
require("./tournament/tournamentModify")(app, pool, authenticateToken);
require("./tournament/tournamentDelete")(app, pool, authenticateToken);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
