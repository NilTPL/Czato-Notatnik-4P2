// Konfiguracja API
const API_BASE_URL = '/GW4p/Czato-Notatnik-4P2/api.php';

// Globalne zmienne
let currentUser = null;
let currentRole = null;
let pollingInterval = null;

// Obsługa przełączania zakładek
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Sprawdź czy przycisk logout istnieje przed dodaniem event listenera
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

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

    // OBSŁUGA REJESTRACJI - DODANE
    document.getElementById('showRegister').addEventListener('click', showRegisterForm);
    document.getElementById('showLogin').addEventListener('click', showLoginForm);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Obsługa formularza logowania
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        try {
            // PRAWDZIWE logowanie z API
            await realLogin(login, password, role);

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

// FUNKCJE REJESTRACJI - DODANE
function showRegisterForm(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'none';
}

function showLoginForm(e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'none';
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
        const response = await apiRequest('register', 'POST', {
            username: username,
            password: password,
            role: role
        });

        if (response.success) {
            // Sukces - pokaz komunikat i wróć do logowania
            document.getElementById('registerError').style.display = 'none';
            document.getElementById('registerSuccess').textContent = response.message;
            document.getElementById('registerSuccess').style.display = 'block';
            
            // Wyczyść formularz
            document.getElementById('registerForm').reset();
            
            // Automatycznie wróć do logowania po 2 sekundach
            setTimeout(() => {
                showLoginForm(e);
            }, 2000);
        }
    } catch (error) {
        document.getElementById('registerError').textContent = error.message;
        document.getElementById('registerError').style.display = 'block';
        document.getElementById('registerSuccess').style.display = 'none';
    }
}

// PRAWDZIWE logowanie z API
async function realLogin(login, password, role) {
    try {
        const response = await apiRequest('users', 'POST', {
            username: login,
            password: password
        });

        if (response.success && response.user) {
            // Sprawdź czy wybrana rola zgadza się z rolą w bazie
            if (response.user.role !== role) {
                throw new Error('Wybrana rola nie zgadza się z kontem');
            }

            currentUser = {
                id: response.user.ID,
                name: response.user.username,
                role: response.user.role
            };
            currentRole = response.user.role;

            // Aktualizacja interfejsu użytkownika
            updateUserInterface();
            return response;
        } else {
            throw new Error('Nieprawidłowe dane logowania');
        }
    } catch (error) {
        throw new Error(error.message || 'Błąd logowania');
    }
}

// Aktualizacja interfejsu po zalogowaniu
function updateUserInterface() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.style.display = 'block';
    }

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
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            // Spróbuj parsować błąd z JSON
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Błąd HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Błąd API:', error);
        throw error;
    }
}

// Ładowanie tablicy nauczyciela Z BAZY DANYCH
async function loadTeacherBoard() {
    const boardContent = document.getElementById('boardContent');
    const boardLoading = document.getElementById('boardLoading');

    try {
        boardLoading.style.display = 'block';

        // Pobierz dane z API - prawdziwe dane z bazy
        const boardData = await apiRequest('board');

        boardLoading.style.display = 'none';

        if (boardData && boardData.length > 0) {
            // Weź pierwszą (lub najnowszą) tablicę
            const latestBoard = boardData[0];
            boardContent.textContent = latestBoard.content || 'Tablica jest pusta.';
        } else {
            boardContent.textContent = 'Tablica jest pusta. Kliknij "Edytuj tablicę" aby dodać treść.';
        }

    } catch (error) {
        boardLoading.innerHTML = `<div class="error">Błąd ładowania tablicy: ${error.message}</div>`;
    }
}

// Włączanie edycji tablicy
function enableBoardEditing() {
    // SPRAWDŹ CZY NAUCZYCIEL
    if (currentRole !== 'teacher') {
        alert('Tylko nauczyciel może edytować tablicę!');
        return;
    }
    
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

// Zapis treści tablicy DO BAZY DANYCH
async function saveBoardContent() {
    // SPRAWDŹ CZY NAUCZYCIEL
    if (currentRole !== 'teacher') {
        alert('Tylko nauczyciel może edytować tablicę!');
        return;
    }
    
    const boardEditor = document.getElementById('boardEditor');
    const boardContent = document.getElementById('boardContent');

    try {
        // Pobierz aktualną tablicę żeby poznać ID
        const currentBoard = await apiRequest('board');
        let boardId = 1; // Domyślne ID

        if (currentBoard && currentBoard.length > 0) {
            boardId = currentBoard[0].ID;
        }

        // Zaktualizuj tablicę w bazie
        await apiRequest('board', 'PUT', { 
            id: boardId,
            content: boardEditor.value 
        });

        boardContent.textContent = boardEditor.value;
        cancelBoardEditing();
        alert('Tablica została zaktualizowana!');

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

// Ładowanie wiadomości czatu Z BAZY DANYCH
// Ładowanie wiadomości czatu Z BAZY DANYCH - POPRAWIONE
async function loadMessages() {
    const chatMessages = document.getElementById('chatMessages');

    try {
        // Pobierz wiadomości z bazy
        const messages = await apiRequest('messages');

        chatMessages.innerHTML = '';

        if (messages.length === 0) {
            chatMessages.innerHTML = '<div class="loading">Brak wiadomości</div>';
            return;
        }

        // Wyświetl wiadomości w dobrej kolejności (najstarsze na górze, najnowsze na dole)
        messages.forEach(msg => {
            const time = new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const username = msg.username || `Użytkownik ${msg.user_ID}`;
            displayMessage(username, msg.content, time);
        });

        // Automatyczne przewinięcie na dół (do najnowszej wiadomości)
        scrollToBottom();

    } catch (error) {
        console.error('Błąd ładowania wiadomości:', error);
    }
}

// Wyświetlanie wiadomości - POPRAWIONE
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
}

// Automatyczne przewijanie na dół czatu
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Rozpoczęcie odpytywania czatu - POPRAWIONE
function startChatPolling() {
    // Wyczyść istniejący interval
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    // Załaduj wiadomości natychmiast
    loadMessages();
    
    // Ustaw odpytywanie co 3 sekundy (mniej agresywne)
    pollingInterval = setInterval(loadMessages, 3000);
}

// Wysyłanie wiadomości DO BAZY DANYCH
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (message && currentUser) {
        try {
            // Wyślij wiadomość do bazy
            await apiRequest('messages', 'POST', {
                content: message,
                user_ID: currentUser.id,
                username: currentUser.name
            });

            messageInput.value = '';
            // Automatycznie odśwież wiadomości
            loadMessages();
            
        } catch (error) {
            console.error('Błąd wysyłania wiadomości:', error);
            alert('Błąd wysyłania wiadomości: ' + error.message);
        }
    } else if (!currentUser) {
        alert('Musisz być zalogowany aby wysłać wiadomość!');
    }
}

// Ładowanie użytkowników Z BAZY DANYCH
async function loadUsers() {
    const usersList = document.getElementById('usersList');
    const usersLoading = document.getElementById('usersLoading');

    try {
        usersLoading.style.display = 'block';

        // Pobierz użytkowników z bazy
        const users = await apiRequest('users');

        usersLoading.style.display = 'none';
        usersList.innerHTML = '';

        users.forEach(user => {
            const userItem = document.createElement('li');
const userLastLogin = user ? user.last_login : "";
            userItem.innerHTML = `
                <span class="status-indicator ${user.is_online ? 'online' : 'offline'}"></span>
                ${user.username} ${user.role === 'teacher' ? '(Nauczyciel)' : '' }
                | Ostatnie zalogowanie: ${userLastLogin}
            `;
            usersList.appendChild(userItem);
        });
    } catch (error) {
        usersLoading.innerHTML = `<div class="error">Błąd ładowania użytkowników: ${error.message}</div>`;
    }
}

// Ładowanie notatek Z BAZY DANYCH
async function loadNotes() {
    const notesContainer = document.getElementById('notesContainer');
    const notesLoading = document.getElementById('notesLoading');
    
    // SPRAWDŹ CZY UŻYTKOWNIK JEST ZALOGOWANY
    if (!currentUser || !currentUser.id) {
        notesLoading.innerHTML = '<div class="error">Musisz być zalogowany aby zobaczyć notatki</div>';
        return;
    }

    try {
        notesLoading.style.display = 'block';
        
        // Pobierz notatki z bazy dla zalogowanego użytkownika
        const notes = await apiRequest(`notes?user_id=${currentUser.id}`);
        
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
    noteElement.dataset.noteId = note.ID;

    noteElement.innerHTML = `
        <div class="note-header">
            <span class="note-date">${new Date(note.updated_at || note.created_at).toLocaleString()}</span>
            <div class="note-actions">
                <button class="delete-note" data-note-id="${note.ID}">Usuń</button>
            </div>
        </div>
        <textarea class="note-content" data-note-id="${note.ID}">${note.content}</textarea>
    `;

    // Dodaj obsługę usuwania notatki
    const deleteBtn = noteElement.querySelector('.delete-note');
    deleteBtn.addEventListener('click', function() {
        deleteNote(note.ID);
    });

    return noteElement;
}

// Dodawanie nowej notatki DO BAZY DANYCH
async function addNewNote() {
    // SPRAWDŹ CZY ZALOGOWANY
    if (!currentUser || !currentUser.id) {
        alert('Musisz być zalogowany aby dodawać notatki!');
        return;
    }

    try {
        // Utwórz nową notatkę w bazie
        const response = await apiRequest('notes', 'POST', {
            user_ID: currentUser.id,
            title: 'Nowa notatka',
            content: 'Twoja nowa notatka...'
        });

        if (response.success) {
            // Załaduj notatki ponownie
            loadNotes();
        }
    } catch (error) {
        alert('Błąd tworzenia notatki: ' + error.message);
    }
}

// Usuwanie notatki Z BAZY DANYCH
async function deleteNote(noteId) {
    try {
        await apiRequest(`notes/${noteId}`, 'DELETE');
        // Załaduj notatki ponownie
        loadNotes();
    } catch (error) {
        alert('Błąd usuwania notatki: ' + error.message);
    }
}

// Zapis wszystkich notatek DO BAZY DANYCH - POPRAWIONE
async function saveAllNotes() {
    // SPRAWDŹ CZY ZALOGOWANY
    if (!currentUser || !currentUser.id) {
        alert('Musisz być zalogowany aby zapisywać notatki!');
        return;
    }

    const noteElements = document.querySelectorAll('.note-item');
    
    try {
        for (const element of noteElements) {
            const noteId = element.dataset.noteId;
            const textarea = element.querySelector('.note-content');
            const content = textarea.value.trim();
            
            if (content && noteId) {
                await apiRequest(`notes/${noteId}`, 'PUT', {
                    content: content,
                    title: 'Notatka'
                });
            }
        }
        
        alert('Notatki zostały zapisane!');
        
    } catch (error) {
        alert('Błąd zapisywania notatek: ' + error.message);
    }
}

// Wylogowanie użytkownika
async function logout() {
    try {
        // Zaktualizuj status użytkownika w bazie
        if (currentUser) {
            await apiRequest(`users/${currentUser.id}`, 'PUT');
        }
    } catch (error) {
        console.error('Błąd podczas wylogowania:', error);
    }

    // Czyścimy dane o użytkowniku
    currentUser = null;
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
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }

    // Czyścimy formularz logowania
    document.getElementById('loginForm').reset();
}

// Globalne funkcje dla HTML
window.deleteNote = deleteNote;