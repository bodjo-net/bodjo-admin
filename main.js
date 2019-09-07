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
		let command = (args[0]||'unknown');
		if (typeof commands[command] === 'undefined')
			command = 'unknown';
		commands[command](args, cmd);
	})
}

let commands = {
	'unknown': (args, next) => {
		println('Команда $bold;\"'+args[0]+'\"$e; не найдена. Введите $bold;\"help\"$e; для помощи.');
		next();
	},
	'help': (args, next) => {
		println('There should be a help message...');
		next();
	},
	'games': (args, next) => {
		let command = (args[1]||'info');
		if (command[0] == '-')
			command = 'info';
		switch (command) {
			case 'info':
				GET(SERVER_HOST+'/games/info' + (
					args.indexOf('--advanced')>=0 || args.indexOf('-a')>=0 ? 
						'?token='+encodeURIComponent(token)+'&advanced' :
						''),
					(status, data) => {
						if (status && data.status === 'ok') {
							table(data.servers);
						} else if (status && data.status !== 'ok') {
							println('$red;Ошибка: $bold;'+(data.errCode==1?'Отказано в доступе.':data.errText)+'$e;$e;');
						} else {
							println('$red;Ошибка$e;');
						}
						next();
					});
				break;
			default:
				println('Команда $bold;"'+command+'"$e; не найдена.');
				next();
		}
	},
	'logout': (args, next) => {
		GET(SERVER_HOST+'/account/logout?token='+encodeURIComponent(token), (status, data) => {
			if (status && data.status === 'ok') {
				println("Токен очищен $green;успешно$e;.");

			} else if (status && data.status !== 'ok') {
				println("Токен не был очищен. $grey;()$e;")
			} else {
				println("$red;Ошибка$e;");
			}

			Storage.remove('bodjo-token');
			Storage.remove('bodjo-username');
			type('Обновление терминала через 3 секунды...', () => {
				setTimeout(() => {
					window.location.reload();
				}, 3000)
			})
		});
		

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