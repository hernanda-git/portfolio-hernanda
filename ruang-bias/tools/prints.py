"""Three original abstract plates, authored specifically for the work index."""
from math import sin, cos, tau, pi, exp, sqrt
import random


def svg(out, key):
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="690" viewBox="0 0 1000 690">']
    def add(txt): parts.append(txt)
    def path(points, **attrs):
        coords = ' '.join(f'{x:.1f} {y:.1f}' for x,y in points)
        options = ' '.join(f'{k.replace("_", "-")}="{v}"' for k,v in attrs.items())
        add(f'<path d="M{coords}" {options}/>')
    if key == 'confluence':
        add('<rect width="1000" height="690" fill="#1f3ba6"/><circle cx="719" cy="323" r="207" fill="#e9a56d"/>')
        for i in range(54):
            points = []
            for j in range(181):
                t=j/180
                # Multiple channels compress to a narrow junction, then fan back out.
                x= -65+1130*t
                gap=142*abs(t-.64)**.93+9
                y=328+(i-26.5)*gap*.22 + 96*sin(t*5+i*.074) + 44*sin(t*10)*(1-t)
                points.append((x,y))
            path(points, fill='none',stroke=('#ffe6c6' if i%4==0 else '#0c205d' if i%3==0 else '#f6c59e'),stroke_width=(2 if i%6 else 3),opacity='.89')
        for i in range(18):
            x=507+i*12.6; y=603+8*sin(i/2)
            add(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="2.6" fill="#f6c59e"/>')
    elif key == 'branch':
        add('<rect width="1000" height="690" fill="#eebcbb"/>')
        rng=random.Random(931)
        for n in range(17):
            x=144+n*43.5; shift=rng.uniform(-28,30)
            for i in range(12):
                points=[]
                for j in range(91):
                    t=j/90; drift=sin(2.7*t+n*.45+shift*.025)
                    points.append((x+(i-5)*1.9+109*t*drift+shift, -40+790*t+11*cos(t*19+n)))
                path(points,fill='none',stroke=('#891e35' if i%4 else '#361627'),stroke_width=(1.5 if i<11 else 4))
        add('<path d="M0 298 Q335 112 1000 349 L1000 422 Q422 168 0 382Z" fill="#eebcbb"/>')
        for i in range(6):
            add(f'<path d="M0 {316+i*8} Q335 {132+i*6} 1000 {349+i*9}" fill="none" stroke="#9e344a" stroke-width="1"/>')
        add('<circle cx="510" cy="273" r="65" fill="#9e344a"/><circle cx="510" cy="273" r="53" fill="#eebcbb"/><circle cx="510" cy="273" r="42" fill="#9e344a"/>')
    else:
        add('<rect width="1000" height="690" fill="#f5cd77"/>')
        for n in range(36):
            ring=[]; r=25+8.8*n
            for j in range(231):
                t=tau*j/230
                bend=1 + .066*sin(3*t+n*.033) + .11*cos(t+n*.05) + .027*sin(8*t+n*.25)
                x= 521+cos(t)*r*1.41*bend+22*sin(n*.121); y=347+sin(t)*r*.83*bend+12*cos(n*.105)
                ring.append((x,y))
            path(ring,fill='none',stroke=('#623820' if n%3 else '#bb572b'),stroke_width=(2.5 if n%4 else 5))
        add('<path d="M637 0L690 0L351 690H298Z" fill="#f5cd77"/><path d="M674 0L689 0L350 690H337Z" fill="#a94f2b"/>')
        add('<circle cx="173" cy="169" r="8" fill="#623820"/><circle cx="812" cy="505" r="8" fill="#623820"/>')
    add('</svg>')
    out.write_text(''.join(parts),encoding='utf-8')


def refraction_print(out):
    """Still frame for browsers without a live canvas. Same surface and proportion."""
    width,height=800,570
    print_lines=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 570">','<rect width="800" height="570" fill="#161e3d"/>']
    for i in range(112):
        u=2*i/111-1
        strand=[]
        for j in range(96):
            t=j/95
            x=u*(1.32+.30*cos(t*tau))+.54*sin(t*tau*1.15+u*2.4)+.10*sin(t*13+u*7)
            y=(t-.5)*3.8 + .24*cos(u*2.9+t*7)+.30*u*sin(t*4)
            z=.87*sin(u*2.8+t*4.65)+.39*sin(t*10+u*2)+.31*cos(u*6)*sin(t*pi)
            depth=z*.947-.32*y
            vertical=y*.947+.32*z
            scale=min(width*.265,height*.242)*6.6/(6.6-depth)
            strand.append((width*.53+(x*cos(-.55)-vertical*sin(-.55))*scale,height*.51+(x*sin(-.55)+vertical*cos(-.55))*scale))
        for j in range(0,len(strand)-1,13):
            p=' '.join(f'{x:.1f} {y:.1f}' for x,y in strand[j:j+14])
            t=j/95
            heat=.5+.5*sin(t*7.9+u*4.2-1.49)
            color='#ffb381' if t>.37+.12*u and t<.61+.12*u else '#9aaff9'
            print_lines.append(f'<path d="M{p}" fill="none" stroke="{color}" stroke-width=".9" opacity="{.2+.65*heat:.2f}"/>')
    print_lines.append('</svg>')
    out.write_text(''.join(print_lines),encoding='utf-8')
