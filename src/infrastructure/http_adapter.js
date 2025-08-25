/*
Path: static/src/infrastructure/http_adapter.js
*/

export class IHttpAdapter {
	async get(url) { throw new Error('Not implemented'); }
	async getText(url) { throw new Error('Not implemented'); }
}

export class HttpAdapter extends IHttpAdapter {
	async get(url) {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('[HttpAdapter] Error en GET:', error);
			throw error;
		}
	}

	async getText(url) {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status}`);
			}
			return await response.text();
		} catch (error) {
			console.error('[HttpAdapter] Error en GET (text):', error);
			throw error;
		}
	}
}
