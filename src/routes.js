const express = require('express');
const { accountData, depositData, withdrawalData, transferData } = require('./middlewares/validationData');
const { createAccount } = require('./controllers/users');
const { deposit, withdrawal, transfer } = require('./controllers/checkingAccount');

const routes = express.Router();

routes.post('/usuarios/:userId/contas', accountData, createAccount);
routes.post('/usuarios/:userId/depositar', depositData, deposit);
routes.post('/usuarios/:userId/sacar', withdrawalData, withdrawal);
routes.post('/usuarios/:userId/transferir', transferData, transfer);

module.exports = routes;