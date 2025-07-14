const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../database/db.json');

const buyAsset = async (req, res) => {
    const { userId } = req.params;
    const { ticker, type, amount, unitPrice } = req.body;

    try {
        const fileData = await fs.readFile(dbPath, 'utf8');
        const data = JSON.parse(fileData);

        const investmentAccount = data.accounts.find((acc) => acc.userId === userId && acc.type === 'investimento');

        if (!investmentAccount) {
            return res.status(404).json({ mensagem: 'Conta de investimento não encontrada.' });
        }

        if (!investmentAccount.assets) {
            investmentAccount.assets = [];
        }

        const cost = amount * unitPrice;
        const brokerageFee = type === 'ação' ? cost * 0.01 : 0;
        const total = cost + brokerageFee;

        if (investmentAccount.balance < total) {
            return res.status(400).json({ mensagem: 'Saldo insuficiente para compra do ativo.' });
        }

        investmentAccount.balance -= total;

        const existingAsset = investmentAccount.assets.find((asset) => asset.ticker === ticker);

        if (existingAsset) {
            existingAsset.amount += amount;
            existingAsset.totalInvested += cost;
        } else {
            investmentAccount.assets.push({
                id: uuidv4(),
                ticker,
                type,
                amount,
                totalInvested: cost
            });
        }

        data.pendingOperations.push({
            id: uuidv4(),
            date: new Date().toISOString(),
            userId,
            type: 'compra',
            ticker,
            assetType: type,
            amount,
            unitPrice,
            total
        });

        data.transactions.push({
            id: uuidv4(),
            date: new Date().toISOString(),
            value: cost,
            tax: type === 'ação' ? brokerageFee : 0,
            from: {
                userId,
                accountId: investmentAccount.id,
                type: 'investimento'
            },
            to: {
                type: 'mercado',
                asset: ticker
            },
            type: 'compra de ativo'
        });

        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

        return res.status(201).json({ mensagem: 'Compra de ativo registrada com sucesso (pendente).' });

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