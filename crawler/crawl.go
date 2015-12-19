package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ses"
)

// SELECTORS
const BESTBUY_SELECTOR = ".item-price"
const EBAY_SELECTOR = "span#prcIsum"
const TARGET_SELECTOR = "span.offerPrice"
const FLIPKART_SELECTOR = "span.selling-price"

//const API_URL = "http://localhost:9000/api/crawl/allproducts"
const API_URL = "http://ec2-54-236-125-44.compute-1.amazonaws.com/api/crawl/allproducts"

// time delay between crawls to a website (seconds)
const TIME_DELAY = 2

// init the SES service
var sesSvc *ses.SES

func init() {
	sesSvc = ses.New(session.New(), aws.NewConfig().WithRegion("us-east-1"))
}

type Product struct {
	Site     string
	Pid      string
	Title    string
	Price    float64
	Image    string
	Currency string
	Url      string
	NewPrice float64
}

type UserProduct struct {
	Userid     int64
	Email      string
	Productids []string
	ProductSet *StringSet
}

type ApiResponse struct {
	Products []Product
	Mapping  []UserProduct
}

// creating a simple struct type
type StringSet struct {
	set map[string]bool
}

func NewStringSet() *StringSet {
	return &StringSet{make(map[string]bool)}
}

func (set *StringSet) Add(s string) bool {
	_, found := set.set[s]
	set.set[s] = true
	return !found
}

func (set *StringSet) Has(s string) bool {
	_, found := set.set[s]
	return found
}

func (set *StringSet) Remove(s string) {
	delete(set.set, s)
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

func crawlWebsiteGroup(website string, products []Product, ch chan<- []Product) {
	log.Println("Starting crawl for:", website, "....")
	totalProducts := len(products)
	var filterProducts []Product
	for i := range products {
		price, err := crawlWebsite(products[i].Url)
		if err != nil {
			log.Println("Unable to crawl website:", products[i].Url, err)
		}
		// TODO: Remove condition on website - for debugging only
		products[i].NewPrice = price
		if price < products[i].Price || products[i].Site == "Ebay" {
			filterProducts = append(filterProducts, products[i])
		}

		fmt.Printf("[%d/%d] %s, %s %f | %f\n", i+1, totalProducts,
			products[i].Site, products[i].Title[:15], products[i].Price, price)
		time.Sleep(TIME_DELAY * time.Second)
	}
	ch <- filterProducts
}

func (m *UserProduct) createProductSet() {
	m.ProductSet = NewStringSet()
	for i := range m.Productids {
		m.ProductSet.Add(m.Productids[i])
	}
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

	// initializing sets on the mapping
	for i := range apiResponse.Mapping {
		apiResponse.Mapping[i].createProductSet()
	}

	log.Println("Total products to crawl:", len(apiResponse.Products))
	websiteGroup := make(map[string][]Product)
	for i := range apiResponse.Products {
		product := apiResponse.Products[i]
		curr := websiteGroup[product.Site]
		curr = append(curr, product)
		websiteGroup[product.Site] = curr
	}

	ch := make(chan []Product)
	var changedProducts []Product

	// crawl over diff websites concurrently
	for k, v := range websiteGroup {
		go crawlWebsiteGroup(k, v, ch)
	}
	// aggregate results
	for i := 0; i < len(websiteGroup); i++ {
		products := <-ch
		changedProducts = append(changedProducts, products...)
	}

	// begin collecting users to be notified
	usersNotify := make(map[string][]Product)
	for i := range apiResponse.Mapping {
		m := apiResponse.Mapping[i]
		for j := range changedProducts {
			p := changedProducts[j]
			if m.ProductSet.Has(p.Pid) {
				usersNotify[m.Email] = append(usersNotify[m.Email], p)
			}
		}
	}

	for k, v := range usersNotify {
		//content := generateEmailContent(v)
		//err := ioutil.WriteFile(k+".html", []byte(content), 0644)
		//if err != nil {
		//fmt.Printf("error writing to file\n")
		//}
		sendEmailToUser(k, generateEmailContent(v))
	}

}

type EmailData struct {
	Count    int
	Products []Product
}

func generateEmailContent(products []Product) (text string) {
	var doc bytes.Buffer
	t, _ := template.ParseFiles("email.html")
	data := &EmailData{Count: len(products), Products: products}
	t.Execute(&doc, data)
	return doc.String()
}

func sendEmailToUser(email string, text string) {
	params := &ses.SendEmailInput{
		Destination: &ses.Destination{
			ToAddresses: []*string{
				aws.String(email),
			},
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Html: &ses.Content{
					Data: aws.String(text),
				},
			},
			Subject: &ses.Content{
				Data: aws.String("Notification from BeKanjoos"),
			},
		},
		Source: aws.String("prakhar@prakhar.me"),
	}
	resp, err := sesSvc.SendEmail(params)
	if err != nil {
		log.Println("Unable to send email")
	}
	log.Println("Email send with id", resp)
}

func main() {
	startCrawl()
}
