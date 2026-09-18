Add-Type -AssemblyName System.Drawing

$assetPath = 'C:\Users\Hayk\Desktop\Mobo War React\src\assets\enemy-lava-miniBoss.png'
$source = [System.Drawing.Bitmap]::new($assetPath)
$target = [System.Drawing.Bitmap]::new(
  $source.Width,
  $source.Height,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
)

for ($y = 0; $y -lt $source.Height; $y++) {
  for ($x = 0; $x -lt $source.Width; $x++) {
    $pixel = $source.GetPixel($x, $y)
    if ($pixel.A -lt 8) {
      $target.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
    } else {
      $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $pixel.R, $pixel.G, $pixel.B))
    }
  }
}

$tempPath = "$assetPath.tmp.png"
$target.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$target.Dispose()
$source.Dispose()
Move-Item -LiteralPath $tempPath -Destination $assetPath -Force
