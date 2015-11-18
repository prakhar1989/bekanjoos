package main

import "testing"

func TestWalmartPrices(t *testing.T) {
	urls := []string{
		"http://www.walmart.com/ip/Marcy-Mini-Bike/17272594",
		"http://www.walmart.com/ip/Pot-Leaf-Hardwood-Cue-Pool-Stick/21810385",
		"http://www.walmart.com/ip/Lifetime-Double-Shot-Arcade-System/32682217",
	}

	for _, url := range urls {
		price := GetPriceForWalmart(url)
		if price == 0 {
			t.Errorf("Error in parsing. Expected non-zero price for " + url)
		}
	}
}
