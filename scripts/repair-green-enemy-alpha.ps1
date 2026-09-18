Add-Type -AssemblyName System.Drawing

$generatedRoot = 'C:\Users\Hayk\.codex\generated_images\01a07d28-d998-7a70-bc02-b8f4071936d6'
$assetRoot = 'C:\Users\Hayk\Desktop\Mobo War React\src\assets'
$jobs = @(
  @{ Source = 'exec-1b003954-0d93-4e08-88a4-628b5cbbd5e2.png'; Mask = 'enemy-fast-skin.png'; Target = 'enemy-green-fast.png' },
  @{ Source = 'exec-e04ba963-c6e5-46ed-ab0a-a94f084af172.png'; Mask = 'enemy-mini-boss-skin.png'; Target = 'enemy-green-miniBoss.png' }
)

foreach ($job in $jobs) {
  $source = [System.Drawing.Bitmap]::new((Join-Path $generatedRoot $job.Source))
  $mask = [System.Drawing.Bitmap]::new((Join-Path $assetRoot $job.Mask))
  if ($source.Width -ne $mask.Width -or $source.Height -ne $mask.Height) {
    $source.Dispose()
    $mask.Dispose()
    throw "Sprite and alpha mask dimensions differ for $($job.Target)."
  }

  $target = [System.Drawing.Bitmap]::new(
    $source.Width,
    $source.Height,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )

  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $alpha = $mask.GetPixel($x, $y).A
      if ($alpha -lt 8) {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      } else {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
      }
    }
  }

  $targetPath = Join-Path $assetRoot $job.Target
  $tempPath = "$targetPath.tmp.png"
  $target.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $target.Dispose()
  $mask.Dispose()
  $source.Dispose()
  Move-Item -LiteralPath $tempPath -Destination $targetPath -Force
}
