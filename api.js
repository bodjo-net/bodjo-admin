const domain = 'bodjo.net';
let Storage = {
	data: {},
	get: function (name) {
		let o = null;
		if (getCookie(name)) {
			o = getCookie(name);
			if (typeof localStorageGet(name) === 'undefined')
				localStorageSet(name, o);
		} else if (localStorageGet(name)) {
			o = localStorageGet(name);
			setCookie(name, o);
			setCookie(name, o, {domain});
		}
		if (o != null) {
			try {
				o = JSON.parse(o)
			} catch (e) {}
		} else if (typeof Storage.data[name] !== 'undefined') {
			return Storage.data[name];
		}
		return o;
	},
	set: function (name, value) {
		let v = JSON.stringify(value);
		localStorageSet(name, v);
		setCookie(name, v);
		setCookie(name, v, {domain});
		Storage.data[name] = value;
	},
	remove: function (name) {
		deleteCookie(name);
		localStorage.removeItem(name);
		delete Storage.data[name];
	}
};
window.Storage = Storage;

function localStorageGet(name) {
	try {
		return localStorage.getItem(name);
	} catch (e) {
		return null;
	}
}
function localStorageSet(name, value) {
	try {
		return localStorage.setItem(name, value);
	} catch (e) {
		return null;
	}
}
// cookies (thanks to https://learn.javascript.ru/cookie)
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options) {
  options = {
    path: '/',
    ...options
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true)
      updatedCookie += "=" + optionValue;
  }

  document.cookie = updatedCookie;
}
function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  })
}


function GET(url, callback, shouldParse) {
	if (typeof shouldParse === 'undefined')
		shouldParse = true;
	let xhr = new XMLHttpRequest();
	if (url.indexOf('http://')!=0 && url.indexOf('https://')!=0 && url[0] != '/')
		url = 'http://'+url;
	xhr.open('GET', url, true);
	xhr.send();
	xhr.onreadystatechange = function () {
		if (xhr.readyState !== 4) return;

		if (xhr.status == 200) {
			let data = xhr.responseText;
			if (shouldParse) {
				try {
					data = JSON.parse(data);
				} catch (e) {}
			}
			callback(true, data);
		} else {
			callback(false, xhr);
		}
	}
}
function POST(url, before, callback) {
	let xhr = new XMLHttpRequest();
	if (url.indexOf('http://')!=0&&url.indexOf('https://')!=0)
		url = 'http://'+url;
	xhr.open('POST', url, true);
	before(xhr);
	xhr.onreadystatechange = function () {
		if (xhr.readyState !== 4) return;

		if (xhr.status == 200) {
			let data = xhr.responseText;
			try {
				data = JSON.parse(data);
			} catch (e) {}
			callback(true, data);
		} else {
			callback(false, xhr);
		}

	}
}