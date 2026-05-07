param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

function Release-ComObject {
  param([object]$Object)

  if ($null -ne $Object) {
    try {
      [System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($Object) | Out-Null
    } catch {
      # Best effort cleanup only.
    }
  }
}

$inputFullPath = [System.IO.Path]::GetFullPath($InputPath)
$outputFullPath = [System.IO.Path]::GetFullPath($OutputPath)
$outputDir = [System.IO.Path]::GetDirectoryName($outputFullPath)

if (-not (Test-Path -LiteralPath $inputFullPath -PathType Leaf)) {
  throw "Input file not found: $inputFullPath"
}

if (-not (Test-Path -LiteralPath $outputDir -PathType Container)) {
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

$extension = [System.IO.Path]::GetExtension($inputFullPath).ToLowerInvariant()

switch ($extension) {
  { $_ -in @(".doc", ".docx", ".odt") } {
    $word = $null
    $document = $null

    try {
      $word = New-Object -ComObject Word.Application
      $word.Visible = $false
      $word.DisplayAlerts = 0
      try { $word.AutomationSecurity = 3 } catch {}

      $document = $word.Documents.Open($inputFullPath, $false, $true)
      $document.ExportAsFixedFormat($outputFullPath, 17)
    } finally {
      if ($null -ne $document) {
        try { $document.Close($false) } catch {}
      }

      if ($null -ne $word) {
        try { $word.Quit() } catch {}
      }

      Release-ComObject $document
      Release-ComObject $word
    }
  }

  { $_ -in @(".ppt", ".pptx", ".odp") } {
    $msoTrue = -1
    $msoFalse = 0
    $powerPoint = $null
    $presentation = $null

    try {
      $powerPoint = New-Object -ComObject PowerPoint.Application
      try { $powerPoint.AutomationSecurity = 3 } catch {}

      $presentation = $powerPoint.Presentations.Open(
        $inputFullPath,
        $msoTrue,
        $msoFalse,
        $msoFalse
      )
      $presentation.SaveAs($outputFullPath, 32)
    } finally {
      if ($null -ne $presentation) {
        try { $presentation.Close() } catch {}
      }

      if ($null -ne $powerPoint) {
        try { $powerPoint.Quit() } catch {}
      }

      Release-ComObject $presentation
      Release-ComObject $powerPoint
    }
  }

  { $_ -in @(".xls", ".xlsx", ".ods") } {
    $excel = $null
    $workbook = $null

    try {
      $excel = New-Object -ComObject Excel.Application
      $excel.Visible = $false
      $excel.DisplayAlerts = $false
      try { $excel.AutomationSecurity = 3 } catch {}

      $workbook = $excel.Workbooks.Open($inputFullPath, 3, $true)
      $workbook.ExportAsFixedFormat(0, $outputFullPath)
    } finally {
      if ($null -ne $workbook) {
        try { $workbook.Close($false) } catch {}
      }

      if ($null -ne $excel) {
        try { $excel.Quit() } catch {}
      }

      Release-ComObject $workbook
      Release-ComObject $excel
    }
  }

  default {
    throw "Unsupported Office extension: $extension"
  }
}

if (-not (Test-Path -LiteralPath $outputFullPath -PathType Leaf)) {
  throw "PDF output was not created: $outputFullPath"
}

Write-Output $outputFullPath
