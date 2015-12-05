var successURL = 'www.facebook.com/connect/login_success.html';

function onFacebookLogin() {
    chrome.tabs.query({}, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.indexOf(successURL) !== -1) {
                var tabUrl = tabs[i].url;
                var accessTokenMatcher = null;
                var expiresInMatcher = null;

                if (tabUrl != null) {
                    accessTokenMatcher = tabUrl.match(/[\\?&#]access_token=([^&#])*/i);
                    expiresInMatcher = tabUrl.match(/expires_in=.*/);
                }

                if (accessTokenMatcher != null) {
                    // set accesstoken
                    var token = accessTokenMatcher[0].substring(14);
                    var expires_in = expiresInMatcher[0].substring(11);
                    localStorage.accessToken = token;

                    // set expiry date
                    var currentDate = new Date();
                    var expiryTime = currentDate.getTime() + 1000 * (expires_in - 300);
                    localStorage.expiryTime = expiryTime;
                    
                }
                chrome.tabs.remove(tabs[i].id);
            }
        }
    });
}

chrome.tabs.onUpdated.addListener(onFacebookLogin);
