const link=document.querySelector('#atlas-back');
try {
  const previous=new URL(document.referrer);
  if(previous.origin===location.origin&&previous.pathname==='/atlas/'&&previous.search)link.href=previous.pathname+previous.search;
} catch { /* direct visit: retain the canonical Atlas link */ }
