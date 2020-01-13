//importer
let express = require('express');
let usersCtrl = require('./routes/usersCtrl');

//routes
exports.router = (function() {
    let apiRouter = express.Router();

    //utilisateurs routes
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);

    return apiRouter;
})();

