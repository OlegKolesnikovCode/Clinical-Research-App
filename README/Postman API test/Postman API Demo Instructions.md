## ⚡ 2-Minute Demo (Proof of Correctness)

This system is validated by how it behaves under failure, not just success.

---

### 🔗 Base URL

Replace with your deployed app:

```
https://your-app.vercel.app
```

---

## 1. Happy Path — Enrollment

**Request**

```http
POST /api/participants
Content-Type: application/json
```

```json
{
  "studyId": "REPLACE_WITH_STUDY_ID",
  "siteId": "REPLACE_WITH_SITE_ID",
  "subjectIdentifier": "DEMO-001",
  "fullName": "Demo User",
  "dateOfBirthUtc": "1990-01-01T00:00:00.000Z"
}
```

**Expected**

* `201 Created`
* Participant created
* Visits generated automatically

---

## 2. Atomicity — Transaction Rollback

**Request**

```json
{
  "studyId": "REPLACE_WITH_STUDY_ID",
  "siteId": "REPLACE_WITH_SITE_ID",
  "subjectIdentifier": "FAIL-001",
  "fullName": "Rollback Test",
  "dateOfBirthUtc": "1990-01-01T00:00:00.000Z",
  "demoFailAfterParticipant": true
}
```

**Expected**

* Request fails
* No participant saved
* No visits saved

👉 Verifies **no partial writes (ACID atomicity)**

---

## 3. Uniqueness — Duplicate Prevention

Send the same request twice:

```json
{
  "studyId": "REPLACE_WITH_STUDY_ID",
  "siteId": "REPLACE_WITH_SITE_ID",
  "subjectIdentifier": "DEMO-002",
  "fullName": "Duplicate Test",
  "dateOfBirthUtc": "1990-01-01T00:00:00.000Z"
}
```

**Expected**

* First → `201 Created`
* Second → `409 Conflict`

👉 Verifies **DB-enforced uniqueness under concurrency**

---

## 4. FSM Enforcement — Invalid Transition

**Request**

```http
PATCH /api/visits/:id/status
Content-Type: application/json
```

```json
{
  "status": "SCHEDULED"
}
```

**Expected**

* `400 Bad Request`
* State unchanged

👉 Verifies **invalid state transitions are rejected**

---

## 5. Terminal State Protection

1. Set visit → `COMPLETED`
2. Attempt another transition

**Expected**

* Request rejected
* State remains unchanged

👉 Verifies **terminal states are irreversible**

---

## 6. Delete Protection

Attempt to delete a Study with existing Participants.

**Expected**

* Database rejects operation
* No cascade deletion

👉 Verifies **referential integrity (`onDelete: Restrict`)**

---

## 7. Validation — Invalid Input Rejected

**Request**

```json
{
  "studyId": "",
  "siteId": null
}
```

**Expected**

* `400 Bad Request`
* No database write

👉 Verifies **validation before persistence**

---

## ✅ What This Proves

* Atomic transactions (no partial writes)
* Concurrency-safe uniqueness
* Controlled workflow via FSM
* Referential integrity enforced by DB
* Safe failure under invalid input

---

## 📌 Notes

* Use Postman or curl for testing
* Replace IDs with values from your database
* All timestamps are stored in UTC
