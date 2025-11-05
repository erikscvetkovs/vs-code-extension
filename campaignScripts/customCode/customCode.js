const pushCustomCode = async (script) => {
    function waitFor(conditionFn, timeout = 10000, interval = 100) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
                if (conditionFn()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    setTimeout(check, interval);
                }
            };
            check();
        });
    }

    try {
        await waitFor(() => window.DY !== undefined, 10000);
        console.log('window.DY is available!');
        eval(script);
        alert('Custom Code is ready');
    } catch (err) {
        console.error('Error running custom code:', err);
        alert('Custom Code failed: ' + err.message);
    }
};

module.exports = { pushCustomCode };
