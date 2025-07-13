const accountData = (req, res, next) => {
    const { type } = req.body;

    if (!type) {
        return res.status(400).json({ mensagem: 'Informe o tipo de conta.' });
    }

    if (type !== 'corrente' && type !== 'investimento') {
        return res.status(400).json({ mensagem: 'Informe um tipo de conta válido.' });
    }

    next();
};

const depositData = (req, res, next) => {
    const { value } = req.body;

    if (!value) {
        return res.status(400).json({ mensagem: 'Informe o valor.' });
    }

    if (value <= 0) {
        return res.status(400).json({ mensagem: 'Informe um valor válido.' });
    }

    next();
};

const withdrawalData = (req, res, next) => {
    const { value } = req.body;

    if (!value) {
        return res.status(400).json({ mensagem: 'Informe o valor.' });
    }

    if (value <= 0) {
        return res.status(400).json({ mensagem: 'Informe um valor válido.' });
    }

    next();
};

const transferData = (req, res, next) => {
    const { value, receiverId, senderType, receiverType } = req.body;

    if (!value || !receiverId || !senderType || !receiverType) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
    }

    const numericValue = Number(value);

    if (isNaN(numericValue) || numericValue <= 0) {
        return res.status(400).json({ mensagem: 'Informe um valor válido.' });
    }

    if (senderType !== 'corrente' && senderType !== 'investimento') {
        return res.status(400).json({ mensagem: 'Informe um tipo de conta de origem válido.' });
    }

    if (receiverType !== 'corrente' && receiverType !== 'investimento') {
        return res.status(400).json({ mensagem: 'Informe um tipo de conta de destino válido.' });
    }

    req.body.value = numericValue;

    next();
};

module.exports = {
    accountData,
    depositData,
    withdrawalData,
    transferData
};