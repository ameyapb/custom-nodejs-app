# ComfyUI ↔ WSL2 Cheatsheet (Commands Only)

## 1️⃣ Windows (PowerShell — Run as Admin)

```powershell
$WIN_HOST = (Get-NetIPAddress -InterfaceAlias "vEthernet (WSL*)" -AddressFamily IPv4 -ErrorAction SilentlyContinue)?.IPAddress

# Fallback to WSL gateway detection
if (-not $WIN_HOST) {
  $WIN_HOST = (wsl -- ip route show default | Select-String "default via" | ForEach-Object { $_.Line.Split()[2] })
}

$WIN_HOST
```

# Reset old rules

netsh interface portproxy reset
netsh advfirewall firewall delete rule name="ComfyUI"

# Add port proxy

netsh interface portproxy add v4tov4 listenaddress=$WIN_HOST listenport=8188 connectaddress=127.0.0.1 connectport=8188

# Allow firewall

New-NetFirewallRule -DisplayName "ComfyUI" -Direction Inbound -LocalPort 8188 -Protocol TCP -Action Allow

# Verify ComfyUI is running

netstat -ano | findstr :8188

## 2️⃣ WSL (Linux)

# Get Windows host IP

WIN_HOST=$(ip route show default | awk '{print $3}')
echo $WIN_HOST

# Test connectivity

curl http://$WIN_HOST:8188

# Update env

sed -i "s|^COMFYUI_URL=.\*|COMFYUI_URL=http://$WIN_HOST:8188|" .env
grep COMFYUI_URL .env

# Run app test

npm run comfy-test

## 3️⃣ Cleanup / Reset (Windows — Admin)

netsh interface portproxy reset
netsh advfirewall firewall delete rule name="ComfyUI"
wsl --shutdown

## 4️⃣ Optional Alias (WSL)

echo 'alias winhost="ip route show default | awk '\''{print \$3}'\''"' >> ~/.bashrc
source ~/.bashrc
