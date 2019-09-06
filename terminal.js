let pre = document.querySelector('pre');
let input = document.querySelector('input');

input.focus();
input.addEventListener('blur', input.focus);
input.addEventListener('selectionchange', handleInputChange);
input.addEventListener('keyup', handleInputChange);
input.addEventListener('keypress', handleInputChange);
input.addEventListener('keydown', handleInputChange);
function handleInputChange(e) {
	if (asking) {
		if (e.type === 'keyup' && e.code == 'Enter') {
			lastline(askStr + input.value);
			askCallback(input.value);
		} else
			lastline(askStr + parse(addSelection(input)));
	}
}

let asking = false,
	askStr = null,
	askCallback = null;
function ask(str, callback) {
	asking = true;
	askStr = str;
	input.value = '';
	lastline(askStr);
	askCallback = function (answer) {
		asking = false;
		askCallback = null;
		askStr = null;
		console.log('answer: ' + answer)
		callback(answer);
	}
}

let _lastline = null;
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
	_lastline = null;
	print(str + '\n');
}
function print(str) {
	_lastline = null;
	pre.innerHTML += parse(str);
}
function clear() {
	pre.innerHTML = '';
}
function parse(str) {
	return str
				.replace(/\</g, '&lt;')
				.replace(/\>/g, '&gt;')
				.replace(/ /g, '&nbsp;')
				.replace(/\$e;/g, '</span>')
				.replace(/\$(\w{1,10});/g, '<span class="$1">');
}
function addSelection(input) {
	let v = input.value, start = input.selectionStart, end = input.selectionEnd;
	return v.substring(0, start) + '$select;' + (v.substring(start, end+1)||' ') + '$e;' + v.substring(end+1);
}