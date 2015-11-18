from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def index():
    return "hello from flask"

@app.route('/api/products')
def getProducts():
    #print request.args.get('user_id')
    prod = {
        'image_url': 'http://img6a.flixcart.com/image/sunglass/r/s/b/fa-1102-c1-farenheit-m-400x400-imae37gyr5q8fpwg.jpeg',
        'price': "Rs. 540.00",
        'site':  'Walmart',
        'title': 'Joe Black Wayfarer Sunglasses',
        'url': 'http://www.walmart.com/ip/Hanes-Girls-Crew-Socks-10-Pack/43989859'

    }
    return jsonify({'products': [prod for _ in range(6)]})

@app.route('/api/product', methods=["DELETE"])
def deleteProduct():
    product_id = request.args.get('product_id')
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
