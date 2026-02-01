# ComfyUI integration (WSL2 + Windows)

## The one thing you need to know

The Windows host IP from WSL2 is **not** the `nameserver` in `/etc/resolv.conf`. It's your default gateway — get it from WSL directly:

```bash
# WSL — run this anytime you need the Windows host IP
WIN_HOST=$(ip route | grep default | awk '{print $3}')
echo $WIN_HOST
# e.g. 172.22.32.1
```

> This IP can change on reboot. Re-run the command if things stop working.

---

## Setup (PowerShell as Admin)

```powershell
# First, grab the same IP from PowerShell to use in the portproxy rule:
$WIN_HOST = (Get-NetIPAddress -InterfaceAlias "vEthernet (WSL*)" -AddressFamily IPv4).IPAddress

netsh interface portproxy add v4tov4 listenaddress=$WIN_HOST listenport=8188 connectaddress=127.0.0.1 connectport=8188
New-NetFirewallRule -DisplayName "ComfyUI" -Direction Inbound -LocalPort 8188 -Protocol TCP -Action Allow
```

Bind to `$WIN_HOST` specifically — `0.0.0.0` does not reliably forward to WSL2.

---

## Verify and configure (WSL)

```bash
WIN_HOST=$(ip route | grep default | awk '{print $3}')

# 1. Test connectivity
curl -v http://$WIN_HOST:8188/
# Expected: HTTP 200

# 2. Update .env with the current IP
sed -i "s|^COMFYUI_URL=.*|COMFYUI_URL=http://$WIN_HOST:8188|" .env

# 3. Confirm
grep COMFYUI_URL .env
# COMFYUI_URL=http://172.22.32.1:8188

# 4. Run test
npm run comfy-test
```

---

## Troubleshooting

| Symptom                       | Cause                                  | Fix                                                                                                 |
| ----------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Connection refused from WSL   | Portproxy missing or bound to wrong IP | Re-check `netsh interface portproxy show all`, rebind to `$WIN_HOST`                                |
| Connection refused from WSL   | ComfyUI not running                    | `netstat -ano \| findstr :8188` on Windows — confirm `127.0.0.1:8188 LISTENING`                     |
| Hangs (connects, no response) | Stale WinNAT state                     | `Restart-Service -Name "WinNAT" -Force`, then `netsh interface portproxy reset` and re-add the rule |
| Works on Windows, not WSL     | Wrong host IP in .env                  | Re-run the verify section above — the IP may have changed after a reboot                            |

---

## Cleanup

```powershell
$WIN_HOST = (Get-NetIPAddress -InterfaceAlias "vEthernet (WSL*)" -AddressFamily IPv4).IPAddress
netsh interface portproxy delete v4tov4 listenaddress=$WIN_HOST listenport=8188
netsh advfirewall firewall delete rule name="ComfyUI"
```
