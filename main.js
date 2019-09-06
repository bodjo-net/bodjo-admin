const VERSION = '0.1.0';
let SERVER_HOST = null;
let token = null,
	username = null;

println('  __                    __       $red;__$e;\n /\\ \\                  /\\ \\     $red;/\\_\\$e;\n \\ \\ \\____   ______   _\\_\\ \\    $red;\\/_/$e;_   ______\n  \\ \\  __ \\ /\\  __ \\ /\\  __ \\   __/\\ \\ /\\  __ \\\n   \\ \\ \\_\\ \\\\ \\ \\_\\ \\\\ \\ \\_\\ \\ /\\ \\_\\ \\\\ \\ \\_\\ \\\n    \\ \\_____\\\\ \\_____\\\\ \\_____\\\\ \\_____\\\\ \\_____\\\n     \\/_____/ \\/_____/ \\/_____/ \\/_____/ \\/_____/\n');
algo([
	next => type('Получаем хост главного сервера... ', () => {
		GET('https://bodjo.net/SERVER_HOST', (status, hostname) => {
			if (status) {
				SERVER_HOST = hostname;
				print('$green;Получили!$e; $grey;('+SERVER_HOST+')$e;');
				next();
			} else {
				print('$red;Не получили :С$e;');
				println('Был отправлен запрос на $bold;https://bodjo.net/SERVER_HOST$e;');
			}
		});
	}),
	next => {
		token = Storage.get('bodjo-token');
		if (token) {
			type('Найден токен, проверяем его... ', () => {
				GET(SERVER_HOST + '/account/check?token='+encodeURIComponent(token), (status, data) => {
					if (status) {
						if (data.status === 'ok') {
							token = data.token.value;
							username = data.token.username;
							Storage.set('bodjo-token', token);
							Storage.set('bodjo-username', username);
							println('$green;Токен действителен.$e;');
							next();
						} else {
							println("$red;Токен оказался недействительным.$e;");
							login(next);
						}
					} else {
						println('$red;Ошибка подключения к главному серверу :С$e;');
					}
				});
			});
		} else {
			login(next);
		}
	},
	next => {
		println('Вы вошли в систему как $bold;'+username+'$e;.');
		next();
	},
	cmd
]);

function cmd() {
	ask('$green;'+username+'$e; $bold;$$e; ', cmdline => {
		let args = cmdline.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
		console.log(args)
		let command = (args[0]||'unknown');
		if (typeof commands[command] === 'undefined')
			command = 'unknown';
		commands[command](args, cmd);
	})
}

let commands = {
	'unknown': (args, callback) => {
		println('Command $bold;\"'+args[0]+'\"$e; not found. Type $bold;\"help\"$e; for help.');
		callback();
	},
	'help': (args, callback) => {
		println('There should be a help message...');
		callback();
	},
	'games': (args, callback) => {
		let command = (args[1]||'info');
		
	}
}

function login(next) {
	ask('$bold;Юзернейм$e;: ', function onUsernameTyped(_username) {
		ask('$bold;Пароль$e;: ', function onPasswordTyped(_password) {
			GET(SERVER_HOST + '/account/login?username='+encodeURIComponent(_username)+'&password='+encodeURIComponent(_password), (status, data) => {
				if (status) {
					if (data.status === 'ok') {
						token = data.token.value;
						username = _username;
						Storage.set('bodjo-token', token);
						Storage.set('bodjo-username', username);
						println("$green;Авторизация прошла успешно.$e;");
						next();
					} else {
						println("$red;Ошибка.$e;");
						ask('$bold;Юзернейм$e;: ', onUsernameTyped);
					}
				} else {
					println('$red;Ошибка подключения к главному серверу :С$e;');
				}
			})
		}, true)
	})
}