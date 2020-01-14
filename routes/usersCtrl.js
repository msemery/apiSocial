//importer les modules
let bcryptjs = require('bcryptjs');
let jwtUtils = require('../utils/jwt.utils');
let models = require('sequelize-models');
//../models

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
            where: { email: email},
        })
        .then(function(userFound) {
            if (!userFound) {
                //on hash et on sale le mot de passe pour pas qu'il soit décrypté
                bcryptjs.hash(password, 5, function( err, bcryptedPassword) {
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
        //paramètres
        let email = req.body.email;
        let password = req.body.password;

        if(email == null || password == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }
        //vérifie mail etc
        models.User.findOne({
            where: { email: email}
        })
        .then(function(userFound) {
            if (userFound) {
                bcryptjs.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                    if(resBycrypt) {
                        return res.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        });
                    } else  {
                        return res.status(403).json({'error': 'invalid password'});
                    }
                })
            } else {
                return res.status(404).json({'error': 'user not exist in DB'});
            }
        })
        .catch(function(err) {
            return res.status(500).json({'error': 'unable to verify user'});
        })
    }
}