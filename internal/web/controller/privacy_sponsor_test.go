package controller

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestPrivacySponsorHTTP(t *testing.T) {
	engine := gin.New()
	NewIndexController(engine.Group("/"))
	server := httptest.NewServer(engine)
	defer server.Close()
	resp, err := http.Get(server.URL + "/sponsors")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	var result struct {
		Success bool `json:"success"`
		Obj struct {
			Sponsors []json.RawMessage `json:"sponsors"`
		} `json:"obj"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != http.StatusOK || !result.Success || result.Obj.Sponsors == nil || len(result.Obj.Sponsors) != 0 {
		t.Fatalf("unexpected sponsor response: status=%d result=%+v", resp.StatusCode, result)
	}
	logo, err := http.Get(server.URL + "/sponsors/logo/acme.png")
	if err != nil {
		t.Fatal(err)
	}
	defer logo.Body.Close()
	if logo.StatusCode != http.StatusNotFound {
		t.Fatalf("logo status = %d", logo.StatusCode)
	}
}
