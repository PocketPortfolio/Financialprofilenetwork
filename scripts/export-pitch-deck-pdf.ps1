Param(
  [string]$PptxPath = "c:\Users\fitne\OneDrive\pocket-portfolio-app\docs\marketing\Pocket-Portfolio-Sovereign-Financial-AI.pptx",
  [string]$PdfPath  = "c:\Users\fitne\OneDrive\pocket-portfolio-app\docs\marketing\Pocket-Portfolio-Sovereign-Financial-AI.pdf"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $PptxPath)) {
  throw "PPTX not found: $PptxPath"
}

# 32 = ppSaveAsPDF
$ppSaveAsPDF = 32

$pp = New-Object -ComObject PowerPoint.Application
try {
  # Some environments disallow hiding the window. Avoid setting Visible=0.
  $pp.Visible = 1
  $presentation = $pp.Presentations.Open($PptxPath, $true, $true, $false)
  try {
    $presentation.SaveAs($PdfPath, $ppSaveAsPDF)
  } finally {
    $presentation.Close()
  }
} finally {
  $pp.Quit()
}

Write-Output "WROTE $PdfPath"

