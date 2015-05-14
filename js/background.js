(function(){
	'use strict';
	var u = "undefined" != typeof chrome ? chrome.extension.getBackgroundPage() : opera.extension.bgProcess;
	// Conditionally initialize the options.
	if (!localStorage.isInitialized) {
		localStorage['refresh_interval'] = 1;        // The display frequency, in minutes.
		localStorage['refresh_interval_text'] = '1 раз в минуту';
		localStorage['isInitialized'] = true; // The option initialization.
		localStorage['audioOn'] = true;
		localStorage['showContext'] = true;
		localStorage['refresh_sound_file'] = 'assets/click.ogg';
		/**
		** Заменить URL
		**/
		localStorage['url_forum'] = 'http://demiart.ru/forum/';
		localStorage['refresh_date'] = (new Date()).getFullYear();
		localStorage['viewtab'] = true;
		localStorage['sounVolume'] = 0.5;
		localStorage['favicon'] = true;
		localStorage['demiColor'] = true;
	}
	if(localStorage['favicon']!="false"){
		if(localStorage['favicon']!="true"){
			localStorage['favicon'] = true;
		}
	}
	var exId = chrome.i18n.getMessage("@@extension_id"),
	extName = chrome.runtime.getManifest().name,
	discussURL = localStorage['url_forum'],
	audio = new Audio(localStorage['refresh_sound_file']),
	tabDDC, optionsDDC,
	calarm = 0,
	iAni = 0,
	cx = 0,
	dcc_c = 0,
	dcc_u = 'http://demiart.ru/forum/',
	icon = new Image,
	ld = new Image,
	fvi = new Image,
	canvas = document.createElement("canvas"),
	favicon = document.createElement("canvas"),
	ftx = favicon.getContext("2d"),
	ctx = canvas.getContext("2d"),
	pix = window.devicePixelRatio || 1,
	fix = {
		width: 7,
		height: 9,
		font: 'bold ' + (10 * pix) + 'px arial',
		colour: '#ffffff',
		background: '#F03D25',
		size: 16
	},
	ddcGoDemiItemMenu,
	ddcGoMorgoth,
	ddcGoDemiYouTube,
	statusTab = undefined,
	/**
	Онлайн изменения на страницах форума
	Количество дискуссий в верху страницы и на мгновенной прокрутке
	**/
	executeDccScript = function(tabId){
		chrome.tabs.insertCSS(tabId, {"file":"css/countPagesMessage.css"}, function(){
			chrome.tabs.executeScript(tabId,{"file":"js/jquery.js"}, function(){
				chrome.tabs.executeScript(tabId,{"file":"js/countPagesMessage.js"});
			});
		});
	},
	/*
	... Контекстное меню
	*/
	contextMenuShow = function(){
		var shcm = (localStorage['showContext']=='true') ? "all" : "browser_action";
		var ddcMenu = chrome.contextMenus.create({"title": extName, "contexts":[shcm]});
		chrome.contextMenus.create({"title": "\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c", "contexts":[shcm], "parentId": ddcMenu, "onclick": onAlarm});
		chrome.contextMenus.create({"type":"separator","title": "", "contexts":[shcm], "parentId": ddcMenu});
		
		ddcGoDemiItemMenu = chrome.contextMenus.create({"title": "\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u043d\u0430 \u0444\u043e\u0440\u0443\u043c", "contexts":[shcm], "parentId": ddcMenu, "onclick": itemMenuClick});
		
		chrome.contextMenus.create({"type":"separator","title": "", "contexts":[shcm], "parentId": ddcMenu});
		chrome.contextMenus.create({"title":"\u041a\u043e\u043d\u0442\u0435\u043a\u0441\u0442\u043d\u043e\u0435 \u043c\u0435\u043d\u044e","contexts":[shcm],"type":"checkbox","checked": (localStorage['showContext']=='true') ? true : false,"parentId":ddcMenu, "onclick":contextShowClick});
		chrome.contextMenus.create({"title": "\u0417\u0432\u0443\u043a\u043e\u0432\u043e\u0435 \u043e\u043f\u043e\u0432\u0435\u0449\u0435\u043d\u0438\u0435", "type":"checkbox", "checked":(localStorage['audioOn']=='true') ? true : false, "contexts":[shcm], "parentId": ddcMenu, "onclick": onSoundChange});
		chrome.contextMenus.create({"title": "\u041e\u0442\u043a\u0440\u044b\u0432\u0430\u0442\u044c \u0432 \u0442\u043e\u0439 \u0436\u0435 \u0432\u043a\u043b\u0430\u0434\u043a\u0435", "type":"checkbox", "checked":(localStorage['viewtab']=='true') ? true : false, "contexts":[shcm], "parentId": ddcMenu, "onclick": onTabChange});
		chrome.contextMenus.create({"title": "\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0442\u044c \u0438\u043a\u043e\u043d\u043a\u0443 \u0444\u043e\u0440\u0443\u043c\u0430", "type":"checkbox", "checked":(localStorage['favicon']=='true') ? true : false, "contexts":[shcm], "parentId": ddcMenu, "onclick": onFavIconChange});
		
		chrome.contextMenus.create({"type":"separator","title": "", "contexts":[shcm], "parentId": ddcMenu});
		var ddcsound = chrome.contextMenus.create({"title": "\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u0437\u0432\u0443\u043a\u043e\u043c", "contexts":["browser_action"], "type":"normal", "parentId": ddcMenu}),
		ddcsoundfile = chrome.contextMenus.create({"title": "\u0424\u0430\u0439\u043b \u0437\u0432\u0443\u043a\u0430", "contexts":["browser_action"], "type":"normal", "parentId": ddcsound}),
		ddcsoundvolume = chrome.contextMenus.create({"title": "\u0413\u0440\u043e\u043c\u043a\u043e\u0441\u0442\u044c \u0437\u0432\u0443\u043a\u0430", "contexts":["browser_action"], "type":"normal", "parentId": ddcsound});
		for(var i=0;i<soundList.length;++i){
			chrome.contextMenus.create({"title": soundList[i].name,"id":soundList[i].id, "contexts":["browser_action"], "type":"radio","checked":(localStorage['refresh_sound_file']==('assets/'+soundList[i].id+'.ogg')) ? true : false, "parentId": ddcsoundfile, "onclick":onSoundFileChange});
		}
		var l = 0;
		while(l<1){
			l += 0.05;
			l = Number(l.toFixed(3));
			chrome.contextMenus.create({"title": (Math.round(l*100)+"%"),"id":String(l), "contexts":["browser_action"], "type":"radio","checked":(localStorage['sounVolume']==String(l)) ? true : false, "parentId": ddcsoundvolume, "onclick":onSoundVolumeChange});
		}
		if(localStorage['showContext']=='true'){
			chrome.contextMenus.create({"title": "separator", "contexts":["page"], "parentId": ddcMenu, "type":"separator"});
			chrome.contextMenus.create({"title": "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438", "contexts":["page"], "parentId": ddcMenu, "onclick": itemMenuSettingClick});
		}
	},
	itemMenuClick = function(info, tab){
		switch(info.menuItemId){
			case ddcGoDemiItemMenu:
				/*
				... setTimeout переместим в начало обработки клика
				... Чистим интервал и запускаем с интервалом 5 сек (актуально для модемного Интернета от сотовых связей)
				*/
				clearTimeout(calarm);
				calarm = setTimeout(function() { onAlarm() }, 5000);
				/*
				... Проверяем доступность Tab
				*/
				(tabDDC!=undefined) ? chrome.tabs.get(tabDDC.id, getTabDdc) : chrome.tabs.create({'url': discussURL, 'active':true}, tabCreate);
				break;
			/***
			Тут были усдовия по другим пунктам в меню
			Переходы на YpuTube и т. п.
			***/
		}
	},
	/*
	... Функции событий меню
	*/
	itemMenuSettingClick = function (info, tab){
		(optionsDDC!=undefined) ? chrome.tabs.get(optionsDDC.id, getTabSettingsDdc) : chrome.tabs.create({'url': optionsURL, 'active':true}, tabSettingsCreate);
	},
	onTabChange = function(info, tab){
		localStorage['viewtab'] = info.checked;
	},
	onFavIconChange = function(info, tab){
		localStorage['favicon'] = info.checked;
		resetOptions();
		chrome.tabs.query({}, function(tabs) {
			var dc = 0;
			for(var i = 0; i<tabs.length;++i){
				var lt = tabs[i].id,
				req = /(http:\/\/demiart.ru\/forum\/(.+.php\?)?)/ig;
				if(req.test(tabs[i].url)){
					++dc;
					chrome.tabs.sendMessage(lt,{ddc:dcc_c,url:dcc_u,def:localStorage['url_forum'],message:'ddc'});
					if(localStorage['favicon']=="true"){
						var datauri = drawFavicon(dcc_c);
						chrome.tabs.sendMessage(lt,{'data':datauri, message:'favicon'});
					}else{
						chrome.tabs.sendMessage(lt,{data:"/favicon.ico", message:'favicon'});
					}
				}
			}
		});
	},
	onSoundChange = function(info, tab){
		localStorage['audioOn'] = info.checked;
	},
	onSoundFileChange = function(info, tab){
		localStorage['refresh_sound_file'] = 'assets/'+info.menuItemId+'.ogg';
		audio.src = localStorage['refresh_sound_file'];
		audio.volume = Number(localStorage['sounVolume']);
		audio.play();
	},
	onSoundVolumeChange = function(info, tab){
		localStorage['sounVolume'] = info.menuItemId;
		audio.src = localStorage['refresh_sound_file'];
		audio.volume = Number(localStorage['sounVolume']);
		audio.play();
	},
	contextShowClick = function(info, tab){
		localStorage['showContext'] = info.checked;
		chrome.contextMenus.removeAll();
		contextMenuShow();
	},
	tabSettingsCreate = function(tab){
		optionsDDC = tab;
	},
	getTabSettingsDdc = function(tab){
		optionsDDC = tab;
		var reg = new RegExp(exId, "ig");
		if(optionsDDC){
			if(reg.test(optionsDDC.url)){
				try{
					chrome.tabs.update(optionsDDC.id, {'url':optionsURL, 'active':true}, tabSettingsCreate);
				}catch(e){
					chrome.tabs.create({'url': optionsURL, 'active':true}, tabSettingsCreate);
				}
			} else {
				chrome.tabs.create({'url': optionsURL, 'active':true}, tabSettingsCreate);
			}
		} else {
			chrome.tabs.create({'url': optionsURL, 'active':true}, tabSettingsCreate);
		}
	},
	/*
	... end menu
	*/
	/*
	... Отказываемся от alarms
	... Используем стандартно setTimeout clearTimeout. Переменная таймера calarm.
	... chrome.alarms.create('refresh', {periodInMinutes: +localStorage.refresh_interval});
	... chrome.alarms.onAlarm.addListener(onAlarm);
	*/
	onAlarm = function() {
		/*
		... Создаём асинхронный запрос к серверу
		*/
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://demiart.ru/forum/index.php?act=ST&CODE=discuss&rand='+(Math.random()*1000000000000000), true);
		/*
		... Отправляем запрос на сервер
		*/
		xhr.send('');
		/*
		... Отслеживаем состояние запроса
		*/
		startAnimation();
		xhr.onreadystatechange = function() {
			/*
			... Независимо от ответа чистим и запускаем интервал для следующего запроса
			*/
			clearTimeout(calarm);
			stopAnimation();
			if(localStorage['refresh_interval']!=0)
			{
				calarm = setTimeout(onAlarm, +localStorage['refresh_interval']*60000);
			}
			if (this.readyState != 4) return;
			/*
			... Если ответ сервера не OK
			*/
			if (xhr.status != 200) {
				chrome.browserAction.setBadgeText({text: 'Error'});
				chrome.browserAction.setTitle({'title':  "\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u044f \u0434\u0430\u043d\u043d\u044b\u0445"});
				chrome.contextMenus.update(ddcGoDemiItemMenu, {"title": "\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u043d\u0430 \u0444\u043e\u0440\u0443\u043c"});
				return;
			}
			/*
			... Собственно сам ответ сервера: количество непрочитанных комментариев и ссылка на них
			*/
			var response = JSON.parse(xhr.response),
			/*
			... Количество комментариев
			*/
			discussCount = response.count || 0;
			/*
			... Ссылка на последний непрочитанный комментарий
			*/
			discussURL = response.href;
			if(response.href == 'http://demiart.ru/forum/'){
				discussURL = localStorage['url_forum'];
			}
			/*
			... Получим дату из заголовка ответа сервера
			... Для укозания точного текущего года в &copy; Демиарта.
			*/
			var resHeader = xhr.getResponseHeader('Date');
			localStorage['refresh_date'] = resHeader.split(' ')[3];
			if (discussCount) {
				chrome.browserAction.getBadgeText({}, function(result) {
					if (result < discussCount && localStorage['audioOn']=='true'){
						audio.src = localStorage['refresh_sound_file'];
						audio.play();
					}
				});
				chrome.browserAction.setBadgeText({text: discussCount});
				chrome.browserAction.setTitle({'title':  "\u0423 \u0432\u0430\u0441 \u0435\u0441\u0442\u044c "+discussCount+" DDC"});
				chrome.contextMenus.update(ddcGoDemiItemMenu, {"title": "\u041d\u0435\u043f\u0440\u0438\u0447\u0438\u0442\u0430\u043d\u043d\u044b\u0445 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0435\u0432 +"+discussCount});
			} else {
				chrome.browserAction.setBadgeText({text: ''});
				chrome.browserAction.setTitle({'title':  extName});
				chrome.contextMenus.update(ddcGoDemiItemMenu, {"title": "\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u043d\u0430 \u0444\u043e\u0440\u0443\u043c"});
			}
			dcc_c = discussCount;
			dcc_u = response.href;
			chrome.tabs.query({}, function(tabs) {
				var dc = 0;
				for(var i = 0; i<tabs.length;++i){
					var lt = tabs[i].id,
						req = /(http:\/\/demiart.ru\/forum\/(.+.php\?)?)/ig;
					if(req.test(tabs[i].url)){
						++dc;
						chrome.tabs.sendMessage(lt,{ddc:dcc_c,url:dcc_u,def:localStorage['url_forum'],message:'ddc'});
						if(localStorage['favicon']=="true"){
							var datauri = drawFavicon(dcc_c);
							chrome.tabs.sendMessage(lt,{'data':datauri, message:'favicon'});
						}else{
							chrome.tabs.sendMessage(lt,{data:"/favicon.ico", message:'favicon'});
						}
					}
				}
			});
		}
	},
	tabCreate = function(tab){
		tabDDC = tab;
	},
	getTabDdc = function(tab){
		tabDDC = tab;
		if(tab && localStorage['viewtab']=='true'){
			/*
			... проверка url вкладки
			*/
			var req = /(http:\/\/demiart.ru\/forum)/ig;
			if(req.test(tab.url)){
				/*
				... Если таб был закрыт.
				... Данная ошибка свойственна только для Yandex браузера.
				*/
				try{
					chrome.tabs.update(tab.id, {'url':discussURL, 'active':true}, tabCreate);
				}catch(e){
					chrome.tabs.create({'url': discussURL, 'active':true}, tabCreate);
				}
			}else{
				chrome.tabs.create({'url': discussURL, 'active':true}, tabCreate);
			}
		}
		else
			chrome.tabs.create({'url': discussURL, 'active':true}, tabCreate);
	},
	/*
	... RESET OPTIONS
	*/
	resetOptions = function(){
		clearTimeout(calarm);
		chrome.contextMenus.removeAll();
		discussURL = localStorage['url_forum'];
		if(localStorage['refresh_interval']!='0'){
			calarm = setTimeout(onAlarm, +localStorage['refresh_interval']*60000);
		}
		chrome.tabs.query({}, function(tabs) {
			for(var i = 0; i<tabs.length;++i){
				var lt = tabs[i].id,
					req = /(http:\/\/demiart.ru\/forum\/(.+.php\?)?)/ig;
				if(req.test(tabs[i].url)){
					chrome.tabs.sendMessage(lt,{ddc:dcc_c,url:dcc_u,def:localStorage['url_forum'],message:'ddc'});
					if(localStorage['favicon']=="true"){
						var datauri = drawFavicon(dcc_c);
						chrome.tabs.sendMessage(lt,{'data':datauri, message:'favicon'});
					}else{
						chrome.tabs.sendMessage(lt,{data:"/favicon.ico", message:'favicon'});
					}
				}
			}
		});
		contextMenuShow();
	},
	/* icon animation */
	startAnimation = function(){
		clearTimeout(iAni);
		cx = (cx>35) ? 0 : cx;
		var x = cx*19,
		imageData = {};
		ctx.drawImage(ld,x,0,19,19,0,0,19,19);
		imageData['19'] = ctx.getImageData(0, 0, 19, 19);
		chrome.browserAction.setIcon({imageData:imageData});
		++cx;
		iAni = setTimeout(startAnimation, 60);
	},
	stopAnimation = function(){
		clearTimeout(iAni);
		chrome.browserAction.setIcon({path:"images/icon19.png"});
	},
	drawFavicon = function(c){
		ftx.clearRect(0, 0, 16, 16);
		ftx.drawImage(fvi, 0, 0, 16, 16, 0, 0, 16, 16);
		var label = c+"";
		c = parseInt(c);
		if(c){
			c = c > 99 ? 99 : c;
			var right,
			len = (c+'').length-1,
			width = fix.width * pix + (6 * pix * len),
			height = fix.height * pix,
			top = fix.size - height,
			left = fix.size - width - pix,//w - 7,
			bottom = right = 16 * pix,
			radius = 2 * pix;
			ftx.font = fix.font;
			ftx.fillStyle = ftx.strokeStyle = "#F03D25";
			ftx.lineWidth = 1;
			ftx.beginPath();
			ftx.moveTo(left + radius, top);
			ftx.quadraticCurveTo(left, top, left, top + radius);
			ftx.lineTo(left, bottom - radius);
			ftx.quadraticCurveTo(left, bottom, left + radius, bottom);
			ftx.lineTo(right - radius, bottom);
			ftx.quadraticCurveTo(right, bottom, right, bottom - radius);
			ftx.lineTo(right, top + radius);
			ftx.quadraticCurveTo(right, top, right - radius, top);
			ftx.closePath();
			ftx.fill();

			// bottom shadow
			ftx.beginPath();
			ftx.strokeStyle = "rgba(0,0,0,0.3)";
			ftx.moveTo(left + radius / 2.0, bottom);
			ftx.lineTo(right - radius / 2.0, bottom);
			ftx.stroke();

			// label
			ftx.fillStyle = fix.colour;
			ftx.textAlign = "right";
			ftx.textBaseline = "top";

			// unfortunately webkit/mozilla are a pixel different in text positioning
			ftx.fillText((c+''), pix === 2 ? 29 : 15, 6*pix);
		}
		return favicon.toDataURL();
	};
	icon.src = "images/fi.png";
	ld.src = "images/ld.png";
	fvi.src = "images/favicon.png";
	canvas.width = 19;
	favicon.width = 16;
	canvas.height = 19;
	favicon.height = 16;
	document.body.appendChild(canvas);
	document.body.appendChild(favicon);
	audio.volume = (localStorage['sounVolume']!==undefined) ? Number(localStorage['sounVolume']) : 0.5;
	chrome.browserAction.setBadgeBackgroundColor({color:'#d22d2d'});
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		statusTab = changeInfo.status;
		/**
		Страницы форума
		**/
		var req = /(http:\/\/demiart.ru\/forum\/(.+.php\?)?)/ig,
		/** 
		Личные настройки
		**/
		regusr = /(UserCP)/ig,
		/**
		Месенджер
		**/
		reqmes = /(qms.php)/ig;
		if(changeInfo.status=='loading' && req.test(tab.url) && reqmes.test(tab.url)==false){
			executeDccScript(tab.id);
			setTimeout(function() {
				chrome.tabs.sendMessage(tab.id,{ddc:dcc_c,url:dcc_u,def:localStorage['url_forum'], message:'ddc'});
				if(localStorage['favicon']=="true"){
					chrome.tabs.sendMessage(tab.id,{data:drawFavicon(dcc_c), message:'favicon'});
				}else{
					chrome.tabs.sendMessage(tab.id,{data:"/favicon.ico", message:'favicon'});
				}
			}, 500);
			stopAnimation();
			clearTimeout(calarm);
			calarm = setTimeout(onAlarm, 2500);
		}
	});
	chrome.browserAction.onClicked.addListener(function(tab) {
		if(tabDDC!=undefined && localStorage['viewtab']=='true'){
			chrome.tabs.query({}, function(tabvs){
				for(var i=0; i<tabvs.length; ++i){
					var req = /(http:\/\/demiart.ru\/forum)/ig,
					td = tabvs[i];
					if(req.test(td.url) && tabDDC.id==td.id){
						chrome.tabs.update(tabDDC.id, {'url':discussURL, 'active':true}, tabCreate);
						return;
						break;
					}
				}
				chrome.tabs.create({'url': discussURL, 'active':true}, tabCreate);
			})
		}else{
			chrome.tabs.create({'url': discussURL, 'active':true}, tabCreate);
		}
	});
	chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
		//ответ от страницы (может пригодится?)
	});
	chrome.commands.onCommand.addListener(function(command) {
		switch(command){
			/* Активировать вкладку Demiart
			* Если её нет - создать с выходом на главную
			*/
			case "activate_tab_demi":
				if(tabDDC!=undefined){
					chrome.tabs.query({}, function(tabs){
						var ta = false;
						for(var i = 0; i<tabs.length; ++i){
							var tab = tabs[i],
							req = /(http:\/\/demiart.ru\/forum)/ig;
							if(tabDDC.id==tab.id && req.test(tab.url)){
								chrome.tabs.update(tab.id,{selected : true}, tabCreate);
								ta = true;
								break;
							}
						}
						if(!ta){
							chrome.tabs.create({'url': localStorage['url_forum'], 'active':true}, tabCreate);
						}
					})
				}else{
					chrome.tabs.create({'url': localStorage['url_forum'], 'active':true}, tabCreate);
				}
				break;
		}
	})
	/*
	... старт расширения
	... Первый запрос через 1 сек после запуска расширения
	*/
	chrome.tabs.query({}, function(tabs) {
		for(var i = 0; i<tabs.length;++i){
			var lt = tabs[i].id,
				req = /(http:\/\/demiart.ru\/forum\/(.+.php\?)?)/ig;
			if(req.test(tabs[i].url)){
				executeDccScript(tabs[i].id);
				setTimeout(function(){chrome.tabs.sendMessage(lt,{data:"/favicon.ico", message:'favicon'});}, 100);
			}
		}
	});
	u.resetOptions = resetOptions;
	chrome.browserAction.setTitle({'title':  "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c..."});
	calarm = setTimeout(function() { onAlarm() }, 1000);
	contextMenuShow();
}());