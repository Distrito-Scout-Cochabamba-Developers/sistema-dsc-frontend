# Security: Sanitization, Trusted Types, and CSP

## Built-in XSS Protection

Angular treats all template-interpolated values as untrusted and sanitizes them contextually (HTML, style, URL, resource URL). Interpolation (`{{ value }}`) and property binding are safe by default.

Rules:

- Never concatenate user input into templates dynamically or use `eval`-like APIs.
- Avoid direct DOM manipulation (`ElementRef.nativeElement.innerHTML = ...`); it bypasses sanitization. Use template bindings instead.
- Binding to `[innerHTML]` is sanitized automatically — script tags and event handlers are stripped.

## `bypassSecurityTrust*` APIs

`DomSanitizer.bypassSecurityTrustHtml/Url/ResourceUrl/Style/Script` disables Angular's protection for a value. Treat every call as a security-sensitive code review item:

- Only bypass for values that are fully controlled by the application (never raw user input).
- Justify each usage with an inline comment explaining why the value is trusted.
- Prefer safer alternatives: sanitized `[innerHTML]`, `NgOptimizedImage`, or rendering structured data instead of raw HTML.

```ts
// Trusted: URL is built from a compile-time constant, not user input.
protected readonly videoUrl = inject(DomSanitizer)
  .bypassSecurityTrustResourceUrl(`https://player.example.com/embed/${EMBED_ID}`);
```

## Trusted Types and CSP

- Enable Trusted Types in production with the `angular` policy: `Content-Security-Policy: trusted-types angular; require-trusted-types-for 'script'`.
- Serve a strict CSP; Angular's runtime is compatible with `strict-dynamic` + nonces.
- Keep dependencies updated (`ng update`); most Angular security fixes ship in patch releases.

## HTTP-level Concerns

- `HttpClient` protects against XSRF via `withXsrfConfiguration` (cookie-to-header scheme) — enable it when the backend supports it.
- Never build URLs by concatenating unvalidated user input; validate at the boundary.
