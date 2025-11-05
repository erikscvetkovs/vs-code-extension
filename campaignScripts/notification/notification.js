const pushNotificationContent = async (html, css, script) => {
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
		await waitFor(() => document.querySelector('body > div') !== null, 10000);
		const targetElement = document.body;

		if (!targetElement) {
			throw new Error(`Target element not found`);
		}

		const previewDiv = document.createElement('div');
		previewDiv.className = 'notification-preview-admin';

		targetElement.insertAdjacentHTML('afterbegin', previewDiv.outerHTML);

		const insertedDiv = targetElement.parentElement.querySelector('.notification-preview-admin');

		if (!insertedDiv) {
			throw new Error('Failed to insert the preview div');
		}

		if (css) {
			const styleTag = document.createElement('style');

			styleTag.textContent = `
				.notification-preview-admin {
					position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #00000068;
					z-index: 1000;
				}
			`;
			insertedDiv.appendChild(styleTag);
		}

		if (html) {
			insertedDiv.insertAdjacentHTML('beforeend', html);
		}

		if (script) {
			eval(script);
		}

	} catch (err) {
		alert('Notification Content failed: ' + err.message);
	}
};

module.exports = { pushNotificationContent };























