package main

// Returns the latest price for a product page on Walmart.com
// Parsing logic: Reads a JSON inside the <script> tag with tb-djs-wml-base
// and reads the price from side the 'adContextJSON' object

import (
  "fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"

	"golang.org/x/net/html"
)

func parsePrice(priceText string) float64 {
	newPrice := strings.Join(strings.Split(priceText, ","), "")
	price, err := strconv.ParseFloat(newPrice, 64)
	if err != nil {
		return 0.0
	}
	return price
}

func parseCurrency(price string) float64 {
	numberStart := 0
	for i := 0; i < len(price); i++ {
		_, err := strconv.Atoi(string(price[i]))
		if err == nil {
			numberStart = i
			break
		}
	}
	// TODO: can be used later
	//curr := strings.Trim(price[:numberStart], " . ")
	return parsePrice(price[numberStart:])
}

func GetPriceForBestBuy(url string) float64 {
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
			isSpan := t.Data == "meta"
			if isSpan {
				for _, attr := range t.Attr {
					if attr.Key == "id" && strings.Contains(attr.Val, "schemaorg-offer-price") {
						nxt := z.Next()
						if nxt == html.TextToken {
							t = z.Token()
							return parseCurrency(t.Data)
						}
					}
				}
			}
		}
	}
}
