# Tailscale Remote Access Runbook

Phase 1 should use Tailscale for private remote access. Do not expose the home server directly to the public internet until the hosted security architecture, WAF, rate limiting, and production incident process are ready.

## Goals

- Family members can reach the home server from WiFi or mobile data.
- Admin access remains private.
- No router port-forwarding is required.
- The server has a stable private Tailscale hostname.

## 1. Install Tailscale

On Ubuntu:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Authenticate in the browser when prompted.

## 2. Enable MagicDNS

In the Tailscale admin console:

1. Enable MagicDNS.
2. Name the server something memorable, such as `aomlegacy-home`.
3. Confirm the server is visible in the machines list.

## 3. Verify local service access

Start the compose stack:

```bash
cd infra/self-hosted
docker compose up -d reverse-proxy immich-server immich-machine-learning immich-redis immich-postgres
```

From the server:

```bash
curl -I http://localhost:8080
```

From another Tailscale device:

```bash
curl -I http://aomlegacy-home:8080
```

## 4. Invite family members

For Phase 1, invite trusted family members to the tailnet or use a dedicated family tailnet.

Recommended policy:

- Founder/admin devices can access server and SSH.
- Family viewer/contributor devices can access only the app port.
- Do not grant broad admin access to non-admin family devices.

## 5. Restrict with Tailscale ACLs

Use ACLs to separate app access from administrative access.

Example intent:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["group:family"],
      "dst": ["tag:aomlegacy-server:8080"]
    },
    {
      "action": "accept",
      "src": ["group:admins"],
      "dst": ["tag:aomlegacy-server:*"]
    }
  ],
  "tagOwners": {
    "tag:aomlegacy-server": ["group:admins"]
  }
}
```

Adapt this in the Tailscale admin console to the actual users, groups, and tags.

## 6. Mobile usage

Family members should:

1. Install Tailscale.
2. Sign into the family tailnet.
3. Keep Tailscale connected.
4. Install Immich mobile.
5. Configure Immich server URL as `http://aomlegacy-home:8080` or the chosen MagicDNS name/port.

## 7. Security expectations

- Use MFA for Tailscale accounts.
- Remove lost or old devices immediately.
- Do not share admin credentials.
- Keep the Ubuntu server patched.
- Use SSH keys, not password SSH.
- Prefer app-level accounts even though Tailscale controls network access.

## Completion criteria

- The server is reachable from a phone on mobile data through Tailscale.
- Immich mobile can log in and upload a test photo.
- Non-admin users cannot SSH to the server.
- Admin can revoke a test device from Tailscale and confirm access is removed.
