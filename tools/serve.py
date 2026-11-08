"""Dev server dengan fallback SPA:  python3 tools/serve.py [port]"""
import http.server, sys, os
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        p = self.path.split('?')[0]
        if not Path(ROOT, p.lstrip('/')).exists() and '.' not in p.rsplit('/', 1)[-1]:
            self.path = '/index.html'
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache'); super().end_headers()
http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1]) if len(sys.argv) > 1 else 8123), H).serve_forever()
