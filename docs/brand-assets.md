# Brand assets in selected work

Verified against the brands' public websites on **7 September 2026**. These files are self-hosted: rendering the portfolio does not request brand artwork from a third-party server. Outbound project links are ordinary user-initiated navigation, not embeds.

## Craft Agents

- Local file: [`public/brands/craft-agents.svg`](../public/brands/craft-agents.svg).
- Official source: <https://thecraftagents.com/favicon.svg>.
- Header cross-check: the public homepage's JavaScript bundle, `https://thecraftagents.com/assets/index-BReO23Za.js`, renders the same path in its header home link, with `viewBox="0 0 24 24"`, `translate(3.4502, 3)` and purple `#9570BE`. This confirms it is the site's actual brand mark, not an invented asterisk or generic substitute. The hashed bundle is an observation, not a permanent asset dependency.
- Preserved: original path coordinates, viewBox, transform, fill and nonzero fill rule. The vector scales without rasterization. A neutral ivory tile behind the artwork mark provides contrast against the editorial green card; the mark itself is not recolored.
- Sanitization: reconstructed using only allowlisted `svg`, `g`, and `path` elements and static geometry/presentation attributes. Removed XML declaration, title, unused rectangle definition, IDs, `xlink` namespace and redundant internal `xlink:href`. No executable content, external references, CSS, embedded images, event handlers or animation.
- Primary destination: <https://thecraftagents.com>. A separate descriptive source-code link points to <https://github.com/craft-ai-agents/craft-agents-oss>.
- The adjacent “Craft Agents” typography is portfolio text, not a claim to reproduce an official wordmark.

## Yabune

- Local file: [`public/brands/yabune-solutions.png`](../public/brands/yabune-solutions.png).
- Official header source: <https://yabune-home.hu/wp-content/themes/yabune-theme/assets/images/Yabune%20Solutions%20Logo%20small%20black%20hor.png>.
- Original transparent PNG is **2941 × 805**, downloaded unmodified. The site displays it at approximately 320 × 88. The portfolio uses the native aspect ratio, not that rounded display ratio, at 160 CSS pixels wide with automatic height.
- Chosen over the site's alternative vertical Yabune Home mark because the official horizontal header wordmark is high resolution and stays legible in compact project captions. It identifies Yabune Solutions while the project text and destination describe Yabune Home.
- Project destination: <https://yabune-home.hu/en/>.

## Use and accessibility

These marks identify the products/organizations discussed in Gyula's selected work. They are descriptive trademark use, not portfolio branding, an endorsement claim, or a representation that the trademarks belong to the portfolio author. All marks remain the property of their respective owners; public availability is not a general reuse license. Reassess permissions for uses beyond this descriptive portfolio context.

Caption images use empty alternative text because nearby readable project text already identifies the brand. The Craft artwork is decorative inside an explicitly named link. No nested anchors are used. The architectural house is original, static, build-time SVG geometry and remains labeled **CONCEPT ILLUSTRATION**; it is not a photograph or a claimed Yabune installation.
