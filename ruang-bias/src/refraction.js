const figure = document.querySelector('[data-refraction]');
if (figure) mount(figure);

function mount(figure) {
  const canvas=figure.querySelector('canvas'), slider=figure.querySelector('input');
  const context=canvas.getContext('2d');
  if (!context) return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const TAU=Math.PI*2;
  let width=0,height=0, phase=.48,target=.48, raf=0, drag=null;

  function trace(u, t, turn) {
    // Open, folded membrane: a saddle with a rolling central seam.
    const long=(t-.5)*3.8;
    const ripple=Math.sin(t*TAU*1.15+u*2.4);
    const x= u*(1.32+.30*Math.cos(t*TAU))+.54*ripple+.10*Math.sin(t*13+u*7);
    const y= long + .24*Math.cos(u*2.9+t*7)+.30*u*Math.sin(t*4);
    const depth=.87*Math.sin(u*2.8+t*4.65)+.39*Math.sin(t*10+u*2)+.31*Math.cos(u*6)*Math.sin(t*Math.PI);
    const cs=Math.cos(turn), sn=Math.sin(turn);
    const x1=x*cs+depth*sn, z1=depth*cs-x*sn;
    const s=-.32, z=z1*.947+y*s, y1=y*.947-z1*s;
    const twist=-.55, fx=x1*Math.cos(twist)-y1*Math.sin(twist), fy=x1*Math.sin(twist)+y1*Math.cos(twist);
    const scale=Math.min(width*.265,height*.242)*6.6/(6.6-z);
    return [width*.53+fx*scale,height*.51+fy*scale,z];
  }
  function draw() {
    if (!width || !height) return;
    context.clearRect(0,0,width,height);
    const turn=(phase-.48)*2.2;
    const profile=width<500?94:154;
    const depth=[];
    for(let i=0;i<profile;i++) {
      const u=i/(profile-1)*2-1;
      const pts=Array.from({length:96},(_,j)=>trace(u,j/95,turn));
      depth.push({line:pts,u,z:pts[52][2]});
    }
    depth.sort((a,b)=>a.z-b.z);
    // A single parallel sheet of filaments, lit across the diffraction seam.
    for(const {line,u} of depth) {
      for(let i=1;i<line.length;i+=3){
        const a=line[i-1], b=line[Math.min(i+2,line.length-1)];
        const t=i/line.length;
        const bounce=.5+.5*Math.sin(t*7.9+u*4.2-phase*3.1);
        const flare=Math.exp(-((t-(.6-phase*.22+u*.155))**2)*59);
        const light=.33+.42*bounce+.26*flare;
        const warm=Math.max(0,Math.min(1,(.7*flare+.66*Math.max(0,u)+.17*Math.cos(t*4+phase*6))));
        const blue=[69+71*light,93+82*light,155+92*light], copper=[255,105+125*light,62+99*light];
        const c=blue.map((v,k)=>Math.round(v*(1-warm)+copper[k]*warm));
        context.strokeStyle=`rgba(${c.join(',')},${.26+.71*light})`;
        context.lineWidth=.36+.73*light+(Math.abs(u)>.985?.62:0);
        context.beginPath(); context.moveTo(a[0],a[1]);
        for(let j=i;j<=i+2 && j<line.length;j++) context.lineTo(line[j][0],line[j][1]);
        context.stroke();
        if (b===line.at(-1)) break;
      }
    }
    figure.dataset.phase=phase.toFixed(3);
    figure.dataset.settled=String(phase===target);
    figure.setAttribute('data-ready','');
  }
  function size() {
    const r=canvas.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1);
    width=r.width; height=r.height;
    if(!width||!height)return;
    canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
    context.setTransform(canvas.width/width,0,0,canvas.height/height,0,0); draw();
  }
  function step(){
    raf=0;
    phase+=(target-phase)*.31;
    if(Math.abs(target-phase)<.006) phase=target;
    draw();
    if(phase!==target)raf=requestAnimationFrame(step);
  }
  function set(amount){
    target=Math.max(0,Math.min(1,amount));
    slider.value=Math.round(target*100);
    if(motion.matches){cancelAnimationFrame(raf);raf=0;phase=target;draw();}
    else if (!raf) raf=requestAnimationFrame(step);
  }
  function apply(event){
    const b=canvas.getBoundingClientRect(); set((event.clientX-b.left)/b.width);
  }
  slider.addEventListener('input',()=>set(Number(slider.value)/100));
  canvas.addEventListener('pointerdown',e=>{ if(!e.isPrimary||e.button!==0)return; drag=e.pointerId; canvas.setPointerCapture(drag);apply(e); });
  canvas.addEventListener('pointermove',e=>{if(e.pointerId===drag)apply(e);});
  canvas.addEventListener('lostpointercapture',()=>{drag=null;});
  motion.addEventListener('change',()=>set(target));
  new ResizeObserver(size).observe(canvas);
  size();
}
