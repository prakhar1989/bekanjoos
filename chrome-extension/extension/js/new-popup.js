function completedLogin() {
    chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;
    });

    alert("you are now logged in");
}

document.addEventListener('DOMContentLoaded', function() {
    var loginButton = document.getElementById("login");
    var logoutButton = document.getElementById("logout");
    var expiry = new Date(parseInt(localStorage.expiryTime));
    var now = new Date();

    if (localStorage.accessToken && now < expiry) {
        var p = document.getElementById("pre");
        p.innerText = "awesome you're logged in";
        loginButton.style.visibility = "hidden";
    } else {
        console.log("here");
        logoutButton.style.visibility = "hidden";
    }

    loginButton.addEventListener("click", function() {
        loginFacebook(completedLogin);
    });

    logoutButton.addEventListener("click", function() {
        localStorage.accessToken = null;
        localStorage.expiryTime = null;
    });
});

