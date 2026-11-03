// Uses the same local workout log as the WEGYM prestige system.
(function () {
  const key = 'wegym-workout-log-v2';
  const buttons = [...document.querySelectorAll('.calisthenics-log-btn')];
  function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function read() { try { const v=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(v)?v:[]; } catch { return []; } }
  function refresh() { const log=read(),date=today(); buttons.forEach(b=>{const done=log.some(x=>x.id===b.dataset.workoutId&&x.date===date);b.textContent=done?'✓ Logged today (undo)':'Log today’s workout';b.setAttribute('aria-pressed',String(done));}); }
  buttons.forEach(b=>b.addEventListener('click',async()=>{
    const date=today(),id=b.dataset.workoutId,log=read(),done=log.some(x=>x.id===id&&x.date===date);
    if(window.WEGYM_CLOUD?.signedIn && typeof window.WEGYM_CLOUD.toggle==='function') { try { await window.WEGYM_CLOUD.toggle(id,date,!done); refresh(); } catch(e) { alert('Could not save workout. Try again.'); } return; }
    const updated=done?log.filter(x=>!(x.id===id&&x.date===date)):[...log,{id,date}];
    try { localStorage.setItem(key,JSON.stringify(updated)); refresh(); } catch(e) { alert('Could not save workout in this browser.'); }
  }));
  refresh();
})();
