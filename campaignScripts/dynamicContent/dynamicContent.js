const pushDynamicContent = async (html, css, script, settings) => {
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
		console.log('html ', html)
		console.log('script ', script)
		console.log('css ', css)
		console.log('settings ', settings)
		// Wait for the target element to exist in the DOM
		await waitFor(() => document.querySelector(settings.selector) !== null, 10000);

		// Get the target element based on the selector
		const targetElement = document.querySelector(settings.selector);

		if (!targetElement) {
			throw new Error(`Target element not found for selector: ${settings.selector}`);
		}

		// Create a new div with the class "dy-preview-admin"
		const previewDiv = document.createElement('div');
		previewDiv.className = 'dy-preview-admin';

		if (settings.method === 'afterbegin') {
			targetElement.innerHTML = '';
		}

		// Insert the new div into the DOM based on the method
		targetElement.insertAdjacentHTML(settings.method, previewDiv.outerHTML);

		// Select the newly inserted div
		const insertedDiv = targetElement.parentElement.querySelector('.dy-preview-admin');

		if (!insertedDiv) {
			throw new Error('Failed to insert the preview div');
		}

		// Insert the <style> tag with the CSS
		if (css) {
			const styleTag = document.createElement('style');
			styleTag.textContent = css;
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

		console.log('Dynamic content successfully inserted and applied');
	} catch (err) {
		console.error('Error running dynamic content:', err);
		alert('Dynamic Content failed: ' + err.message);
	}
};

module.exports = { pushDynamicContent };