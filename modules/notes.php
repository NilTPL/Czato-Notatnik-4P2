<?php
function handleNotes($pdo, $method, $id = null) {
    switch ($method) {
        case 'GET':
            // Pobierz notatki dla konkretnego użytkownika
            $userId = $_GET['user_id'] ?? null;
            if (!$userId) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID required']);
                return;
            }
            
            $stmt = $pdo->prepare("SELECT * FROM `notes` WHERE user_ID = ? ORDER BY updated_at DESC");
            $stmt->execute([$userId]);
            $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($notes);
            break;
            
        case 'POST':
            // Dodaj nową notatkę
            $data = json_decode(file_get_contents("php://input"), true);
            if (empty($data['user_ID']) || !isset($data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing user_ID or content']);
                return;
            }
            
            $title = $data['title'] ?? 'Nowa notatka';
            $content = $data['content'];
            $userId = $data['user_ID'];
            
            $stmt = $pdo->prepare("INSERT INTO `notes` (user_ID, title, content) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $title, $content]);
            
            $noteId = $pdo->lastInsertId();
            echo json_encode([
                'success' => true,
                'note_id' => $noteId
            ]);
            break;
            
        case 'PUT':
            // Edytuj notatkę
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Note ID required']);
                return;
            }
            
            $data = json_decode(file_get_contents("php://input"), true);
            if (!isset($data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing content']);
                return;
            }
            
            $title = $data['title'] ?? 'Nowa notatka';
            $content = $data['content'];
            
            $stmt = $pdo->prepare("UPDATE `notes` SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE ID = ?");
            $stmt->execute([$title, $content, $id]);
            
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            // Usuń notatkę
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Note ID required']);
                return;
            }
            
            $stmt = $pdo->prepare("DELETE FROM `notes` WHERE ID = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}