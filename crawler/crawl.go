package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

// SELECTORS
const BESTBUY_SELECTOR = ".item-price"
const EBAY_SELECTOR = "span#prcIsum"
const TARGET_SELECTOR = "span.offerPrice"
const FLIPKART_SELECTOR = "span.selling-price"

//const API_URL = "http://localhost:9000/api/crawl/allproducts"
const API_URL = "http://ec2-54-236-125-44.compute-1.amazonaws.com/api/crawl/allproducts"

type Product struct {
	Site     string
	Pid      string
	Title    string
	Price    float64
	Image    string
	Currency string
	Url      string
}

type UserProduct struct {
	Userid     int64
	Email      string
	Productids []string
}

type ApiResponse struct {
	Products []Product
	Mapping  []UserProduct
}

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

func crawlWebsite(url string) (price float64, err error) {
	website := getWebsite(url)
	if strings.Contains(website, "walmart") {
		price = GetPriceForWalmart(url)
	} else if strings.Contains(website, "bestbuy") {
		price = getPriceForSite(url, BESTBUY_SELECTOR)
	} else if strings.Contains(website, "target") {
		price = getPriceForSite(url, TARGET_SELECTOR)
	} else if strings.Contains(website, "ebay") {
		price = getPriceForSite(url, EBAY_SELECTOR)
	} else if strings.Contains(website, "flipkart") {
		price = getPriceForSite(url, FLIPKART_SELECTOR)
	} else {
		err = errors.New("Website not supported")
	}
	return price, err
}

func crawlWebsiteGroup(website string, products []Product, done chan<- bool) {
	log.Println("Starting crawl for:", website, "....")
	totalProducts := len(products)
	for i := range products {
		price, err := crawlWebsite(products[i].Url)
		if err != nil {
			log.Println("Unable to crawl website:", products[i].Url, err)
		}
		fmt.Printf("[%d/%d] %s, %s %f | %f\n", i+1, totalProducts,
			products[i].Site, products[i].Title[:15], products[i].Price, price)
		time.Sleep(2 * time.Second)
	}
	done <- true
}

func startCrawl() {
	resp, err := http.Get(API_URL)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)

	var apiResponse ApiResponse
	err = json.Unmarshal(body, &apiResponse)

	if err != nil {
		log.Fatal(err)
	}

	// aggregating over websites
	websiteGroup := make(map[string][]Product)
	for i := range apiResponse.Products {
		product := apiResponse.Products[i]
		curr := websiteGroup[product.Site]
		curr = append(curr, product)
		websiteGroup[product.Site] = curr
	}

	// crawl over diff websites concurrently
	done := make(chan bool, 4)
	for k, v := range websiteGroup {
		go crawlWebsiteGroup(k, v, done)
	}
	<-done
}

func main() {
	startCrawl()
}
