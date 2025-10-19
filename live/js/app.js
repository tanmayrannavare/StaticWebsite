const DATA_URL = 'data/players.json';
const STATE_KEY = 'matchState';
const teamsEl = document.getElementById('teams');
const scoreForm = document.getElementById('score-form');
const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('match-updates') : null;

let state = { teams: [] };

function avatarUrl(name){
  return `https://avatars.dicebear.com/api/identicon/${encodeURIComponent(name)}.svg`;
}

function loadState(){
  const raw = localStorage.getItem(STATE_KEY);
  if(raw) return JSON.parse(raw);
  return null;
}

function saveStateToStorage(s){
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
  if(bc) bc.postMessage({type:'state', state:s});
}

function initStateFromJsonIfNeeded(){
  const existing = loadState();
  if(existing){
    state = existing;
    render();
    return;
  }
  // initial fetch
  fetch(DATA_URL).then(r => r.json()).then(json => {
    state = { teams: json.teams };
    saveStateToStorage(state);
    render();
  }).catch(err => {
    console.error('Failed to load players.json', err);
    teamsEl.innerHTML = '<p class="subtle">Failed to load player data. Make sure you are serving the files via a local server.</p>';
  });
}

function render(){
  teamsEl.innerHTML = '';
  state.teams.forEach(team => {
    const teamDiv = document.createElement('div');
    teamDiv.className = 'team';
    teamDiv.innerHTML = `
      <h2>${team.name}</h2>
      <div class="role-toggle">
        <button class="btn-toggle" data-team="${team.name}" data-show="playing">Playing XI</button>
        <button class="btn-toggle" data-team="${team.name}" data-show="subs">Substitutes</button>
      </div>
      <div class="cards" id="cards-${team.name}"></div>
    `;
    teamsEl.appendChild(teamDiv);
    renderCards(team.name, 'playing');
  });

  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const teamName = btn.dataset.team;
      const show = btn.dataset.show;
      renderCards(teamName, show);
    });
  });

  updateScoreboardFromStorage();
}

function renderCards(teamName, show){
  const cardsEl = document.getElementById(`cards-${teamName}`);
  const team = state.teams.find(t => t.name === teamName);
  if(!team) return;
  let players;
  if(show === 'playing'){
    players = team.players.filter(p => p.isPlaying);
  }else{
    players = team.players.filter(p => !p.isPlaying);
  }
  cardsEl.innerHTML = players.map(p => `
    <div class="card">
      <img src="${p.image || avatarUrl(p.name)}" alt="${p.name}" />
      <div class="meta">
        <h3>${p.name} <span class="subtle">(${p.role})</span></h3>
        <div class="badge">${p.isPlaying ? 'Playing' : 'Substitute'}</div>
        <p>${p.desc || ''}</p>
      </div>
    </div>
  `).join('');
}

// listen to broadcasts or storage events to update UI when admin makes changes
if(bc){
  bc.onmessage = (ev) => {
    if(ev.data && ev.data.type === 'state'){
      state = ev.data.state;
      saveStateToStorage(state); // ensure localStorage is updated
      render();
    }
  };
}

window.addEventListener('storage', (e) => {
  if(e.key === STATE_KEY){
    const s = loadState();
    if(s){
      state = s;
      render();
    }
  }
});

// score handling: keep as before but store in same storage (separate key)
scoreForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const team = document.getElementById('score-team').value;
  const runs = Number(document.getElementById('score-runs').value);
  const wk = Number(document.getElementById('score-wk').value);
  const overs = document.getElementById('score-overs').value;

  const payload = { team, runs, wk, overs, ts: Date.now() };
  saveScoreToStorage(team, payload);
  updateScoreboardFromStorage();

  fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  }).then(res => res.json()).then(resp => {
    console.log('Server acknowledged score update', resp);
  }).catch(err => {
    console.warn('AJAX failed, but UI updated locally', err);
  });
});

function saveScoreToStorage(team, payload){
  const scores = JSON.parse(localStorage.getItem('matchScores')||'{}');
  scores[team] = payload;
  localStorage.setItem('matchScores', JSON.stringify(scores));
  if(bc) bc.postMessage({type:'score', scores});
}

function updateScoreboardFromStorage(){
  const scores = JSON.parse(localStorage.getItem('matchScores')||'{}');
  const india = scores['India'];
  const aus = scores['Australia'];
  document.getElementById('india-score').textContent = india ? `${india.runs}/${india.wk} (${india.overs})` : '0/0 (0.0)';
  document.getElementById('aus-score').textContent = aus ? `${aus.runs}/${aus.wk} (${aus.overs})` : '0/0 (0.0)';
}

// also react to score broadcasts
if(bc){
  bc.onmessage = (ev) => {
    if(ev.data && ev.data.type === 'score'){
      localStorage.setItem('matchScores', JSON.stringify(ev.data.scores));
      updateScoreboardFromStorage();
    } else if(ev.data && ev.data.type === 'state'){
      state = ev.data.state;
      saveStateToStorage(state);
      render();
    }
  };
}

// start
initStateFromJsonIfNeeded();