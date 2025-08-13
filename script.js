const appsUrl = 'apps.json';
const gamesUrl = 'games.json';

const SEARCH_ENGINES = {
  google: { url: "https://www.google.com/search?q=", name: "Google" },
  duckduckgo: { url: "https://duckduckgo.com/?q=", name: "DuckDuckGo" },
  bing: { url: "https://www.bing.com/search?q=", name: "Bing" },
  yahoo: { url: "https://search.yahoo.com/search?p=", name: "Yahoo" }
};
let searchEngine = localStorage.getItem('voidSearchEngine') || 'google';

let appsData = [], gamesData = [];

// --- Name and Block Logic ---
const nameOverlay = document.getElementById('name-overlay');
const blockedOverlay = document.getElementById('blocked-overlay');
const blockedMessage = document.getElementById('blocked-message');
let userName = localStorage.getItem('voidUserName');
let blockedUsers = JSON.parse(localStorage.getItem('voidBlockedUsers') || '[]');
let trollMessages = JSON.parse(localStorage.getItem('voidTrollMessages') || '{}');
let allUsers = JSON.parse(localStorage.getItem('voidAllUsers') || '[]');

function saveUserName(name) {
  if (!allUsers.includes(name)) {
    allUsers.push(name);
    localStorage.setItem('voidAllUsers', JSON.stringify(allUsers));
  }
}
function promptName() {
  nameOverlay.style.display = 'flex';
  document.getElementById('user-name-input').value = '';
  document.getElementById('user-name-input').focus();
}
function checkBlocked() {
  if (userName && blockedUsers.includes(userName)) {
    document.body.innerHTML = '<div style="width:100vw;height:100vh;background:#fff;display:flex;align-items:center;justify-content:center;"><div style="color:#222;font-size:24px;text-align:center;">' + (trollMessages[userName] || "You have been blocked by the admin.") + '</div></div>';
  }
}
if (!userName) {
  setTimeout(promptName, 200);
} else {
  saveUserName(userName);
  checkBlocked();
}
document.getElementById('user-name-confirm').onclick = () => {
  const val = document.getElementById('user-name-input').value.trim();
  if (val.length < 2) {
    alert("Name must be at least 2 characters.");
    return;
  }
  userName = val;
  localStorage.setItem('voidUserName', userName);
  saveUserName(userName);
  nameOverlay.style.display = 'none';
  checkBlocked();
};
document.getElementById('user-name-input').addEventListener('keydown', e => {
  if (e.key === "Enter") document.getElementById('user-name-confirm').click();
});

// --- Admin Dot & Panel ---
const adminDot = document.getElementById('admin-dot');
const adminPanel = document.getElementById('admin-panel');
const adminVerify = document.getElementById('admin-verify');
const closeAdminBtn = document.getElementById('close-admin-btn');
const closeAdminVerify = document.getElementById('close-admin-verify');
const adminNameInput = document.getElementById('admin-name-input');
const adminVerifyBtn = document.getElementById('admin-verify-btn');
const adminVerifyLog = document.getElementById('admin-verify-log');
const adminPanelLog = document.getElementById('admin-panel-log');
const adminUsersList = document.getElementById('admin-users-list');
const adminRemoveAdmins = document.getElementById('admin-remove-admins');
const trollUserInput = document.getElementById('troll-user-input');
const trollMsgInput = document.getElementById('troll-message-input');
const sendTrollBtn = document.getElementById('send-troll-btn');

const ADMIN_NAMES = [
  "TheChosenOne",
  "TheTanertantan",
  "thegramcracker",
  "TheUnc"
];
let adminSession = JSON.parse(localStorage.getItem('voidAdminSession') || '{}');
let currentAdmin = null;

adminDot.onclick = () => {
  let session = JSON.parse(localStorage.getItem('voidAdminSession') || '{}');
  if (session.name && session.count >= 2 && ADMIN_NAMES.includes(session.name)) {
    currentAdmin = session.name;
    showAdminPanel();
  } else {
    adminVerify.style.display = 'flex';
    adminVerifyLog.innerText = '';
    adminNameInput.value = '';
    adminNameInput.focus();
  }
};
closeAdminBtn.onclick = () => adminPanel.style.display = 'none';
closeAdminVerify.onclick = () => adminVerify.style.display = 'none';

adminVerifyBtn.onclick = () => {
  const name = adminNameInput.value.trim();
  if (!ADMIN_NAMES.includes(name)) {
    adminVerifyLog.innerText = "Invalid admin name.";
    return;
  }
  let session = JSON.parse(localStorage.getItem('voidAdminSession') || '{}');
  if (session.name === name) {
    session.count = (session.count || 0) + 1;
  } else {
    session = { name, count: 1 };
  }
  localStorage.setItem('voidAdminSession', JSON.stringify(session));
  currentAdmin = name;
  adminVerify.style.display = 'none';
  showAdminPanel();
};
adminNameInput.addEventListener('keydown', e => {
  if (e.key === "Enter") adminVerifyBtn.click();
});
function showAdminPanel() {
  adminPanel.style.display = 'flex';
  adminPanelLog.innerText = '';
  renderUsersList();
  renderRemoveAdmins();
}
function renderUsersList() {
  let html = '<div style="margin-bottom:10px;font-weight:bold;color:#bdf6ff;">Users:</div>';
  allUsers.forEach(name => {
    if (!name) return;
    const isBlocked = blockedUsers.includes(name);
    html += `<div style="margin-bottom:6px;">
      <span style="color:${isBlocked ? '#ff2222' : '#bdf6ff'};font-weight:bold;">${name}</span>
      <button data-user="${name}" class="block-btn" style="margin-left:10px;background:${isBlocked ? '#33aaff' : '#ff2222'};color:#fff;border:none;border-radius:8px;padding:2px 10px;cursor:pointer;">
        ${isBlocked ? 'Unblock' : 'Block'}
      </button>
    </div>`;
  });
  adminUsersList.innerHTML = html;
  adminUsersList.querySelectorAll('.block-btn').forEach(btn => {
    btn.onclick = () => {
      const name = btn.getAttribute('data-user');
      if (blockedUsers.includes(name)) {
        blockedUsers = blockedUsers.filter(n => n !== name);
      } else {
        blockedUsers.push(name);
      }
      localStorage.setItem('voidBlockedUsers', JSON.stringify(blockedUsers));
      renderUsersList();
    };
  });
}
function renderRemoveAdmins() {
  if (currentAdmin !== "TheChosenOne") {
    adminRemoveAdmins.innerHTML = '';
    return;
  }
  let html = '<div style="margin-top:18px;"><b>Remove Admin Access:</b></div>';
  ADMIN_NAMES.forEach(name => {
    if (name === "TheChosenOne") return;
    html += `<div style="margin:6px 0;">
      <span style="color:#bdf6ff;">${name}</span>
      <button data-admin="${name}" class="remove-admin-btn" style="margin-left:10px;background:#ff2222;color:#fff;border:none;border-radius:8px;padding:2px 10px;cursor:pointer;">
        Remove Access
      </button>
    </div>`;
  });
  adminRemoveAdmins.innerHTML = html;
  adminRemoveAdmins.querySelectorAll('.remove-admin-btn').forEach(btn => {
    btn.onclick = () => {
      const name = btn.getAttribute('data-admin');
      let session = JSON.parse(localStorage.getItem('voidAdminSession') || '{}');
      if (session.name === name) {
        localStorage.removeItem('voidAdminSession');
        adminPanelLog.innerText = `Removed admin access for ${name}`;
      }
    };
  });
}
sendTrollBtn.onclick = () => {
  const name = trollUserInput.value.trim();
  const msg = trollMsgInput.value.trim();
  if (!name || !msg) return;
  trollMessages[name] = msg;
  localStorage.setItem('voidTrollMessages', JSON.stringify(trollMessages));
  adminPanelLog.innerText = `Sent troll message to "${name}"`;
  checkBlocked();
};
window.onclick = function(e) {
  if (e.target === nameOverlay) nameOverlay.style.display = 'none';
  if (e.target === adminPanel) adminPanel.style.display = 'none';
  if (e.target === adminVerify) adminVerify.style.display = 'none';
};

// --- Main Dashboard Logic ---
function openInBrowser(url) {
  const iframeContainer = document.getElementById('iframe-container');
  const iframe = document.getElementById('browser-frame');
  iframe.src = url;
  iframeContainer.style.display = 'block';
  window.scrollTo(0, iframeContainer.offsetTop);
}
document.getElementById('close-iframe').onclick = function() {
  document.getElementById('iframe-container').style.display = 'none';
  document.getElementById('browser-frame').src = '';
};
function loadJSON(url) {
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Network response not ok');
      return res.json();
    });
}
function loadData() {
  Promise.all([loadJSON(appsUrl), loadJSON(gamesUrl)])
    .then(([apps, gamesObj]) => {
      appsData = Array.isArray(apps) ? apps : (apps.apps || apps);
      gamesData = Array.isArray(gamesObj) ? gamesObj : gamesObj.games || [];
      showGamesTiles();
    })
    .catch(e => {
      console.error('Error loading JSON:', e);
    });
}
function showGamesTiles() {
  document.getElementById('tiles-container').style.display = 'none';
  document.getElementById('iframe-container').style.display = 'none';
  document.getElementById('ai-section').style.display = 'none';
  document.getElementById('settings-section').style.display = 'none';
  let overlay = document.getElementById('game-fullscreen-overlay');
  let frame = document.getElementById('game-fullscreen-frame');
  let tilesDiv = overlay.querySelector('.game-fullscreen-tiles');
  overlay.style.display = 'flex';
  frame.style.display = 'none';
  tilesDiv.innerHTML = '';
  gamesData.forEach(item => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.margin = "18px";
    tile.onclick = () => {
      frame.src = item.url;
      frame.style.display = 'block';
      tilesDiv.style.display = 'none';
    };
    const icon = document.createElement('img');
    let iconPath = item.icon || '';
    if (iconPath && !iconPath.startsWith('http') && !iconPath.startsWith('assets/')) {
      icon.src = 'assets/icons/games/' + iconPath;
    } else {
      icon.src = iconPath;
    }
    icon.onerror = function() {
      this.src = 'assets/icons/space/favicon.ico';
    };
    icon.alt = item.name;
    const name = document.createElement('span');
    name.innerText = item.name;
    tile.appendChild(icon);
    tile.appendChild(name);
    tilesDiv.appendChild(tile);
  });
  overlay.querySelector('#close-game-fullscreen').onclick = () => {
    overlay.style.display = 'none';
    frame.src = '';
    tilesDiv.style.display = 'flex';
  };
  frame.style.width = "90vw";
  frame.style.height = "80vh";
  frame.style.margin = "auto";
  frame.style.borderRadius = "18px";
  frame.style.background = "#111";
  tilesDiv.style.display = "flex";
  tilesDiv.style.flexWrap = "wrap";
  tilesDiv.style.justifyContent = "center";
  tilesDiv.style.alignItems = "center";
  tilesDiv.style.marginTop = "30px";
}
function showAppsTiles() {
  document.getElementById('tiles-container').style.display = 'grid';
  document.getElementById('iframe-container').style.display = 'none';
  document.getElementById('ai-section').style.display = 'none';
  document.getElementById('settings-section').style.display = 'none';
  document.getElementById('game-fullscreen-overlay').style.display = 'none';
  loadTiles(appsData, 'apps');
}
function showMediaPage() {
  document.getElementById('tiles-container').style.display = 'grid';
  document.getElementById('iframe-container').style.display = 'none';
  document.getElementById('ai-section').style.display = 'none';
  document.getElementById('settings-section').style.display = 'none';
  document.getElementById('game-fullscreen-overlay').style.display = 'none';
  const half = Math.ceil(appsData.length / 2);
  loadTiles(appsData.slice(0, half), 'apps');
}
function showAIPage() {
  document.getElementById('tiles-container').style.display = 'none';
  document.getElementById('iframe-container').style.display = 'none';
  document.getElementById('ai-section').style.display = 'block';
  document.getElementById('settings-section').style.display = 'none';
  document.getElementById('game-fullscreen-overlay').style.display = 'none';
}
function showSettingsPage() {
  document.getElementById('tiles-container').style.display = 'none';
  document.getElementById('iframe-container').style.display = 'none';
  document.getElementById('ai-section').style.display = 'none';
  document.getElementById('settings-section').style.display = 'block';
  document.getElementById('game-fullscreen-overlay').style.display = 'none';
  document.getElementById('search-engine-select').value = searchEngine;
}
function loadTiles(data, type) {
  const container = document.getElementById('tiles-container');
  container.innerHTML = '';
  data.forEach(item => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.onclick = () => {
      let url = item.url;
      if (!/^https?:\/\//i.test(url)) {
        url = SEARCH_ENGINES[searchEngine].url + encodeURIComponent(url);
      }
      openInBrowser(url);
    };
    const icon = document.createElement('img');
    let iconPath = item.icon || '';
    if (iconPath && !iconPath.startsWith('http') && !iconPath.startsWith('assets/')) {
      if (type === 'apps') {
        icon.src = 'assets/icons/apps/' + iconPath;
      } else if (type === 'games') {
        icon.src = 'assets/icons/games/' + iconPath;
      } else {
        icon.src = iconPath;
      }
    } else {
      icon.src = iconPath;
    }
    icon.onerror = function() {
      this.src = 'assets/icons/space/favicon.ico';
    };
    icon.alt = item.name;
    const name = document.createElement('span');
    name.innerText = item.name;
    tile.appendChild(icon);
    tile.appendChild(name);
    container.appendChild(tile);
  });
}
document.getElementById('btn-games').onclick = showGamesTiles;
document.getElementById('btn-apps').onclick = showAppsTiles;
document.getElementById('btn-media').onclick = showMediaPage;
document.getElementById('btn-ai').onclick = showAIPage;
document.getElementById('btn-settings').onclick = showSettingsPage;
document.getElementById('surf-btn').onclick = () => {
  const input = document.getElementById('url-input').value.trim();
  if (input) {
    let url = /^https?:\/\//i.test(input)
      ? input
      : SEARCH_ENGINES[searchEngine].url + encodeURIComponent(input);
    openInBrowser(url);
  }
};
document.querySelectorAll('.quick-icon').forEach(icon => {
  icon.onclick = () => {
    const url = icon.dataset.url;
    openInBrowser(url);
  };
});
document.getElementById('stealth-btn').onclick = activateStealthMode;
document.getElementById('wipe-btn').onclick = () => {
  localStorage.removeItem('chatMessages');
  alert('History wiped!');
};
function activateStealthMode() {
  const icons = [
    "https://www.google.com/favicon.ico",
    "https://www.roblox.com/favicon.ico",
    "https://learn.instructure.com/favicon.ico",
    "https://docs.google.com/favicon.ico"
  ];
  const randomIcon = icons[Math.floor(Math.random() * icons.length)];
  setFavicon(randomIcon);
}
const popup = document.getElementById('cloak-popup');
const openBtn = document.getElementById('custom-cloak-btn');
const closeBtn = document.getElementById('close-cloak-btn');
const confirmBtn = document.getElementById('confirm-cloak-btn');
const input = document.getElementById('custom-favicon-input');
openBtn.onclick = () => {
  popup.style.display = 'flex';
  input.value = '';
  input.focus();
};
closeBtn.onclick = () => popup.style.display = 'none';
confirmBtn.onclick = () => {
  const url = input.value.trim();
  if (url) setFavicon(url);
  popup.style.display = 'none';
};
popup.addEventListener('keydown', e => {
  if (e.key === "Escape") popup.style.display = 'none';
});
function setFavicon(url) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}
loadData();
checkBlocked();

// --- AI Chat (VOID AI) ---
const aiSection = document.getElementById('ai-section');
const aiChatWindow = document.getElementById('ai-chat-window');
const aiInput = document.getElementById('ai-input');
const aiSendBtn = document.getElementById('ai-send-btn');
let aiHistory = [];
function addAIMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot';
  msg.innerText = text;
  aiChatWindow.appendChild(msg);
  aiChatWindow.scrollTop = aiChatWindow.scrollHeight;
}
aiSendBtn.onclick = sendAIMessage;
aiInput.addEventListener('keydown', e => {
  if (e.key === "Enter") sendAIMessage();
});
function sendAIMessage() {
  const text = aiInput.value.trim();
  if (!text) return;
  addAIMessage('user', text);
  aiInput.value = '';
  // Placeholder: Simulate AI response
  setTimeout(() => {
    addAIMessage('bot', "VOID AI: Sorry, real AI is not connected yet. (You asked: " + text + ")");
  }, 700);
}

// --- Settings Logic ---
const searchEngineSelect = document.getElementById('search-engine-select');
const saveSearchEngineBtn = document.getElementById('save-search-engine-btn');
searchEngineSelect.value = searchEngine;
saveSearchEngineBtn.onclick = function() {
  searchEngine = searchEngineSelect.value;
  localStorage.setItem('voidSearchEngine', searchEngine);
  alert("Search engine saved!");
};

// Background image
const bgUrlInput = document.getElementById('bg-url-input');
const saveBgBtn = document.getElementById('save-bg-btn');
const resetBgBtn = document.getElementById('reset-bg-btn');
if (localStorage.getItem('voidBgUrl')) {
  document.body.style.backgroundImage = `url('${localStorage.getItem('voidBgUrl')}')`;
  bgUrlInput.value = localStorage.getItem('voidBgUrl');
}
saveBgBtn.onclick = function() {
  const url = bgUrlInput.value.trim();
  if (url) {
    document.body.style.backgroundImage = `url('${url}')`;
    localStorage.setItem('voidBgUrl', url);
  }
};
resetBgBtn.onclick = function() {
  document.body.style.backgroundImage = "";
  localStorage.removeItem('voidBgUrl');
  bgUrlInput.value = "";
};

// Panic button
const panicBtn = document.getElementById('panic-btn');
panicBtn.onclick = () => {
  window.open('','_self').close();
};

// Panic keybind
const keybindInput = document.getElementById('keybind-input');
const panicUrlInput = document.getElementById('panic-url-input');
const saveKeybindBtn = document.getElementById('save-keybind-btn');
const keybindStatus = document.getElementById('keybind-status');
let customKeybind = localStorage.getItem('voidPanicKeybind') || '';
let panicUrl = localStorage.getItem('voidPanicUrl') || 'https://classroom.google.com/';
keybindInput.value = customKeybind;
panicUrlInput.value = panicUrl;
saveKeybindBtn.onclick = () => {
  customKeybind = keybindInput.value.trim().toUpperCase();
  panicUrl = panicUrlInput.value.trim();
  localStorage.setItem('voidPanicKeybind', customKeybind);
  localStorage.setItem('voidPanicUrl', panicUrl);
  keybindStatus.innerText = "Saved!";
};
document.addEventListener('keydown', function(e) {
  if (!customKeybind) return;
  const keys = customKeybind.split(',').map(k => k.trim());
  if (keys.length === 1 && e.key.toUpperCase() === keys[0]) {
    window.location.href = panicUrl;
  } else if (keys.length > 1) {
    window._voidKeySeq = window._voidKeySeq || [];
    window._voidKeySeq.push(e.key.toUpperCase());
    if (window._voidKeySeq.slice(-keys.length).join(',') === keys.join(',')) {
      window.location.href = panicUrl;
      window._voidKeySeq = [];
    }
    setTimeout(() => { window._voidKeySeq = []; }, 2000);
  }
});