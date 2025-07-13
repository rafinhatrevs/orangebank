const isValidAccountType = (type) => {
    return type === 'corrente' || type === 'investimento';
};

const isValidValue = (value) => {
    const numericValue = Number(value);

    return !isNaN(numericValue) && numericValue > 0 ? numericValue : null;
};

const accountData = (req, res, next) => {
    const { type } = req.body;

    if (!type) {
        return res.status(400).json({ mensagem: 'Informe o tipo de conta.' });
    }

    if (!isValidAccountType(type)) {
        return res.status(400).json({ mensagem: 'Informe um tipo de conta válido.' });
    }

    next();
};

const depositData = (req, res, next) => {
    const { value } = req.body;
    const numericValue = isValidValue(value);

    if (!value) {
        return res.status(400).json({ mensagem: 'Informe o valor.' });
    }

    if (!numericValue) {
        return res.status(400).json({ mensagem: 'Informe um valor válido.' });
    }

    req.body.value = numericValue;

    next();
};

const withdrawalData = (req, res, next) => {
    const { value } = req.body;
    const numericValue = isValidValue(value);

    if (!value) {
        return res.status(400).json({ mensagem: 'Informe o valor.' });
    }

    if (!numericValue) {
        return res.status(400).json({ mensagem: 'Informe um valor válido.' });
    }

    req.body.value = numericValue;

    next();
};

const transferInternalData = (req, res, next) => {
    const { value, senderType, receiverType } = req.body;

    if (!value || !senderType || !receiverType) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
    }

    const numericValue = isValidValue(value);

    if (!numericValue) {
        return res.status(400).json({ mensagem: 'Informe um valor válido.' });
    }

    if (!isValidAccountType(senderType)) {
        return res.status(400).json({ mensagem: 'Informe um tipo de conta de origem válido.' });
    }

    if (!isValidAccountType(receiverType)) {
        return res.status(400).json({ mensagem: 'Informe um tipo de conta de destino válido.' });
    }

    req.body.value = numericValue;

    next();
};

const transferExternalData = (req, res, next) => {
    const { userId } = req.params;
    const { value, receiverId, senderType, receiverType } = req.body;

    if (!value || !receiverId || !senderType || !receiverType) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
    }

    const numericValue = isValidValue(value);

    if (!numericValue) {
        return res.status(400).json({ mensagem: 'Informe um valor válido.' });
    }

    if (senderType !== 'corrente' || receiverType !== 'corrente') {
        return res.status(400).json({ mensagem: 'Transferências externas só são permitidas entre contas correntes.' });
    }

    if (userId === receiverId) {
        return res.status(400).json({ mensagem: 'Para transferências internas use o endpoint apropriado.' });
    }

    req.body.value = numericValue;

    next();
};

module.exports = {
    accountData,
    depositData,
    withdrawalData,
    transferInternalData,
    transferExternalData
};