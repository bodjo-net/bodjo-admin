const VERSION = '0.1.0';
let SERVER_HOST = null;

println('  __                    __       $red;__$e;\n /\\ \\                  /\\ \\     $red;/\\_\\$e;\n \\ \\ \\____   ______   _\\_\\ \\    $red;\\/_/$e;_   ______\n  \\ \\  __ \\ /\\  __ \\ /\\  __ \\   __/\\ \\ /\\  __ \\\n   \\ \\ \\_\\ \\\\ \\ \\_\\ \\\\ \\ \\_\\ \\ /\\ \\_\\ \\\\ \\ \\_\\ \\\n    \\ \\_____\\\\ \\_____\\\\ \\_____\\\\ \\_____\\\\ \\_____\\\n     \\/_____/ \\/_____/ \\/_____/ \\/_____/ \\/_____/\n');
type('Получаем хост главного сервера... ', () => {
	GET('https://bodjo.net/SERVER_HOST', (status, hostname) => {
		if (status) {
			SERVER_HOST = hostname;
			print('$green;Получили!$e; $grey;('+SERVER_HOST+')$e;');

		} else {
			print('$red;Не получили :С$e;');
		}
	});
});