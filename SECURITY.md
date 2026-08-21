# 🔒 Security Policy

TryBe is currently in active development. This document describes the security practices, boundaries, and reporting process for the project.

---

## 🛡️ Current Security Status

TryBe is currently a **frontend-first application**.

At the current stage:

* Authentication and authorization are still being developed.
* Most application data is currently represented through the frontend/domain data layer.
* Production backend persistence is planned.
* Club Admin and College Admin roles are **not currently implemented**.
* Role-based access control (RBAC) will be introduced alongside the backend architecture.
* Production security controls will be expanded as backend functionality is added.

> **Important:** The current application should not be considered production-ready for handling sensitive or confidential user data.

---

## 🔐 Security Principles

TryBe follows these principles during development:

### 1. No Secrets in Source Code

Sensitive credentials must never be committed to the repository.

Examples:

```text
API keys
Database credentials
Private tokens
OAuth secrets
Service credentials
Deployment secrets
```

Use environment variables instead.

```env
VITE_API_BASE_URL=
VITE_APP_NAME=TryBe
```

Any production secret must remain server-side and must never be exposed through client-side code.

---

### 2. Environment Variables

Local environment configuration should be stored in:

```text
.env
```

The `.env` file must not be committed.

A safe template should be maintained through:

```text
.env.example
```

Only variable names and non-sensitive example values should be included in `.env.example`.

---

### 3. Authentication

Authentication is currently under development.

Once implemented, authentication must ensure:

* Secure session handling
* Protected routes
* Proper logout
* Session expiration
* Authentication state validation
* No plaintext password storage
* No sensitive authentication data in browser logs

---

## 👥 Authorization & Roles

The platform is expected to support role-based authorization in future versions.

### Current

```text
Student / User
    │
    └── Standard platform access
```

### Planned

```text
                    TryBe
                         │
          ┌──────────────┴──────────────┐
          │                             │
     College Admin                 Student/User
          │
          ▼
      Club Admin
          │
          ▼
     Club Members
```

The following roles are **planned but not currently implemented**:

* 🎭 Club Admin
* 🏫 College Admin

When introduced, permissions must be enforced by the backend rather than relying only on frontend route protection.

---

## 🧹 User-Generated Content

TryBe is expected to support user-generated content such as:

* Posts
* Comments
* Discussions
* Messages
* Club information
* Event information
* Profile information

All user-controlled input should be treated as untrusted.

Future backend implementation should include appropriate:

* Input validation
* Authorization checks
* Content sanitization
* Rate limiting
* Abuse prevention
* Error handling

---

## 🌐 Frontend Security

Frontend validation is **not considered a security boundary**.

For example:

```text
Frontend permission check
        ↓
       UI
        ↓
Backend authorization
        ↓
   Actual security
```

Sensitive operations must ultimately be validated by the backend.

---

## 🔑 API & Backend Security

When the backend is introduced, the following controls are required:

* Authentication for protected endpoints
* Server-side authorization
* Request validation
* Rate limiting
* Secure database access
* Least-privilege permissions
* Secure error responses
* Protection against unauthorized data access

---

## 📦 Dependency Security

Project dependencies should be regularly reviewed for known vulnerabilities.

Before merging changes:

```bash
npm run lint
npm run build
```

Dependency updates should be tested before deployment.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability in TryBe:

### Please do not

* Create a public issue containing the vulnerability.
* Publish exploit details before the issue is investigated.
* Share credentials, tokens, or private user information.

### Instead

Report the issue privately to the project maintainers.

Include:

```text
1. Vulnerability description
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Security impact
6. Screenshots / logs if relevant
7. Suggested mitigation, if available
```

---

## 🧪 Security Checklist

Before a production release:

* [ ] No secrets committed to Git
* [ ] `.env` excluded from repository
* [ ] Authentication implemented securely
* [ ] Protected routes verified
* [ ] Backend authorization implemented
* [ ] Role permissions tested
* [ ] User input validated
* [ ] Database access secured
* [ ] API endpoints protected
* [ ] Rate limiting implemented where required
* [ ] Dependencies reviewed
* [ ] Production configuration reviewed
* [ ] Error messages do not expose sensitive information
* [ ] Security testing completed

---

## 📌 Security Roadmap

| Security Area                 |       Status      |
| :---------------------------- | :---------------: |
| Secure source-code practices  |     🟢 Active     |
| Environment variable handling |     🟢 Active     |
| Authentication                | 🟡 In Development |
| Backend authorization         |     ⏳ Planned     |
| Club Admin permissions        |     ⏳ Planned     |
| College Admin permissions     |     ⏳ Planned     |
| Database security             |     ⏳ Planned     |
| API security                  |     ⏳ Planned     |
| Rate limiting                 |     ⏳ Planned     |
| Security testing              |     ⏳ Planned     |
| Production security audit     |     ⏳ Planned     |

---

## ⚠️ Development Disclaimer

TryBe is an actively evolving project.

Until authentication, backend authorization, database security, and production security controls are fully implemented and reviewed, the application should **not be used to store sensitive personal, financial, authentication, or confidential information**.

---

<div align="center">

**TryBe Security**

*Build secure. Build responsibly. 🔒*

</div>
