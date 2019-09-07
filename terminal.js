let pre = document.querySelector('pre');
let input = document.querySelector('input');

input.focus();
window.addEventListener('keyup', tryToFocus);
window.addEventListener('keypress', tryToFocus);
window.addEventListener('keydown', tryToFocus);
input.addEventListener('selectionchange', handleInputChange);
input.addEventListener('keyup', handleInputChange);
input.addEventListener('keypress', handleInputChange);
input.addEventListener('keydown', handleInputChange);
function tryToFocus(e) {
	if (!e.ctrlKey && e.key != 'Control')
		input.focus();
}
function handleInputChange(e) {
	let value = input.value;
	if (asking) {
		if (e.type === 'keyup' && e.code == 'Enter') {
			lastline(parse(askStr) + (askPass ? '*'.repeat(input.value.length) : input.value) + '\n');
			askCallback(input.value);
		} else if (e.type === 'keyup' && (e.code == 'ArrowUp' || e.code == 'ArrowDown')) {
			if (historyIndex == -1)
				historyIndex = history.length;
			historyIndex += (e.code == 'ArrowUp' ? -1 : 1);
			if (historyIndex < 0)
				historyIndex = -1;
			if (historyIndex < history.length)
				input.value = historyIndex == -1 ? '' : history[historyIndex];
			lastline(parse(askStr) + parse(addSelection(input, askPass)));
		} else
			lastline(parse(askStr) + parse(addSelection(input, askPass)));
	}
}

let asking = false,
	askStr = null,
	askCallback = null,
	askPass = null,
	history = [], historyIndex = -1;
function ask(str, callback, pass) {
	if (typeof pass === 'undefined')
		pass = false;
	asking = true;
	askStr = str;
	askPass = pass;
	input.value = '';
	if (pre.innerHTML[pre.innerHTML.length-1] != '\n')
		println('')
	lastline(parse(askStr + "$select; $e;"));
	askCallback = function (answer) {
		asking = false;
		askCallback = null;
		askStr = null;
		_lastline = null;
		if (!pass) {
			history.push(answer);
			historyIndex = -1;
		}
		callback(answer);
	}
}
function table(data) {
	println("Таблица, $bold;" + data.length + "$e; элементов.");
	if (data.length > 0) {
		let keys = Object.keys(data[0]);
		let lengths = new Array(keys.length).fill(0);
		for (let i = -1; i < data.length; ++i) {
			for (let k = 0; k < keys.length; ++k) {
				let s = i == -1 ? keys[k] : format(keys[k],data[i][keys[k]],true);
				if (s.length > lengths[k])
					lengths[k] = s.length;
			}
		}

		println(Array.from(keys, (k, i) => '$bold;'+k+'$e;' + ' '.repeat(lengths[i]-k.length)).join(' '));
		for (let i = 0; i < data.length; ++i) {
			println(Array.from(keys, (k, j) =>
				format(k,data[i][k],false) + ' '.repeat(lengths[j]-format(k,data[i][k],true).length)
			).join(' '));
		}
	}
}
function format(key, e, len) {
	if (key === 'secret')
		return len?'<secret>':'$spoiler('+e.toString()+');<secret>$e;';
	if (typeof e == 'boolean')
		return len?e.toString():((e?'$green;':'$red;')+e.toString()+'$e;');
	return e.toString();
}
function lastline(str) {
	pre.innerHTML = pre.innerHTML.substring(0, pre.innerHTML.lastIndexOf('\n')) + ('\n'+str)
}
function type(msg, cb, speed) {
	if (typeof speed !== 'number')
		speed = 1;
	println("");
	function t(i) {
		if (i == msg.length) {
			if (typeof cb === "function")
				cb();
			return;
		}

		print(msg[i]);
		setTimeout(function(){t(i+1)}, (5+Math.random()*10)*speed);
	}
	t(0);
}
function println(str) {
	print(str + '\n');
}
function print(str) {
	let shouldScroll = Math.abs(pre.scrollTop - (pre.scrollHeight - pre.clientHeight)) < 25;
	pre.innerHTML += parse(str);
	if (shouldScroll)
		setTimeout(() => pre.scrollTop = pre.scrollHeight - pre.clientHeight, 2);
}
function clear() {
	pre.innerHTML = '';
}
let spoilers = {};
function parse(str) {
	return str
				.replace(/\</g, '&lt;')
				.replace(/\>/g, '&gt;')
				.replace(/ /g, '&nbsp;')
				.replace(/\$spoiler\((.+)\);/g, function (_, m) {
					let id = randomID();
					spoilers[id] = m;
					return '<span class="spoiler" onClick="openSpoiler(\''+id+'\')" id="'+id+'">';
				})
				.replace(/\$e;/g, '</span>')
				.replace(/\$(\w{1,10});/g, '<span class="$1">');
}
function openSpoiler(id) {
	let spoiler = document.querySelector('#'+id);
	if (spoiler.className.indexOf('open') >= 0)
		return;
	spoiler.className = 'spoiler open';
	spoiler.innerHTML = parse(spoilers[id]);
}
function randomID(n) {
	if (typeof n === 'undefined')
		n = 16;
	let q = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPSDFGHJKLZXCVBNM";
	return Array.from({length:n}, () => q[Math.round(Math.random()*(q.length-1))]).join('');
}
function addSelection(input, pass) {
	let v = pass?'*'.repeat(input.value.length):input.value, start = input.selectionStart, end = input.selectionEnd;
	return v.substring(0, start) + '$select;' + (v.substring(start, end+1)||' ') + '$e;' + v.substring(end+1);
}
function algo(arr) {
	function t(i) {
		if (i == arr.length)
			return;
		arr[i](function () {
			t(i+1);
		});
	}
	t(0)
}