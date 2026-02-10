<?php
session_start();
header('Content-Type: application/json');

require_once '../../config.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Admin only.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$userId = $input['id'] ?? null;
$firstName = trim($input['first_name'] ?? '');
$lastName = trim($input['last_name'] ?? '');
$role = $input['role'] ?? '';

// Validate input
if (empty($userId) || empty($firstName) || empty($lastName) || empty($role)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Validate role
$validRoles = ['admin', 'barangay_official'];
if (!in_array($role, $validRoles)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid role']);
    exit;
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    // Update user
    $stmt = $pdo->prepare("UPDATE users SET first_name = ?, last_name = ?, role = ? WHERE id = ?");
    $stmt->execute([$firstName, $lastName, $role, $userId]);

    echo json_encode([
        'success' => true,
        'message' => 'User updated successfully',
        'user' => [
            'id' => $userId,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => $role
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
