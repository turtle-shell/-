var sapper = (function() {
  
	var fieldValue = {		/*значение поля*/
		emptiness: 	1, 		/*пустота*/
		opened:		2, 		/*открытые*/
		flagged:	3, 		/*отмеченные*/
		question: 	4 		/*неизвестно*/
		}, 
		Image = { 		/*изображение*/
			emptiness: 		'C:/Users/User Pc/Desktop/Miner/Picture/emptiness.gif',
			flagged: 		'C:/Users/User Pc/Desktop/Miner/Picture/flagged.gif',
			question: 		'C:/Users/User Pc/Desktop/Miner/Picture/question.gif',
			minedeath:		'C:/Users/User Pc/Desktop/Miner/Picture/minedeath.gif',
			minemisflagged: 'C:/Users/User Pc/Desktop/Miner/Picture/minemisflagged.gif',
			minerevealed: 	'C:/Users/User Pc/Desktop/Miner/Picture/minerevealed.gif',
			facedead: 		'C:/Users/User Pc/Desktop/Miner/Picture/facedead.gif',
			facesmile: 		'C:/Users/User Pc/Desktop/Miner/Picture/facesmile.gif',
			facewin: 		'C:/Users/User Pc/Desktop/Miner/Picture/facewin.gif',
			'number-': 		'C:/Users/User Pc/Desktop/Miner/Picture/number-.gif',
			number0: 		'C:/Users/User Pc/Desktop/Miner/Picture/number0.gif',
			number1: 		'C:/Users/User Pc/Desktop/Miner/Picture/number1.gif',
			number2:		'C:/Users/User Pc/Desktop/Miner/Picture/number2.gif',
			number3: 		'C:/Users/User Pc/Desktop/Miner/Picture/number3.gif',
			number4: 		'C:/Users/User Pc/Desktop/Miner/Picture/number4.gif',
			number5: 		'C:/Users/User Pc/Desktop/Miner/Picture/number5.gif',
			number6: 		'C:/Users/User Pc/Desktop/Miner/Picture/number6.gif',
			number7: 		'C:/Users/User Pc/Desktop/Miner/Picture/number7.gif',
			number8: 		'C:/Users/User Pc/Desktop/Miner/Picture/number8.gif',
			number9: 		'C:/Users/User Pc/Desktop/Miner/Picture/number9.gif',
			open0: 			'C:/Users/User Pc/Desktop/Miner/Picture/open0.gif',
			open1: 			'C:/Users/User Pc/Desktop/Miner/Picture/open1.gif',
			open2: 			'C:/Users/User Pc/Desktop/Miner/Picture/open2.gif',
			open3: 			'C:/Users/User Pc/Desktop/Miner/Picture/open3.gif',
			open4: 			'C:/Users/User Pc/Desktop/Miner/Picture/open4.gif',
			open5: 			'C:/Users/User Pc/Desktop/Miner/Picture/open5.gif',
			open6: 			'C:/Users/User Pc/Desktop/Miner/Picture/open6.gif',
			open7: 			'C:/Users/User Pc/Desktop/Miner/Picture/open7.gif',
			open8: 			'C:/Users/User Pc/Desktop/Miner/Picture/open8.gif'
		},
		options = {
			width: 	9,
			height: 9,
			mines: 	10
		};

	/* Проверка, действительна ли ячейка.*/
	var isValidPosition = function( position ) {
		return position[0] >= 0 && position[0] < options.height &&
			   position[1] >= 0 && position[1] < options.width;
	};

	/* Преобразование ячейки в номер*/
	var linearPosition = function( position ) {
		return position[0] * options.width + position[1];
	};

	/* Ограничение значения ячейки от минимума до максимума значений*/
	var restrict = function( num, min, max ) {
		if( !num ) {
		num = 0;
		}
		if( num < min ) {
		  return min;
		} else if( num > max ) {
		  return max;
		} else {
		  return num;
		}
	};

	/* Основной метод, содержащий свойства и методы игры*/
	var board = {
	/* Инициализация свойств для новой игры*/
		initialize: function() {
		this.rows = options.height; 		/*строки*/
		this.cols = options.width; 			/*столбцы*/
		this.minesLeft = options.mines;		/*Не найденные мины*/
		this.timePassed = 0;				/*Время игры*/
		this.timerID = 0;					/*Идентификатор времени*/
		this.squares = [];					/*Ячейки*/
		this.minePositions = [];			/*Позиция мины*/
		this.squaresOpened = 0;				/*Открытые ячейки*/
		this.noneOpened = true;				/*Не открытые ячейки*/
		this.create();						/*Создание*/
    },

    /*Создание разметки для игры*/
    create: function() {
      var content;
      for( var i = 0; i < this.rows; i++ ){
        content += '<tr>';
        for( var j = 0; j < this.cols; j++ ) {
          this.squares.push( new Square( [i, j] ) );
          content += '<td><img src="' + Image.emptiness +
                     '" id=' + ( i * this.cols + j) + '></td>';
        }
        content += '</tr>';
      }
      $( '.container' ).width( this.cols * 16 + 20 );
      $( 'tbody' ).empty().append( content );

      this.displayMinesCount(); 	/*Счетчик мин*/
      this.displayTimer();			/*Таймер*/
    },

	/* Генерация мин, после того как игрок отрыл первую ячейку. 
	Обеспечение начала игры (первая ячейка не окажется миной)*/
	generateMines: function( position ) {
			var size = options.width * options.height,
			/* Случайный порядок элементов массива.*/
			shuffleArray = function( array ) {
            for (var i = array.length - 1; i > 0; i--) {
              var j = Math.floor(Math.random() * (i + 1));
              var temp = array[i];
				  array[i] = array[j];
                  array[j] = temp;
			}
            return array;
        };

		for( var i = 0; i < size; i++ ) {
        /* Исключение позиции, открытой игроком 
		(первое открытое поле) из возможного расположения мины*/        
			if( i !== position ) {
			this.minePositions.push( i );
        }
    }
      this.minePositions = shuffleArray( this.minePositions ).
                           slice( 0, options.mines );
      this.addMines();
    },

    /* Расположение мин в сгенерированные позиции и 
	обновление ячеек вокруг каждой, подсчет количества мин вокруг каждого квадрата */
    addMines: function() {
		var square,
			neighborSquare,
			neighborPositions,
			squares = this.squares;

		$.each( this.minePositions, function( index, position ) {
			square = squares[ position ];
			square.isMine = true;
        /* Обновление соседних ячеек*/
			neighborPositions = square.neighborPositions();
        $.each( neighborPositions, function( index, neighborPosition ) {
			neighborSquare = squares[ neighborPosition ];
			neighborSquare.adjacentMines += 1;
        });
      });
	/*Подсчет времени*/
      this.timerID = setInterval( this.updateTimer.bind( this ), 1000 );
    },

    /* Отображение количества мин,которое требуется найти*/
	displayMinesCount: function() {
		var display = restrict( this.minesLeft, -99, 999 ),
			/* Формат подсчета мин,которое требуется найти*/
			displayStr = ('00' + Math.abs(display) ).slice(-3);
		if ( display < 0 ) {
        displayStr =  '-' + displayStr.slice( -2 );
		}
		$( '#mine0' ).attr( 'src', Image['number' + displayStr[0]] );
		$( '#mine1' ).attr( 'src', Image['number' + displayStr[1]] );
		$( '#mine2' ).attr( 'src', Image['number' + displayStr[2]] );
    },

    /* Увеличение времени каждую секунду*/
    updateTimer: function() {
		this.timePassed++;
		this.displayTimer();

		if ( this.timePassed >= 999 ) {
			this.timePassed = 999;
			clearInterval( this.timerID );
		}
    },

    /* Отображение времени игры*/
    displayTimer: function() {
      /* Нулевой таймер игры*/
      var displayStr = ('00' + Math.abs(this.timePassed) ).slice(-3);
      $( '#time0' ).attr( 'src', Image['number' + displayStr[0]] );
      $( '#time1' ).attr( 'src', Image['number' + displayStr[1]] );
      $( '#time2' ).attr( 'src', Image['number' + displayStr[2]] );
    },

    /* Метод управления кликом игрока */
    handlePlay: function( clicktType, $square ) {
		var square = this.squares[ $square.attr( 'id' ) ];
			if ( clicktType === 1 ){ /*Левая кнопка мыши*/
				switch( square.state ) {
					case fieldValue.emptiness: 
					case fieldValue.question:
				this.handleOpen( square, $square );          
						break;
					case fieldValue.flagged: 
					case fieldValue.opened:
						break;
					}
			} else if ( clicktType === 3 ) { /*Правая кнопка мыши*/
				switch( square.state ) {
					case fieldValue.emptiness:
				this.updateSquare( square, fieldValue.flagged, 
									$square, Image.flagged );
				this.minesLeft--;
				this.displayMinesCount();
						break;
					case fieldValue.question:
				this.updateSquare( square, fieldValue.emptiness, 
									$square, Image.emptiness );
						break;
					case fieldValue.flagged:
				this.updateSquare( square, fieldValue.question, 
									$square, Image.question );
				this.minesLeft++;
				this.displayMinesCount();
						break;
					case fieldValue.opened:
						break;
				}       
			}
		},

    /* Открытие пустой ячейки (или ячейки с вопросом), если в ней бомба (или нет)*/
	handleOpen: function( square, $square ) {
		/* Генерация мин, исключая открытые (с флагом)*/
		if( this.noneOpened ) {
			this.generateMines( linearPosition(square.position) );
			this.noneOpened = false;
		}

		if( square.isMine ) {
			this.loseGame( $square );
		} else if ( square.adjacentMines === 0 ) {
			this.openMultiple( square, $square );
		} else {
			this.updateSquare( square, fieldValue.opened,
								$square, Image['open' + square.adjacentMines] );
			this.updateSquaresOpened();
		}
    },

    /* Если открываемый игроком квадрат не имеет рядом с собой мин, 
	то открываются квадраты, прилегающие к нему, до тех пор пока
	открываемый квадрат не будет иметь соседа-мину*/
	
    openMultiple: function( square, $square ) {
		var nextSquare,
			$nextSquare,
			neighbors,
			seen = [ linearPosition( square.position ) ],
			to_open = [ linearPosition( square.position ) ];

		while( to_open.length ) { 		/* Открытие нескольких ячеек*/
			nextSquare = this.squares[ to_open.shift() ];
			$nextSquare = $( '#' + linearPosition(nextSquare.position) );
			if( nextSquare.adjacentMines === 0 ) {
				neighbors = nextSquare.neighborPositions();

				$.each( neighbors, function( index, neighbor ) {
				if( seen.indexOf( neighbor ) === -1 ) { // an unseen square
				  seen.push( neighbor );
				  to_open.push( neighbor );
				}
			  });
			}
			if( nextSquare.state === fieldValue.emptiness ||
				nextSquare.state === fieldValue.question ) {
				this.updateSquare( nextSquare, fieldValue.opened, $nextSquare,
									Image['open' + nextSquare.adjacentMines] );
				this.updateSquaresOpened();
			}
		}
    },

    /*Обновление количества открытых ячеек. Это необходимо для определения победы игрока*/ 
    updateSquaresOpened: function() {
		this.squaresOpened++;
			if( this.squaresOpened === 
			options.width * options.height - options.mines ) {
				this.winGame();
			}
		},

    /* Создание игрового поля и отображения изменения статуса ячейки*/
    updateSquare: function( square, state, $square, Image ) {
		square.state = state;
		$square.attr( 'src', Image );
    },

    /* Проигрыш (если игрок наступил на мину)*/ 
    loseGame: function( $squareMissed ) {
		var square, $square;
		/* Отображение всех мин, где не был установлен флаг*/
		for( var i = 0, len = options.mines; i < len; i++ ) {
			square = this.squares[ this.minePositions[i] ];
			$square = $( '#' + this.minePositions[i] );

        if( square.state === fieldValue.emptiness ||
            square.state === fieldValue.question ) {
			this.updateSquare( square, fieldValue.opened, 
								$square, Image.minerevealed );
			}
		}

		/* Отображение ошибочно уставленных флагов (мины под флагом нет)*/
		for( var i = 0, rows = options.height; i < rows; i++ ) {
			for( var j = 0, cols = options.width; j < cols; j++ ) {
				square = this.squares[ linearPosition([i, j]) ];
				if( square.state === fieldValue.flagged && !square.isMine ) {
					$square = $( '#' + linearPosition([i, j]) );
				this.updateSquare( square, fieldValue.opened, 
									$square, Image.minemisflagged );
				}
			}
		}

      /* Отображение ячейки где игрок наступил на мину*/
		$squareMissed.attr( 'src', Image.minedeath );
		$( '.face' ).find( 'img' ).attr( 'src', Image.facedead );

		this.endGame();
    },

	/* Обработка победы игрока*/
    winGame: function() {
		var square, $square;
		/* Добавления флага на позиции, которые игрок не отметил*/
		for( var i = 0, len = options.mines; i < len; i++ ) {
			square = this.squares[ this.minePositions[i] ];
			$square = $( '#' + this.minePositions[i] );

        this.updateSquare( square, fieldValue.flagged, 
							$square, Image.flagged );
		}
		/* Настройка панели на статус победы*/
		this.minesLeft = 0;
		this.displayMinesCount();
		$( '.face' ).find( 'img' ).attr( 'src', Image.facewin );

		this.endGame();
    },

    /* Обнуление таймера и приема событий от игрока*/
	endGame: function() {
		clearInterval( this.timerID );
		$( 'tbody' ).off( 'mousedown', 'img');
    },

    /* Конец игры*/
    restart: function() {
      this.endGame();
      $( '.face' ).find( 'img' ).attr( 'src', Image.facesmile );
      this.initialize();
    },

    /* Прием сигнала к началу новой игры*/
    reset_options: function() {
		var gametype = $('input[name="gametype"]:checked').val(),
			height   = parseInt( $('input[name="height"]').val(), 10 ),
			width    = parseInt( $('input[name="width"]').val(), 10 ),
			mines    = parseInt( $('input[name="mines"]').val(), 10 );

		switch( gametype ) {
			case 'beginner':
				this.setOptions( 9, 9, 10 );
				break;
			case 'intermediate':
				this.setOptions( 16, 16, 40 );
				break;
			case 'expert':
				this.setOptions( 16, 30, 99 );
				break;
			case 'custom':
				height = restrict( height, 4, 40 );
				width  = restrict( width,  8, 60 );
				mines  = restrict( mines,  1, (height * width - 1) );
				this.setOptions( height, width, mines );
				break;
      }
    },

    /* Найстройка игровых опций в зависимости от входа игрока*/
    setOptions: function( height, width, mines ) {
		options.height = height;
		options.width  = width;
		options.mines  = mines;
    }
}; /* итоговое поле*/

	/* Конструктор игрового поля*/
	function Square( position ) {
		this.position = position;
		this.state = fieldValue.emptiness;
		this.isMine = false;
		this.adjacentMines = 0;
	}

/*Определение позиции (как число) всех ячеек, смежных с вызывающейся ячейкой*/
 Square.prototype.neighborPositions = function() {
    var newPos,
        validNeighbors = [],
        direction = {
			north: [-1, 0],
			south: [1, 0],
			east: [0, 1],
			west: [0, -1],
			nw: [-1, -1],
			ne: [-1, 1],
			se: [1, 1],
			sw: [1, -1],
        };
    for( var dir in direction ){
		newPos = [ this.position[0] + direction[dir][0],
					this.position[1] + direction[dir][1] ];
		if ( isValidPosition( newPos ) ){
			validNeighbors.push( linearPosition( newPos ) );
			}
    }

    return validNeighbors;
};

	return {
    board: board
	};

})();

$( document ).ready( function() {
	var setupPlayHandler = function() {
		$( 'tbody' ).on( 'mousedown', 'img', function( event ) {
		sapper.board.handlePlay( event.which, $(this) );
		});
	};

	sapper.board.initialize();

	$( '.game-container' ).on( 'contextmenu', function( event ) {
    event.preventDefault();
	});

	setupPlayHandler();

	$( '.face' ).on( 'click', 'img', function() {
    sapper.board.restart();
    setupPlayHandler();
	});

	$( '.menu' ).on( 'click', 'a', function( event ) {
		event.preventDefault();
		$( '.menu' ).find( 'form' ).fadeToggle( function() {
		});
	});

	$( '.menu' ).on( 'click', 'input[type="button"]', function() {
		sapper.board.reset_options();
		$(this).closest( 'form' ).fadeOut();
		sapper.board.restart();
		setupPlayHandler();
	});

	$( document ).mouseup( function ( event ) {
		var $container = $( '.menu' );
    /* Если игрок не попал в ячейку*/
		if ( !$container.is( event.target ) &&
        /* не контейнер*/
			$container.has( event.target ).length === 0 ) { 
			$( '#form' ).fadeOut();
			}		
	});
});