const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../database/db.json');

const createAccount = async (req, res) => {
    const { userId, type } = req.body;

    if (!userId || !type) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
    }

    if (type !== 'corrente' && type !== 'investimento') {
        return res.status(400).json({ mensagem: 'Informe um tipo de conta válido.' });
    }

    try {
        const fileData = await fs.readFile(dbPath, 'utf8');
        const data = JSON.parse(fileData);

        const user = data.users.find((user) => user.id === userId);

        if (!user) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        const account = data.accounts.find((account) => account.userId === userId && account.type === type);

        if (account) {
            return res.status(400).json({ mensagem: `Usuário já possui conta ${type}.` });
        }

        const newAccount = {
            id: uuidv4(),
            userId,
            type,
            balance: 0
        };

        data.accounts.push(newAccount);

        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

        return res.status(201).json(newAccount);

    } catch (error) {
        console.error('Erro ao criar conta: ', error);
        return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
};

module.exports = {
    createAccount,
};