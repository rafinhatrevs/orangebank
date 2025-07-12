const fs = require('fs/promises');
const path = require('path');
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

const transfer = async (req, res) => {
    const { userId } = req.params;
    const { value, receiverId, senderType, receiverType } = req.body;

    try {
        const fileData = await fs.readFile(dbPath, 'utf8');
        const data = JSON.parse(fileData);

        const senderAccount = data.accounts.find((acc) => acc.userId === userId && acc.type === senderType);

        if (!senderAccount) {
            return res.status(404).json({ mensagem: 'Conta de origem não encontrada.' });
        }

        const receiverAccount = data.accounts.find((acc) => acc.userId === receiverId && acc.type === receiverType);

        if (!receiverAccount) {
            return res.status(404).json({ mensagem: 'Conta de destino não encontrada.' });
        }

        if (senderAccount.type === 'investimento' && receiverAccount.type === 'investimento') {
            return res.status(400).json({ mensagem: 'Transferências entre contas de investimento não são permitidas.' });
        }

        if (senderAccount.balance < value) {
            return res.status(400).json({ mensagem: 'Saldo insuficiente para transferência.' });
        }

        senderAccount.balance -= value;
        receiverAccount.balance += value;

        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

        return res.status(200).json({
            mensagem: `Transferência de ${formatCurrency(value)} realizada com sucesso.`,
            saldo: formatCurrency(senderAccount.balance)
        });

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
};

module.exports = {
    deposit,
    withdrawal,
    transfer,
};