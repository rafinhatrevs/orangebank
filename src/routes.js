const express = require('express');
const { accountData, depositData, withdrawalData, transferInternalData, transferExternalData, buyAssetData } = require('./middlewares/validationData');
const { createAccount } = require('./controllers/users');
const { deposit, withdrawal, transferExternal } = require('./controllers/checkingAccount');
const { transferInternal } = require('./controllers/transferInternal');
const { buyAsset } = require('./controllers/investmentAccount');

const routes = express.Router();

routes.post('/usuarios/:userId/contas', accountData, createAccount);
routes.post('/usuarios/:userId/deposito', depositData, deposit);
routes.post('/usuarios/:userId/saque', withdrawalData, withdrawal);
routes.post('/usuarios/:userId/transferencia/interna', transferInternalData, transferInternal);
routes.post('/usuarios/:userId/transferencia/externa', transferExternalData, transferExternal);
routes.post('/usuarios/:userId/compra', buyAssetData, buyAsset);

module.exports = routes;