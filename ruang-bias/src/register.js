const form=document.querySelector('.register-filters');
const rows=[...document.querySelectorAll('.concept-row')];
const count=document.querySelector('#result-count');
const clear=document.querySelector('#clear');
const empty=document.querySelector('#no-results');
const index=rows.map(row=>[row,fold(row.textContent)]);
const keys=['q','sector','platform'];
function fold(s){return s.toLowerCase().normalize('NFKD').replace(/\p{M}/gu,'');}
function read(){
  const query=new URLSearchParams(location.search);
  for(const key of keys)form.elements[key].value=query.get(key)??'';
}
function render(){
  const {q,sector,platform}=form.elements;
  const needles=fold(q.value.trim()).split(/\s+/).filter(Boolean);
  let visible=0;
  for(const [item,text] of index){
    const matches=(!sector.value||item.dataset.sector===sector.value)&&(!platform.value||item.dataset.platform===platform.value)&&needles.every(n=>text.includes(n));
    item.hidden=!matches;
    if(matches)visible++;
  }
  count.textContent=visible===rows.length?`${visible} konsep`:`${visible} dari ${rows.length} konsep`;
  empty.hidden=visible!==0;
  clear.hidden=!keys.some(k=>form.elements[k].value);
}
function update(){
  render();
  const params=new URLSearchParams();
  for(const k of keys)if(form.elements[k].value.trim())params.set(k,form.elements[k].value.trim());
  history.replaceState(history.state,'',location.pathname+(params.size?'?'+params:''));
}
function reset(){form.reset();update();form.elements.q.focus();}
form.addEventListener('input',update);
form.addEventListener('submit',e=>{e.preventDefault();update();});
clear.addEventListener('click',reset);
document.querySelector('#reset-empty').addEventListener('click',reset);
addEventListener('pageshow',()=>{read();render();});
read();render();form.hidden=false;
