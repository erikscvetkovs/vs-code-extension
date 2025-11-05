const pushNotificationContent = async (html, css, script, settings) => {
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
		// Wait for the target element to exist in the DOM
		await waitFor(() => document.querySelector('body > div') !== null, 10000);

		// Get the target element based on the settings
		const targetElement = document.querySelector('body > div');

		if (!targetElement) {
			throw new Error(`Target element not found`);
		}

		// Create a new div with the class "notification-preview-admin"
		const previewDiv = document.createElement('div');
		previewDiv.className = 'notification-preview-admin';

		// Insert the new div into the DOM based on the method
		targetElement.insertAdjacentHTML('beforeend', previewDiv.outerHTML);

		// Select the newly inserted div
		const insertedDiv = targetElement.parentElement.querySelector('.notification-preview-admin');

		if (!insertedDiv) {
			throw new Error('Failed to insert the preview div');
		}

		// Insert the <style> tag with the CSS
		if (css) {
			const styleTag = document.createElement('style');

			// Add position: fixed and options for center/left/right
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

		// Insert the HTML content
		if (html) {
			insertedDiv.insertAdjacentHTML('beforeend', html);
		}

		// Apply the script
		if (script) {
			eval(script);
		}

		console.log('Notification content successfully inserted and applied');
	} catch (err) {
		console.error('Error running notification content:', err);
		alert('Notification Content failed: ' + err.message);
	}
};

module.exports = { pushNotificationContent };























