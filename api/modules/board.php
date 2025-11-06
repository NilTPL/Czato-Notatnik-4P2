<?php
function handleboard($pdo, $method, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM board LIMIT 1");
                $stmt->execute([$id]);
            } else {
                $stmt = $pdo->query("SELECT * FROM board LIMIT 1");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (empty($data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing content']);
                return;
            }
            $stmt = $pdo->prepare("UPDATE board `content` = ?, `updated_at` = LOCALTIMESTAMP WHERE 1" );
            $stmt->execute([$data['content']]);
            echo json_encode(['success' => true, 'query' => $stmt]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}