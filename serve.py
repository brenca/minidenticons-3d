#!/usr/bin/env python3

import http.server
import socketserver

HOST = "localhost"
PORT = 8000


class HttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        "": "application/octet-stream",	
        ".css": "text/css",
        ".html": "text/html",
        ".jpg": "image/jpg",	
        ".js": "application/x-javascript",	
        ".min.js": "application/x-javascript",	
        ".json": "application/json",	
        ".manifest": "text/cache-manifest",	
        ".pdf": "application/pdf",	
        ".png": "image/png",	
        ".svg": "image/svg+xml",	
        ".wasm": "application/wasm",	
        ".xml": "application/xml",	
    }

    def version_string(self):
        return "Apache/1.3.0 (Win32)"

    def send_response_only(self, code, message=None):
        super().send_response_only(code, message)
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')


try:
    with socketserver.TCPServer((HOST, PORT), HttpRequestHandler) as httpd:
        print(f"serving at http://{HOST}:{PORT}")
        httpd.serve_forever()
except KeyboardInterrupt:
    pass