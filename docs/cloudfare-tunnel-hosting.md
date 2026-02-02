## Cloudflare Tunnel setup (local)

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

1. Start your app
2. cloudflared tunnel --url http://localhost:3000

===========
EXPOSING IT TO LOCAL
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.22.38.244
netsh interface portproxy show all
