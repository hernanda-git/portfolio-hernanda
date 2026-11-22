from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
from sys import argv

class Preview(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('Referrer-Policy','strict-origin-when-cross-origin')
        super().end_headers()

if __name__=='__main__':
    root=Path(__file__).resolve().parent/'public'
    if not (root/'index.html').is_file(): raise SystemExit('Run: python build.py')
    port=int(argv[1]) if len(argv)>1 else 4186
    with ThreadingHTTPServer(('127.0.0.1',port),partial(Preview,directory=str(root))) as s:
        print(f'http://127.0.0.1:{port}/',flush=True)
        s.serve_forever()
