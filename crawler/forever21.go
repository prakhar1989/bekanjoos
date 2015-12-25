package main

import (
	"log"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

const PRICE_SELECTOR = "p.product-price"
const WASNOW_SELECTOR = "p.was-now-price"

func GetPriceForForever21(url string) (price float64) {
	doc, err := goquery.NewDocument(url)
	if err != nil {
		log.Fatal(err)
	}

	var hasWasNowPrice bool

	// see if the product has a was-now price
	hasWasNowPrice = len(doc.Find(WASNOW_SELECTOR).Nodes) > 0

	if hasWasNowPrice {
		doc.Find(WASNOW_SELECTOR).Each(func(i int, s *goquery.Selection) {
			subparts := strings.Split(s.Text(), ":")
			price = parseCurrency(subparts[len(subparts)-1])
		})
	} else {
		doc.Find(PRICE_SELECTOR).Each(func(i int, s *goquery.Selection) {
			price = parseCurrency(s.Text())
		})
	}

	return price
}
