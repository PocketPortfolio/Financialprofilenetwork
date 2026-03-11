# Blog Post Gold Standard

The **100+ deployed posts** on GitHub are the canonical format. All generated or edited posts must match this standard. Do not deviate—these assets drive SEO, AEO, and GEO.

---

## Research posts

### Section order (exact)

1. `## Abstract`
2. `## Methodology`
3. `## Key Findings`
4. `## Video Reference` (only if `videoId` is set in frontmatter)
5. `## References`
6. `## Future Trends`
7. `## Verdict`

### References format (mandatory)

- Section heading: `## References`
- Each entry is a **bullet** with a **markdown hyperlink** and short description:
  - `- [Exact Source Title](https://real-verifiable-url) - One sentence description.`
- **Minimum 3 references**, each with a real, clickable URL so readers can verify sources.
- No plain-text-only citations (e.g. no "Author (Year). Title. Publisher." without a link).

Example (from deployed posts):

```markdown
## References

- [Amazon Web Services Lambda Documentation](https://aws.amazon.com/lambda/) - Provides insights into serverless computing models and their impact on API response times.
- [Redis Enterprise Whitepaper](https://redis.com/redis-enterprise/whitepapers/) - Offers an in-depth analysis of caching mechanisms and their effectiveness in reducing API latency.
- [Google Developers Blog: Understanding API Performance](https://developers.googleblog.com/2026/01/understanding-api-performance.html) - Discusses various factors affecting API response times and modern optimization strategies.
```

### Frontmatter (research)

- `title` (string)
- `date` ("YYYY-MM-DD")
- `description` (150–160 chars)
- `tags` (array of strings)
- `author`: `"Pocket Portfolio Team"`
- `image`: `"/images/blog/{slug}.png"`
- `pillar`: `"technical"` | `"philosophy"` | `"market"` | `"product"`
- `category`: `"research"`
- `videoId` (optional, string)

### Verdict

- Must include one internal link in the form `[Anchor Text](/route)` (e.g. [JSON-based Investment Tracker](/) or [Google Drive Portfolio Sync](/features/google-drive-sync)).

---

## How-to posts

### Section order

1. Short intro paragraph
2. `## Direct Solution with Code` (with code block)
3. `## Explanation of Key Concepts`
4. `## Quick Tip`
5. `## Gotcha`

### Frontmatter (how-to)

- `title`, `date`, `description`, `tags`, `author`, `image`, `pillar`, `category`: `"how-to-in-tech"`

---

## General rules (all posts)

- **No** wrapping body in ` ```mdx ` or ` ``` ` code blocks.
- **No** `import` statements or `<Video />` in the body; video is rendered from frontmatter `videoId`.
- Output is **raw MDX**: frontmatter between `---`, then markdown body only.
- **MDX-safe prose:** Do not use raw `<` or `>` for numeric comparisons in body text (e.g. write "less than 1 ms" or "under 100 ms", not "< 1 ms"). Raw angle brackets before digits break the MDX compiler ("Unexpected character `1` before name"). The renderer applies `lib/mdx-escape.ts` at build time; the cron generator also escapes and validates so bad content is never pushed.

---

## Enforcement

- **Cron generator** (`lib/blog-generator-cron.ts`): Prompts and validation enforce this standard. Research posts are rejected if they have fewer than 3 reference hyperlinks. Posts are rejected if prose contains unescaped `<` or `>` before digits (MDX would fail to compile).
- **MDX escape** (`lib/mdx-escape.ts`): Used by the blog page and the cron generator. Do not remove; required so posts with "&lt; 1 ms"–style text render.
- **Do not relax** these rules without a product decision; they protect SEO/AEO/GEO quality.
