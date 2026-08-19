# Demo-only security bypasses

This project intentionally demonstrates insecure patterns that should never be used in a production app.

- A fake admin token is exposed in the browser.
- User profiles are globally shared with no authorization boundary.
- Password recovery can be completed with trivial codes.
- Sessions are stored in localStorage with no protection.

These modules are for demonstration only and violate the expected rules deliberately.
