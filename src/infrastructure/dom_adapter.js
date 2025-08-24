/*
Path: static/src/infrastructure/dom_adapter.js
*/

export class IDomAdapter {
	getElement(id) { throw new Error('Not implemented'); }
	setText(id, text) { throw new Error('Not implemented'); }
	setHtml(id, html) { throw new Error('Not implemented'); }
	addClass(id, className) { throw new Error('Not implemented'); }
	removeClass(id, className) { throw new Error('Not implemented'); }
	querySelectorAll(id, selector) { throw new Error('Not implemented'); }
}

export class DomAdapter {
	getElement(id) {
		return document.getElementById(id);
	}

	setText(id, text) {
		const el = this.getElement(id);
		if (el) el.textContent = text;
	}

	setHtml(id, html) {
		const el = this.getElement(id);
		if (el) el.innerHTML = html;
	}

	addClass(id, className) {
		const el = this.getElement(id);
		if (el) el.classList.add(className);
	}

	removeClass(id, className) {
		const el = this.getElement(id);
		if (el) el.classList.remove(className);
	}

	querySelectorAll(id, selector) {
		const el = this.getElement(id);
		return el ? el.querySelectorAll(selector) : [];
	}
}
