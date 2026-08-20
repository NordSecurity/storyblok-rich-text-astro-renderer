# Release Process

For manual package publishing use npm's staged publishing workflow for releases.

## Prerequisites

- npm account with 2FA enabled
- Publish access to the package
- npm CLI version 11.15.0 or higher
- Node.js version 22.14.0 or higher

## Release Steps

1. Navigate to the lib package folder:
   ```bash
   cd lib
   ```

2. Stage the release (build runs via npm hooks):
   ```bash
   npm stage publish
   ```

3. Review the staged release in NPM web panel and get it approved by admin.

## Why staged publishing?

As of July 2026, npm has deprecated GAT (Granular Access Tokens) for bypassing 2FA during publishing. Staged publishing provides a secure alternative that:

- Separates the build/upload step from the actual publish
- Allows review before the package goes live
- Maintains security without requiring automation tokens

## References

- [npm Staged Publishing Documentation](https://docs.npmjs.com/staged-publishing)
- [npm Changelog: Install-time Security](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/)
