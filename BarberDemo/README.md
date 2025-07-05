# BarberDemo – Minimal .NET 8 API (working hours, bookings, e-mail reminders)

## Quick start

```bash
dotnet restore
dotnet run
# Swagger UI → http://localhost:5000/swagger
```

## Endpoints

| Verb | Path | Body example (JSON) | Purpose |
|------|------|---------------------|---------|
| POST | `/api/hours` | `{ "day":"Monday","start":"10:00:00","end":"18:00:00" }` | Add working hours |
| POST | `/api/appointments` | `{ "customer":"John","email":"john@x.com","date":"2025-07-09T14:00:00Z" }` | Book an appointment |

## E-mail modes
- **console** (default) — mails appear as log lines
- **smtp** — set `Mail:Mode=smtp` and provide env vars `SMTP_USER`, `SMTP_PASS`.

## Reminder job

A background service runs every minute and sends one reminder when an
appointment is less than 24 h away.

---

Built for a short live demo – zero DB setup, deploy anywhere.