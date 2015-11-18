package main

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "hello world")
}

func main() {
	fmt.Println("hello world")
}
