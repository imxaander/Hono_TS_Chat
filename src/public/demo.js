// public/demo.js (browser)
const ws = new WebSocket('wss://hono-ts-chat.onrender.com/ws');

let currentRoom = '';
let rooms = [
    //{ name: 'General', users: 14, tag: 'open chat' },
];

ws.addEventListener('open', () => {
  console.log('connected');
  // example: join a room
  ws.send(JSON.stringify({ action: 'join_room', room: 'lobby', name: 'Alice' }));
});

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  console.log('received', msg);

  if(msg.type == 'chat'){
    receiveMessage(msg.text, msg.from)
  }else if(msg.type == 'system'){
    getRooms()
  }
  // display in UI...
});

ws.addEventListener('close', () => console.log('disconnected'));
ws.addEventListener('error', (e) => console.error('ws error', e));

async function getRooms(){
    
    const response = await fetch("https://hono-ts-chat.onrender.com/rooms", {
    method: "GET",
    })

    const roomList = await response.json()
    refreshRooms(roomList.rooms);
    console.log("fetched : ", rooms);
    
    return rooms;
}

// helper to send chat
function sendChat(room, text, from) {
  ws.send(JSON.stringify({ action: 'chat', room:currentRoom, text: text, from: from }));
  sendMessage();
}

function createRoom() {
        const nameEl = document.getElementById('cr-name');
    const crname = nameEl.value.trim();
    
  ws.send(JSON.stringify({ action: 'create_room', room: crname }));
}

function joinRoom(roomName) {
    ws.send(JSON.stringify({ action: 'join_room', room: roomName }));
    currentRoom = roomName;
    document.getElementById('chat-room-label').textContent = '#' + currentRoom;
    document.getElementById('messages').innerHTML = '<div class="empty-state" id="empty-msg">No messages yet. Say something!</div>';
    switchPage('page-chat');
}

function leaveRoom(roomName) {
    ws.send(JSON.stringify({ action: 'leave_room', room: currentRoom }));
    currentRoom = '';
    switchPage('page-rooms');
}

function refreshRooms(roomList){
    // Render room list
    rooms = roomList
    const list = document.getElementById('room-list');
    list.innerHTML = ``
    rooms.forEach(r => {
    list.innerHTML += `
        <div class="room-card">
        <div class="room-info">
            <div class="room-name">#${r}</div>
            <div class="room-meta"><span class="dot"></span>67 online &nbsp;·&nbsp; untagged</div>
        </div>
        <button class="btn-join" onclick="joinRoom('${r}')">Join</button>
        </div>
        <br>`;
    });
}



// Send on Enter key
document.getElementById('input-msg').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
});

function switchPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


function sendMessage() {
    const nameEl = document.getElementById('input-name');
    const msgEl = document.getElementById('input-msg');
    const name = nameEl.value.trim();
    const text = msgEl.value.trim();

    if (!name) { nameEl.focus(); nameEl.style.borderColor = 'var(--accent2)'; return; }
    if (!text) { msgEl.focus(); return; }

    nameEl.style.borderColor = '';

    msgEl.value = '';
    msgEl.focus();

    sendChat(currentRoom, text, name)
}

function receiveMessage(text, from){
    const box = document.getElementById('messages');
    const empty = document.getElementById('empty-msg');
    if (empty) empty.remove();

    const msg = document.createElement('div');
    msg.className = 'msg';
    msg.innerHTML = `<span class="msg-user">${escHtml(from)}</span><span class="msg-text">${escHtml(text)}</span>`;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
}

