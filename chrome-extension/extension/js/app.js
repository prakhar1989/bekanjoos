var React = require('react');
var ReactDOM = require('react-dom');
var request = require('superagent');

var VALID_SITES = ["www.snapdeal.com", "www.flipkart.com", "www.jabong.com", "www.walmart.com"];
var URL = "http://localhost:5000"

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

var App = React.createClass({
    getInitialState() {
        return {
            validURL: false,
            products: []
        }
    },
    componentDidMount() {
        var validURL;
        getCurrentTabUrl(function(url) {
            var hostname = getHostname(url)
            validURL = VALID_SITES.indexOf(hostname) > -1;
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
                                    products: [payload].concat(self.state.products)
                                });
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
    render() {
        return <div>
            <h1>PriceTell</h1>
            <span className="tagline">Helping you track your favorite online products</span>
            { this.state.validURL ? <button onClick={this.addProduct} className="add-product"> Track Product </button> : null }
            <Products 
                products={this.state.products} 
                handleRemoveProduct={this.removeProduct} />
        </div>
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
                    <span> <span className="price">{prod.price} </span> on {prod.site}</span>
                    <img src={prod.image_url} />
                    <button onClick={this.removeProduct.bind(this, i)}>Remove</button>
                </div>
            </li>
        }.bind(this));
        return (<ul className="products"> {productList} </ul>)
    }
});

ReactDOM.render(<App />, document.getElementById('app'));
