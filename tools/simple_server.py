#!/usr/bin/env python3
import http.server
import socketserver
import os

class CacheBustingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Resource-Policy', 'same-origin')
        
        # Content Security Policy
        csp = ("default-src 'self'; "
               "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://api.emailjs.com; "
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
               "img-src 'self' data: https: blob:; "
               "font-src 'self' https://fonts.gstatic.com; "
               "connect-src 'self' https://api.emailjs.com https://cdn.jsdelivr.net; "
               "frame-ancestors 'none'; "
               "base-uri 'self'; "
               "form-action 'self'; "
               "object-src 'none'; "
               "media-src 'self'; "
               "worker-src 'self' blob:; "
               "manifest-src 'self'")
        self.send_header('Content-Security-Policy', csp)
        
        # Cache headers
        if self.path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico')):
            # Static assets - cache for 1 year
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        elif self.path.endswith(('.html', '.htm')):
            # HTML files - short cache
            self.send_header('Cache-Control', 'public, max-age=3600')
        else:
            # Default cache-busting for development
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        super().end_headers()

if __name__ == "__main__":
    PORT = 8080
    
    # Change to build directory
    os.chdir('build')
    
    with socketserver.TCPServer(("", PORT), CacheBustingHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.shutdown()
