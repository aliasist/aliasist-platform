# Aliasist Repo Map

This is the canonical map of the Aliasist GitHub org. It keeps the suite organized around one public hub, one private platform, and a small set of focused supporting repos.

## Active surfaces

| Repo | Role | Surface | Status |
| --- | --- | --- | --- |
| `aliasist/aliasist-platform` | Private suite core | Portal, sist apps, worker API, shared packages | Live |
| `aliasist/aliasistabductor` | Public brand site | Homepage, visuals, easter egg, showcase content | Live |
| `aliasist/aliasist-hub` | Public launchpad | Suite entry point and status hub | Live |
| `aliasist/datasist` | DataSist frontend | Data-center intelligence app | Live |
| `aliasist/datasist-api` | DataSist backend | Worker/API layer for DataSist | Live |
| `aliasist/ecosist` | EcoSist app | Earth and environmental intelligence | Live |
| `aliasist/space-asist` | Space surface | Space and astronomy dashboard | Live |
| `aliasist/stockmarket` | Market surface | Market tracking and analysis | Live |
| `aliasist/news-worker` | News feed worker | Scheduled news aggregation | Live |
| `aliasist/aliasist-auth` | Auth portal | Sign-in and account access | Live |
| `aliasist/aliasist-image-worker` | Image worker | Generated image delivery | Live |
| `aliasist/phoenix-image-worker` | Image generator | Prompt-to-image backend | Live |
| `aliasist/chatroom` | Chat template | Room-based messaging surface | Live |
| `aliasist/llm-chat` | Chat worker | Conversational Worker routes | Live |
| `aliasist/pulse` | Legacy finance repo | Older market experiments | Legacy |
| `aliasist/tikasist` | Experimental repo | Internal sandbox surface | Experimental |
| `aliasist/aliasist-backup` | Archive repo | Snapshots, assets, recovery | Internal |

## What to keep consistent

- Each active repo should start with a short purpose statement.
- Each active repo should mention its live surface or Cloudflare role.
- Each active repo should keep its README brief and product-focused.
- Legacy repos should be clearly labeled as legacy or experimental.
- The main platform repo should stay the canonical overview for the suite.

## Cloudflare alignment

- `aliasist-platform` is the main Cloudflare-backed product stack.
- `aliasistabductor` is the public-facing site and brand surface.
- Worker repos should document their worker name, preview flow, and secrets.
- Pages repos should document their build command and deployed domain.

## Maintenance rule

If a repo becomes public-facing, it gets a short README, a banner, and a clear live URL.
If a repo becomes legacy, it gets labeled as such instead of being left ambiguous.
