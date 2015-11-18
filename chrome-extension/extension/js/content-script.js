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


/*
 * Main content script
 */
function getDetailsForFlipkart() {
    var parsedURL = parseUri(document.location.href);
    // check if it's a product page
    if (parsedURL["queryKey"]["pid"] !== undefined) {
        return {
            title: $('h1.title').text(),
            image: $('img.productImage.current').attr('src'),
            price: $('span.selling-price').text(),
            product_id: parsedURL["queryKey"]["pid"]
        };
    }
}

$(document).on('ready', function() {
    console.log("hello from content script");
    var parsedURL = parseUri(document.location.href);
    var details = null;
    if (parsedURL.authority === "www.flipkart.com")  {
        details = getDetailsForFlipkart();
    }
    if (details) {
        console.log(JSON.stringify(details, null, 2));
    } else {
        console.log("Not a valid product page");
    }
});

