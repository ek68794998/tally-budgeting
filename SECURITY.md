# Security Policy

## Supported Versions

Only the latest release receives security fixes.

## Reporting a Vulnerability

Please report vulnerabilities privately using GitHub's private vulnerability reporting: open the **Security** tab of this repository and choose **Report a vulnerability**. Do not open a public issue or pull request for a security problem.

Include as much of the following as you can:

- The affected version or commit
- Steps to reproduce
- The impact you expect (for example, reading or modifying financial data)

This is a personal project with minimal ongoing support. Reports are handled on a best-effort basis with no guaranteed response time. Please give me a reasonable chance to release a fix before disclosing the issue publicly.

## Security Model

Tally is built to be self-hosted by its operator. Keep the following in mind when deploying it and when judging whether something is a vulnerability.

- **Single shared password:** access is protected by one app-wide password (`APP_PASSWORD` or `APP_PASSWORD_FILE`). There are no user accounts, roles, or per-user audit trail. Anyone with the password can read, modify, and delete all data.
- **Authentication is on by default:** the app refuses to start unless a password is set or `DANGEROUSLY_DISABLE_AUTH=1` is set explicitly. If you disable it, you are responsible for protecting the app another way, such as an authenticating reverse proxy or a private network.
- **HTTPS is your responsibility:** over plain HTTP, the password and session cookie travel in cleartext. Put Tally behind a reverse proxy that terminates HTTPS (for example Caddy or Traefik) if it is reachable over anything other than a network you fully trust.
- **Sessions:** sessions are signed cookies using a random secret stored in the database. Changing the password invalidates all existing sessions.
- **Brute-force protection:** login attempts are rate limited. Because client IPs come from forwarded headers, which a client can spoof when the app is not behind a trusted proxy, a global limit also caps total failed attempts.
- **Your data stays with you:** Tally sends nothing to external services. Protect the host, the database, and your backups accordingly.

## Out of Scope

The following are generally not considered vulnerabilities:

- Issues that require existing access to the host, the database, or the environment variables
- Access gained because auth was disabled or the password was weak
- Exposure caused by deploying without HTTPS or a trusted network
- Denial of service from an authenticated user or from unrestricted network access
- Vulnerabilities in third-party dependencies with no demonstrated impact on Tally
