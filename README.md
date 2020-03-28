# node-twitter-scraper

A robust twitter scraper with node
Uses Puppeteer to mock a browser request with headless chrome.

Intercepts network request that calls API to twitter to retrieve responses, then uses initial request to generate new requests to get more tweets (pagination).
