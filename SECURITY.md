# Security Policy

**Built by [SkilledDragon LLC](https://skilleddragon.com)**

This is a **SkilledDragon educational minilab**, not a production product. We do **not** maintain these repos on a regular schedule and we do **not** operate a vulnerability response program for them.

## Contact

General questions: **hello@skilleddragon.com**  
Do not use a dedicated security mailbox for this repo — none exists.

## If you find an issue

- Prefer reporting **upstream** when the issue is in [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), the [`skills`](https://www.npmjs.com/package/skills) CLI, or other dependencies.
- For something specific to this minilab’s gate scripts or CI, you may email hello@skilleddragon.com. There is **no SLA**, and we may not patch or reply quickly.
- Do not expect private coordinated disclosure or paid bounty handling here.

## Scope / hygiene

This repository ships documentation, CI checks, and small verification scripts. It does **not** host production credentials.

- Never commit `.env`, API keys, or tokens.
- CI is intended to stay **keyless** (gitleaks, audits, skill layout, fixture tests, optional upstream clone tests).

Use at your own risk. Pin versions, review the code, and treat this as sample material.
