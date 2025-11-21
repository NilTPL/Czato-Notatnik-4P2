<?php
function handleUsers($pdo, $method, $id = null) {
    switch ($method) {
        case 'GET':
            // Pobierz wszystkich użytkowników
            $stmt = $pdo->query("SELECT ID, username, role, is_online, last_login FROM `users`");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($users);
            break;
            
        case 'POST':
            // Logowanie użytkownika
            $data = json_decode(file_get_contents("php://input"), true);
            if (empty($data['username']) || empty($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing username or password']);
                return;
            }
            
            $username = $data['username'];
            $password = $data['password'];
            
            // Znajdź użytkownika
            $stmt = $pdo->prepare("SELECT * FROM `users` WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($password, $user['password'])) {
                // Aktualizuj status online i czas logowania
                $updateStmt = $pdo->prepare("UPDATE `users` SET is_online = 1, last_login = CURRENT_TIMESTAMP WHERE ID = ?");
                $updateStmt->execute([$user['ID']]);
                
                // Zwróć dane użytkownika (bez hasła)
                unset($user['password']);
                echo json_encode([
                    'success' => true,
                    'user' => $user
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid username or password']);
            }
            break;
            
        case 'PUT':
            // Wylogowanie użytkownika
            if ($id) {
                $stmt = $pdo->prepare("UPDATE `users` SET is_online = 0 WHERE ID = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'User ID required']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}