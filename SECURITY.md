# Security Policy

## Report a vulnerability
Email **security@pocketportfolio.app**. We aim to acknowledge within 48 hours and target fixes or mitigations inside 7 days for High/Critical issues.

## Scope
- Web app and serverless APIs under this repository.
- Excludes upstream third-party services (Firebase, Yahoo, CoinGecko, OXR), beyond our configuration.

## Automated checks
- Dependency review (GitHub) on pull requests
- Secret scanning: Gitleaks and TruffleHog on pull requests
- Dependabot: weekly npm and GitHub Actions dependency updates
- CodeQL: code scanning on push and pull requests (main, develop)
- Weekly OWASP ZAP baseline scan (and on dispatch) against `secrets.ZAP_TARGET_URL` or https://pocketportfolio.app

See `docs/security/README.md` for required GitHub Actions secrets and deploy clarification. See `docs/threat-model.md`, `docs/privacy-guidelines.md`, and `docs/incident-response.md`.
