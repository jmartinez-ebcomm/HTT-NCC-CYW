
var app = {
    // App Members
    appTitle: 'ClickByImpuls',
    targetUrl: 'http://173.203.97.7/~impulsha',
    allowNavigationUrls: [
        '*://173.203.97.7/~impulsha/*',
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
    // Device ready Event
    receivedEvent: function(e) {
        var pageName = document.getElementById('index_page');
        var loadingComponent = document.querySelector('.loading');
        var statusComponent = document.getElementById('status');
        var messagesComponent = document.getElementById('messages');
        var buttonsComponent = document.querySelector('.nav_buttons');

        var statusText = statusComponent.children[0];
        var messageText = messagesComponent.children[0];

        // set title again
        document.title = this.appTitle;

        app.startupInterval = setInterval(function () {
           if (navigator.connection.type == Connection.NONE) {
              console.log('No Internet connection');

              statusText.setAttribute('class', 'event error');
              statusText.innerText = "Reconectando...";
              messagesComponent.setAttribute('class', '');
              messageText.innerText = "Se presentó un problema de conexión a Internet.";

           } else {
              console.log('Internet connection detected');

              // Stop interval
              app.onStartupIntervalCompleted();

              loadingComponent.setAttribute('class', 'hide');
              statusComponent.setAttribute('class', '');
              statusText.setAttribute('class', 'event success');
              statusText.innerText = "Listo";
              messagesComponent.setAttribute('class', 'hide');
              buttonsComponent.setAttribute('class', '');

              if (app.externalRequest) {
                  // Automatic request to external url
                  app.browser_open(app.browserUrlRequest);
                  app.browser_open(app.browserUrlCurrent);
              } else {
                  // Normal
                  if (typeof(pageName) != 'undefined' && pageName != null) {
                      // continue button
                      app.browserUrlRequest = app.targetUrl;
                      var continueButton = document.getElementById("continue");
                      continueButton.setAttribute('class', 'btn btn-default');
                      continueButton.addEventListener('click', app.continueButton_onClick, false);
                      // index page: automatic redirect
                      app.browser_open(app.browserUrlRequest);
                  } else {
                      // error page: manual redirect
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
    browser_open: function(url) {
        console.log('inAppBrowser.open: ' + url);

        if (!app.allowNavigation(url)) {
            window.open(url, '_system');
        } else {
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
                console.log('URL is not allowed for navigation: ' + url);
            } else {
                // Open any file in external browser
                for (i = 0; i < fileExtensions.length; i++) {
                    if (url.endsWith(fileExtensions[i])) {
                        console.log('URL has extension file: ' + url);
                        validated = false;
                        break;
                    }
                }
            }

        } catch(err) {
            validated = false;
            console.log(err.Message);
        }

        return validated;
    },
    // inAppBrowser Events
    //
    // inAppBrowser loadstart
    browser_onLoadStart: function(event) {
        console.log('inAppBrowser.loadstart: ' + event.url);

        // 10 secs maximum showing the loading message

        /*
        window.plugins.spinnerDialog.show(null, "Cargando...", true);
	app.cancelLoading = true;

	setTimeout(function () {
		if (app.cancelLoading) {
			window.plugins.spinnerDialog.hide();
			window.plugins.spinnerDialog.hide();
			app.cancelLoading = false;
		}
        }, 10000);

         */

        window.plugins.spinnerDialog.show(null, "Cargando...", function () {
            setTimeout(function () {
                window.plugins.spinnerDialog.hide();
                window.plugins.spinnerDialog.hide();
            }, 10000);
        });

        // Allow-Navigation
        if (!app.allowNavigation(event.url)) {

            // if (device.platform.toUpperCase() === 'ANDROID') {
            //     navigator.notification.alert('Android');
            //     // navigator.app.loadUrl(event.url, { openExternal: true });
            // } else {
            //     navigator.notification.alert('Other: ' + device.platform.toUpperCase());
            //     // window.open(event.url, '_system');
            // }

            // una vez cargada la pagina externa, intenta llamar esa pagina de forma externa
            // pero no funciona asi
            // app.browserRef.open(app.browserUrlRequest, '_system');

            window.plugins.spinnerDialog.hide();
            window.plugins.spinnerDialog.hide();

            window.location.href = "error.html" +
                "?request=" + decodeURIComponent(event.url) +
                "&current=" + decodeURIComponent(app.browserUrlRequest) +
                "&external=true";

            return;
        } else {
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

        // Va a la pagina que esta cargada en el wrapper y le cambia los anchor para que ejecute externo
        // pero no funciona asi
        // setTimeout(function() {
        //     app.browserRef.executeScript(
        //         { code: "var externalTargetCounter = 0; document.querySelectorAll('a[href]').forEach(function(a) { var href = a.getAttribute('href'); if( href != null && href != '' && href != '#' && !href.startsWith('..') && !href.startsWith('//') && !href.startsWith('file:') && !href.startsWith('mailto:') && !href.startsWith('geo:') && !href.startsWith('tel:') && !href.startsWith('sms:') ) { if (href.startsWith('http://www.haztutienda.com') || href.startsWith('https://www.facebook')) { externalTargetCounter++; a.setAttribute('target', '_system'); a.addEventListener('click', function (e) { var element = e.target; console.log('open external url: ' + element.href); window.open(element.href, '_system'); return false; }, false); } } }); externalTargetCounter;" },
        //         function(data) {
        //             console.log('External targets: ' + data);
        //             navigator.notification.alert('External targets: ' + data);
        //         }
        //     );
        // }, 100);
    },
    // inAppBrowser loaderror
    browser_onLoadError: function(event) {
        console.log('inAppBrowser.loaderror: ' + event.url);

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
            backButton.setAttribute('class', 'btn btn-info');
            backButton.addEventListener('click', app.backButton_onClick, false);
        }

        // continue button
        var continueButton = document.getElementById("continue");
        if (!(app.browserUrlRequest == 'undefined' || app.browserUrlRequest == '')) {
            continueButton.setAttribute('class', 'btn btn-default');
            continueButton.addEventListener('click', app.continueButton_onClick, false);
        }
    },
    // Event back.click
    backButton_onClick: function() {
        console.log('back.click');
        app.browser_open(app.browserUrlCurrent);
    },
    // Event continue.click
    continueButton_onClick: function() {
        console.log('continue.click');
        app.browser_open(app.browserUrlRequest);
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
