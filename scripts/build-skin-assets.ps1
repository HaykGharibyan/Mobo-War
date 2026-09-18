param(
  [string]$AssetsRoot = (Join-Path $PSScriptRoot '..\src\assets'),
  [string]$GeneratedRoot = 'C:\Users\Hayk\.codex\generated_images\01a07d28-d998-7a70-bc02-b8f4071936d6'
)

Add-Type -AssemblyName System.Drawing

$source = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;

public static class MoboSkinAssetBuilder {
  static byte Clip(float value) { return (byte)Math.Max(0, Math.Min(255, (int)Math.Round(value))); }
  static Color Tint(Color source, string skin) {
    if (source.A == 0 || skin == "default") return source;
    float r = source.R, g = source.G, b = source.B;
    float lum = r * .299f + g * .587f + b * .114f;
    float nr = r, ng = g, nb = b;
    switch (skin) {
      case "ninja": nr = lum * .34f + 20; ng = lum * .24f + 12; nb = lum * .73f + 34; break;
      case "knight": nr = lum * .73f + 28; ng = lum * .80f + 28; nb = lum * .94f + 38; break;
      case "cyber": nr = r * .62f + b * .36f + 14; ng = g * 1.20f + b * .20f + 12; nb = b * 1.16f + g * .16f + 18; break;
      case "golden": nr = lum * 1.28f + 22; ng = lum * .92f + 18; nb = lum * .28f + 6; break;
      case "blackgold":
        float dark = lum * .20f + 8;
        float gold = Math.Max(0, (lum - 72) * 1.35f);
        nr = dark + gold; ng = dark + gold * .72f; nb = dark + gold * .18f;
        break;
    }
    return Color.FromArgb(source.A, Clip(nr), Clip(ng), Clip(nb));
  }
  public static void Create(string input, string output, string skin) {
    using (var origin = new Bitmap(input))
    using (var result = new Bitmap(origin.Width, origin.Height, PixelFormat.Format32bppArgb)) {
      result.SetResolution(origin.HorizontalResolution, origin.VerticalResolution);
      for (int y = 0; y < origin.Height; y++) {
        for (int x = 0; x < origin.Width; x++) result.SetPixel(x, y, Tint(origin.GetPixel(x, y), skin));
      }
      result.Save(output, ImageFormat.Png);
    }
  }
}
'@
Add-Type -TypeDefinition $source -ReferencedAssemblies System.Drawing

$botSources = @{
  basic = @{ front = 'bot-basic-hd.png'; back = 'bot-basic-back-hd.png' }
  runner = @{ front = 'bot-runner-hd.png'; back = 'bot-runner-back-hd.png' }
  tank = @{ front = 'bot-tank-hd.png'; back = 'bot-tank-back-simple-hd.png' }
}
$skins = @('ninja','knight','cyber','golden','blackgold')
foreach ($kind in $botSources.Keys) {
  foreach ($side in @('front','back')) {
    $input = Join-Path $AssetsRoot $botSources[$kind][$side]
    foreach ($skin in $skins) {
      $output = Join-Path $AssetsRoot ("bot-$kind-skin-$skin-$side.png")
      [MoboSkinAssetBuilder]::Create($input, $output, $skin)
    }
  }
}

$premium = @{
  basic = 'exec-187a20b4-a9a1-4833-95f6-3e0b8a8a8a8b.png'
  runner = 'exec-ec3e4545-bd02-4ec0-b532-27bf4f52443a.png'
  tank = 'exec-f3f0ab77-7ca0-4fe0-bfab-084ec824bf2b.png'
}
foreach ($kind in $premium.Keys) {
  Copy-Item -LiteralPath (Join-Path $GeneratedRoot $premium[$kind]) -Destination (Join-Path $AssetsRoot "bot-$kind-skin-blackgold-front.png") -Force
}

# Reward-card art is deliberately split into independent raster assets so the
# battle-result UI has no dependency on emoji, SVG, or CSS sprite positions.
$boosterSource = Join-Path $AssetsRoot 'booster-rewards-art.png'
$boosterImage = [System.Drawing.Bitmap]::new($boosterSource)
try {
  $sliceWidth = [int]($boosterImage.Width / 3)
  @('freeze','army','blast') | ForEach-Object -Begin { $index = 0 } -Process {
    $target = [System.Drawing.Bitmap]::new($sliceWidth, $boosterImage.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($target)
      try { $graphics.DrawImage($boosterImage, [System.Drawing.Rectangle]::new(0,0,$sliceWidth,$boosterImage.Height), [System.Drawing.Rectangle]::new($index*$sliceWidth,0,$sliceWidth,$boosterImage.Height), [System.Drawing.GraphicsUnit]::Pixel) }
      finally { $graphics.Dispose() }
      $target.Save((Join-Path $AssetsRoot "reward-card-$_.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $target.Dispose() }
    $index++
  }
} finally { $boosterImage.Dispose() }
Copy-Item -LiteralPath (Join-Path $GeneratedRoot 'exec-5e02868e-bd3f-41ff-a2e3-9622789af73d.png') -Destination (Join-Path $AssetsRoot 'reward-card-empty.png') -Force
