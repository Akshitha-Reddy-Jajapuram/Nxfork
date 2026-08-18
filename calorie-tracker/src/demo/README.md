# Insecure demo notes

This folder intentionally demonstrates bad app practices that violate the architecture and security rules from the calorie tracker specification.

- No real authentication
- No authorization middleware
- Public token exposed in the UI
- Shared user data visible without checks
- Local browser storage used as if it were a secure backend
- Cross-user data can be loaded without validation

This is for demonstration only and should not be used in production.
