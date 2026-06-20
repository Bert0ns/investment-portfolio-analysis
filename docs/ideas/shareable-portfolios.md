# Shareable Portfolios (Zero-Backend)

## Problem Statement

How might we enable users to instantly share their complete portfolio configurations and parsed CSV data with others, entirely client-side, without requiring a backend database?

## Recommended Direction

**The "Smart PNG" with a "Data Cartridge" Fallback.**
We will generate a visual "Trading Card" PNG of the user's portfolio, injecting the heavily compressed portfolio state (via `pako` deflate) directly into a hidden PNG metadata chunk (`tEXt`). When a recipient drags this image into their app, we extract the metadata and instantly rebuild the state.

Because social media platforms often strip image metadata, we will also provide a safe fallback: exporting the raw compressed payload as a custom `.lens` data cartridge file, which guarantees the data survives any transfer.

## Key Assumptions to Validate

- [ ] **Social Media Stripping**: We assume some platforms will strip the PNG metadata. We need to test which popular platforms (WhatsApp, Discord, iMessage, Slack, Email) preserve the `tEXt` chunk.
- [ ] **Compression Ratio**: We assume `pako` can compress 1MB of JSON ETF data down to <100KB to comfortably fit inside a PNG. We need to verify the compression output of a massive 3-ETF portfolio.
- [ ] **Mobile UX**: We assume mobile users can easily import these files. Drag-and-drop is native on desktop, but we will need an explicit "Upload Image/File" button for mobile users.

## MVP Scope

**In Scope:**

- `pako` library integration for gzip compression/decompression of the portfolio state.
- HTML-to-Canvas PNG generation for a sleek, cyberpunk "Trading Card" visual.
- PNG metadata injection logic (writing and reading custom `tEXt` chunks in Javascript).
- **Payload Versioning**: Embedding an explicit `version` number (e.g., `version: 1`) in the JSON payload before compression to future-proof against structural changes to `EtfConfig`.
- A unified "Dropzone" in the UI that accepts both PNGs (extracts chunk) and `.lens` files.
- Exporting the `.lens` data cartridge as a safe fallback option.

**Out of Scope:**

- URL-based state sharing (abandoned due to hard browser string limits).
- Sending files directly to other users via peer-to-peer (WebRTC).
- A centralized template gallery.

## Not Doing (and Why)

- **Base64 encoding without compression**: The resulting strings would be massive (1MB+) and bloat the PNG file size unnecessarily, making it slow to share.
- **Relying entirely on the PNG**: We are explicitly adding the `.lens` fallback because relying solely on social networks to preserve binary image chunks is too fragile.
- **Backend Storage**: Violates the project's strict 100% client-side constraint.
