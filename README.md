# Discover Türkiye

A visual travel guide to 20 destinations across Türkiye's seven regions, in
**seven languages** — English, Deutsch, Русский, العربية, 日本語, Français, Italiano
(with right-to-left layout for Arabic).

147 statically generated pages, one real URL per destination per language:

```
/discover-turkiye/                        English home (x-default)
/discover-turkiye/place/{slug}/           English destination
/discover-turkiye/{lang}/                 home in de|ru|ar|ja|fr|it
/discover-turkiye/{lang}/place/{slug}/    destination in that language
```

Each page carries a self-referencing canonical, the full seven-language hreflang
set plus x-default, Open Graph tags and JSON-LD (`TouristAttraction`,
`BreadcrumbList`, `ItemList`). The body is printed at build time, so the content
is in the HTML source rather than only in the DOM after JavaScript runs.

**Live:** https://bubixo.com/discover-turkiye/ · **Sitemap:** https://bubixo.com/discover-turkiye/sitemap.xml

## Building

`build/` holds the generator. `data.js` is produced by merging the source data
with the translation batches; `build.mjs` writes `dist/`.

```
node build/extract.mjs && node build/merge.mjs   # data.js
node build/build.mjs                             # dist/ (147 pages + sitemap)
node build/check.mjs                             # acceptance checks
```

Photos from [Wikimedia Commons](https://commons.wikimedia.org), under CC licenses.
