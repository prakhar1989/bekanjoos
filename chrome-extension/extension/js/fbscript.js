//var redirect_url = "http://localhost:5000/success";
var redirect_url = "https://www.facebook.com/connect/login_success.html";
var url = "https://www.facebook.com/dialog/oauth?client_id=1643610532594445&"
                    + "redirect_uri=" + redirect_url
                    + "&scope=email&response_type=token";

var windowConfig = {url: url, width: 580, height: 500};
var tabConfig = {url: url, selected: true};


function setInnerText(msg) {
    var p = document.getElementById("pre");
    p.innerText = msg;
}

function loginFacebook(callback) {
    chrome.tabs.create(tabConfig, function(tabDetails) {
        chrome.tabs.query({active: true}, function(tabs) {
            tabid = tabs[1].id;

            chrome.tabs.onUpdated.addListener(function(tabid, tab) {
                var tabUrl = tab.url;
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
                setInnerText("hello world");

                // remove the popup
                chrome.tabs.remove(tabDetails.id);
                callback();
            });

        });
    });
}

