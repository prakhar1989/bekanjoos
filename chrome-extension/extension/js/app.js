var React = require('react');
var ReactDOM = require('react-dom');
var request = require('superagent');

var VALID_SITES = ["www.ebay.com", "www.flipkart.com", "www.walmart.com", 
                   "www.target.com", "www.bestbuy.com", "www.forever21.com"];

var URL = "http://api.bekanjoos.co";
//var URL = "http://localhost:9000";

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
    // don't really care about expiry time of access tokens
    var accessToken = localStorage.accessToken;
    var expiry = new Date(parseInt(localStorage.expiryTime));
    var now = new Date();
    return accessToken !== null && accessToken !== undefined;
}

function getUserId() {
    return localStorage.id;
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
        });
        if (isLoggedIn()) {
            request
                .get(URL + '/api/user/' + getUserId() + '/products')
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
        }
    },
    addProduct() {
        var self = this;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            console.log("sending message to content script");
            chrome.tabs.sendMessage(tabs[0].id, {ACTION: "ADD_PRODUCT"}, function(response) {
                var payload = response.payload;
                if (payload) {
                    // see if the product exists
                    var productExists = self.state.products.filter(p => p.pid === payload.product_id).length;
                    if (productExists) {
                        self.setState({
                            flashMsg: {
                                status: 'error',
                                text: "You're already tracking this product"
                            }
                        });
                        return
                    }
                    request
                        .post(URL + "/api/user/" + getUserId() + "/product")
                        .type('form')
                        .send(payload)
                        .end(function(err, res) {
                            if (err) console.log(err);
                            else {
                                payload.pid = payload.product_id;
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
        console.log("jere");
        request
            .del(URL + '/api/user/' + getUserId() + "/product")
            .type('form')
            .send({
                site: product["site"], 
                product_id: product["pid"]
            })
            .end(function(err, res) {
                var prod = this.state.products.filter((p) => p.pid !== product["pid"]);
                this.setState({
                    products: prod,
                    flashMsg: {
                        status: 'success',
                        text: "Product deleted from your tracking list"
                    }
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
    handleLogout() {
        localStorage.clear();
        this.setState({
            products: []
        });
    },
    render() {
        var { flashMsg, products, validURL } = this.state;
        products = products || [];
        if (!isLoggedIn()) {
            return <div>
                <button onClick={this.handleLogin} className="login-btn"></button>
            </div>
        }
        return <div>
            <h1>Be Kanjoos 
                <i className="ion-arrow-graph-up-right"></i>
                <i title="Logout" className="logout ion-power" onClick={this.handleLogout}></i>
            </h1>
            <span className="tagline">Helping you track your favorite online products</span>
            { flashMsg ? <FlashMsg status={flashMsg.status} msg={flashMsg.text} /> : null }
            { this.state.validURL ? <button onClick={this.addProduct} className="add-product"> 
                Track Product <i className="ion-plus-circled"></i></button> : null 
            }
            { products.length === 0 ? <NoProducts /> : 
                <Products products={products} handleRemoveProduct={this.removeProduct} /> }
        </div>
    }
});

var NoProducts = React.createClass({
    render() {
        return <div>
            <h2>No Products added!</h2>
            <div className="bannerlogos">
                <a target="_blank" href="http://www.flipkart.com"><img src="/img/flipkart.png"/></a>
                <a target="_blank" href="http://www.bestbuy.com"><img src="/img/bestbuy.png"/></a>
                <a target="_blank" href="http://www.walmart.com"><img src="/img/walmart.png"/></a>
                <a target="_blank" href="http://www.forever21.com"><img src="/img/forever21.png"/></a>
                <a target="_blank" href="http://www.ebay.com"><img src="/img/ebay.png"/></a>
                <a target="_blank" href="http://www.target.com"><img src="/img/target.png"/></a>
            </div>
            <p>Head over to your favorite shopping websites to get started</p>
        </div>
    }
});

var FlashMsg = React.createClass({
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
                    <h2><a target="_blank" href={prod.url}>{ prod.title }</a></h2> 
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
