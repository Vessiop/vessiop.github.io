

/* Termion — navigation des classes classiques V2 (progressive enhancement, isolé) */
(() => {
  'use strict';
  const start = () => {
    const nav = document.querySelector('body.termion-classic-v2 .tv-nav');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const entries = links.map(link => {
      const id = link.getAttribute('href').slice(1);
      return {link,section:document.getElementById(id)};
    }).filter(item => item.section);
    const activate = target => {
      entries.forEach(({link,section}) => {
        if (section===target) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    };
    if (typeof IntersectionObserver === 'function') {
      const observer = new IntersectionObserver(records => {
        const visible=records.filter(r=>r.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
        if (visible.length) activate(visible[0].target);
      },{rootMargin:'-15% 0px -70% 0px',threshold:0});
      entries.forEach(({section})=>observer.observe(section));
    }
    links.forEach(link=>link.addEventListener('click',event=>{
      const id=link.getAttribute('href').slice(1),target=document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const top=target.getBoundingClientRect().top+window.scrollY-nav.getBoundingClientRect().height-22;
      window.scrollTo({top:Math.max(0,top),behavior:reduced?'instant':'smooth'});
      if (history.replaceState) history.replaceState(null,'','#'+encodeURIComponent(id));
      activate(target);
    }));
    if(entries.length) activate(entries[0].section);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
