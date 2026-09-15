Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot "..\public\icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null
}

function Create-PwaIcon {
    param(
        [string]$FileName,
        [int]$Size,
        [bool]$Maskable
    )

    $outPath = Join-Path $iconsDir $FileName
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background color #10B981
    $emeraldColor = [System.Drawing.ColorTranslator]::FromHtml('#10B981')
    $bgBrush = New-Object System.Drawing.SolidBrush($emeraldColor)
    $g.FillRectangle($bgBrush, 0, 0, $Size, $Size)

    # Calculate wallet dimensions
    $pad = $Size * 0.22
    $w = $Size - (2 * $pad)
    $h = $w * 0.72
    $top = ($Size - $h) / 2

    # Draw White Wallet Body
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $radius = [float]($Size * 0.08)
    $rect = New-Object System.Drawing.RectangleF($pad, $top, $w, $h)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($rect.X, $rect.Y, $radius * 2, $radius * 2, 180, 90)
    $path.AddArc($rect.Right - $radius * 2, $rect.Y, $radius * 2, $radius * 2, 270, 90)
    $path.AddArc($rect.Right - $radius * 2, $rect.Bottom - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $path.CloseFigure()
    $g.FillPath($whiteBrush, $path)

    # Draw Wallet Flap
    $flapW = $w * 0.4
    $flapH = $h * 0.44
    $flapX = $rect.Right - $flapW + ($Size * 0.01)
    $flapY = $top + ($h - $flapH) / 2

    $flapPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $flapRadius = [float]($radius * 0.8)
    $flapRect = New-Object System.Drawing.RectangleF($flapX, $flapY, $flapW, $flapH)
    $flapPath.AddArc($flapRect.X, $flapRect.Y, $flapRadius * 2, $flapRadius * 2, 180, 90)
    $flapPath.AddArc($flapRect.Right - $flapRadius * 2, $flapRect.Y, $flapRadius * 2, $flapRadius * 2, 270, 90)
    $flapPath.AddArc($flapRect.Right - $flapRadius * 2, $flapRect.Bottom - $flapRadius * 2, $flapRadius * 2, $flapRadius * 2, 0, 90)
    $flapPath.AddArc($flapRect.X, $flapRect.Bottom - $flapRadius * 2, $flapRadius * 2, $flapRadius * 2, 90, 90)
    $flapPath.CloseFigure()
    $g.FillPath($bgBrush, $flapPath)

    # Clasp Coin in Gold (#F59E0B)
    $goldColor = [System.Drawing.ColorTranslator]::FromHtml('#F59E0B')
    $goldBrush = New-Object System.Drawing.SolidBrush($goldColor)
    $coinSize = $flapH * 0.45
    $coinX = $flapX + ($flapW * 0.3)
    $coinY = $flapY + ($flapH - $coinSize) / 2
    $g.FillEllipse($goldBrush, $coinX, $coinY, $coinSize, $coinSize)

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outPath ($Size x $Size)"
}

Create-PwaIcon "icon-192x192.png" 192 $false
Create-PwaIcon "icon-512x512.png" 512 $false
Create-PwaIcon "maskable-icon-512x512.png" 512 $true
