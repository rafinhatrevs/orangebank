const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { formatCurrency } = require('../utils/format');

const dbPath = path.join(__dirname, '../database/db.json');

const deposit = async (req, res) => {
    const { userId } = req.params;
    const { value } = req.body;

    try {
        const fileData = await fs.readFile(dbPath, 'utf8');
        const data = JSON.parse(fileData);

        const account = data.accounts.find((acc) => acc.userId === userId && acc.type === 'corrente');

        if (!account) {
            return res.status(404).json({ mensagem: 'Conta não encontrada.' });
        }

        if (account.type !== 'corrente') {
            return res.status(400).json({ mensagem: 'Depósitos diretos só são permitidos em contas do tipo corrente.' });
        }

        account.balance += value;

        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

        return res.status(200).json({
            mensagem: `Depósito de ${formatCurrency(value)} realizado com sucesso.`,
            saldo: formatCurrency(account.balance)
        });

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
};

const withdrawal = async (req, res) => {
    const { userId } = req.params;
    const { value } = req.body;

    try {
        const fileData = await fs.readFile(dbPath, 'utf8');
        const data = JSON.parse(fileData);

        const account = data.accounts.find((acc) => acc.userId === userId && acc.type === 'corrente');

        if (!account) {
            return res.status(404).json({ mensagem: 'Conta não encontrada.' });
        }

        if (account.type !== 'corrente') {
            return res.status(400).json({ mensagem: 'Saques diretos só são permitidos em contas do tipo corrente.' });
        }

        if (account.balance < value) {
            return res.status(400).json({ mensagem: 'Saldo insuficiente.' });
        }

        account.balance -= value;

        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

        return res.status(200).json({
            mensagem: `Saque de ${formatCurrency(value)} realizado com sucesso.`,
            saldo: formatCurrency(account.balance)
        });

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
};

const transferExternal = async (req, res) => {
    const { userId } = req.params;
    const { value, receiverId, senderType, receiverType } = req.body;

    try {
        const fileData = await fs.readFile(dbPath, 'utf8');
        const data = JSON.parse(fileData);

        const senderAccount = data.accounts.find((acc) => acc.userId === userId && acc.type === senderType);
        const receiverAccount = data.accounts.find((acc) => acc.userId === receiverId && acc.type === receiverType);

        if (!senderAccount) {
            return res.status(404).json({ mensagem: 'Conta de origem não encontrada.' });
        }

        if (!receiverAccount) {
            return res.status(404).json({ mensagem: 'Conta de destino não encontrada.' });
        }

        if (senderAccount.balance < value) {
            return res.status(400).json({ mensagem: 'Saldo insuficiente para transferência.' });
        }

        const fee = value * 0.005;
        const total = value + fee;

        if (senderAccount.balance < total) {
            return res.status(400).json({ mensagem: 'Saldo insuficiente para transferência.' });
        }

        senderAccount.balance -= total;
        receiverAccount.balance += value;

        const transaction = {
            id: uuidv4(),
            date: new Date().toISOString(),
            value,
            tax: fee,
            from: {
                userId: senderAccount.userId,
                accountId: senderAccount.id,
                type: senderAccount.type
            },
            to: {
                userId: receiverAccount.userId,
                accountId: receiverAccount.id,
                type: receiverAccount.type
            },
            type: 'transferência externa'
        };

        data.transactions.push(transaction);

        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

        return res.status(200).json({
            mensagem: `Transferência externa de ${formatCurrency(value)} realizada com sucesso.`,
            taxa: formatCurrency(fee),
            saldo: formatCurrency(senderAccount.balance)
        });

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
};

module.exports = {
    deposit,
    withdrawal,
    transferExternal
};