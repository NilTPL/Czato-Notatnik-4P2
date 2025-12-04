## Dokumentacja api

odczyt  treści tablicy:
`GET /api.php/board` -- pobiera z bazy z tabeli 'board' ID, treść i datę.
`POST /api.php/board` -- wrzuca do bazy w tabelę 'board' treść.
`PUT /api.php/board` -- aktualizuje treść w 'board' gdzie ID jest zgodne z tym podanym.
`DELETE /api.php/board` -- usuwa z 'board' treść o podanym id.

wiadomości:
`GET /api.php/messages` -- pobiera wszystkie wiadomości z 'messages' i ID autora wiadomości z 'users'.
`POST /api.php/messages` -- wrzuca do tablicy 'messages' ID autora, nazwę i treść.

notatki:
`GET /api.php/notes` -- pobiera wszystkie notatki użytkownika.
`POST /api.php/notes` -- wrzuca do notatek ID użytkownika, tytuł i treść.
`PUT /api.php/notes` -- aktualizuje tytuł, treść, datę i czas z podanym ID.
`DELETE /api.php/notes` -- usuwa całą notatkę z podanym ID.

rejestracja:
`POST /api.php/register` -- dodaje nową osobę do 'users' i przypisuje jej nazwę, hasło i rolę.

użytkownicy:
`GET /api.php/users` -- pobiera ID, username, ostatnie logowanie i czy jest online z 'users'.
`POST /api.php/users` -- aktualizuje 'users' i ustawia czy użytkownik jest online oraz datę i czas ostatniego logowania z podanym ID.
`PUT /api.php/users` -- aktualizuje 'users' z podanym ID i określa że jest offline.



