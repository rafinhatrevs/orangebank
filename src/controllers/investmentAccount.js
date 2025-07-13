const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { formatCurrency } = require('../utils/format');

const dbPath = path.join(__dirname, '../database/db.json');

const buyAsset = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
};

const sellAsset = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
};

module.exports = {
    buyAsset,
    sellAsset,
};