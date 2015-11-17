package main

import (
	"fmt"
	"log"
	"net/http"
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

func parseCurrency(price string) (string, float64) {
	numberStart := 0
	for i := 0; i < len(price); i++ {
		_, err := strconv.Atoi(string(price[i]))
		if err == nil {
			numberStart = i
			break
		}
	}
	curr := strings.Trim(price[:numberStart], " . ")
	return curr, parsePrice(price[numberStart:])
}

func getPriceForFlipkart(url string) (string, float64) {
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
			return "", 0.0
		case tt == html.StartTagToken:
			t := z.Token()
			isSpan := t.Data == "span"
			if isSpan {
				for _, attr := range t.Attr {
					if attr.Key == "class" && strings.Contains(attr.Val, "selling-price") {
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

func main() {
	if len(os.Args) != 2 {
		log.Fatal("Usage: ./crawl <url>")
	}
	url := os.Args[1]
	curr, price := getPriceForFlipkart(url)
	fmt.Println("Curr", curr, "Price:", price)
}
