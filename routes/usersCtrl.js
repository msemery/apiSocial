//importer les modules
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let models = require('..models');

//routes, on y exporte toutes nos routes
module.exports = {
    register : function(req, res) {
        //récupérer les paramétres
        let email = req.body.email;
        let username = req.body.username;
        let password = req.body.password;
        let bio = req.body.bio;

        //si l'un de ces paramètres est vide on retourne une erreur 400
        if(email == null || username == null || password == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }

        //ici on vérifie les variables, le mail, la taille du password
        models.User.findOne({
            attributes: ['email'],
            where: { email: email}
        })
        .then(function(userFound) {
            if (!userFound) {
                //on hash et on sale le mot de passe pour pas qu'il soit décrypté
                bcrypt.hash(password, 5, function( err, bcryptedPassword) {
                    let newUser = models.User.create({
                    email: email,
                    username: username,
                    password: bcryptedPassword,
                    bio: bio,
                    isAdmin: 0
                    })
                    .then(function(newUser) {
                        return res.status(201).json({
                            'userId': newUser.id
                        })
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'cannot add user'});
                    });
                });
            } else {
                return res.status(409).json({ 'error': 'user already exist'});
            }
        })
        .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user'});
        });
    },
    login: function(req, res) {

    }
}