const pushDynamicContent = async (html, css, script, settings, variables) => {
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
		await waitFor(() => document.querySelector(settings.selector) !== null, 10000);
		const targetElement = document.querySelector(settings.selector);

		if (!targetElement) {
			throw new Error(`Target element not found for\ selector: ${settings.selector}`);
		}

		const previewDiv = document.createElement('div');
		previewDiv.className = 'dy-preview-admin';

		if (settings.method === 'afterbegin') {
			targetElement.innerHTML = '';
		}

		targetElement.insertAdjacentHTML(settings.method, previewDiv.outerHTML);

		const insertedDiv = targetElement.parentElement.querySelector('.dy-preview-admin');

		if (!insertedDiv) {
			throw new Error('Failed to insert the preview div');
		}

		if (css) {
			const styleTag = document.createElement('style');
			styleTag.textContent = css;
			insertedDiv.appendChild(styleTag);
		}

		if (html) {
			insertedDiv.insertAdjacentHTML('beforeend', html);
			const resolvePath = (obj, path) => {
				const cleaned = path.replace(/\[(\d+)\]/g, '.$1').trim();
				const parts = cleaned.split('.').filter(Boolean);
				let cur = obj;
				for (const p of parts) {
					if (cur == null) return undefined;
					cur = cur[p];
				}
				return cur;
			};

			let htmlString = String(insertedDiv.innerHTML);

			htmlString = htmlString.replace(/\$\{([^}]+)\}/g, (match, expr) => {
				const key = expr.trim();
				let value;
				if (variables && Object.prototype.hasOwnProperty.call(variables, key)) {
					value = variables[key];
				} else {
					value = resolvePath(variables, key);
				}
				if (value === undefined || value === null) return '';
				if (typeof value === 'object') return JSON.stringify(value);
				return String(value);
			});

			insertedDiv.innerHTML = htmlString;
		}

		if (script) {
			eval(script);
		}

	} catch (err) {
		alert('Dynamic Content failed: ' + err.message);
	}
};

module.exports = { pushDynamicContent };