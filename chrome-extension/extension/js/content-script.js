// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
    var options = {
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

	var	o   = options,
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
            price: $('span.selling-price.omniture-field').text(),
            product_id: parsedURL["queryKey"]["pid"]
        };
    }
}

function getDetailsForEbay() {
    var parsedURL = parseUri(document.location.href);
    var subparts = parsedURL.path.split('/');
    var price = $('span#prcIsum').text();

    if (subparts[1] === "itm") {
        return {
            title: $('h1#itemTitle').children().remove().end().text(),
            image_url: $('img#icImg').attr('src'),
            site: 'Ebay',
            url: document.location.href,
            price: price.split(' ')[1],
            product_id: subparts[subparts.length - 1]
        };
    }
}

function getDetailsForWalmart() {
    var parsedURL = parseUri(document.location.href);
    var subparts = parsedURL.path.split('/').filter(function(s) {
        return s.length > 0; 
    });
    
    if (subparts[0] === "ip") {
        // stupid fucking DOM markup on Walmart >:-[
        var priceDiv = $('div.js-price-display.price.price-display');
        var leadingDigit = priceDiv.clone().children().remove().end().text().trim();
        var curr = priceDiv.children().first().text();
        var cents = priceDiv.children().last().text();
        return {
            title: $('h1.product-name.product-heading span').text().trim(),
            price: curr + leadingDigit + "." + cents,
            site: "Walmart",
            url: document.location.href,
            image_url: $('img.product-image.js-product-primary-image').attr('src'),
            product_id: subparts[1]
        }
    }
}

function getProductDetails() {
    var details = null;
    var parsedURL = parseUri(document.location.href);
    if (parsedURL.authority === "www.flipkart.com")  {
        details = getDetailsForFlipkart();
    } else if (parsedURL.authority === "www.ebay.com") {
        details = getDetailsForEbay();
    } else if (parsedURL.authority === "www.walmart.com") {
        details = getDetailsForWalmart();
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

