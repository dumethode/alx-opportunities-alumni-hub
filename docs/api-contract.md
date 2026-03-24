# API Contract

Base URL: `/api/v1`

Public endpoints:

- `GET /home`
- `GET /opportunities`
- `GET /opportunities/{slug}`
- `GET /events`
- `GET /events/{slug}`
- `GET /hub-locations`
- `POST /contact`

Authenticated endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /dashboard`
- `GET /alumni`
- `GET /saved-opportunities`
- `POST /saved-opportunities/{opportunity_id}`
- `GET /tracker`
- `POST /tracker`
- `POST /mentorship-bookings`
- `POST /supporting-letter-requests`
- `GET /notifications`
- `POST /documents/resume`
- `POST /documents/cover-letter`

Admin endpoints:

- `POST /admin/opportunities`
- `POST /admin/events`
- `POST /admin/newsletters`
- `POST /admin/testimonials`

