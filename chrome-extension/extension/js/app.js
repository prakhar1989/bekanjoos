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
            'validURL': false
        }
    },
    componentDidMount() {
        var self = this;
        getCurrentTabUrl(function(url) {
            var hostname = getHostname(url)
            var isValid = VALID_SITES.indexOf(hostname) > -1;
            self.setState({
                validURL: isValid
            });
        });
    },
    addProduct() {
        alert("hello world");
    },
    render() {

        return (<div>
            <h1>PriceTell</h1>
            <span className="tagline">Helping you track your favorite online products</span>
            { this.state.validURL ?  <button onClick={this.addProduct} className="add-product"> Track Product </button> : null }
            <Products />
        </div>
        )
    }
});

var Products = React.createClass({
    getInitialState() {
        return { products: [] }
    },
    componentDidMount() {
        request
            .get(URL + '/api/products')
            .end(function(err, res) {
                if (err) console.log(err) 
                else {
                    if (this.isMounted()) {
                        this.setState({
                            products: res.body.products
                        })
                    }
                }
            }.bind(this));
    },
    render() {
        var productList = this.state.products.map(function(prod, i) {
            return <li key={i}> 
                <div className="info">
                    <h2><a href={prod.url}>{ prod.title }</a></h2> 
                    <p> Price: <span className="price">{prod.price} </span> as seen on {prod.site}</p>
                    <img src={prod.image_url} />
                    <button>Remove</button>
                </div>
            </li>
        });
        return (<ul className="products"> {productList} </ul>)
    }
});

ReactDOM.render(<App />, document.getElementById('app'));
