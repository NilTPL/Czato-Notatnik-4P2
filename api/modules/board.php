<?php
function handleboard($pdo, $method, $id = null) {
    switch ($method) {
        case 'GET':
                $stmt = $pdo->query("SELECT * FROM `board` ORDER BY ID desc");
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
            $stmt = $pdo->prepare("INSERT INTO `board` (`content`, `timestamp`) values (?, LOCALTIMESTAMP())" );
            $stmt->execute([$data['content']]);
            echo json_encode(['success' => true]);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if (empty($data['content']) || empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'missing content or id']);
                return;
            }
            $stmt = $pdo->prepare("UPDATE `board` SET `content` = ?, `timestamp` = LOCALTIMESTAMP() WHERE `id` = ?");
            $stmt->execute([$data['content'], $data['id']]);
            echo json_encode(['success' => true]);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}