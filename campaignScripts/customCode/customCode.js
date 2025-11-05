const pushCustomCode = async (script) => {
    eval(script);
};

module.exports = { pushCustomCode };
