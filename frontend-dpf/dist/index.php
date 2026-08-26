<?php
$html = file_get_contents(__DIR__ . '/app.html');
$path = $_SERVER['REQUEST_URI'];

// Avoid overhead for assets and non-HTML requests
if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico|json|txt|woff2?|map)$/i', $path)) {
    return false;
}

// Fetch OpenGraph meta tags from the backend API
$apiUrl = 'https://api.ywdp.org/api/v1/og-meta?path=' . urlencode($path);

// Use cURL to fetch meta tags quickly (1-2 seconds timeout)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 2);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close($ch);

if ($response) {
    $meta = json_decode($response, true);
    if (!empty($meta['success']) && !empty($meta['tags'])) {
        // Inject tags into the head
        $html = str_replace('</head>', $meta['tags'] . "\n</head>", $html);
        
        // Optionally update the title if provided
        if (!empty($meta['title'])) {
            $html = preg_replace('/<title>.*?<\/title>/i', '<title>' . htmlspecialchars($meta['title']) . ' - Djalaludin Pane Foundation</title>', $html);
        }
    }
}

header('Content-Type: text/html; charset=UTF-8');
echo $html;
