# AI Things Considered - Deployment

## Automation

Comics are generated daily at 3 PM PST on claudevm (10.11.12.98) via systemd timer.

### Flow
```
claudevm (15:00 PST)
    │
    ├── ai-comics.timer triggers ai-comics.service
    │
    ├── run-comic.sh executes:
    │   1. Runs Python pipeline (generates comic from NPR RSS)
    │   2. git add comics/ai-things-considered/
    │   3. git commit + push
    │   4. Discord notification
    │
    └── GitHub receives push
            │
            └── Cloudflare Pages auto-deploys
```

### Files Updated Each Run
- `{date}.jpg` - The comic image
- `{date}.json` - Story metadata
- `latest.json` - Current comic pointer
- `latest-1.jpg` - Most recent comic
- `latest-2.jpg` - Previous comic
- `archive.json` - Full index for archive page

## Caching

Cloudflare caching is controlled via `/_headers` in repo root:

| Path | Cache Duration |
|------|----------------|
| `latest*` | 5 minutes |
| `archive.json` | 5 minutes |
| `2026-*.jpg/json` | 24 hours |

## Manual Operations

### Force cache refresh
Cloudflare dashboard > Caching > Purge Cache

### Check automation status
```bash
ssh 10.11.12.98 "systemctl list-timers ai-comics*"
ssh 10.11.12.98 "journalctl -u ai-comics.service -n 20"
```

### Update pipeline code
```bash
ssh 10.11.12.98 "cd ~/NAVIN/Projects/AI-Things-Considered && git pull"
```

### Manual comic generation
```bash
ssh 10.11.12.98 "sudo systemctl start ai-comics.service"
```

## Source

Comic generation code: https://github.com/benol5en/AI-Things-Considered
