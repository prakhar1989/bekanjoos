package main

// Returns the latest price for a product page on Walmart.com
// Parsing logic: Reads a JSON inside the <script> tag with tb-djs-wml-base
// and reads the price from side the 'adContextJSON' object

import (
	"log"
	"net/http"
	"strings"

	"github.com/bitly/go-simplejson"
	"golang.org/x/net/html"
)

// parseJson reads the rawjson passed and
// returns the price. Assumes the json object has
// a adContextJSON child that itself has the
// price key
func parseJson(rawjson string) float64 {
	js, err := simplejson.NewJson([]byte(rawjson))
	if err != nil {
		log.Fatal(err)
	}
	adObject := js.Get("adContextJSON")
	price := adObject.Get("price").MustFloat64()
	return price
}

func GetPriceForWalmart(url string) float64 {
	resp, err := http.Get(url)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	z := html.NewTokenizer(resp.Body)
	for {
		tt := z.Next()
		switch {
		case tt == html.ErrorToken:
			return 0.0
		case tt == html.StartTagToken:
			t := z.Token()
			isSpan := t.Data == "script"
			if isSpan {
				for _, attr := range t.Attr {
					if attr.Key == "id" && strings.Contains(attr.Val, "tb-djs-wml-base") {
						nxt := z.Next()
						if nxt == html.TextToken {
							return parseJson(z.Token().Data)
						}
					}
				}
			}
		}
	}
}
