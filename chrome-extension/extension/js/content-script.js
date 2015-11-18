// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};


function sendMessage(msg) {
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
      console.log(response);
    });
}

/*
 * Main content script
 */
function getDetailsForFlipkart() {
    var parsedURL = parseUri(document.location.href);
    // check if we're on a product page
    if (parsedURL["queryKey"]["pid"] !== undefined) {
        return {
            title: $('h1.title').text(),
            image_url: $('img.productImage.current').attr('src'),
            site: "Flipkart",
            url: document.location.href,
            price: $('span.selling-price').text(),
            product_id: parsedURL["queryKey"]["pid"]
        };
    }
}

function getProductDetails() {
    var details = null;
    var parsedURL = parseUri(document.location.href);
    if (parsedURL.authority === "www.flipkart.com")  {
        details = getDetailsForFlipkart();
    }
    return details
}

// handle the message from extension
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // check if the sender is the extension
        if (!sender.tab && request.ACTION === "ADD_PRODUCT") {
            var payload = getProductDetails();
            console.log("Sending off details", JSON.stringify(payload, null, 2));
            sendResponse({payload: payload});
        }
    }
);

$(document).on('ready', function() {
    console.log("Hello from TrackThis!");
});

