param(
  [string]$PrismaUrl,
  [string]$MigrationsPath = "prisma/migrations"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-EnvValue {
  param([string]$Path, [string]$Key)
  if (-not (Test-Path $Path)) { return $null }
  $content = Get-Content -Raw $Path
  $escapedKey = [regex]::Escape($Key)
  $patterns = @(
    "$escapedKey\s*=\s*""([^""]*)""",
    "$escapedKey\s*=\s*'([^']*)'",
    "$escapedKey\s*=\s*([^\r\n#]+)"
  )
  foreach ($pattern in $patterns) {
    $m = [regex]::Match($content, $pattern)
    if ($m.Success) {
      return $m.Groups[1].Value.Trim()
    }
  }
  return $null
}

function Convert-PrismaToAdo {
  param([string]$Url)
  if (-not $Url) { throw "Prisma URL is empty." }
  if ($Url -notmatch "^sqlserver://") {
    throw "Only sqlserver:// URLs are supported. Got: $Url"
  }
  $raw = $Url.Substring("sqlserver://".Length)
  $parts = $raw.Split(";", [System.StringSplitOptions]::RemoveEmptyEntries)
  if ($parts.Length -lt 1) { throw "Invalid Prisma URL format." }

  $hostPort = $parts[0].Trim()
  $server = $hostPort -replace ":", ","

  $kv = @{}
  for ($i = 1; $i -lt $parts.Length; $i++) {
    $p = $parts[$i]
    if ($p -match "=") {
      $kvp = $p.Split("=", 2)
      $k = $kvp[0].Trim().ToLower()
      $v = $kvp[1].Trim()
      $kv[$k] = $v
    }
  }

  $ado = "Server=$server;"
  if ($kv.ContainsKey("database")) { $ado += "Database=$($kv["database"]);" }
  if ($kv.ContainsKey("user")) { $ado += "User ID=$($kv["user"]);" }
  if ($kv.ContainsKey("password")) { $ado += "Password=$($kv["password"]);" }
  if ($kv.ContainsKey("encrypt")) { $ado += "Encrypt=$($kv["encrypt"]);" }
  if ($kv.ContainsKey("trustservercertificate")) { $ado += "TrustServerCertificate=$($kv["trustservercertificate"]);" }
  if ($kv.ContainsKey("connecttimeout")) { $ado += "Connection Timeout=$($kv["connecttimeout"]);" }
  return $ado
}

function Mask-ConnectionString {
  param([string]$Conn)
  return ($Conn -replace "Password=[^;]*", "Password=***")
}

$envPath = Join-Path $PSScriptRoot "..\\.env"
if (-not $PrismaUrl) {
  $PrismaUrl = Get-EnvValue -Path $envPath -Key "FLOWLY_DATABASE_URL"
}
if (-not $PrismaUrl) {
  throw "FLOWLY_DATABASE_URL not found. Pass -PrismaUrl explicitly."
}

$adoConn = Convert-PrismaToAdo -Url $PrismaUrl
Write-Host ("Using connection: " + (Mask-ConnectionString $adoConn))

$migrationsRoot = Join-Path $PSScriptRoot "..\\$MigrationsPath"
if (-not (Test-Path $migrationsRoot)) {
  throw "Migrations path not found: $migrationsRoot"
}

$dirs = Get-ChildItem -Path $migrationsRoot -Directory | Sort-Object Name
if ($dirs.Count -eq 0) {
  Write-Host "No migrations found."
  exit 0
}

$cn = New-Object System.Data.SqlClient.SqlConnection($adoConn)
$cn.Open()

# Ensure _prisma_migrations table exists
$ensureCmd = $cn.CreateCommand()
$ensureCmd.CommandText = @"
IF OBJECT_ID(N'_prisma_migrations', 'U') IS NULL
BEGIN
  CREATE TABLE _prisma_migrations (
    id NVARCHAR(36) NOT NULL,
    checksum NVARCHAR(64) NOT NULL,
    finished_at DATETIME2 NULL,
    migration_name NVARCHAR(255) NOT NULL,
    logs NVARCHAR(MAX) NULL,
    rolled_back_at DATETIME2 NULL,
    started_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    applied_steps_count INT NOT NULL DEFAULT 0,
    CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id)
  );
END
"@
$ensureCmd.ExecuteNonQuery() | Out-Null

foreach ($dir in $dirs) {
  $migrationName = $dir.Name
  $sqlPath = Join-Path $dir.FullName "migration.sql"

  $checkCmd = $cn.CreateCommand()
  $checkCmd.CommandText = "SELECT COUNT(*) FROM _prisma_migrations WHERE migration_name = @name AND rolled_back_at IS NULL"
  $null = $checkCmd.Parameters.AddWithValue("@name", $migrationName)
  $exists = [int]$checkCmd.ExecuteScalar()

  if ($exists -gt 0) {
    Write-Host "SKIP  $migrationName (already applied)"
    continue
  }

  $sql = ""
  if (Test-Path $sqlPath) {
    $sql = Get-Content -Raw $sqlPath
  }

  Write-Host "APPLY $migrationName"

  if (-not [string]::IsNullOrWhiteSpace($sql)) {
    $cmd = $cn.CreateCommand()
    $cmd.CommandTimeout = 0
    $cmd.CommandText = $sql
    $cmd.ExecuteNonQuery() | Out-Null
  }

  $checksum = ""
  if (Test-Path $sqlPath) {
    $checksum = (Get-FileHash -Algorithm SHA256 -Path $sqlPath).Hash.ToLower()
  } else {
    $checksum = ("0" * 64)
  }

  if ([string]::IsNullOrWhiteSpace($sql)) {
    $steps = 0
  } else {
    $steps = 1
  }

  $insertCmd = $cn.CreateCommand()
  $insertCmd.CommandText = @"
INSERT INTO _prisma_migrations
(id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES
(@id, @checksum, SYSUTCDATETIME(), @name, NULL, NULL, SYSUTCDATETIME(), @steps)
"@
  $null = $insertCmd.Parameters.AddWithValue("@id", [guid]::NewGuid().ToString())
  $null = $insertCmd.Parameters.AddWithValue("@checksum", $checksum)
  $null = $insertCmd.Parameters.AddWithValue("@name", $migrationName)
  $null = $insertCmd.Parameters.AddWithValue("@steps", $steps)
  $insertCmd.ExecuteNonQuery() | Out-Null
}

$cn.Close()
Write-Host "Done."
