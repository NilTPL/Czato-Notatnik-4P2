
// Konfiguracja API
const API_BASE_URL = 'localhost\GW4p\Czato-Notatnik-4P2\api.php';

// Globalne zmienne
let currentUser = null;
let authToken = null;
let currentRole = null;
let pollingInterval = null;

// Obsługa przełączania zakładek
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
 
function initializeApp() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Usuń klasę active ze wszystkich linków
            navLinks.forEach(item => item.classList.remove('active'));
            
            // Dodaj klasę active do klikniętego linku
            this.classList.add('active');
            
            // Ukryj wszystkie zakładki
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Pokaż odpowiednią zakładkę
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Załaduj dane dla aktywnej zakładki
            if (tabId === 'tab2') {
                loadTeacherBoard();
                setupBoardPermissions();
            } else if (tabId === 'tab3') {
                startChatPolling();
                loadUsers();
            } else if (tabId === 'tab4') {
                loadNotes();
            }
        });
    });

    // Obsługa formularza logowania
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        try {
            // Symulacja logowania - w rzeczywistości połącz z API
            await simulateLogin(login, password, role);
            
            loginError.style.display = 'none';
            
            // Przejdź do zakładki Tablica nauczyciela po zalogowaniu
            document.querySelector('.nav-link[data-tab="tab2"]').click();
            
        } catch (error) {
            loginError.textContent = error.message || 'Błąd logowania';
            loginError.style.display = 'block';
        }
    });

    // Obsługa czatu
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessage');
    
    // Obsługa wysyłania nowej wiadomości
    sendMessageBtn.addEventListener('click', async function() {
        await sendMessage();
    });
    
    // Wysyłanie wiadomości po naciśnięciu Enter
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Obsługa tablicy nauczyciela
    document.getElementById('editBoardBtn').addEventListener('click', enableBoardEditing);
    document.getElementById('saveBoardBtn').addEventListener('click', saveBoardContent);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelBoardEditing);

    // Obsługa notatek
    document.getElementById('addNoteBtn').addEventListener('click', addNewNote);
    document.getElementById('saveNotesBtn').addEventListener('click', saveAllNotes);
}

// Symulacja logowania (do zastąpienia prawdziwym API)
async function simulateLogin(login, password, role) {
    // Tutaj w rzeczywistości będzie zapytanie do API
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (login && password && role) {
                currentUser = { id: 1, name: login, role: role };
                currentRole = role;
                authToken = 'simulated_token_' + Date.now();
                
                // Aktualizacja interfejsu użytkownika
                updateUserInterface();
                resolve({ user: currentUser, token: authToken });
            } else {
                reject(new Error('Nieprawidłowe dane logowania'));
            }
        }, 1000);
    });
}

// Aktualizacja interfejsu po zalogowaniu
function updateUserInterface() {
    document.getElementById('logoutBtn').style.display = 'block';
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    userInfo.style.display = 'block';
    userName.textContent = currentUser.name;
    userRole.textContent = currentRole === 'teacher' ? 'Nauczyciel' : 'Uczeń';
    userRole.className = `role-badge ${currentRole}`;
    
    // Ukryj zakładkę logowania
    document.querySelector('.nav-link[data-tab="tab1"]').parentElement.style.display = 'none';
}

// Ustawienia uprawnień tablicy
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

// Funkcja do wykonywania zapytań do API
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}/${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    // Dodaj token autoryzacyjny jeśli dostępny
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Dodaj dane dla metod POST, PUT
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Błąd API:', error);
        throw error;
    }
}

// Ładowanie tablicy nauczyciela
async function loadTeacherBoard() {
    const boardContent = document.getElementById('boardContent');
    const boardLoading = document.getElementById('boardLoading');
    
    try {
        boardLoading.style.display = 'block';
        
        // Symulacja pobierania danych z API
        const boardData = await apiRequest('board');
        // W rzeczywistości: const boardData = await apiRequest('board');
        
        boardLoading.style.display = 'none';
        boardContent.textContent = boardData.content || 'Tablica jest pusta. Kliknij "Edytuj tablicę" aby dodać treść.';
        
    } catch (error) {
        boardLoading.innerHTML = `<div class="error">Błąd ładowania tablicy: ${error.message}</div>`;
    }
}

// Włączanie edycji tablicy
function enableBoardEditing() {
    const boardContent = document.getElementById('boardContent');
    const boardEditor = document.getElementById('boardEditor');
    const editBtn = document.getElementById('editBoardBtn');
    const saveBtn = document.getElementById('saveBoardBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    
    boardContent.style.display = 'none';
    boardEditor.style.display = 'block';
    boardEditor.value = boardContent.textContent;
    
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
}

// Anulowanie edycji tablicy
function cancelBoardEditing() {
    const boardContent = document.getElementById('boardContent');
    const boardEditor = document.getElementById('boardEditor');
    const editBtn = document.getElementById('editBoardBtn');
    const saveBtn = document.getElementById('saveBoardBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    
    boardContent.style.display = 'block';
    boardEditor.style.display = 'none';
    
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

// Zapis treści tablicy
async function saveBoardContent() {
    const boardEditor = document.getElementById('boardEditor');
    const boardContent = document.getElementById('boardContent');
    
    try {
        // Symulacja zapisu do API
        await apiRequest('board', 'PUT', { content: boardEditor.value });
        // W rzeczywistości: await apiRequest('board', 'PUT', { content: boardEditor.value });
        
        boardContent.textContent = boardEditor.value;
        cancelBoardEditing();
        
    } catch (error) {
        alert('Błąd zapisywania tablicy: ' + error.message);
    }
}

// Rozpoczęcie odpytywania czatu
function startChatPolling() {
    // Wyczyść istniejący interval
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    // Załaduj wiadomości natychmiast
    loadMessages();
    
    // Ustaw odpytywanie co 2 sekundy
    pollingInterval = setInterval(loadMessages, 2000);
}

// Ładowanie wiadomości czatu
async function loadMessages() {
    const chatMessages = document.getElementById('chatMessages');
    
    try {
        // Symulacja pobierania wiadomości
        const messages = await apiRequest('messages');
        // W rzeczywistości: const messages = await apiRequest('messages');
        
        chatMessages.innerHTML = '';
        
        if (messages.length === 0) {
            chatMessages.innerHTML = '<div class="loading">Brak wiadomości</div>';
            return;
        }
        
        messages.forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            displayMessage(msg.user_name, msg.content, time);
        });
    } catch (error) {
        console.error('Błąd ładowania wiadomości:', error);
    }
}

// Wyświetlanie wiadomości
function displayMessage(user, message, time) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="message-user">${user}</span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-content">${message}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Wysyłanie wiadomości
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message && authToken) {
        try {
            // Symulacja wysyłania wiadomości
            await apiRequest('messages', 'POST', {
                content: message,
                user_id: currentUser.id,
                user_name: currentUser.name,
                timestamp: new Date().toISOString()
            });
            
            const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            displayMessage(currentUser.name, message, currentTime);
            messageInput.value = '';
            
        } catch (error) {
            console.error('Błąd wysyłania wiadomości:', error);
        }
    }
}

// Ładowanie użytkowników
async function loadUsers() {
    const usersList = document.getElementById('usersList');
    const usersLoading = document.getElementById('usersLoading');
    
    try {
        usersLoading.style.display = 'block';
        
        // Symulacja pobierania użytkowników
        const users = await apiRequest('users');
        // W rzeczywistości: const users = await apiRequest('users');
        
        usersLoading.style.display = 'none';
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.innerHTML = `
                <span class="status-indicator ${user.online ? 'online' : 'offline'}"></span>
                ${user.name} ${user.role === 'teacher' ? '(Nauczyciel)' : ''}
            `;
            usersList.appendChild(userItem);
        });
    } catch (error) {
        usersLoading.innerHTML = `<div class="error">Błąd ładowania użytkowników: ${error.message}</div>`;
    }
}

// Ładowanie notatek
async function loadNotes() {
    const notesContainer = document.getElementById('notesContainer');
    const notesLoading = document.getElementById('notesLoading');
    
    try {
        notesLoading.style.display = 'block';
        
        // Symulacja pobierania notatek
        const notes = await apiRequest('notes');
        // W rzeczywistości: const notes = await apiRequest('notes');
        
        notesLoading.style.display = 'none';
        notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            notesContainer.innerHTML = '<div class="loading">Brak notatek. Kliknij "Dodaj notatkę" aby utworzyć pierwszą.</div>';
            return;
        }
        
        notes.forEach((note, index) => {
            const noteElement = createNoteElement(note, index);
            notesContainer.appendChild(noteElement);
        });
    } catch (error) {
        notesLoading.innerHTML = `<div class="error">Błąd ładowania notatek: ${error.message}</div>`;
    }
}

// Tworzenie elementu notatki
function createNoteElement(note, index) {
    const noteElement = document.createElement('div');
    noteElement.className = 'note-item';
    
    noteElement.innerHTML = `
        <div class="note-header">
            <span class="note-date">${new Date(note.timestamp).toLocaleString()}</span>
            <div class="note-actions">
                <button class="delete-note" data-index="${index}">Usuń</button>
            </div>
        </div>
        <textarea class="note-content" data-index="${index}">${note.content}</textarea>
    `;
    
    // Dodaj obsługę usuwania notatki
    const deleteBtn = noteElement.querySelector('.delete-note');
    deleteBtn.addEventListener('click', function() {
        deleteNote(index);
    });
    
    return noteElement;
}

// Dodawanie nowej notatki
function addNewNote() {
    const notesContainer = document.getElementById('notesContainer');
    
    const newNote = {
        id: Date.now(),
        content: '',
        timestamp: new Date().toISOString()
    };
    
    const noteElement = createNoteElement(newNote, -1);
    notesContainer.appendChild(noteElement);
}

// Usuwanie notatki
function deleteNote(index) {
    const notesContainer = document.getElementById('notesContainer');
    const noteElements = notesContainer.querySelectorAll('.note-item');
    
    if (noteElements[index]) {
        noteElements[index].remove();
    }
}

// Zapis wszystkich notatek
async function saveAllNotes() {
    const noteElements = document.querySelectorAll('.note-item');
    const notes = [];
    
    noteElements.forEach(element => {
        const textarea = element.querySelector('.note-content');
        if (textarea.value.trim()) {
            notes.push({
                content: textarea.value.trim(),
                timestamp: new Date().toISOString()
            });
        }
    });
    
    try {
        // Symulacja zapisu notatek
        await apiRequest('notes', 'POST', { notes });
        // W rzeczywistości: await apiRequest('notes', 'POST', { notes });
        
        alert('Notatki zostały zapisane!');
        
    } catch (error) {
        alert('Błąd zapisywania notatek: ' + error.message);
    }
}

// Dane testowe dla symulacji API
// W rzeczywistej aplikacji te dane będą pochodzić z API
const mockData = {
    board: { content: "Witajcie na tablicy nauczyciela!\n\nDzisiejsze tematy:\n1. Wprowadzenie do JavaScript\n2. Praca z API\n3. Projekt grupowy\n\nZadanie domowe: Stworzenie prostej aplikacji webowej." },
    messages: [
        { user_name: "Nauczyciel", content: "Witam wszystkich na czacie!", timestamp: new Date(Date.now() - 300000).toISOString() },
        { user_name: "Uczeń1", content: "Dzień dobry, mam pytanie odnośnie zadania domowego", timestamp: new Date(Date.now() - 120000).toISOString() },
        { user_name: "Uczeń2", content: "Ja też mam pytanie", timestamp: new Date(Date.now() - 60000).toISOString() }
    ],
    users: [
        { name: "Nauczyciel", online: true, role: "teacher" },
        { name: "Uczeń1", online: true, role: "student" },
        { name: "Uczeń2", online: true, role: "student" },
        { name: "Uczeń3", online: false, role: "student" }
    ],
    notes: [
        { content: "Przeczytać rozdział 5 z podręcznika", timestamp: new Date(Date.now() - 86400000).toISOString() },
        { content: "Przygotować się do testu z JavaScript", timestamp: new Date().toISOString() }
    ]
};

// Mockowanie API dla celów demonstracyjnych
window.apiRequest = async function(endpoint, method = 'GET', data = null) {
    // Symulacja opóźnienia sieci
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switch (endpoint) {
        case 'board':
            if (method === 'GET') {
                return mockData.board;
            } else if (method === 'PUT') {
                mockData.board.content = data.content;
                return { success: true };
            }
            break;
            
        case 'messages':
            if (method === 'GET') {
                return mockData.messages;
            } else if (method === 'POST') {
                mockData.messages.push({
                    user_name: data.user_name,
                    content: data.content,
                    timestamp: data.timestamp
                });
                return { success: true };
            }
            break;
            
        case 'users':
            return mockData.users;
            
        case 'notes':
            if (method === 'GET') {
                return mockData.notes;
            } else if (method === 'POST') {
                // W rzeczywistej aplikacji tutaj byłby zapis do bazy
                return { success: true };
            }
            break;
            
        default:
            throw new Error('Endpoint nie istnieje');
    }
};
// Wylogowanie użytkownika
function logout() {
    // Czyścimy dane o użytkowniku
    currentUser = null;
    authToken = null;
    currentRole = null;

    // Zatrzymujemy polling czatu
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }

    // Ukrywamy sekcję informacji o użytkowniku
    const userInfo = document.getElementById('userInfo');
    userInfo.style.display = 'none';

    // Pokazujemy zakładkę logowania
    document.querySelector('.nav-link[data-tab="tab1"]').parentElement.style.display = 'block';
    document.querySelector('.nav-link[data-tab="tab1"]').click();

    // Ukrywamy przycisk wylogowania
    document.getElementById('logoutBtn').style.display = 'none';
}
