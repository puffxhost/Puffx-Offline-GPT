const $ = selector => document.querySelector(selector);
const messagesEl = $('#messages');
const conversation = $('#conversation');
const promptEl = $('#prompt');
const welcome = $('#welcome');
const CHAT_KEY = 'offlinegpt_chats';
const LIGHT_KEY = 'offlinegpt_light';
const MODEL_KEY = 'offlinegpt_model';
const WORKSPACE_NAME_KEY = 'offlinegpt_workspace_name';
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
let modelSizes = new Map();

const DEFAULT_WORKSPACE_NAME = 'Your workspace';
let workspaceName = normalizeWorkspaceName(readSetting(WORKSPACE_NAME_KEY, '')) || DEFAULT_WORKSPACE_NAME;

function normalizeWorkspaceName(value) {
  const cleaned = String(value || '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '');
  return Array.from(cleaned).slice(0, 32).join('');
}
function workspaceInitial() {
  return Array.from(workspaceName.trim())[0]?.toLocaleUpperCase() || 'Y';
}
function renderWorkspaceName() {
  const label = $('#workspaceName');
  const avatar = $('#workspaceAvatar');
  if (label) label.textContent = workspaceName;
  if (avatar) avatar.textContent = workspaceInitial();
}
function setWorkspaceName(value) {
  const cleaned = normalizeWorkspaceName(value);
  try {
    if (cleaned) localStorage.setItem(WORKSPACE_NAME_KEY, cleaned);
    else localStorage.removeItem(WORKSPACE_NAME_KEY);
  } catch { return false; }
  workspaceName = cleaned || DEFAULT_WORKSPACE_NAME;
  renderWorkspaceName();
  return true;
}
function parseWorkspaceNameCommand(text) {
  const patterns = [
    /^\s*(?:call me|my name is|set (?:my )?name to|set (?:my )?workspace name to|rename me to)\s+([^.!?\n]+?)\s*[.!?]*\s*$/i,
    /^\s*(?:मेरा\s+नाम|mera\s+naam)\s+(.+?)\s+(?:है|hai|रखो|rakho|रखना|rakhna)\s*[.!?।]*\s*$/iu,
    /^\s*(?:मुझे|mujhe)\s+(.+?)\s+(?:बुलाओ|bulao|बोलो|bolo|कहो|kaho)\s*[.!?।]*\s*$/iu,
    /^\s*(?:(?:my|meri|mera|मेरे|मेरी)\s+)?(?:workspace|वर्कस्पेस)\s+(?:ka\s+naam|का\s+नाम)\s+(.+?)\s+(?:रखो|rakho|रखना|rakhna|कर\s+दो|kar\s+do)\s*[.!?।]*\s*$/iu
  ];
  for (const pattern of patterns) {
    const match = String(text || '').match(pattern);
    if (!match) continue;
    const name = normalizeWorkspaceName(match[1]);
    if (name && name !== DEFAULT_WORKSPACE_NAME) return name;
  }
  return null;
}
renderWorkspaceName();


function formatModelSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes >= 1_000_000_000) return (bytes / 1_000_000_000).toFixed(1) + ' GB';
  return Math.round(bytes / 1_000_000) + ' MB';
}
function setModelName(name) {
  const label = (name || 'qwen2.5:3b').replace(/:latest$/, '').replace(/:/g, ' ');
  const size = formatModelSize(modelSizes.get(name));
  const display = size ? label + ' · ' + size : label;
  $('#composerModel').textContent = display;
  $('#modelLabel').textContent = display;
}
function normalizeModelName(name) {
  const tag = String(name || '').trim();
  return tag.includes(':') ? tag : tag + ':latest';
}
function refreshModels(models, defaultModel) {
  const select = $('#modelSelect');
  const inventory = new Map();
  for (const model of Array.isArray(models) ? models : []) {
    const name = typeof model === 'string' ? model : model?.name;
    if (typeof name !== 'string' || !name.trim()) continue;
    const size = typeof model === 'object' && model && Number.isFinite(model.size) && model.size > 0
      ? model.size
      : null;
    inventory.set(name.trim(), size);
  }
  modelSizes = inventory;
  const installed = [...inventory.keys()];
  const preferred = selectedModel || defaultModel || 'qwen2.5:3b';
  const options = [...installed];
  for (const name of [defaultModel, preferred]) {
    if (name && !options.some(item => normalizeModelName(item) === normalizeModelName(name))) {
      options.push(name);
      modelSizes.set(name, null);
    }
  }
  select.replaceChildren();
  options.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    const sizeLabel = formatModelSize(modelSizes.get(name));
    const isInstalled = installed.some(item => normalizeModelName(item) === normalizeModelName(name));
    const isDefault = Boolean(defaultModel) && normalizeModelName(name) === normalizeModelName(defaultModel);
    const isRecommended = normalizeModelName(name) === 'qwen2.5:3b';
    option.textContent = name.replace(/:latest$/, '')
      + (sizeLabel ? ' · ' + sizeLabel : '')
      + (isDefault ? (isRecommended ? ' (default · recommended)' : ' (default)') : '')
      + (isInstalled ? '' : ' · not downloaded');
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
  avatar.textContent = role === 'user' ? workspaceInitial() : '✳';
  const body = document.createElement('div');
  body.className = typing ? 'message-content typing' : 'message-content';
  if (typing) body.innerHTML = '<span></span><span></span><span></span>';
  else body.textContent = content;
  row.append(avatar, body);
  if (role === 'assistant' && !typing) {
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'copy-message';
    copyButton.textContent = 'Copy';
    copyButton.setAttribute('aria-label', 'Copy assistant response');
    copyButton.title = 'Copy response';
    copyButton.addEventListener('click', async () => {
      try {
        await copyText(content);
        copyButton.textContent = 'Copied';
        copyButton.setAttribute('aria-label', 'Response copied');
      } catch {
        copyButton.textContent = 'Copy failed';
        copyButton.setAttribute('aria-label', 'Could not copy response');
      }
      window.setTimeout(() => {
        copyButton.textContent = 'Copy';
        copyButton.setAttribute('aria-label', 'Copy assistant response');
      }, 1600);
    });
    row.append(copyButton);
  }
  messagesEl.append(row);
  scrollBottom();
  return row;
}
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.left = '-9999px';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Clipboard access is not available.');
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
  const requestedWorkspaceName = parseWorkspaceNameCommand(text);
  if (requestedWorkspaceName) {
    const saved = setWorkspaceName(requestedWorkspaceName);
    const confirmation = saved
      ? `Theek hai, ab main tumhe ${workspaceName} bulaunga. Ye naam isi browser mein save rahega. Naam badalne ke liye chat mein “mujhe [naam] bulao” kehna ya pencil button use karna.`
      : 'Naam is browser mein save nahi ho saka. Browser storage settings check karke dobara try karo.';
    chat.messages.push({ role: 'assistant', content: confirmation });
    addMessage('assistant', confirmation);
    persist();
    return;
  }
  persist();

  busy = true;
  $('#send').disabled = true;
  const thinking = addMessage('assistant', '', true);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: workspaceName !== DEFAULT_WORKSPACE_NAME
          ? [{ role: 'system', content: `The user's preferred name is ${workspaceName}. Address them by this name naturally, but do not overuse it.` }, ...chat.messages]
          : chat.messages,
        model: selectedModel
      })
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
$('#editWorkspaceName').addEventListener('click', () => {
  const current = workspaceName === DEFAULT_WORKSPACE_NAME ? '' : workspaceName;
  const value = window.prompt('What should Puffx call you? You can also set this in chat by saying “my name is Alex” or “mujhe Alex bulao”. Leave blank to reset.', current);
  if (value === null) return;
  if (!setWorkspaceName(value)) {
    showNotice('Your name could not be saved in this browser. Check browser storage or privacy settings.');
    return;
  }
  showNotice(workspaceName === DEFAULT_WORKSPACE_NAME
    ? 'Workspace name reset.'
    : `I’ll call you ${workspaceName}. This preference is saved in this browser.`);
});
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
    const selectedDownloaded = (data.models || []).some(model => normalizeModelName(typeof model === 'string' ? model : model.name) === normalizeModelName(selectedModel));
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


