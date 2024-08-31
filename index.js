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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM utilisateur";

  //Todo: ne pas envoyer password
  //Todo : check isAdmin
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).send("Erreur du serveur");
    }
    res.json(results);
  });
});

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

// Exemple de route protégée (vous avez besoin du middleware d'authentification ici)
const authenticateToken = require("./authMiddleware");
app.get("/protected", authenticateToken, (req, res) => {
  res.send("Cette route est protégée");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
