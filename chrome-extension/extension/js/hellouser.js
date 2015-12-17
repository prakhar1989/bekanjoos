document.addEventListener('DOMContentLoaded', function() {
    var access_token = localStorage.accessToken;
    var url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + access_token;
    $.get(url, function( data ) {
        localStorage.email = data.email;
        localStorage.id = data.id;
        localStorage.name = data.name;

        // TODO: set welcome message
        document.getElementById("msg").innerText = "Welcome, " + localStorage.name;
    });
});
