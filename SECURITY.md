# Security Policy

## Report a vulnerability
Email **security@pocketportfolio.app**. We aim to acknowledge within 48 hours and target fixes or mitigations inside 7 days for High/Critical issues.

## Scope
- Web app and serverless APIs under this repository.
- Excludes upstream third-party services (Firebase, Yahoo, CoinGecko, OXR), beyond our configuration.

## Automated checks
- Dependency review (GitHub)
- Secret scanning (Gitleaks)
- Weekly OWASP ZAP baseline scan against preview

See `docs/threat-model.md`, `docs/privacy-guidelines.md`, and `docs/incident-response.md`.
