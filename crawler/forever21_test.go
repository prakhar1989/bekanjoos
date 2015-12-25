package main

import "testing"

func TestForever21Prices(t *testing.T) {
	urls := []string{
		"http://www.forever21.com/Product/Product.aspx?BR=21men&Category=mens-main&ProductID=2000150051&VariantID=",
		"http://www.forever21.com/Product/Product.aspx?BR=21men&Category=mens-sweaters&ProductID=2000060922&VariantID=",
	}
	for _, url := range urls {
		price := GetPriceForForever21(url)
		if price == 0 {
			t.Errorf("Error in parsing. Expected non-zero price for " + url)
		}
	}

}
