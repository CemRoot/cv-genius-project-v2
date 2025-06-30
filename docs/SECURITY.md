# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of CV Genius seriously. If you discover a security vulnerability, please follow these steps:

1. **DO NOT** open a public issue
2. Email us at: security@cvgenius.ie with details
3. Include the following information:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## What to expect

- We will acknowledge your email within 48 hours
- We will provide a detailed response within 7 days
- We will work on a fix and release it as soon as possible
- We will credit you for the discovery (unless you prefer to remain anonymous)

## Security Best Practices for Contributors

When contributing to CV Genius:

1. **Never commit sensitive data**
   - API keys
   - Passwords
   - Personal information
   - Database credentials

2. **Use environment variables**
   ```bash
   # Good
   const apiKey = process.env.NEXT_PUBLIC_API_KEY
   
   # Bad
   const apiKey = "sk-abc123..."
   ```

3. **Validate all inputs**
   - Sanitize user inputs
   - Use proper TypeScript types
   - Implement proper error handling

4. **Dependencies**
   - Keep dependencies up to date
   - Review security advisories
   - Use `npm audit` regularly

## Known Security Measures

- All admin routes are protected with JWT authentication
- API endpoints validate authentication tokens
- Input sanitization for CV content
- Rate limiting on API endpoints
- HTTPS only in production

Thank you for helping keep CV Genius secure!