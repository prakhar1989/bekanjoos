from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def index():
    return "hello from flask"

@app.route('/api/products')
def getProducts():
    #print request.args.get('user_id')
    prod = {
        'title': 'iPhone 6',
        'price': 540.00,
        'url': 'Joe Black Wayfarer Sunglasses'
    }
    return jsonify({'products': [prod for _ in range(10)]})

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
