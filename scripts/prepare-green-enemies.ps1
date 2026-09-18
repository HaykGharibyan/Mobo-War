Add-Type -AssemblyName System.Drawing

$generatedRoot = 'C:\Users\Hayk\.codex\generated_images\01a07d28-d998-7a70-bc02-b8f4071936d6'
$assetRoot = 'C:\Users\Hayk\Desktop\Mobo War React\src\assets'
$jobs = @(
  @{ Source = 'exec-6669d0fe-f752-48ab-ad57-edadea117853.png'; Target = 'enemy-green-basic.png' },
  @{ Source = 'exec-1b003954-0d93-4e08-88a4-628b5cbbd5e2.png'; Target = 'enemy-green-fast.png' },
  @{ Source = 'exec-171ca1fb-b390-4790-bced-b31f9c08cbff.png'; Target = 'enemy-green-tank.png' },
  @{ Source = 'exec-e04ba963-c6e5-46ed-ab0a-a94f084af172.png'; Target = 'enemy-green-miniBoss.png' },
  @{ Source = 'exec-3e6de4ca-5401-4abc-9fc1-6cc99656fb90.png'; Target = 'enemy-green-boss.png' }
)

foreach ($job in $jobs) {
  $sourcePath = Join-Path $generatedRoot $job.Source
  $targetPath = Join-Path $assetRoot $job.Target
  $source = [System.Drawing.Bitmap]::new($sourcePath)
  $target = [System.Drawing.Bitmap]::new($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

  for ($x = 0; $x -lt $source.Width; $x++) {
    for ($y = 0; $y -lt $source.Height; $y++) {
      $pixel = $source.GetPixel($x, $y)
      $max = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
      $min = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
      $neutralBright = (($max - $min) -lt 18 -and $max -gt 150)
      $isWhiteBackground = ($pixel.R -gt 245 -and $pixel.G -gt 245 -and $pixel.B -gt 245)
      if ($neutralBright -or $isWhiteBackground) {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
      } else {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B))
      }
    }
  }

  $target.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $target.Dispose()
  $source.Dispose()
}
