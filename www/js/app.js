
var app = {
    // App Members
    appTitle: 'ClicByImpuls',
    targetUrl: 'http://clic.impuls.com.mx',
    allowNavigationUrls: [
        '*://clic.impuls.com.mx/*',
        '*://www.paypal.com/*',
        '*://secure.na.tnspayments.com/*',
        '*://banamex.na.tnspayments.com/*',
        '*://banamex.dialectpayments.com/*'
    ],
    fileExtensions: [
        // text files
        '.txt',
        '.csv',
        // binary files
        '.pdf',
        '.zip', '.rar',
        '.xls', '.xlsx',
        '.doc', '.docx',
        '.ppt', '.pptx',
        // image files
        '.png',
        '.gif',
        '.jpg', '.jpeg',
        '.bmp'
    ],
    // Support Members
    startupInterval: null,
    browserRef: null,
    browserUrlCurrent: '',
    browserUrlRequest: '',
    externalRequest: false,
    externalProcess: false,
    cancelLoading: false,
    // Initialize app
    initialize: function() {
        console.log('app.initialize');

        // members
        var parameters = this.getParameters();
        this.browserUrlCurrent = decodeURIComponent(parameters['current']);
        this.browserUrlRequest = decodeURIComponent(parameters['request']);
        this.externalRequest = decodeURIComponent(parameters['external']);

        if (this.externalRequest == 'undefined' || this.externalRequest == '' || this.externalRequest == 'false') {
            this.externalRequest = false;
        } else {
            this.externalRequest = true;
        }

        if ((this.browserUrlCurrent == 'undefined' || this.browserUrlCurrent == '') &&
            (this.browserUrlRequest == 'undefined' || this.browserUrlRequest == '')) {
            this.browserUrlRequest = this.targetUrl;
        }

        console.log('current=' + this.browserUrlCurrent);
        console.log('request=' + this.browserUrlRequest);

        // events
        this.bindEvents();
    },
    // Bind events
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    //
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    clearScreen: function() {
        var loadingComponent = document.getElementById('loading');
        var statusBoxComponent = document.getElementById('statusBox');
        var statusText = document.getElementById('statusText');
        var messagesComponent = document.getElementById('messages');
        var buttonsComponent = document.querySelector('.nav_buttons');

        var messageText = messagesComponent.children[0].children[0];

        // set title again
        document.title = app.appTitle;
	///////////////

	loadingComponent.setAttribute('class', 'loader');
	statusBoxComponent.setAttribute('class', 'blink');
	statusText.setAttribute('class', 'event listening');
	statusText.innerText = "Cargando...";
        messagesComponent.setAttribute('class', 'descrip_aviso hide');
	buttonsComponent.setAttribute('class', 'nav_buttons hide');

	var continueButton = document.getElementById("continue");
	continueButton.setAttribute('class', 'hide');

	var backButton = document.getElementById("back");
	backButton.setAttribute('class', 'hide');
    },
    // Device ready Event
    receivedEvent: function(e) {
        var pageName = document.getElementById('index_page');
        var loadingComponent = document.getElementById('loading');
        var statusBoxComponent = document.getElementById('statusBox');
        var statusText = document.getElementById('statusText');
        var messagesComponent = document.getElementById('messages');
        var buttonsComponent = document.querySelector('.nav_buttons');

        var messageText = messagesComponent.children[0].children[0];

	document.addEventListener("backbutton", function(e) {
		if (document.getElementById('index_page') != undefined) {
			e.preventDefault();
			navigator.app.exitApp();
		} else {
			navigator.app.backHistory();
		}
	}, false);

        // set title again
        document.title = this.appTitle;

        app.startupInterval = setInterval(function () {
           if (navigator.connection.type == Connection.NONE) {
              console.log('No Internet connection');

              statusText.setAttribute('class', 'event error');
              statusText.innerText = "Reconectando...";
              messagesComponent.setAttribute('class', 'descrip_aviso');
              messageText.innerText = "Se presentó un problema de conexión a Internet.";

           } else {
              console.log('Internet connection detected');

              // Stop interval
              app.onStartupIntervalCompleted();

              loadingComponent.setAttribute('class', 'loader hide');
              statusBoxComponent.setAttribute('class', 'blink hide');

              statusText.setAttribute('class', 'event received');
              statusText.innerText = "Listo";
              messagesComponent.setAttribute('class', 'descrip_aviso hide');
              buttonsComponent.setAttribute('class', 'nav_buttons hide');

              if (app.externalRequest) {
                  // Automatic request to external url
                  console.log('app.startup[e]: External Request');

			app.clearScreen();

                  console.log('app.startup[e]: Open request url: ' + app.browserUrlRequest);
                  app.browser_open(app.browserUrlRequest, true);

                  console.log('app.startup[e]: Open current url: ' + app.browserUrlCurrent);
                  app.browser_open(app.browserUrlCurrent);

              } else {
                  console.log('app.startup[n]: Normal Request');
                  // Normal
                  if (typeof(pageName) != 'undefined' && pageName != null) {
                      // continue button
                      app.browserUrlRequest = app.targetUrl;
                      // index page: automatic redirect
                      console.log('app.startup[n]: Open request url: ' + app.browserUrlRequest);

			setTimeout(function() {
				app.clearScreen();

				loadingComponent.setAttribute('class', 'loader hide');
				statusBoxComponent.setAttribute('class', 'blink hide');

				var continueButton = document.getElementById("continue");
				continueButton.setAttribute('class', '');
				continueButton.addEventListener('click', app.continueButton_onClick, false);
				buttonsComponent.setAttribute('class', 'nav_buttons');

				app.browser_open(app.browserUrlRequest);
			}, 1000);
                  } else {
                      // error page: manual redirect
                      console.log('app.startup[n]: Open error page');
                      buttonsComponent.setAttribute('class', 'nav_buttons');
                      app.errorPageBindEvents();
                  }
              }
           }
        }, 2000);
    },
    // Startup interval completed Event
    onStartupIntervalCompleted: function() {
        if (app.startupInterval != null && app.startupInterval != 'undefined') {
            clearInterval(app.startupInterval);
            app.startupInterval = null;
        }
    },
    // inAppBrowser open
    browser_open: function(url, external) {
	if (external === undefined) external = false;

	if (external) console.log('inAppBrowser.open_external: ' + url);
	else console.log('inAppBrowser.open: ' + url);

        if (external || !app.allowNavigation(url)) {
            console.log('inAppBrowser.open[e]: ' + url);

            window.open(url, '_system');
        } else {
            console.log('inAppBrowser.open[n]: ' + url);

            app.browserRef = window.open(url, '_blank', 'location=no,toolbar=no,zoom=no,fullscreen=yes');
            app.browserRef.addEventListener('loadstart', app.browser_onLoadStart);
            app.browserRef.addEventListener('loadstop', app.browser_onLoadStop);
            app.browserRef.addEventListener('loaderror', app.browser_onLoadError);
            app.browserRef.addEventListener('exit', app.browser_onExit);
        }
    },
    // validation url
    allowNavigation: function(url) {
        var allowedUrls = app.allowNavigationUrls;
        var fileExtensions = app.fileExtensions;
        var validated = true;

        try {

            url = url.toLowerCase();

		// external URL
		if ( url.indexOf('error.html') !== -1 && url.indexOf('external=true') !== -1 ) {
			validated = true;
			return true;
		}

            // pagatuservicio: donaciones en navegación externa
            if (
                  url.indexOf('pts.payment?categoria=6') !== -1 ||
                  (url.indexOf('pts.payment?business_id=') !== -1 && url.indexOf('categoria=6') !== -1)
               ) {
              console.log('allowNavigation: false [donacion]');
              validated = false;
              return false;
            }

            for (i = 0; i < allowedUrls.length; i++) {
                var test = allowedUrls[i];

                validated = true;
                for(j = 0, k = 0; j < test.length && k < url.length; j++) {
                    if (test.charAt(j) != '*') {
                        if (test.charAt(j) != url.charAt(k)) {
                            validated = false;
                            break;
                        }
                        k++;
                    } else {
                        if (test.length != j+1) {
                            for( ; k < url.length; k++) {
                                if (url.charAt(k) == test.charAt(j+1)) {
                                    break;
                                }
                            }
                            if (k == url.length) {
                                validated = false;
                                break;
                            }
                        }
                    }
                }

                if (validated && k == url.length && j < test.length) {
                    s = test.length - j;
                    if (s == 1) {
                        if (test.charAt(test.length-1) != '/' && test.charAt(test.length-1) != '*' ) {
                            validated = false;
                        }
                    } else if (s == 2) {
                        if (test.charAt(test.length-2) != '/' && test.charAt(test.length-1) != '*' ) {
                            validated = false;
                        }
                    } else {
                        validated = false;
                    }
                }

                if (validated && j == test.length && k < url.length) {
                    if (test.charAt(j-1) != '*') {
                        validated = false;
                    }
                }

                if (validated && test.length > 0) {
                      break;
                }
            }

            if (!validated) {
                console.log('allowNavigation: false [' + url + ']');
            } else {
                // Open any file in external browser
                for (i = 0; i < fileExtensions.length; i++) {
                    if (url.endsWith(fileExtensions[i])) {
                        console.log('allowNavigation: false [URL has extension file: ' + url + ']');
                        validated = false;
                        break;
                    }
                }
            }

        } catch(err) {
            validated = false;
            console.log('allowNavigation: false [exception]');
            console.log(err.Message);
        }

        if (validated) {
            console.log('allowNavigation: true [' + url + ']');
        }

        return validated;
    },
    // inAppBrowser Events
    //
    // inAppBrowser loadstart
    currentLoadStart: "",
    browser_onLoadStart: function(event) {
        console.log('inAppBrowser.loadstart: ' + event.url);

	if (event.url != app.currentLoadStart)
		app.currentLoadStart = event.url;
	else {
		var i = 0;
		var url = event.url;
		var validated = true;

                // Open any file in external browser
                for (i = 0; i < app.fileExtensions.length; i++) {
                    if (url.endsWith(app.fileExtensions[i])) {
                        console.log('loadstart-allowNav: false [URL has extension file: ' + url + ']');
                        validated = false;
                        break;
                    }
                }

		if (!validated)
			return;
	}

        // 10 secs maximum showing the loading message
        window.plugins.spinnerDialog.show(null, "Cargando...", function () {
            setTimeout(function () {
                window.plugins.spinnerDialog.hide();
                window.plugins.spinnerDialog.hide();
            }, 10000);
        });

        // Allow-Navigation
        if (!app.allowNavigation(event.url)) {
		console.log('inAppBrowser.loadstart: Redirect to error page');

		app.externalProcess = true;

		window.plugins.spinnerDialog.hide();
		window.plugins.spinnerDialog.hide();

            var url = "error.html" +
                "?request=" + encodeURIComponent(event.url) +
                "&current=" + encodeURIComponent(app.browserUrlRequest) +
                "&external=true";

		setTimeout(function () {
			stopAndStart(url);
		}, 1000);

		app.browserRef.close();

            return;
        } else {
		console.log('inAppBrowser.loadstart: Continue normal');
            // Updates current URL
            if (app.browserUrlCurrent != app.browserUrlRequest) {
                app.browserUrlCurrent = app.browserUrlRequest;
            }
            app.browserUrlRequest = event.url;
        }
    },
    // inAppBrowser loadstop
    browser_onLoadStop: function(event) {
        console.log('inAppBrowser.loadstop: ' + event.url);

        window.plugins.spinnerDialog.hide();
        window.plugins.spinnerDialog.hide();
	      app.cancelLoading = false;

    },
    // inAppBrowser loaderror
    browser_onLoadError: function(event) {
        console.log('inAppBrowser.loaderror: ' + event.url);
	console.log('Error code: ' + event.code + ', Message: ' + event.message);

	if (event.url == app.currentLoadStart) {
                var i = 0;
                var url = event.url;
                var validated = true;

                // Open any file in external browser
                for (i = 0; i < app.fileExtensions.length; i++) {
                    if (url.endsWith(app.fileExtensions[i])) {
                        console.log('loaderror-allowNav: false [URL has extension file: ' + url + ']');
                        validated = false;
                        break;
                    }
                }

                if (!validated)
                        return;
	}

        // Allow-Navigation
        if (app.allowNavigation(event.url)) {
            app.browserUrlRequest = event.url;
        }

        window.plugins.spinnerDialog.hide();
        window.plugins.spinnerDialog.hide();
	      app.cancelLoading = false;

        //navigator.notification.alert('error: code=' + event.code + ', message=' + event.message);
        // -999: The operation could not be completed (NSURLErrorDomain error -999)
        // -1009: The Internet connection appears to be offline.

        if (event.code != '-999') {
		console.log('inAppBrowser.loaderror: Redirect to error page');
		window.location.href = "error.html" +
			"?request=" + encodeURIComponent(app.browserUrlRequest) +
			"&current=" + encodeURIComponent(app.browserUrlCurrent);
        }
    },
    // inAppBrowser exit
    browser_onExit: function(event) {
        console.log('inAppBrowser.exit');

        window.plugins.spinnerDialog.hide();
        window.plugins.spinnerDialog.hide();
	      app.cancelLoading = false;

        app.browserRef.removeEventListener('loadstart', app.browser_onLoadStart);
        app.browserRef.removeEventListener('loadstop', app.browser_onLoadStop);
        app.browserRef.removeEventListener('loaderror', app.browser_onLoadError);
        app.browserRef.removeEventListener('exit', app.browser_onExit);
    },
    // Error page events
    errorPageBindEvents: function() {
        // back button
        var backButton = document.getElementById("back");
        if (!(app.browserUrlCurrent == 'undefined' || app.browserUrlCurrent == '') &&
          app.browserUrlCurrent != app.browserUrlRequest) {
            backButton.setAttribute('class', '');
            backButton.addEventListener('click', app.backButton_onClick, false);
        }

        // continue button
        var continueButton = document.getElementById("continue");
        if (!(app.browserUrlRequest == 'undefined' || app.browserUrlRequest == '')) {
            continueButton.setAttribute('class', '');
            continueButton.addEventListener('click', app.continueButton_onClick, false);
        }
    },
    // Event back.click
    backButton_onClick: function() {
        console.log('back.click');
        app.browser_open(app.browserUrlCurrent);
	app.clearScreen();
    },
    // Event continue.click
    continueButton_onClick: function() {
        console.log('continue.click');
        app.browser_open(app.browserUrlRequest);
	app.clearScreen();
    },
    // Gets query string parameters array
    getParameters: function() {
        var urlParams;
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);
        urlParams = {};
        while (match = search.exec(query))
           urlParams[decode(match[1])] = decode(match[2]);
        return urlParams;
    }
};

app.initialize();

function executeScript() {
    var externalTargetCounter = 0;
    document.querySelectorAll('a[href]').forEach(function(a) {
        var href = a.getAttribute('href');
        if(
            href != null &&
            href != '' &&
            href != '#' &&
            !href.startsWith('..') &&
            !href.startsWith('//') &&
            !href.startsWith('file:') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('geo:') &&
            !href.startsWith('tel:') &&
            !href.startsWith('sms:')
          ) {
            if (href.startsWith('http://www.haztutienda')
                || href.startsWith('https://www.facebook')
              ) {
                externalTargetCounter++;
                a.setAttribute('target', '_system');
                a.addEventListener('click', function (e) {
                    var element = e.target;
                    console.log('open external url: ' + element.href);
                    window.open(element.href, '_system');
                    return false;
                }, false);
            }
        }
    });
    externalTargetCounter;
}


function stopAndStart(url) {
	console.log('stopAndStart: url=' + url);
	app.currentLoadStart = "";
	window.location.href = url;
}

