/*
Project game: "Space Rangers" based on MVC concept.
*/

/* ---------------------------- begin view ----------------------------- */

var view = {
	
	// Функция showCount() - отображает на странице счет игрока
	showCount: function (count) {
		var elCount = document.getElementById("area_game__user_count--total");
		elCount.innerHTML = count;
	},
	
	// Функция showMsg() - отображает на странице сообщение
	showMsg: function (msg) {
		var elMessage = document.getElementById("area_game__user-message--msg");
		elMessage.innerHTML = msg;
	},

	// Функция showShip() - отображает на странице корабль (синий или красный)
	showShip: function (id, color) {
		var elShip = document.getElementById(id);
		if (color == "red") {
			elShip.setAttribute("class", "ship-red");
		} else if (color == "blue") {
			elShip.setAttribute("class", "ship-blue");
		}
	},

	// Функция showAsteroid() - если игрок промахнулся, отображает астероид
	showAsteroid: function (id) {
		var elAsteroid = document.getElementById(id);
		elAsteroid.setAttribute("class", "asteroid");
	},

	// Функция soundShot() - звук выстрела
	soundShot: function () {
		var audio = document.getElementsByTagName("audio")[0];

		audio.pause();
		audio.currentTime = 0;
		setTimeout(function () {      
   			audio.play();
		}, 20);
		// audio.play();
	}
	
	// Future method winner sound
	// winner: function () {
	// 
	// }
};

/* ----------------------------- end view ------------------------------ */


/* ---------------------------- begin model ---------------------------- */

var model = {
	sizeSpace: 	  7,	// Размер карты
	numShips: 	  6,	// Кол-во флотилий
	lengthShips:  3,	// Размеры флотилии
	destroyShips: 0,	// Уничтоженные флотилии

	spaceships: [
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "red"  },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "blue" },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "red"  },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "blue" },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "red"  },
		{ position: ["0", "0", "0"], damage: ["", "", ""], color: "blue" }
	],

	// Функция shot() - производит выстрел и проверку на попадание
	shot: function (id) {
		for (var i = 0; i < this.numShips; i++) {
			var spaceship = this.spaceships[i];
			var posDamage = spaceship.position.indexOf(id);
			// console.log(posDamage);
			if (posDamage >= 0) {

				if (spaceship.damage[posDamage] === "loss") {
					return true;
				}
				spaceship.damage[posDamage] = "loss";
				var color = spaceship.color;

				if (this.checkDestroyedShip(spaceship)) {
					this.destroyShips++;
					return {
						id: id,
						color: color,
						status: 3
					};
				}
				return {
					id: id,
					color: color,
					status: 1
				};
			}
		};
		return id;
	},

	// Функция checkDestoyedShip() - проверяет полностью подбиты три корабля
	checkDestroyedShip: function (ship) {
		for (var i = 0; i < this.lengthShips; i++) {
			if (ship.damage[i] === "") {
				return false;
			}
		};
		return true;
	},

	// Функция createShipPos() - создадим позицию корабля (вертикальную или горизонтальную - наугад)
	createShipPos: function () {
		var col = 0;
		var row = 0;
		var location = Math.floor(Math.random() * 2);
		var shipPosition = [];

		if (location === 1) { // horizontal
			row = Math.floor(Math.random() * this.sizeSpace);
			col = Math.floor(Math.random() * (this.sizeSpace - this.lengthShips + 1));
		} else { // vertical
			row = Math.floor(Math.random() * (this.sizeSpace - this.lengthShips + 1));
			col = Math.floor(Math.random() * this.sizeSpace);
		}
	
		for (var i = 0; i < this.lengthShips; i++) {
			if (location === 1) {
				shipPosition.push(row + "" + (col + i));
			} else {
				shipPosition.push((row + i) + "" + col);
			}
		};
		return shipPosition;
	},

	// Функция checkRepeatsPos() - корабли не накладывались друг на друга и не пересекались
	checkRepeatsPos: function (position) {
		for (var i = 0; i < this.numShips; i++) {
			var spaceship = this.spaceships[i];
			for (var j = 0; j < position.length; j++) {
				if (spaceship.position.indexOf(position[j]) >= 0) {
					return true;
				}
			};
		};
		return false;
	},

	/* 
		Функция createSpaceships() - объединяет в себе две другие функции: createShipPos() и checkRepeatsPos(),
		для того что бы сгенерировать полностью корабли в массиве "spaceships[]"
		Функция генерирует позицию для будущего корабля, затем проверяет свободны ли данные позиции, потом добавляет
		эту позицию в массив "spaceships"
	*/
	createSpaceships: function () {
		var position;
		for (var i = 0; i < this.numShips; i++) {

			do {
				position = this.createShipPos();
			} while (this.checkRepeatsPos(position));
			this.spaceships[i].position = position;

		};
	}
};

/* ----------------------------- end model ----------------------------- */


/* -------------------------- begin controller ------------------------- */

var controller = {
	
	// Количество выстрелов
	numShots: 0,

	// Сгенерировать корабли
	createShips: function () {
		model.createSpaceships();
	},

	// Функция shotShip() - соединяет в себе вызов методов из объектов "model", "view"
	shotShip: function (c) {
		var id = this.convertToID(c);

		if (id) {
			var loss = model.shot(id);
			if (loss === true) {
				view.showMsg("Этот корабль уже подбит!");
			} else if (loss.status === 3) {
				view.showShip(loss.id, loss.color);
				view.showMsg("Флотилия из 3-х кораблей уничтожена!");
			} else if (loss.status === 1) {
				view.showShip(loss.id, loss.color);
				view.showMsg("Попадание");
			} else if (typeof(loss) == 'string') {
				view.showAsteroid(loss);
				view.showMsg("Промах");
			}
			this.numShots++;
			if (loss && (model.destroyShips === model.numShips)) {
				var count = Math.round((model.numShips * 3 / this.numShots) * 1000);
				view.showMsg("Вы уничтожили все корабли!");
				view.showCount(count);
			}
			view.soundShot();
		}
	},

	// Функция convertToID() - переводит координаты типа (А2) в id(02)
	convertToID: function (c) {
		var symbol = ["A", "B", "C", "D", "E", "F", "G"];

		if (c !== null && c.length === 2) {

			var firstChar = c.charAt(0);
			var row = symbol.indexOf(firstChar);
			var col = c.charAt(1);

			if (!this.isNumeric(row) || !this.isNumeric(col)) {
				alert("Вы ввели не числовое значение!");
			} else if (row < 0 || row >= model.sizeSpace ||
					   col < 0 || col >= model.sizeSpace) {
				alert("Цель находиться за пределами карты!");
			} else {
				return row + col;
			}

		} else {
			alert("Пожалуйста введите символ A - G!");
		}
		return null;
	},

	// Функция isNumeric() - нужна для определения переменной на число
	isNumeric: function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},

	/*
		Функция hoverClick() - при наведении курсора на элемент ячейки таблицы меняет стиль, убирает стиль.
		Также регистрирует тип события "onclick" на наведенном элементе, полученного от типа события "onmouseover"
	*/
	hoverClick: function (id) {
		var el = document.getElementById(id);
		el.onmouseover = function (e) {
			e = e || window.event;
			// console.log(e.target);
			// console.log(this);
			// console.log(el);
			
			if (e.target.id !== "") {
				e.target.style.transition = "0.5s";
				e.target.style.backgroundColor = "rgba(104, 142, 218, 0.33)";
				
			// Присвоить функцию свойству onclick (тип события) элемента td.
			// Функция - обработчик события: она вызывается, когда пользователь нажмет на ячейку таблицы.
			// Все объекты событий имеют свойство type, определяющее тип события, и свойство target, определяющее цель события.
			
				e.target.onclick = function () {
					var c = this.getAttribute("data-title");
					controller.shotShip(c)
				};
			}
		};

		el.onmouseout = function (e) {
			e = e || window.event;
			if (e.target.id !== "") {
				e.target.style.backgroundColor = "inherit";
			}
		};
	},

	/*
		Данная функция создает для ячеек таблицы (td - кроме 1 столбца и 1 ряда) data-title атрибут
		нужна для того что бы можно было воспользоваться функцией "hoverClick()"
		Получим все теги "td" и поместим в переменную "elCell". Установим новый атрибут "data-title"
		удовлетворяющим нашим условиям и поместим значения типа "А0"
	*/
	createDataTitle: function () {
		var elCell = document.getElementsByTagName("td");
		for (var i = 0; i < elCell.length; i++) {
			if (elCell[i].id !== "") {
				var value = elCell[i].getAttribute("id");
				var element = elCell[i];
				var letter = element.parentNode.firstElementChild.firstElementChild.innerHTML;
				
				elCell[i].setAttribute("data-title", letter + value.charAt(1));
			}
		};
	},

	// Обработчик события - браузер вызовет функцию "hBtnClick" когда возникнет событие "onclick"
	// Функция hBtnClick() - вызовет метод shotShip() объекта "controller"
	hBtnClick: function () {
		var el = document.getElementById("crdInput");
		var elValueUp = el.value.toUpperCase();

		controller.shotShip(elValueUp);

		el.value = "";
	},

	// Обработчик события - браузер вызовет функцию "hKeyPress" когда возникнет событие "onkeypress"
	// объектом события является "e" - содержит всю информацию об этом событии
	// Когда пользователь нажмет на клавишу "enter" сработает функция hBtnClick()
	hKeyPress: function (e) {
		e = e || window.event;

		var el = document.getElementById("btnShot");

		if (e.keyCode === 13) {
			el.click();
			return false;
		}
	}

};

/* --------------------------- end controller -------------------------- */




/* --------------------- anonymous initialize function ----------------- */
(function() {
  
	var start = {

		init: function () {
			this.main();
			this.control();
			this.event();
		},

		// main() - Основной код для проекта, например подключать и настраивать плагины и т.д
		main: function () {

		},

		// control() - Запускаем необходимые методы объекта "controller"
		control: function () {

			// Генерируем позиции кораблей и помещаем в массив spaceships
			controller.createShips();
			// Создаем атрибут (data-title) для ячеек td (кроме 1 столбца и 1 ряда)
			controller.createDataTitle();


		},
		
		// event() - Здесь мы регистрируем, вызываем "Обработчики событий"
		event: function () {

			var btnShot = document.getElementById("btnShot");
			// Регистрируем обработчик события "тип события: onclick", "цель события: элемент с id btnShot",
			// "обработчик события: hBtnClick()"
			btnShot.onclick = controller.hBtnClick;

			var elCrdInput = document.getElementById("crdInput");
			elCrdInput.onkeypress = controller.hKeyPress;

			/* 
				Вызываем метод "hoverClick()" объекта "controller".
				Метод "hoverClick()" также относиться к обработчику события. Внутри данного метода уже содержаться обработчики событий.
			*/
			controller.hoverClick("area_game__table");

		}

	};
	
	// запускаем init() - выполняет запуск всего кода
	start.init();

}());
/* --------------------- anonymous initialize function ----------------- */