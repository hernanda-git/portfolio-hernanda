"""Build standalone HTML pages from content-only records. Standard library only."""
from pathlib import Path
from html import escape
from urllib.parse import urlsplit
import json
import shutil
from tools.prints import svg, refraction_print

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'public'
DATA = ROOT / 'data'

def data(name): return json.loads((DATA/f'{name}.json').read_text(encoding='utf-8'))
profile, stories, catalog = (data(k) for k in ('profile','stories','catalog'))
name = profile['name']
def e(x): return escape(str(x), quote=True)
icon = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4.5 12h14m-5.5-5.5 5.5 5.5-5.5 5.5"/></svg>'
exit_icon = '<svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 18 18 6M8 6h10v10"/></svg>'
nav = [('Karya','/karya/'),('Atlas','/atlas/'),('Tentang','/tentang/'),('Kontak','/kontak/')]

def header(active):
    links = ''.join(f'<a href="{href}"'+(' aria-current="page"' if href==active else '')+f'>{label}</a>' for label,href in nav)
    return f'<header class="top"><div class="frame top-inner"><a class="mark" href="/" aria-label="Beranda {e(name)}"><img src="/assets/mark.svg" alt="" width="35" height="35"><span>Hernanda</span></a><nav aria-label="Menu utama">{links}</nav></div></header>'

def foot():
    return f'<footer class="foot"><div class="frame foot-inner"><span>{e(name)} <span class="foot-place">· Jakarta, Indonesia</span></span><a href="/kontak/">Kontak {exit_icon}</a></div></footer>'

def page(title,desc,active,body,script=None,home=False):
    js = f'<script type="module" src="/{e(script)}"></script>' if script else ''
    return f'''<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{e(desc)}"><title>{e(title)}</title><link rel="icon" type="image/svg+xml" href="/assets/mark.svg"><link rel="preload" href="/assets/bricolage-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/site.css">{js}</head>
<body{' class="home"' if home else ''}><a class="skip" href="#main">Lewati ke isi</a>{header(active)}<main id="main" tabindex="-1">{body}</main>{foot()}</body></html>'''

def write(url, doc):
    dest = (OUT / url.strip('/') / 'index.html').resolve()
    if not dest.is_relative_to(OUT): raise ValueError(url)
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(doc,encoding='utf-8')

def ep(title, eyebrow, lead, attr=''):
    return f'<header class="frame page-heading" {attr}><p class="eyebrow">{e(eyebrow)}</p><h1>{title}</h1><p class="page-lead">{e(lead)}</p></header>'

def study_tiles():
    return ''.join(f'''<article class="work-plate plate-{i+1}"><a href="/karya/{e(s['slug'])}/">
       <figure><img src="/assets/{e(s['surface'])}.svg" alt="" width="1000" height="690" decoding="async"></figure>
       <div class="work-record"><span class="catalog-no">{e(s['number'])}</span><div><p class="work-field">{e(s['field'])}</p><h3>{e(s['title'])}</h3><p>{e(s['line'])}</p></div><span class="work-arrow">{icon}</span></div>
       </a></article>''' for i,s in enumerate(stories))

def home():
    work = study_tiles()
    return f'''<section class="projection" aria-labelledby="main-title">
  <div class="frame projection-grid">
    <header class="signature">
      <p class="eyebrow">Software engineer &amp; solution architect</p>
      <h1 id="main-title">Muhammad<br> Hernanda<span>.</span></h1>
      <p class="hero-text">Saya membangun perangkat lunak dari laporan gudang di 18 cabang hingga kas RT yang bisa dibaca dari ponsel.</p>
      <a class="hero-link" href="#selected">Jelajahi karya <span>{icon}</span></a>
    </header>
    <figure class="refraction" data-refraction aria-labelledby="refraction-name">
      <div class="projection-field"><canvas aria-hidden="true"></canvas></div>
      <figcaption class="projection-caption"><div><span class="projection-caption-no" aria-hidden="true">FIG. 01</span><strong id="refraction-name">Ruang Bias</strong><span class="projection-caption-kind">Seret gambar untuk membelokkan cahaya.</span><span class="projection-caption-static">Cetak cahaya.</span></div>
      <div class="refraction-control"><label for="bend">Geser cahaya</label><input id="bend" type="range" min="0" max="100" value="48" aria-label="Geser cahaya"></div></figcaption>
    </figure>
  </div>
</section>
<section id="selected" class="frame selected" aria-labelledby="selected-title">
  <header class="section-title"><div><p class="eyebrow">Pengalaman produksi</p><h2 id="selected-title">Pilihan karya</h2></div><a class="text-link" href="/karya/">Indeks karya {icon}</a></header>
  <div class="works-layout">{work}</div>
</section>
<section class="atlas-door" aria-labelledby="atlas-door-title"><div class="frame atlas-door-inner"><div><p class="eyebrow">Terpisah dari pekerjaan produksi</p><h2 id="atlas-door-title">Atlas<br>Konsep.</h2></div><div><p>Telusuri gagasan produk digital untuk Indonesia. Baca konteksnya, pilih satu alur, lalu buka demonya dengan data contoh.</p><a class="solid-link" href="/atlas/">Jelajahi {len(catalog)} konsep {icon}</a></div></div></section>'''

def work_index():
    return ep('Pekerjaan yang<br>saya bangun.','Indeks karya','Tiga pekerjaan produksi, dilihat dari keputusan yang harus diambil orang yang memakainya.')+f'<section aria-label="Studi kasus" class="frame works-layout work-index">{study_tiles()}</section>'

def story_page(s,index):
    sections = ''.join(f'<section><h2>{e(t)}</h2><p>{e(d)}</p></section>' for t,d in s['sections'])
    nxt = stories[(index+1)%len(stories)]
    return f'''<article class="case">
    <header class="frame case-head"><a class="text-link" href="/karya/">Semua karya</a><div class="case-heading"><div><p class="eyebrow">Studi {e(s['number'])} · {e(s['field'])}</p><h1>{e(s['title'])}</h1></div><p class="case-pitch">{e(s['line'])}</p></div></header>
    <figure class="frame case-print"><img width="1000" height="690" src="/assets/{e(s['surface'])}.svg" alt="" decoding="async"><figcaption>Ilustrasi abstrak untuk studi ini, bukan tampilan produksi.</figcaption></figure>
    <div class="frame case-grid"><aside><p class="eyebrow">Pekerjaan produksi</p><p>{e(s['company'])}</p><a class="text-link" href="/tentang/#riwayat">Riwayat karier {icon}</a></aside><div class="reading"><p class="opener">{e(s['opening'])}</p>{sections}</div></div>
    <div class="frame next-study"><div><p class="eyebrow">Karya berikutnya</p><a href="/karya/{e(nxt['slug'])}/">{e(nxt['title'])} {icon}</a></div></div></article>'''

def catalog_page():
    sectors={p['sector']:p['sectorName'] for p in catalog}
    options=''.join(f'<option value="{e(k)}">{e(label)}</option>' for k,label in sorted(sectors.items(),key=lambda x:x[1].casefold()))
    listing=''.join(f'''<li class="concept-row" data-sector="{e(p['sector'])}" data-platform="{e(p['platform'])}"><span class="catalog-no">{e(p['id'])}</span><div class="concept-name"><h2><a href="/atlas/{e(p['id'].lower())}/">{e(p['name'])} {icon}</a></h2><p>{e(p['subject'])}</p></div><div class="concept-category"><span>{e(p['sectorName'])}</span><span>{e(p['platform'])}</span></div></li>''' for p in catalog)
    platforms=''.join(f'<option>{e(k)}</option>' for k in sorted({p['platform'] for p in catalog}))
    return ep('Atlas Konsep.','Katalog produk digital Indonesia','Semua entri di sini adalah konsep. Demo memakai data contoh, terpisah dari sistem produksi.')+f'''<section class="frame register" aria-label="Katalog konsep">
    <form class="register-filters" action="/atlas/" role="search" aria-label="Cari konsep" hidden>
    <div class="register-field"><label for="query">Nama atau kata kunci</label><input id="query" type="search" name="q" placeholder="Contoh: QRIS, gudang, ID-011" autocomplete="off"></div>
    <div class="register-field"><label for="sector">Sektor</label><select id="sector" name="sector"><option value="">Semua sektor</option>{options}</select></div>
    <div class="register-field"><label for="platform">Platform</label><select id="platform" name="platform"><option value="">Semua platform</option>{platforms}</select></div>
    </form><div class="register-head"><p role="status" id="result-count">{len(catalog)} konsep</p><button class="text-button" type="button" id="clear" hidden>Hapus filter</button></div>
    <div id="no-results" hidden><h2>Tidak ada konsep yang cocok.</h2><p>Coba nama produk, ID, atau kata kunci yang lebih pendek.</p><button type="button" class="text-button" id="reset-empty">Tampilkan semua konsep</button></div>
    <ul id="concepts" role="list">{listing}</ul></section>'''

def detail(p):
    def demo_link(s, i):
        u=urlsplit(s['href'])
        if u.scheme!='https' or u.netloc!='hernanda-git.github.io' or not u.path.startswith('/portfolio-hernanda/'): raise ValueError(s['href'])
        return f'<li><a href="{e(s["href"])}"><span class="catalog-no">{i:02d}</span><span>{e(s["title"])}</span>{exit_icon}</a></li>'
    links=''.join(demo_link(s,i) for i,s in enumerate(p['pages'],1))
    return f'''<article><header class="frame detail-heading"><a href="/atlas/" class="text-link" id="atlas-back">Kembali ke Atlas</a><p class="eyebrow">{e(p['id'])} / {e(p['sectorName'])}</p><h1>{e(p['name'])}</h1><p class="page-lead">{e(p['subject'])}</p></header>
      <div class="frame detail-grid"><aside><p class="eyebrow">Konsep · data contoh</p><dl><div><dt>Platform</dt><dd>{e(p['platform'])}</dd></div><div><dt>Pengguna yang dituju</dt><dd>{e(p['audience'])}</dd></div></dl></aside>
      <section aria-labelledby="demo-title"><h2 id="demo-title">Buka layar demo</h2><p>Tautan mengarah ke demo yang menjadi bagian dari konsep ini.</p><ol class="demo-links" role="list">{links}</ol></section></div></article>'''

def about():
    rows=''.join(f'<li id="{e(p["id"])}"><p>{e(p["period"])}</p><div><h3>{e(p["role"])}</h3><p>{e(p["company"])}</p></div></li>' for p in profile['experience'])
    return ep('Tentang Hernanda.','Jakarta, Indonesia','Saya bekerja di antara implementasi, arsitektur, dan operasi. Saya tertarik pada perangkat lunak yang memperjelas apa yang perlu dilakukan orang berikutnya.')+f'<section class="frame timeline" id="riwayat" aria-labelledby="timeline-title"><div><p class="eyebrow">Berdasarkan riwayat karier</p><h2 id="timeline-title">Riwayat kerja</h2></div><ol role="list">{rows}</ol></section>'

def contact():
    mail=e(profile['email']); web=urlsplit(profile['linkedin'])
    if web.scheme!='https' or web.netloc not in {'www.linkedin.com','linkedin.com'}: raise ValueError('Invalid contact link')
    return ep('Ceritakan pekerjaan<br>yang perlu dibangun.','Kontak','Kirim masalahnya, siapa yang akan memakai sistemnya, dan keputusan apa yang sedang Anda pertimbangkan.')+f'<section class="frame channels" aria-label="Saluran kontak"><a href="mailto:{mail}"><span>Email</span><strong>{mail}</strong>{exit_icon}</a><a href="{e(profile["linkedin"])}"><span>LinkedIn</span><strong>Profil profesional</strong>{exit_icon}</a></section>'

if __name__=='__main__':
    OUT.mkdir(exist_ok=True)
    shutil.copytree(ROOT/'src',OUT,dirs_exist_ok=True)
    for story in stories: svg(OUT/'assets'/f'{story["surface"]}.svg',story['surface'])
    refraction_print(OUT/'assets'/'refraction-print.svg')
    write('/',page(name+' — Portofolio', 'Karya rekayasa perangkat lunak dan Atlas Konsep Muhammad Hernanda.',None,home(),'refraction.js',True))
    write('/karya/',page('Karya — '+name,'Tiga studi pekerjaan produksi.','/karya/',work_index()))
    for i,s in enumerate(stories): write('/karya/'+s['slug']+'/',page(s['title']+' — '+name,s['line'],'/karya/',story_page(s,i)))
    write('/atlas/',page('Atlas Konsep — '+name,'Katalog konsep produk digital Indonesia.','/atlas/',catalog_page(),'register.js'))
    for p in catalog: write('/atlas/'+p['id'].lower()+'/',page(p['name']+' — Atlas Konsep',p['subject'],'/atlas/',detail(p),'return.js'))
    write('/tentang/',page('Tentang — '+name,'Riwayat kerja Muhammad Hernanda.','/tentang/',about()))
    write('/kontak/',page('Kontak — '+name,'Hubungi Muhammad Hernanda.','/kontak/',contact()))
    print(f'{len(list(OUT.rglob("index.html")))} HTML pages · {len(catalog)} concepts · {sum(len(p["pages"]) for p in catalog)} outgoing demo routes')
