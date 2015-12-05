BeKanjoos
===

[Website](http://bekanjoos.co/) | [App]()

### Description
Our project is an application that allows users to track their favorite products across various E-Commerce websites and get notified when the prices of their products drop. We are building a Chrome Extension and an Android App which allow users to track products as they are browsing through E-Commerce websites.

### Features and User Flow

The user logs into the Chrome Extension/ Android App using Facebook OAuth.
While browsing through E-Commerce websites, the extension allows a user to add a product to his/her tracked list with a single click. We are currently supporting the following websites - Flipkart, Jabong, Snapdeal, Target, EBay, Walmart and Amazon.
The user can remove products he no longer wants to track through the user interface.
If the price of a product changes, the user is notified and he can go to the product page to make a purchase.

### Technical Architecture

A crawler written in GoLang which automatically goes through URLs of tracked products and queries their prices. It polls the website URLs at fixed intervals of time and updates the product prices if they have changed.
SNS to send a notification to the user that the price of a product has changed.
RDS to store information of users and their tracked products.
S3 to store images of the tracked products.
(optional) Some graphs to show the variation of prices for a product, which allows users to see patterns in price behavior.
The Chrome Extension is built in React.js and displays the product name, image, price and a link to the product page.


### Team Members
- Gaurang Sadekar (gss2147)
- Prakhar Srivastav (ps2894)
- Vinay Gaba (vhg2105)
- Viral Shah (vrs2119)
