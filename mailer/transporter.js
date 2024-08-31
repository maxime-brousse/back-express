const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'libby49@ethereal.email',
        pass: '9M5u8xYVy6d4nwCUvp'
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Erreur de configuration du transporter:", error);
    } else {
        console.log("Le transporter est configuré correctement:", success);
    }
});


module.exports = transporter;