const $ = selector => document.querySelector(selector);
const messagesEl = $('#messages');
const conversation = $('#conversation');
const promptEl = $('#prompt');
const welcome = $('#welcome');
const CHAT_KEY = 'offlinegpt_chats';
const LIGHT_KEY = 'offlinegpt_light';

function loadChats() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(chat => chat && typeof chat.id === 'string' && Array.isArray(chat.messages)) : [];
  } catch {
    localStorage.removeItem(CHAT_KEY);
    return [];
  }
}
let chats = loadChats();
let activeId = null;
let busy = false;

function setModelName(name) {
  const label = (name || 'Local model').replace(/:latest$/, '').replace(/:/g, ' ');
  $('#composerModel').textContent = label;
  $('#modelLabel').textContent = label;
  $('#topModel').textContent = label;
}
setModelName('qwen2.5:3b');

function persist() {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(chats)); }
  catch { showNotice('Chat history could not be saved. Browser storage may be full.'); }
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
function scrollBottom() { requestAnimationFrame(() => conversation.scrollTop = conversation.scrollHeight); }
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
async function send(text = promptEl.value.trim()) {
  if (!text || busy) return;
  promptEl.value = '';
  promptEl.style.height = 'auto';
  welcome.style.display = 'none';
  if (!activeId) {
    activeId = makeId();
    chats.push({ id: activeId, title: text.slice(0, 42), messages: [] });
  }
  const chatId = activeId;
  const chat = chats.find(item => item.id === chatId);
  chat.messages.push({ role: 'user', content: text });
  addMessage('user', text);
  persist();
  busy = true;
  $('#send').disabled = true;
  const thinking = addMessage('assistant', '', true);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chat.messages })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    const reply = typeof data.reply === 'string' ? data.reply : '';
    chat.messages.push({ role: 'assistant', content: reply });
    if (activeId === chatId) {
      thinking.remove();
      addMessage('assistant', reply);
    }
    persist();
  } catch (error) {
    const message = 'I couldn’t reach your local model. Make sure Ollama is running and the model is downloaded.\n\n' + error.message;
    if (activeId === chatId) {
      thinking.remove();
      addMessage('assistant', message);
    }
  } finally {
    busy = false;
    $('#send').disabled = false;
    if (activeId === chatId) promptEl.focus();
  }
}

$('#send').onclick = () => send();
promptEl.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); }
});
promptEl.addEventListener('input', () => {
  promptEl.style.height = 'auto';
  promptEl.style.height = Math.min(promptEl.scrollHeight, 160) + 'px';
});
$('#newChat').onclick = newChat;
document.querySelectorAll('.suggestion').forEach(button => button.onclick = () => send(button.dataset.prompt));
$('#openSidebar').onclick = () => $('#sidebar').classList.remove('hidden');
$('#closeSidebar').onclick = () => $('#sidebar').classList.add('hidden');
$('#themeToggle').onclick = () => {
  document.body.classList.toggle('light');
  localStorage.setItem(LIGHT_KEY, document.body.classList.contains('light'));
};
if (localStorage.getItem(LIGHT_KEY) === 'true') document.body.classList.add('light');
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); newChat(); }
  if (event.key === 'Escape' && innerWidth <= 760) $('#sidebar').classList.add('hidden');
});

async function checkStatus() {
  const pill = $('#connection');
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    setModelName(data.model);
    pill.textContent = '';
    const dot = document.createElement('i');
    pill.append(dot, document.createTextNode(data.online && data.downloaded ? ' Running locally' : data.online ? ' Model not downloaded' : ' Ollama not running'));
    pill.classList.toggle('offline', !data.online || !data.downloaded);
  } catch {
    pill.textContent = ' Local model unavailable';
    pill.classList.add('offline');
  }
}
checkStatus();
renderHistory();

