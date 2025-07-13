const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { formatCurrency } = require('../utils/format');

const dbPath = path.join(__dirname, '../database/db.json');

const transferInternal = async (req, res) => {
    const { userId } = req.params;
    const { value, senderType, receiverType } = req.body;

    try {
        const fileData = await fs.readFile(dbPath, 'utf8');
        const data = JSON.parse(fileData);

        const senderAccount = data.accounts.find((acc) => acc.userId === userId && acc.type === senderType);
        const receiverAccount = data.accounts.find((acc) => acc.userId === userId && acc.type === receiverType);

        if (!senderAccount) {
            return res.status(404).json({ mensagem: 'Conta de origem não encontrada.' });
        }

        if (!receiverAccount) {
            return res.status(404).json({ mensagem: 'Conta de destino não encontrada.' });
        }

        if (senderAccount.type === 'investimento' && receiverAccount.type === 'investimento') {
            return res.status(400).json({ mensagem: 'Transferências entre contas de investimento não são permitidas.' });
        }

        if (senderAccount.type === 'investimento' && receiverAccount.type === 'corrente') {
            const hasPendingOperations = data.pendingOperations.some(op => op.userId === userId);

            if (hasPendingOperations) {
                return res.status(400).json({ mensagem: 'Existem operações pendentes na conta de investimento.' });
            }
        }

        if (senderAccount.balance < value) {
            return res.status(400).json({ mensagem: 'Saldo insuficiente para transferência.' });
        }

        senderAccount.balance -= value;
        receiverAccount.balance += value;

        const transaction = {
            id: uuidv4(),
            date: new Date().toISOString(),
            value,
            tax: 0,
            from: {
                userId,
                accountId: senderAccount.id,
                type: senderAccount.type
            },
            to: {
                userId,
                accountId: receiverAccount.id,
                type: receiverAccount.type
            },
            type: 'transferência interna'
        };

        data.transactions.push(transaction);

        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

        return res.status(200).json({
            mensagem: `Transferência interna de ${formatCurrency(value)} realizada com sucesso.`,
            saldoOrigem: formatCurrency(senderAccount.balance),
            saldoDestino: formatCurrency(receiverAccount.balance)
        });

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
};

module.exports = {
    transferInternal
};