// Variable contenant le token JWT
const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFV0aWxpc2F0ZXVyIjo2LCJpc0FkbWluIjowLCJpYXQiOjE3MjQ3MDYxNjUsImV4cCI6MTcyNDcwOTc2NX0.pGtFUDyc-wxSRkCrKLhsikiDd1bly2VV6GZaeXqvjRc";

// Exemple d'URL pour accéder à une ressource protégée
const url = 'http://localhost:3333/protected';

// Effectuer la requête fetch avec le token JWT dans l'en-tête Authorization
fetch(url, {
  method: 'GET', // La méthode de la requête, par exemple GET
  headers: {
    'Authorization': `Bearer ${token}`, // Ajouter le token JWT dans l'en-tête Authorization
    'Content-Type': 'application/json', // Indiquer le type de contenu (facultatif selon la requête)
  }
})
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text) });
    }
    return response.json();
  })
  .then(data => {
    console.log('Données reçues:', data);
    // Traitez les données reçues ici
  })
  .catch(error => {
    console.error('Erreur lors de la requête:', error.message);
  });