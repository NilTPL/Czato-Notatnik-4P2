<?php
function handleMessages($pdo, $method, $id = null)
{
    switch ($method) {
        case 'GET':
            // Pobierz wiadomości z JOIN do users żeby mieć nazwy użytkowników
            $stmt = $pdo->query("
                SELECT m.*, u.username 
                FROM `messages` m 
                LEFT JOIN `users` u ON m.user_ID = u.ID 
                ORDER BY m.ID ASC
            ");
            $received = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($received);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (empty($data['content']) || empty($data['user_ID'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing content or user_ID']);
                return;
            }
            
            // Użyj username z danych (nie pobieraj ponownie z bazy)
            $username = $data['username'] ?? 'Nieznany';
            
            $stmt = $pdo->prepare("INSERT INTO `messages` (`user_ID`, `username`, `content`) VALUES (?, ?, ?)");
            $stmt->execute([$data['user_ID'], $username, $data['content']]);
            
            echo json_encode(['success' => true]);
            break;
    }
}