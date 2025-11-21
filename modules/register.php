<?php
function handleRegister($pdo, $method, $id = null) {
    switch ($method) {
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Walidacja danych
            if (empty($data['username']) || empty($data['password']) || empty($data['role'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Wszystkie pola są wymagane']);
                return;
            }
            
            $username = $data['username'];
            $password = $data['password'];
            $role = $data['role'];
            
            // Sprawdź czy użytkownik już istnieje
            $checkStmt = $pdo->prepare("SELECT ID FROM `users` WHERE username = ?");
            $checkStmt->execute([$username]);
            $existingUser = $checkStmt->fetch();
            
            if ($existingUser) {
                http_response_code(409);
                echo json_encode(['error' => 'Użytkownik o tej nazwie już istnieje']);
                return;
            }
            
            // Zahaszuj hasło
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // Dodaj użytkownika
            $stmt = $pdo->prepare("INSERT INTO `users` (username, password, role) VALUES (?, ?, ?)");
            $stmt->execute([$username, $hashedPassword, $role]);
            
            $userId = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Konto zostało utworzone',
                'user_id' => $userId
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}