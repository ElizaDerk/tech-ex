# Feature Specification: Contact Form

**Feature Branch**: `002-contact-form`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "Create a specification for the Contact Form feature: a form in the landing page contact section where visitors send their name, email, optional phone, and a message to the company's CRM (HubSpot) via the server, with server-side validation, honeypot spam protection, input retention on failure, loading state, friendly errors, and accessible error announcements."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send a message to the company (Priority: P1)

A visitor to the website wants the company to contact them. In the contact section of the landing page they enter their first name, last name, email address, optionally a phone number, and a message, then submit. The message reaches the company's CRM and the visitor sees a confirmation that it was sent.

**Why this priority**: This is the only way a visitor can reach the company through the site. Without it the landing page generates no leads.

**Independent Test**: Open the contact section, fill in valid values, submit, and confirm the form is replaced by a "message sent" confirmation and the contact appears in the CRM. Then repeat with invalid values and with the CRM unavailable to confirm error behavior.

**Acceptance Scenarios**:

1. **Given** a visitor enters valid values in all required fields, **When** they submit the form, **Then** the data is sent to the CRM, **And** the form is replaced by a message confirming that the message was sent.
2. **Given** a visitor submits the form with one or more required fields empty, **When** the form is processed, **Then** submission is rejected, **And** each missing field displays an appropriate validation error message next to it.
3. **Given** a visitor enters an email address in an invalid format, **When** they submit the form, **Then** submission is rejected, **And** the email field displays an appropriate validation error message.
4. **Given** a visitor leaves the phone number empty, **When** they submit an otherwise valid form, **Then** submission succeeds.
5. **Given** a visitor enters a phone number with disallowed characters or a length outside 7 to 20 characters, **When** they submit the form, **Then** submission is rejected, **And** the phone field displays an appropriate validation error message.
6. **Given** a visitor enters a message shorter than 10 or longer than 1000 characters, **When** they submit the form, **Then** submission is rejected, **And** the message field displays an appropriate validation error message.
7. **Given** a visitor submits a form that contains validation errors, **When** the form is redisplayed, **Then** all entered values are retained.
8. **Given** the CRM request fails, **When** the visitor submits a valid form, **Then** a friendly error message is displayed, **And** the entered values are retained so the visitor can retry.
9. **Given** the hidden honeypot field is filled, **When** the form is submitted, **Then** the submission is rejected silently, **And** nothing is sent to the CRM.
10. **Given** a visitor uses a keyboard or screen reader, **When** validation errors appear, **Then** each error is linked to its field and announced to assistive technologies.

---

### Edge Cases

- Message of exactly 10 or exactly 1000 characters: accepted. 9 or 1001 characters: rejected.
- Phone number of exactly 7 or exactly 20 characters using only allowed characters: accepted. 6 or 21 characters: rejected.
- Fields containing only spaces are treated as empty for required fields.
- Visitor double-clicks submit or presses Enter repeatedly: only one submission is sent, because the submit button is disabled while the request is in progress.
- Submission bypasses the browser (for example, a direct request with invalid data): the server rejects it with the same field errors; browser-side checks are never the only protection.
- Honeypot is filled by a bot: the response looks the same as success to the sender's side where possible, no error details are revealed, and nothing reaches the CRM.
- CRM is slow or unreachable: the visitor sees a friendly retry message, never raw CRM output or internal error details.
- Visitor loses connection mid-submission: a friendly error is shown and entered values remain.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The contact form MUST appear inside the existing contact section of the landing page, replacing its placeholder content area, with no changes to other sections.
- **FR-002**: The form MUST collect first name (required), last name (required), email address (required), phone number (optional), and message (required).
- **FR-003**: The email address MUST be in a valid email format.
- **FR-004**: If a phone number is provided, it MUST contain only digits, spaces, plus signs, hyphens, and parentheses, and MUST be 7 to 20 characters long.
- **FR-005**: The message MUST be 10 to 1000 characters long.
- **FR-006**: The form MUST include a hidden honeypot field that real visitors never see or fill.
- **FR-007**: If the honeypot field is filled, the submission MUST be rejected silently and nothing MUST be sent to the CRM.
- **FR-008**: Valid submissions MUST be forwarded to the company's CRM (HubSpot) by the server; the visitor's browser MUST NOT contact the CRM directly.
- **FR-009**: All input MUST be validated on the server regardless of any validation performed in the browser.
- **FR-010**: Validation errors MUST be displayed next to the corresponding form fields, with a message that tells the visitor what to fix.
- **FR-011**: After a failed submission (validation or CRM failure), all previously entered values MUST remain in the form.
- **FR-012**: While a submission is in progress, the submit button MUST be disabled and a loading state MUST be shown.
- **FR-013**: On successful submission, the form MUST be replaced by a message confirming the message was sent.
- **FR-014**: When the CRM request fails, the visitor MUST see a friendly error message and be able to retry.
- **FR-015**: Visitors MUST NOT see internal errors, stack traces, or raw CRM responses.
- **FR-016**: Every field MUST have a visible label, and the form MUST be fully operable by keyboard with visible focus states.
- **FR-017**: Each validation error MUST be programmatically linked to its field and announced to assistive technologies when it appears.

### Key Entities

- **Contact Message**: A single submission from a visitor. Attributes: first name, last name, email address, phone number (optional), message text. Passed to the CRM; not stored anywhere else.
- **Honeypot Field**: A hidden field included in the form solely to detect automated submissions; carries no visitor data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can complete and submit the form with valid data in under 2 minutes and sees the confirmation message within 5 seconds of submitting under normal conditions.
- **SC-002**: 100% of submissions with invalid data (missing fields, bad email, bad phone, out-of-range message length) are rejected with a field-level error and none reach the CRM.
- **SC-003**: 100% of submissions with the honeypot filled are rejected and none reach the CRM.
- **SC-004**: In 100% of failed submissions, the visitor's entered values are still present in the form.
- **SC-005**: No internal error text or raw CRM response is ever visible to a visitor, including when the CRM is unavailable.
- **SC-006**: All form errors and controls can be reached and understood using only a keyboard and a screen reader, with no accessibility violations at the WCAG 2.1 AA level in the form area.

## Assumptions

- The contact section and its placeholder already exist from the landing page layout feature (001) and only the placeholder content area is replaced.
- The company's HubSpot account and the credentials needed by the server are available; they are kept private to the server.
- Email format checking follows common practice (a local part, an @ sign, and a domain); no check is made that the mailbox actually exists.
- Confirmation and error message wording is in English only.
- No retry limit or rate limiting is required beyond the honeypot; the visitor may resubmit after a failure.
- The confirmation message replaces the form for the rest of the page visit; sending another message requires reloading the page.
- Notifications to the company beyond the CRM record are handled inside the CRM, not by this feature.

## Out of Scope

- File attachments.
- User accounts, login, and email notifications to the visitor.
- Storing submissions in a database.
- reCAPTCHA or other third-party spam services.
- Multiple languages.
- Changes to the other sections of the landing page.
