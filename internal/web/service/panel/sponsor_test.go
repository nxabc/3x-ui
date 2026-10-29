package panel

import (
 "encoding/json"
 "errors"
 "net/http"
 "net/http/httptest"
 "net/url"
 "sync/atomic"
 "testing"
)

// A live local advertising server must receive zero requests in either mode.
func TestPrivacySponsorsNeverFetch(t *testing.T) {
 var hits atomic.Int32
 server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
  hits.Add(1)
  _, _ = w.Write([]byte("advertisement"))
 }))
 defer server.Close()
 // Trap actual HTTP attempts; redirect the default transport to the live server.
 oldTransport := http.DefaultTransport
 http.DefaultTransport = privacySponsorTransport{server.URL, oldTransport}
 defer func() { http.DefaultTransport = oldTransport }()
 for _, debug := range []string{"false", "true"} {
  t.Run(debug, func(t *testing.T) {
   t.Setenv("XUI_DEBUG", debug)
   svc := &PanelService{}
   for range 3 {
    list, err := svc.GetSponsors()
    if err != nil { t.Fatal(err) }
    body, err := json.Marshal(list)
    if err != nil || string(body) != `{"sponsors":[]}` { t.Fatalf("response = %s, %v", body, err) }
    for _, name := range []string{"acme.png", "../secret", "https://example.com/ad.png", ""} {
     data, contentType, err := svc.GetSponsorLogo(name)
     if len(data) != 0 || contentType != "" || !errors.Is(err, ErrSponsorLogoUnknown) {
      t.Fatalf("logo %q = %v, %q, %v", name, data, contentType, err)
     }
    }
   }
  })
 }
 if hits.Load() != 0 { t.Fatalf("advertising requests = %d", hits.Load()) }
}

type privacySponsorTransport struct {
 target string
 base http.RoundTripper
}

func (p privacySponsorTransport) RoundTrip(req *http.Request) (*http.Response, error) {
 clone := req.Clone(req.Context())
 target, err := url.Parse(p.target)
 if err != nil { return nil, err }
 clone.URL = target
 return p.base.RoundTrip(clone)
}

func TestPrivacyPanelUpdaterBlocked(t *testing.T) {
 svc := &PanelService{}
 for _, dev := range []bool{false, true} {
  id, err := svc.StartUpdateChannel(dev)
  if id != 0 || err == nil { t.Fatalf("update = %d, %v", id, err) }
 }
 path, err := downloadPanelUpdater()
 if path != "" || err == nil { t.Fatalf("download = %q, %v", path, err) }
}
