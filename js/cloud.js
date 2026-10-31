import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const config = window.WEGYM_SUPABASE || {};
const status = document.getElementById('cloudStatus');
const form = document.getElementById('authForm');
const email = document.getElementById('authEmail');
const password = document.getElementById('authPassword');
const signout = document.getElementById('signOut');
const migrate = document.getElementById('importProgress');
const enabled = Boolean(config.url && config.anonKey);
const client = enabled ? createClient(config.url, config.anonKey) : null;
let user = null;
let busy = false;
const setStatus = message => { if (status) status.textContent = message; };
const localEntries = () => window.WEGYM_PROGRESS?.getLog() || [];
const setControls = () => {
  if (form) form.hidden = Boolean(user);
  const loginLink = document.getElementById('cloudLoginLink');
  if (loginLink) loginLink.hidden = Boolean(user);
  if (signout) signout.hidden = !user;
  if (migrate) migrate.hidden = !user;
};
const normalize = rows => rows.map(r => ({id:r.workout_id,date:r.workout_date}));
async function syncFromCloud() {
  if (!user) return;
  busy = true;
  try {
    const {data,error} = await client.from('workout_logs').select('workout_id,workout_date').eq('user_id',user.id);
    if (error) throw error;
    window.WEGYM_PROGRESS?.setLog(normalize(data || []));
    setStatus(`Signed in as ${user.email}. Progress synced to cloud.`);
  } catch(e) { setStatus(`Sync failed: ${e.message}`); }
  finally { busy = false; }
}
window.WEGYM_CLOUD = {
  get signedIn() { return Boolean(user); },
  get busy() { return busy; },
  async toggle(id,date,shouldAdd) {
    if (!user) return false;
    if (busy) return false;
    busy = true;
    try {
      const query = client.from('workout_logs');
      const {error} = shouldAdd
        ? await query.upsert({user_id:user.id,workout_id:id,workout_date:date},{onConflict:'user_id,workout_id,workout_date'})
        : await query.delete().eq('user_id',user.id).eq('workout_id',id).eq('workout_date',date);
      if (error) throw error;
      await syncFromCloud();
      return true;
    } catch(e) { setStatus(`Save failed: ${e.message}`); return false; }
    finally { busy = false; }
  },
  async reset() {
    if (!user || busy) return false;
    busy = true;
    try {
      const {error} = await client.from('workout_logs').delete().eq('user_id',user.id);
      if (error) throw error;
      window.WEGYM_PROGRESS?.setLog([]);
      setStatus('Cloud workout history deleted.');
      return true;
    } catch(e) { setStatus(`Reset failed: ${e.message}`); return false; }
    finally { busy = false; }
  }
};
if (!enabled) {
  setStatus('Cloud accounts need setup. See README.md. Your local workout tracker still works.');
} else {
  const {data:{session}} = await client.auth.getSession();
  user = session?.user || null;
  setControls();
  if (user) { await syncFromCloud(); if (form) { setStatus('Already signed in. Your account is connected.'); } }
  else setStatus(form ? 'Sign in or create an account to sync your progress.' : 'Progress is saved on this browser. Sign in to sync across devices.');
  client.auth.onAuthStateChange((_event,session) => {
    const nextUser = session?.user || null;
    if (nextUser?.id !== user?.id) {
      user = nextUser;
      setControls();
      if (user) setTimeout(syncFromCloud,0);
      else { window.WEGYM_PROGRESS?.setLog([]); setStatus('Signed out. Sign in to load your cloud progress.'); }
    }
  });
  form?.addEventListener('submit',async e => {
    e.preventDefault();
    const mode = form.dataset.mode;
    const credentials = {email:email.value.trim(),password:password.value};
    const {data,error} = mode === 'signup'
      ? await client.auth.signUp(credentials)
      : await client.auth.signInWithPassword(credentials);
    password.value = '';
    if (error) return setStatus(error.message);
    if (mode === 'signup' && !data.session) return setStatus('Account created. Check your email to confirm your account, then sign in.');
    setStatus('Success! Redirecting to workouts...');
    window.location.href = 'workout-videos.html';
  });
  signout?.addEventListener('click',async () => {
    const {error} = await client.auth.signOut();
    if (error) setStatus(error.message);
  });
  migrate?.addEventListener('click',async () => {
    if (!user || busy) return;
    const raw = JSON.parse(localStorage.getItem('wegym-workout-log-v2') || '[]');
    if (!Array.isArray(raw) || !raw.length) return setStatus('No local workout history found to import.');
    if (!confirm(`Import ${raw.length} local workout records into your account? Existing cloud records will be kept.`)) return;
    busy = true;
    try {
      const rows = raw.filter(x => /^WVID-\d+$/.test(x.id) && /^\d{4}-\d{2}-\d{2}$/.test(x.date))
        .map(x => ({user_id:user.id,workout_id:x.id,workout_date:x.date}));
      if (!rows.length) throw Error('No valid local records found.');
      const {error} = await client.from('workout_logs').upsert(rows,{onConflict:'user_id,workout_id,workout_date'});
      if (error) throw error;
      await syncFromCloud();
      setStatus(`Imported ${rows.length} local records. Cloud progress synced.`);
    } catch(e) { setStatus(`Import failed: ${e.message}`); }
    finally { busy = false; }
  });
}
