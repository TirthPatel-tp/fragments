# File: tests/integration/404.hurl

GET http://localhost:8080/no-such-route

# Expecting a 404 response
HTTP/1.1 404 
