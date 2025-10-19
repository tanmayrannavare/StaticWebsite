const ADMIN_KEY = 'matchState';
const SCORE_KEY = 'matchScores';
const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('match-updates') : null;

const adminAreas = document.getElementById('admin-areas');
const loginBox = document.getElementById('login-box');
const adminRoot = document.getElementById('admin-root');
const loginBtn = document.getElementById('login-btn');
const loginMsg = document.getElementById('login-msg');
const logoutBtn = document.getElementById('logout-btn');

function loadState(){
  const raw = localStorage.getItem(ADMIN_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveState(state){
  localStorage.setItem(ADMIN_KEY, JSON.stringify(state));
  if(bc) bc.postMessage({type:'state', state});
}

function loadScores(){
  return JSON.parse(localStorage.getItem(SCORE_KEY) || '{}');
}

function saveScores(scores){
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
  if(bc) bc.postMessage({type:'score', scores});
}

function ensureStateFromJsonThenRender(){
  const existing = loadState();
  if(existing){
    renderAdmin(existing);
    return;
  }
  // fallback load players.json once to initialize state
  fetch('data/players.json').then(r=>r.json()).then(json=>{
    const init = { teams: json.teams };
    saveState(init);
    renderAdmin(init);
  }).catch(err=>{
    adminAreas.innerHTML = '<p class="subtle">Failed to load data/players.json</p>';
    console.error(err);
  });
}

function renderAdmin(state){
  adminAreas.innerHTML = '';
  state.teams.forEach(team=>{
    const teamDiv = document.createElement('div');
    teamDiv.className = 'team-admin';
    teamDiv.innerHTML = `<h3>${team.name}</h3><div id="players-${team.name}"></div>`;
    adminAreas.appendChild(teamDiv);
    const list = teamDiv.querySelector(`#players-${team.name}`);
    list.innerHTML = team.players.map((p, idx) => `
      <div class="player-row" data-team="${team.name}" data-idx="${idx}">
        <img src="${p.image || 'https://avatars.dicebear.com/api/identicon/' + encodeURIComponent(p.name) + '.svg'}" alt="${p.name}" />
        <div>
          <strong>${p.name}</strong>
          <div class="subtle">${p.role} — ${p.isPlaying ? 'Playing' : 'Substitute'}</div>
        </div>
        <div class="controls">
          <label><input type="checkbox" class="playing-checkbox" ${p.isPlaying ? 'checked' : ''}/> Playing</label>
          <button class="injured-btn">${p.isPlaying ? 'Mark injured / Replace' : 'Mark injured'}</button>
        </div>
      </div>
    `).join('');
  });

  // attach handlers
  adminAreas.querySelectorAll('.playing-checkbox').forEach(cb=>{
    cb.addEventListener('change', (ev)=>{
      const row = ev.target.closest('.player-row');
      const teamName = row.dataset.team;
      const idx = Number(row.dataset.idx);
      const st = loadState();
      const team = st.teams.find(t=>t.name===teamName);
      team.players[idx].isPlaying = ev.target.checked;
      saveState(st);
      renderAdmin(st);
    });
  });

  adminAreas.querySelectorAll('.injured-btn').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      const row = ev.target.closest('.player-row');
      const teamName = row.dataset.team;
      const idx = Number(row.dataset.idx);
      const st = loadState();
      const team = st.teams.find(t=>t.name===teamName);
      // if player is playing, prompt to pick a substitute to promote
      if(team.players[idx].isPlaying){
        // collect subs
        const subs = team.players.map((p,i)=>({p,i})).filter(x=>!x.p.isPlaying);
        if(subs.length === 0){
          alert('No substitutes available to promote.');
          return;
        }
        const choices = subs.map(s => `${s.i}: ${s.p.name}`).join('\n');
        const sel = prompt('Select substitute index to promote:\n' + choices);
        const selIdx = Number(sel);
        const chosen = subs.find(s => s.i === selIdx);
        if(!chosen){
          alert('Invalid selection.');
          return;
        }
        // swap: playing -> sub, chosen sub -> playing
        team.players[idx].isPlaying = false;
        team.players[chosen.i].isPlaying = true;
        saveState(st);
        renderAdmin(st);
        return;
      } else {
        // marking a substitute injured - just annotate description
        team.players[idx].desc = (team.players[idx].desc || '') + ' (Injured)';
        saveState(st);
        renderAdmin(st);
      }
    });
  });
}

// SCORE form handling (admin)
function setupScoreForm(){
  const form = document.getElementById('admin-score-form');
  if(!form) return;
  form.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const team = document.getElementById('admin-score-team').value;
    const runs = Number(document.getElementById('admin-score-runs').value);
    const wk = Number(document.getElementById('admin-score-wk').value);
    const overs = document.getElementById('admin-score-overs').value;
    const payload = { team, runs, wk, overs, ts: Date.now() };
    const scores = loadScores();
    scores[team] = payload;
    saveScores(scores);
    alert('Score updated and broadcast to viewers.');
  });
}

// simple client-side auth (NOT secure for production)
const VALID_USER = 'admin';
const VALID_PASS = 'admin@123';

function showAdminArea(){
  loginBox.classList.add('hidden');
  adminRoot.classList.remove('hidden');
  ensureStateFromJsonThenRender();
  setupScoreForm();
}

function logout(){
  adminRoot.classList.add('hidden');
  loginBox.classList.remove('hidden');
}

loginBtn.addEventListener('click', ()=>{
  const u = document.getElementById('admin-user').value.trim();
  const p = document.getElementById('admin-pass').value;
  if(u === VALID_USER && p === VALID_PASS){
    loginMsg.textContent = '';
    showAdminArea();
  } else {
    loginMsg.textContent = 'Invalid credentials';
  }
});

logoutBtn.addEventListener('click', ()=>{
  logout();
});

// respond to broadcasts from other tabs (viewer/admin)
if(bc){
  bc.onmessage = (ev) => {
    if(ev.data && ev.data.type === 'state'){
      // keep in sync
      localStorage.setItem(ADMIN_KEY, JSON.stringify(ev.data.state));
      renderAdmin(ev.data.state);
    } else if(ev.data && ev.data.type === 'score'){
      localStorage.setItem(SCORE_KEY, JSON.stringify(ev.data.scores));
      // if admin is logged in, nothing else needed; viewers will update
    }
  };
}

// also respond to storage events (other tab wrote)
window.addEventListener('storage', (e)=>{
  if(e.key === ADMIN_KEY){
    const s = loadState();
    if(s) renderAdmin(s);
  }
  if(e.key === SCORE_KEY){
    // scores changed in another tab
  }
});

// init: only prepare login UI; actual render happens after login