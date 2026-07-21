param(
  [Parameter(Mandatory = $true)]
  [string]$GithubRepo,

  [Parameter(Mandatory = $true)]
  [string]$GithubToken,

  [Parameter(Mandatory = $true)]
  [string]$VercelToken
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".git")) {
  git init
}

git add .
git commit -m "Initial BaseMint production app"
git branch -M main

$remoteUrl = "https://$GithubToken@github.com/$GithubRepo.git"
if (-not (git remote)) {
  git remote add origin $remoteUrl
} else {
  git remote set-url origin $remoteUrl
}

git push -u origin main
npx vercel --prod --token $VercelToken
