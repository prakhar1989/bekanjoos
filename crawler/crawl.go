package main

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// SELECTORS
const BESTBUY_SELECTOR = ".item-price"
const EBAY_SELECTOR = "span#prcIsum"
const TARGET_SELECTOR = "span.offerPrice"

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
	price = strings.TrimSpace(price)
	for i := 0; i < len(price); i++ {
		_, err := strconv.Atoi(string(price[i]))
		if err == nil {
			numberStart = i
			break
		}
	}
	return parsePrice(price[numberStart:])
}

func getWebsite(uri string) string {
	u, err := url.Parse(uri)
	if err != nil {
		log.Fatal(err)
	}
	return u.Host
}

func getPriceForSite(url string, selector string) float64 {
	doc, err := goquery.NewDocument(url)
	if err != nil {
		log.Fatal(err)
	}

	var price float64
	doc.Find(selector).Each(func(i int, s *goquery.Selection) {
		price = parseCurrency(s.Text())
	})
	return price

}

func main() {
	if len(os.Args) != 2 {
		log.Fatal("Usage: ./crawl <url>")
	}
	url := os.Args[1]
	website := getWebsite(url)

	var price float64
	if strings.Contains(website, "walmart") {
		price = GetPriceForWalmart(url)
	} else if strings.Contains(website, "bestbuy") {
		price = getPriceForSite(url, BESTBUY_SELECTOR)
	} else if strings.Contains(website, "target") {
		price = getPriceForSite(url, TARGET_SELECTOR)
	} else if strings.Contains(website, "ebay") {
		price = getPriceForSite(url, EBAY_SELECTOR)
	} else {
		log.Fatal("Website not supported")
	}
	fmt.Println(price)
}
