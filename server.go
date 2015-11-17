package main

import (
	"fmt"
	"net/http"
)

//func getPriceForAmazon(url string) float64 {
//resp, err := http.Get(url)
//if err != nil {
//log.Fatal(err)
//}
//defer resp.Body.Close()

//z := html.NewTokenizer(resp.Body)
//for {
//tt := z.Next()
//switch {
//case tt == html.ErrorToken:
//return 2.0
//case tt == html.StartTagToken:
//t := z.Token()
//isSpan := t.Data == "span"
//if isSpan {
//for _, attr := range t.Attr {
//if attr.Key == "class" && strings.Contains(attr.Val, "a-size-medium a-color-price") {
//fmt.Println("here")
//return 0.0
//nxt := z.Next()
//if nxt == html.TextToken {
//t = z.Token()
//return parseCurrency(t.Data)
//}
//}
//}
//}
//}
//}
//}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "hello world")
}

func main() {
	//url := "http://www.amazon.in/gp/product/B00CE3FT66/ref=br_asw_pdt-4?pf_rd_m=A1VBAL9TL5WCBF&pf_rd_s=desktop-4&pf_rd_r=0AFE93WTE6Y3B705T6C9&pf_rd_t=36701&pf_rd_p=750594207&pf_rd_i=desktop"
	http.HandleFunc("/", handler)
	http.ListenAndServe(":3000", nil)

}
