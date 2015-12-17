package main

import (
  //."crawl.go"
	"fmt"
)


func main(){
  var target = getWebsite("http://www.target.com/p/durban-one-1-speed-folding-bike-grey/-/A-17241916#prodSlot=_1_1")
  var amazon = getWebsite("hhttp://www.amazon.com/gp/product/B00LIPETS0/ref=s9_simh_gw_p193_d0_i3?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=desktop-1&pf_rd_r=0CNEJGWQ0BFN0KKQSZ0S&pf_rd_t=36701&pf_rd_p=2253014322&pf_rd_i=desktop")
  var bestbuy = getWebsite("http://www.bestbuy.com/site/apple-apple-watch-sport-42mm-space-gray-aluminum-case-space-gray-sports-band/4274802.p?id=1219733906250&skuId=4274802")
  var flipkart = getWebsite("http://www.flipkart.com/gritstones-full-sleeve-solid-men-s-sweatshirt/p/itmdrwgffw49aymq?pid=SWSDRWGYTF2SYQCQ&al=8UejgCmgy22rREgrRauIMsldugMWZuE7eGHgUTGjVrq34eb4hWsJ%2Fc0O9f9Ma1qzB7QC1N9M%2B0c%3D&ref=L%3A-2230074855024737552&srno=b_2&findingMethod=hp_mod")
  fmt.Println(result)
}
