        // Obsługa przełączania zakładek
        document.addEventListener('DOMContentLoaded', function() {
            const navLinks = document.querySelectorAll('.nav-link');
            const tabContents = document.querySelectorAll('.tab-content');
            
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
                });
            });

            // Symulacja statusów użytkowników (do zastąpienia danymi z API)
            const userStatuses = document.querySelectorAll('.status-indicator');
            
            // Losowo ustaw statusy użytkowników (w rzeczywistej aplikacji dane będą z API)
            userStatuses.forEach(status => {
                const isOnline = Math.random() > 0.5;
                status.className = isOnline ? 'status-indicator online' : 'status-indicator offline';
            });

            // Obsługa formularza logowania
            const loginForm = document.querySelector('.login-form');
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const login = document.getElementById('login').value;
                const password = document.getElementById('password').value;
                
                // Tutaj będzie logika logowania (połączenie z API)
                console.log('Logowanie:', { login, password });
                
                // Przejdź do zakładki Tablica nauczyciela po zalogowaniu
                document.querySelector('.nav-link[data-tab="tab2"]').click();
            });
        });

