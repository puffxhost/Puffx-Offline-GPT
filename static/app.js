const $ = selector => document.querySelector(selector);
const messagesEl = $('#messages');
const conversation = $('#conversation');
const promptEl = $('#prompt');
const welcome = $('#welcome');
const CHAT_KEY = 'offlinegpt_chats';
const LIGHT_KEY = 'offlinegpt_light';
const MODEL_KEY = 'offlinegpt_model';
const VALID_ROLES = new Set(['user', 'assistant']);

function readSetting(key, fallback = null) {
  try { return localStorage.getItem(key) ?? fallback; }
  catch { return fallback; }
}
function writeSetting(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch { return false; }
}
function loadChats() {
  try {
    const saved = JSON.parse(readSetting(CHAT_KEY, '[]'));
    if (!Array.isArray(saved)) return [];
    const seen = new Set();
    return saved.filter(chat => {
      if (!chat || typeof chat.id !== 'string' || !Array.isArray(chat.messages) || seen.has(chat.id)) return false;
      seen.add(chat.id);
      chat.title = typeof chat.title === 'string' ? chat.title : 'New conversation';
      chat.messages = chat.messages.filter(message =>
        message && VALID_ROLES.has(message.role) && typeof message.content === 'string'
      );
      return true;
    });
  } catch { return []; }
}

let chats = loadChats();
let activeId = null;
let busy = false;
let selectedModel = readSetting(MODEL_KEY, '') || '';

function setModelName(name) {
  const label = (name || 'qwen2.5:3b').replace(/:latest$/, '').replace(/:/g, ' ');
  $('#composerModel').textContent = label;
  $('#modelLabel').textContent = label;
}
function normalizeModelName(name) {
  const tag = String(name || '').trim();
  return tag.includes(':') ? tag : tag + ':latest';
}
function refreshModels(models, defaultModel) {
  const select = $('#modelSelect');
  const installed = Array.isArray(models) ? models.filter(name => typeof name === 'string' && name.trim()) : [];
  const preferred = selectedModel || defaultModel || 'qwen2.5:3b';
  const options = [...new Set(installed)];
  for (const name of [defaultModel, preferred]) {
    if (name && !options.some(item => normalizeModelName(item) === normalizeModelName(name))) options.push(name);
  }
  select.replaceChildren();
  options.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    const isInstalled = installed.some(item => normalizeModelName(item) === normalizeModelName(name));
    const isDefault = Boolean(defaultModel) && normalizeModelName(name) === normalizeModelName(defaultModel);
    option.textContent = name.replace(/:latest$/, '') + (isDefault ? ' (default)' : '') + (isInstalled ? '' : ' · not downloaded');
    select.append(option);
  });
  selectedModel = options.includes(preferred) ? preferred : options[0] || 'qwen2.5:3b';
  select.value = selectedModel;
  setModelName(selectedModel);
}
refreshModels([], selectedModel || 'qwen2.5:3b');
$('#modelSelect').addEventListener('change', () => {
  selectedModel = $('#modelSelect').value;
  writeSetting(MODEL_KEY, selectedModel);
  setModelName(selectedModel);
  checkStatus();
});

function persist() {
  if (!writeSetting(CHAT_KEY, JSON.stringify(chats))) {
    showNotice('Chat history could not be saved. Check browser storage or privacy settings.');
  }
  renderHistory();
}
function renderHistory() {
  const nav = $('#history');
  nav.replaceChildren();
  [...chats].reverse().forEach(chat => {
    const button = document.createElement('button');
    button.className = 'history-item' + (chat.id === activeId ? ' active' : '');
    button.textContent = chat.title || 'New conversation';
    button.onclick = () => openChat(chat.id);
    nav.append(button);
  });
}
function openChat(id) {
  activeId = id;
  const chat = chats.find(item => item.id === id);
  messagesEl.replaceChildren();
  (chat?.messages || []).forEach(message => addMessage(message.role, message.content));
  welcome.style.display = chat?.messages?.length ? 'none' : '';
  renderHistory();
  scrollBottom();
}
function addMessage(role, content, typing = false) {
  const row = document.createElement('div');
  row.className = 'message ' + (role === 'user' ? 'user' : 'assistant');
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'user' ? 'Y' : '✳';
  const body = document.createElement('div');
  body.className = typing ? 'message-content typing' : 'message-content';
  if (typing) body.innerHTML = '<span></span><span></span><span></span>';
  else body.textContent = content;
  row.append(avatar, body);
  messagesEl.append(row);
  scrollBottom();
  return row;
}
function scrollBottom() {
  requestAnimationFrame(() => { conversation.scrollTop = conversation.scrollHeight; });
}
function showNotice(message) {
  const notice = document.createElement('div');
  notice.className = 'empty-hint';
  notice.textContent = message;
  messagesEl.append(notice);
  scrollBottom();
}
function newChat() {
  activeId = null;
  messagesEl.replaceChildren();
  welcome.style.display = '';
  renderHistory();
  promptEl.focus();
}
function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function newChatShortcut() {
  const label = $('.new-chat kbd');
  if (label) label.textContent = /mac/i.test(navigator.platform || '') ? '⌘ K' : 'Ctrl K';
}
newChatShortcut();

async function send(text = promptEl.value.trim()) {
  if (!text || busy) return;
  promptEl.value = '';
  promptEl.style.height = 'auto';
  welcome.style.display = 'none';
  let chat = chats.find(item => item.id === activeId);
  if (!chat) {
    activeId = makeId();
    chat = { id: activeId, title: text.slice(0, 42), messages: [] };
    chats.push(chat);
  }
  const chatId = chat.id;
  chat.messages.push({ role: 'user', content: text });
  addMessage('user', text);
  persist();

  busy = true;
  $('#send').disabled = true;
  const thinking = addMessage('assistant', '', true);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chat.messages, model: selectedModel })
    });
    let data;
    try { data = await response.json(); }
    catch { throw new Error(`The local server returned an unreadable response (${response.status}).`); }
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    if (typeof data.reply !== 'string') throw new Error('The local model returned an invalid response.');
    chat.messages.push({ role: 'assistant', content: data.reply });
    if (activeId === chatId) {
      thinking.remove();
      addMessage('assistant', data.reply);
    }
    persist();
  } catch (error) {
    if (activeId === chatId) {
      thinking.remove();
      addMessage('assistant', 'I couldn’t reach your local model. Make sure Ollama is running and the selected model is downloaded.\n\n' + error.message);
    }
  } finally {
    busy = false;
    $('#send').disabled = false;
    if (activeId === chatId) promptEl.focus();
  }
}

$('#send').onclick = () => send();
promptEl.addEventListener('keydown', event => {
  if (event.isComposing || event.keyCode === 229) return;
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); }
});
promptEl.addEventListener('input', () => {
  promptEl.style.height = 'auto';
  promptEl.style.height = Math.min(promptEl.scrollHeight, 160) + 'px';
});
$('#newChat').onclick = newChat;
document.querySelectorAll('.suggestion').forEach(button => { button.onclick = () => send(button.dataset.prompt); });
$('#openSidebar').onclick = () => $('#sidebar').classList.remove('hidden');
$('#closeSidebar').onclick = () => $('#sidebar').classList.add('hidden');
$('#themeToggle').onclick = () => {
  const light = document.body.classList.toggle('light');
  $('#themeToggle').setAttribute('aria-pressed', String(light));
  if (!writeSetting(LIGHT_KEY, String(light))) showNotice('Theme changed, but this browser could not save the preference.');
};
const savedTheme = readSetting(LIGHT_KEY, 'false') === 'true';
if (savedTheme) document.body.classList.add('light');
$('#themeToggle').setAttribute('aria-pressed', String(savedTheme));
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); newChat(); }
  if (event.key === 'Escape' && innerWidth <= 760) $('#sidebar').classList.add('hidden');
});

async function checkStatus() {
  const pill = $('#connection');
  try {
    const response = await fetch('/api/status', { cache: 'no-store' });
    if (!response.ok) throw new Error('Status request failed');
    const data = await response.json();
    refreshModels(data.models, data.model);
    const selectedDownloaded = (data.models || []).some(name => normalizeModelName(name) === normalizeModelName(selectedModel));
    pill.replaceChildren();
    const dot = document.createElement('i');
    const status = data.online && selectedDownloaded ? ' Running locally' : data.online ? ' Model not downloaded' : ' Ollama not running';
    pill.append(dot, document.createTextNode(status));
    pill.classList.toggle('offline', !data.online || !selectedDownloaded);
  } catch {
    pill.textContent = ' Local model unavailable';
    pill.classList.add('offline');
  }
}
checkStatus();
window.setInterval(() => { if (!document.hidden) checkStatus(); }, 20000);
window.addEventListener('focus', checkStatus);
renderHistory();


