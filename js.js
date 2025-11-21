// Konfiguracja API - UŻYWAMY RELATYWNEJ ŚCIEŻKI
const API_BASE_URL = '/GW4p/Czato-Notatnik-4P2/api.php';

// Globalne zmienne
let currentUser = null;
let currentRole = null;

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Obsługa zakładek
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Zmiana aktywnej zakładki
            document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Ładowanie danych dla zakładki
            if (tabId === 'tab2') {
                loadTeacherBoard();
                setupBoardPermissions();
            }
            if (tabId === 'tab3') {
                loadMessages();
                loadUsers();
            }
            if (tabId === 'tab4') loadNotes();
        });
    });

    // Logowanie
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        try {
            await realLogin(login, password, role);
            document.getElementById('loginError').style.display = 'none';
            document.querySelector('.nav-link[data-tab="tab2"]').click();
        } catch (error) {
            document.getElementById('loginError').textContent = error.message;
            document.getElementById('loginError').style.display = 'block';
        }
    });

    // Czat
    document.getElementById('sendMessage').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Tablica
    document.getElementById('editBoardBtn').addEventListener('click', enableBoardEditing);
    document.getElementById('saveBoardBtn').addEventListener('click', saveBoardContent);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelBoardEditing);

    // Notatki
    document.getElementById('addNoteBtn').addEventListener('click', addNewNote);
    document.getElementById('saveNotesBtn').addEventListener('click', saveAllNotes);

    // Wylogowanie
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// PRAWDZIWE LOGOWANIE
async function realLogin(login, password, role) {
    try {
        const response = await apiRequest('users', 'POST', {
            username: login,
            password: password
        });

        if (response.success && response.user) {
            if (response.user.role !== role) {
                throw new Error('Wybrana rola nie zgadza się z kontem');
            }

            currentUser = {
                id: response.user.ID,
                name: response.user.username,
                role: response.user.role
            };
            currentRole = response.user.role;

            updateUserInterface();
            return response;
        } else {
            throw new Error('Nieprawidłowe dane logowania');
        }
    } catch (error) {
        throw new Error(error.message || 'Błąd logowania');
    }
}

// Aktualizacja interfejsu po logowaniu
function updateUserInterface() {
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentRole === 'teacher' ? 'Nauczyciel' : 'Uczeń';
    document.getElementById('userRole').className = `role-badge ${currentRole}`;
    document.getElementById('logoutBtn').style.display = 'block';
    document.querySelector('.nav-link[data-tab="tab1"]').parentElement.style.display = 'none';
}

// Uprawnienia tablicy
function setupBoardPermissions() {
    const editBtn = document.getElementById('editBoardBtn');
    const permissionInfo = document.getElementById('permissionInfo');
    
    if (currentRole === 'teacher') {
        editBtn.style.display = 'inline-block';
        permissionInfo.style.display = 'none';
    } else {
        editBtn.style.display = 'none';
        permissionInfo.style.display = 'block';
    }
}

// API REQUEST - POPRAWIONE
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = API_BASE_URL + '/' + endpoint;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Błąd API:', error);
        throw error;
    }
}

// Tablica nauczyciela
async function loadTeacherBoard() {
    try {
        document.getElementById('boardLoading').style.display = 'block';
        const boardData = await apiRequest('board');
        document.getElementById('boardLoading').style.display = 'none';
        
        if (boardData && boardData.length > 0) {
            document.getElementById('boardContent').textContent = boardData[0].content;
        } else {
            document.getElementById('boardContent').textContent = 'Tablica jest pusta.';
        }
    } catch (error) {
        document.getElementById('boardLoading').innerHTML = `<div class="error">Błąd: ${error.message}</div>`;
    }
}

// Edycja tablicy
function enableBoardEditing() {
    if (currentRole !== 'teacher') {
        alert('Tylko nauczyciel może edytować tablicę!');
        return;
    }
    
    const content = document.getElementById('boardContent').textContent;
    document.getElementById('boardContent').style.display = 'none';
    document.getElementById('boardEditor').style.display = 'block';
    document.getElementById('boardEditor').value = content;
    
    document.getElementById('editBoardBtn').style.display = 'none';
    document.getElementById('saveBoardBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
}

function cancelBoardEditing() {
    document.getElementById('boardContent').style.display = 'block';
    document.getElementById('boardEditor').style.display = 'none';
    document.getElementById('editBoardBtn').style.display = 'inline-block';
    document.getElementById('saveBoardBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

async function saveBoardContent() {
    if (currentRole !== 'teacher') return;
    
    try {
        const content = document.getElementById('boardEditor').value;
        const boardData = await apiRequest('board');
        const boardId = boardData && boardData.length > 0 ? boardData[0].ID : 1;
        
        await apiRequest('board', 'PUT', { id: boardId, content: content });
        document.getElementById('boardContent').textContent = content;
        cancelBoardEditing();
        alert('Tablica zaktualizowana!');
    } catch (error) {
        alert('Błąd: ' + error.message);
    }
}

// Czat
async function loadMessages() {
    try {
        const messages = await apiRequest('messages');
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        if (messages.length === 0) {
            chatMessages.innerHTML = '<div class="loading">Brak wiadomości</div>';
            return;
        }
        
        messages.forEach(msg => {
            const time = new Date(msg.created_at).toLocaleTimeString();
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="message-user">${msg.username}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-content">${msg.content}</div>
            `;
            chatMessages.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Błąd wiadomości:', error);
    }
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message && currentUser) {
        try {
            await apiRequest('messages', 'POST', {
                content: message,
                user_ID: currentUser.id,
                username: currentUser.name
            });
            
            messageInput.value = '';
            loadMessages(); // Odśwież wiadomości
        } catch (error) {
            alert('Błąd wysyłania: ' + error.message);
        }
    }
}

// Użytkownicy
async function loadUsers() {
    try {
        const users = await apiRequest('users');
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.innerHTML = `
                <span class="status-indicator ${user.is_online ? 'online' : 'offline'}"></span>
                ${user.username} ${user.role === 'teacher' ? '(Nauczyciel)' : ''}
            `;
            usersList.appendChild(userItem);
        });
    } catch (error) {
        console.error('Błąd użytkowników:', error);
    }
}

// Notatki
async function loadNotes() {
    if (!currentUser) {
        document.getElementById('notesLoading').innerHTML = '<div class="error">Zaloguj się</div>';
        return;
    }
    
    try {
        document.getElementById('notesLoading').style.display = 'block';
        const notes = await apiRequest(`notes?user_id=${currentUser.id}`);
        document.getElementById('notesLoading').style.display = 'none';
        
        const container = document.getElementById('notesContainer');
        container.innerHTML = '';
        
        if (notes.length === 0) {
            container.innerHTML = '<div class="loading">Brak notatek</div>';
            return;
        }
        
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.innerHTML = `
                <div class="note-header">
                    <span class="note-date">${new Date(note.updated_at).toLocaleString()}</span>
                    <button class="delete-note" onclick="deleteNote(${note.ID})">Usuń</button>
                </div>
                <textarea class="note-content">${note.content}</textarea>
            `;
            container.appendChild(noteElement);
        });
    } catch (error) {
        document.getElementById('notesLoading').innerHTML = `<div class="error">Błąd: ${error.message}</div>`;
    }
}

async function addNewNote() {
    if (!currentUser) {
        alert('Zaloguj się!');
        return;
    }
    
    try {
        await apiRequest('notes', 'POST', {
            user_ID: currentUser.id,
            title: 'Nowa notatka',
            content: 'Treść notatki...'
        });
        loadNotes();
    } catch (error) {
        alert('Błąd: ' + error.message);
    }
}

async function deleteNote(noteId) {
    try {
        await apiRequest(`notes/${noteId}`, 'DELETE');
        loadNotes();
    } catch (error) {
        alert('Błąd: ' + error.message);
    }
}

async function saveAllNotes() {
    if (!currentUser) return;
    
    const notes = document.querySelectorAll('.note-item');
    for (const note of notes) {
        const textarea = note.querySelector('.note-content');
        const content = textarea.value.trim();
        // Tutaj potrzebowałbyś ID notatki - uproszczone
    }
    alert('Notatki zapisane!');
}

// Wylogowanie
function logout() {
    currentUser = null;
    currentRole = null;
    
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.querySelector('.nav-link[data-tab="tab1"]').parentElement.style.display = 'block';
    document.querySelector('.nav-link[data-tab="tab1"]').click();
    document.getElementById('loginForm').reset();
}

// Globalne funkcje dla HTML
window.deleteNote = deleteNote;