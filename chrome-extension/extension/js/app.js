var React = require('react');
var ReactDOM = require('react-dom');
var request = require('superagent');

var VALID_SITES = ["www.ebay.com", "www.flipkart.com", "www.walmart.com", 
                   "www.target.com", "www.bestbuy.com", "www.amazon.com"];
var URL = "http://localhost:5000";

// get the current tab URl
function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;
        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(url);
    });
}

function getHostname(url) {
    var parser = document.createElement("a");
    parser.href = url;
    return parser.hostname;
}

function isLoggedIn() {
    var accessToken = localStorage.accessToken;
    var expiry = new Date(parseInt(localStorage.expiryTime));
    var now = new Date();
    return accessToken && now < expiry;
}

function logoutUser() {
    localStorage.accessToken = null;
    localStorage.id = null;
    localStorage.email = null;
    localStorage.name = null;
    localStorage.expiryTime = null;
}

var App = React.createClass({
    getInitialState() {
        return {
            validURL: false,
            products: [],
            flashMsg: null
        }
    },
    componentDidMount() {
        var validURL;
        getCurrentTabUrl(function(url) {
            var hostname = getHostname(url)
            validURL = VALID_SITES.indexOf(hostname) > -1;
            console.log("valid url", validURL);
        });
        request
            .get(URL + '/api/products')
            .end(function(err, res) {
                if (err) console.log(err) 
                else {
                    if (this.isMounted()) {
                        this.setState({
                            products: res.body.products,
                            validURL: validURL
                        })
                    }
                }
            }.bind(this));
    },
    addProduct() {
        var self = this;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            console.log("sending message to content script");
            chrome.tabs.sendMessage(tabs[0].id, {ACTION: "ADD_PRODUCT"}, function(response) {
                var payload = response.payload;
                if (payload) {
                    // add product to the list and send a POST to the server
                    request.post(URL + "/api/product").send(payload)
                        .end(function(err, res) {
                            if (err) console.log(err);
                            else {
                                self.setState({
                                    products: [payload].concat(self.state.products),
                                    flashMsg: {
                                        status: 'success',
                                        text: "Product successfully added to your tracking list"
                                    }
                                });
                            }
                        });
                } else {
                    self.setState({
                        flashMsg: {
                            status: 'error',
                            text: "Unable to add the product. Are you sure you are on a product page?"
                        }
                    });
                }
            });
        });
    },
    removeProduct(index) {
        var product = this.state.products[index];
        var id = product["product_id"];
        request
            .del(URL + '/api/product?product_id=' + id)
            .end(function(err, res) {
                this.setState({
                    products: this.state.products.filter((_, i) => i !== index)
                })
            }.bind(this));
    },
    handleLogin() {
        var redirect_url = "https://www.facebook.com/connect/login_success.html";
        var url = "https://www.facebook.com/dialog/oauth?client_id=1643610532594445&"
                            + "redirect_uri=" + redirect_url
                            + "&scope=email&response_type=token";
        chrome.tabs.create({url: url, selected: true});
    },
    render() {
        var flashMsg = this.state.flashMsg;
        if (!isLoggedIn()) {
            return <div>
                <button onClick={this.handleLogin} className="login-btn"></button>
            </div>
        }
        return <div>
            <h1>PriceTell <i className="ion-arrow-graph-up-right"></i></h1>
            <span className="tagline">Helping you track your favorite online products</span>
            { flashMsg ? <FlashMsg status={flashMsg.status} msg={flashMsg.text} /> : null }
            { this.state.validURL ? <button onClick={this.addProduct} className="add-product"> 
                Track Product <i className="ion-plus-circled"></i></button> : null 
            }
            <Products 
                products={this.state.products} 
                handleRemoveProduct={this.removeProduct} />
        </div>
    }
});

var FlashMsg = React.createClass({
    propTypes: {
        msg: React.PropTypes.String,
        status: React.PropTypes.String
    },
    render() {
        var {msg, status} = this.props;
        var error = status === "error";
        var icon = error ?  <i className="ion-alert-circled"></i> : <i className="ion-checkmark"></i>;
        var cls = error ? "error animated shake" : "success animated tada";
        return <p className={cls}> {icon} { msg } </p>
    }
});

var Products = React.createClass({
    removeProduct(index) {
        this.props.handleRemoveProduct(index);
    },
    render() {
        var productList = this.props.products.map(function(prod, i) {
            return <li key={i}> 
                <div className="info">
                    <h2><a href={prod.url}>{ prod.title }</a></h2> 
                    <span> 
                        <span className="price">{prod.price} </span> 
                        on {prod.site} <i className="ion-information-circled"></i>
                    </span>
                    <img src={prod.image_url} />
                    <button onClick={this.removeProduct.bind(this, i)}>Remove <i className="ion-close-circled"></i></button>
                </div>
            </li>
        }.bind(this));
        return (<ul className="products"> {productList} </ul>)
    }
});

ReactDOM.render(<App />, document.getElementById('app'));
