<?php
function handlemessages($pdo, $method, $id = null)
{
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM `messages` ORDER BY ID desc");
            $received = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($received);
        break;
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (empty($data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing content']);
                return;
            }
            $stmt = $pdo->prepare("INSERT INTO `messages` (`user_ID`, `content`) VALUES (?, ?)");
            $stmt -> execute([$data['user_ID'], $data['content']]);
            echo json_encode(['success' => true]);
        break;
    }
}