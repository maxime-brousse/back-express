require('dotenv').config();
const transporter = require('../mailer/transporter');

module.exports = function(app, pool, authenticateToken) {
    app.post('/inscription/:id', authenticateToken, (req, res) => {
        const { mail } = req.body;
        const { id } = req.params;

        if (!mail) {
            return res.status(400).send('le mail est requis');
        }

        const checkTournoiSql = 'SELECT * FROM tournoi WHERE idTournoi = ?';
        pool.query(checkTournoiSql, [id], (err, tournoi) => {
            if (err) {
                console.error('Erreur lors de la vérification du tournoi:', err);
                return res.status(500).send('Erreur du serveur');
            }

            if (tournoi.length < 1) {
                return res.status(400).send('tournoi inconnu');
            }

            const checkUserSql = 'SELECT * FROM utilisateur WHERE mail = ?';
            pool.query(checkUserSql, [mail], (err, user) => {
                if (err) {
                    console.error('Erreur lors de la vérification de l\'utilisateur:', err);
                    return res.status(500).send('Erreur du serveur');
                }

                if (user.length < 1) {
                    return res.status(400).send('utilisateur inconnu');
                }

                // Insertion du nouvel tournoi dans la base de données
                const insertTournoiSql = `
                INSERT INTO participants (idTournoi, idUtilisateur)
                VALUES (?, ?)
                    `;

                pool.query(insertTournoiSql, [id, mail], (err, result) => {
                    if (err) {
                        console.error('Erreur lors de l\'insertion du tournoi :', err);
                        return res.status(500).send('Erreur du serveur');
                    }

                    const modifyTournoiSql = `
                        UPDATE tournoi
                        SET nbJoueurs = ?
                        WHERE idTournoi = ?;
                    `;
                    const formattedNumber = parseInt(tournoi[0].nbJoueurs, 10) + 1;
                    pool.query(modifyTournoiSql, [formattedNumber, id], (err, result) => {
                        if (err) {
                            console.error('Erreur lors de la modification du tournoi :', err);
                            return res.status(500).send('Erreur du serveur');
                        }

                        const mailOptions = {
                            from: 'autoTournament@example.com',
                            to: mail,
                            subject: 'autoTournament : inscription compléte',
                            text: 'Vous avez bien été inscrit au tournoi : ' + tournoi[0].titreTournoi + 'prévue le : ' + tournoi[0].dateTournoi,
                            html: '<p>Vous avez bien été inscrit au tournoi :' + tournoi[0].titreTournoi + 'prévue le : ' + tournoi[0].dateTournoi + '</p>'
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.error('Erreur lors de l\'envoi de l\'email:', error);
                            }
                            console.log('Email envoyé avec succès:', info.response);
                        });


                        res.status(201).json({ message: 'tournoi créer avec succès' });
                    });
                });
            });
        });
    });
}