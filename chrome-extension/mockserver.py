from flask import Flask, jsonify, request
from random import randint, choice

app = Flask(__name__)


def getProduct():
    prices = ["Rs. 540.00", "$499.99", "KWD 10.000"]
    titles = ['Joe Black Wayfarer Sunglasses', 'Samsung Galaxy On5', 'Ladies Red Socks', 'Maybelline Flaming Red Lipstick']
    sites = ["Flipkart", "Walmart", "Target", "BestBuy"]
    images = ['http://img6a.flixcart.com/image/sunglass/r/s/b/fa-1102-c1-farenheit-m-400x400-imae37gyr5q8fpwg.jpeg',
              'http://i5.walmartimages.com/dfw/dce07b8c-24c5/k2-_b8b8b08a-34a3-4815-baad-62893995f8b3.v1.jpg',
              'http://static2.jassets.com/p/Nike-Liteforce-Iii-Mid-Black-Sneakers-7017-3023861-1-pdp_slider_m.jpg']
    return {
        'image_url': choice(images),
        'price': choice(prices),
        'site':  choice(sites),
        'title': choice(titles),
        'url': 'http://www.walmart.com/ip/Hanes-Girls-Crew-Socks-10-Pack/43989859',
        'product_id': randint(100, 1000)
    }


products = [getProduct() for _ in range(10)]

@app.route('/')
def index():
    return "hello from flask"

@app.route('/api/products')
def getProducts():
    #print request.args.get('user_id')
    return jsonify({'products': products})

@app.route('/api/product', methods=["DELETE"])
def deleteProduct():
    product_id = request.args.get('product_id')
    for (i, p) in enumerate(products):
        if p["product_id"] == product_id:
            pass #do something with id here
    return jsonify({
        'status': 'product deleted',
        'id': product_id
    })

@app.route('/api/product', methods=["POST"])
def addProduct():
    if request.method == "POST":
        # do something with the request data
        print request.data
        return jsonify({
            'status': 'product added',
            'id': 10
        })

if __name__ == "__main__":
    app.run(debug=True)
