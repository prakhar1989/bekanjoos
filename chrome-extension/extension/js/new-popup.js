document.addEventListener('DOMContentLoaded', function() {
    var loginButton = document.getElementById("login");
    var logoutButton = document.getElementById("logout");
    var expiry = new Date(parseInt(localStorage.expiryTime));
    var now = new Date();

    // add the event listener
    loginButton.addEventListener("click", function() {
        var redirect_url = "https://www.facebook.com/connect/login_success.html";
        var url = "https://www.facebook.com/dialog/oauth?client_id=1643610532594445&"
                            + "redirect_uri=" + redirect_url
                            + "&scope=email&response_type=token";
        chrome.tabs.create({url: url, selected: true});
    });


    if (localStorage.accessToken && now < expiry) {
        // logged in
        document.getElementById("msg").innerText = "hello, " + localStorage.name;
        loginButton.style.visibility = "hidden";
    } else { // init login
        logoutButton.style.visibility = "hidden";
    }

    logoutButton.addEventListener("click", function() {
        localStorage.accessToken = null;
        localStorage.id = null;
        localStorage.email = null;
        localStorage.user = null;
        localStorage.expiryTime = null;
    });
});

