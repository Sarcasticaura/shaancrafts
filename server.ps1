# shaanCrafts Local Web Server (Pure PowerShell - Production Grade)
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
    Write-Host "--------------------------------------------------"
    Write-Host "  shaanCrafts Premium Web Server is LIVE!         "
    Write-Host "  Open: http://127.0.0.1:$port/                   "
    Write-Host "  Open: http://localhost:$port/                   "
    Write-Host "--------------------------------------------------"
    Write-Host "Press Ctrl+C in terminal to stop server."
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $bytes = $null
        $contentType = "application/octet-stream"
        
        # Map URL to local file path
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }
        
        # Clean URL path
        $cleanPath = $urlPath.Replace("/", "\").TrimStart("\")
        $filePath = [System.IO.Path]::Combine((Get-Location).Path, $cleanPath)
        
        Write-Host "Request: $($request.HttpMethod) $($request.Url.PathAndQuery)"
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css" }
                ".js"   { "text/javascript" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            
            # Skip writing body for HEAD requests
            if ($request.HttpMethod -eq "HEAD") {
                Write-Host "HEAD request: returned headers only."
            } else {
                try {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    Write-Host "Write successful: $cleanPath"
                }
                catch {
                    $errMsg = $_.Exception.Message
                    Write-Host "Write FAILED for file $cleanPath - $errMsg"
                }
            }
        } else {
            Write-Host "File Not Found: $filePath"
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $urlPath")
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $errBytes.Length
            
            if ($request.HttpMethod -ne "HEAD") {
                try {
                    $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                }
                catch {
                    Write-Host "Write FAILED for 404 page"
                }
            }
        }
        
        try {
            $response.OutputStream.Close()
            Write-Host "Response closed."
        }
        catch {
            $errMsg = $_.Exception.Message
            Write-Host "Error closing response: $errMsg"
        }
        Write-Host "--------------------"
    }
}
catch {
    Write-Error $_.Exception.Message
}
finally {
    if ($null -ne $listener -and $listener.IsListening) {
        $listener.Stop()
    }
}
