package main

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

func getPriceForFlipkart(url string) float64 {
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

func getPriceForJabong(url string) float64 {
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
			isSpan := t.Data == "span"
			if isSpan {
				for _, attr := range t.Attr {
					if attr.Key == "class" && strings.Contains(attr.Val, "actual-price") {
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

func getPriceForSnapdeal(url string) float64 {
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
			isSpan := t.Data == "span"
			if isSpan {
				for _, attr := range t.Attr {
					if attr.Key == "class" && strings.Contains(attr.Val, "payBlkBig") {
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

func getPriceForAmazon(url string) float64 {
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
			return 2.0
		case tt == html.StartTagToken:
			t := z.Token()
			isSpan := t.Data == "span"
			if isSpan {
				for _, attr := range t.Attr {
					if attr.Key == "class" && strings.Contains(attr.Val, "a-size-medium a-color-price") {
						fmt.Println("here")
						return 0.0
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

func getPriceForTarget(url string) float64 {
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
			return 2.0
		case tt == html.StartTagToken:
			t := z.Token()
			isSpan := t.Data == "span"
			if isSpan {
				for _, attr := range t.Attr {
					if attr.Key == "class" && strings.Contains(attr.Val, "offerPrice") {
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

func getWebsite(uri string) string {
	u, err := url.Parse(uri)
	if err != nil {
		log.Fatal(err)
	}
	return u.Host
}

func main() {
	if len(os.Args) != 2 {
		log.Fatal("Usage: ./crawl <url>")
	}
	url := os.Args[1]
	website := getWebsite(url)

	var price float64
	if strings.Contains(website, "jabong") {
		price = getPriceForJabong(url)
	} else if strings.Contains(website, "flipkart") {
		price = getPriceForFlipkart(url)
	} else if strings.Contains(website, "snapdeal") {
		price = getPriceForSnapdeal(url)
	}  else if strings.Contains(website, "amazon") {
		price = getPriceForAmazon(url)
	} else if strings.Contains(website, "target") {
		price = getPriceForTarget(url)
	} else {
		log.Fatal("Website not supported")
	}
	fmt.Println(price)
}
