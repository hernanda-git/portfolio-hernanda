"""Audit the built HTML contract (no browser or network needed)."""
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json

root=Path(__file__).resolve().parents[1]
pub=root/'public'
catalog=json.loads((root/'data/catalog.json').read_text(encoding='utf-8'))
profile=json.loads((root/'data/profile.json').read_text(encoding='utf-8'))
stories=json.loads((root/'data/stories.json').read_text(encoding='utf-8'))

class Inspect(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.ids=[]; self.targets=[]; self.h1=0; self.lang=[]
        self.feed(text)
    def handle_starttag(self,tag,attrs):
        at=dict(attrs)
        if tag=='h1': self.h1+=1
        if tag=='html': self.lang.append(at.get('lang'))
        if at.get('id'): self.ids.append(at['id'])
        key='href' if tag in {'a','link'} else 'src' if tag in {'script','img','iframe'} else None
        if key and at.get(key): self.targets.append((tag,at[key]))
        assert not any(k.startswith('on') for k in at),at

def dest(path):
    path=(pub/unquote(path).strip('/')).resolve()
    assert path.is_relative_to(pub)
    return path/'index.html' if path.is_dir() else path

pages={file:Inspect(file.read_text(encoding='utf-8')) for file in pub.rglob('index.html')}
expect={pub/'index.html', *(dest(x) for x in ('/karya/','/atlas/','/tentang/','/kontak/')),
        *(dest('/karya/'+s['slug']) for s in stories),*(dest('/atlas/'+p['id'].lower()) for p in catalog)}
assert set(pages)==expect,(set(pages)-expect,expect-set(pages))
links=0
for file,parsed in pages.items():
    assert parsed.h1==1 and parsed.lang==['id'],file
    assert len(parsed.ids)==len(set(parsed.ids)),file
    for tag,target in parsed.targets:
        u=urlsplit(target)
        if u.scheme or u.netloc:
            assert tag=='a' and u.scheme in {'https','mailto'},target
            continue
        path=dest(u.path) if u.path else file
        assert path.is_file(),(file,target)
        if u.fragment: assert u.fragment in pages[path].ids,(file,target)
        links+=1

published=[]
for p in catalog:
    output=pages[dest('/atlas/'+p['id'].lower())]
    actual=[href for tag,href in output.targets if tag=='a' and urlsplit(href).netloc=='hernanda-git.github.io']
    assert actual==[s['href'] for s in p['pages']],p['id']
    published+=actual
assert len(set(published))==len(published)
assert len({p['id'] for p in catalog})==len(catalog)
assert len(profile['experience'])==len(set(x['id'] for x in profile['experience']))
asset_root=pub/'assets'
originals=[asset_root/(s['surface']+'.svg') for s in stories]+[asset_root/'refraction-print.svg']
assert len({sha256(x.read_bytes()).hexdigest() for x in originals})==len(originals)
assert not list(pub.rglob('*.webp')) and not list(pub.rglob('*.tsx'))
print(json.dumps({'html_routes':len(pages),'local_link_checks':links,'concepts':len(catalog),'distinct_external_demo_destinations':len(published),'artworks':len(originals)}))
