let pre = document.querySelector('pre');
let input = document.querySelector('input');

input.focus();
input.addEventListener('blur', input.focus);
input.addEventListener('selectionchange', handleInputChange);
input.addEventListener('keyup', handleInputChange);
input.addEventListener('keypress', handleInputChange);
input.addEventListener('keydown', handleInputChange);
function handleInputChange(e) {
	let value = input.value;
	if (asking) {
		if (e.type === 'keyup' && e.code == 'Enter') {
			lastline(parse(askStr) + (askPass ? '*'.repeat(input.value.length) : input.value) + '\n');
			askCallback(input.value);
		} else
			lastline(parse(askStr) + parse(addSelection(input, askPass)));
	}
}

let asking = false,
	askStr = null,
	askCallback = null,
	askPass = null;
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
		console.log('answer: ' + answer)
		callback(answer);
	}
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