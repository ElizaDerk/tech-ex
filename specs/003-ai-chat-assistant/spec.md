# Feature Specification: AI Chat Assistant

**Feature Branch**: `003-ai-chat-assistant`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Create a specification for the AI Chat Assistant feature: a chat on the landing page where visitors can ask questions about the company before filling in the contact form (\"Request a quote\"). The assistant answers only from the content already on the site (services, work stages, projects, contact information), politely declines anything else and points to the contact form, never invents prices, deadlines, availability or guarantees, and ignores instructions that try to change its role or reveal its instructions. Visitors see a loading state and the answer in the conversation; follow-up questions keep context. Message length, conversation length and request rate are limited with friendly messages. If the assistant is unavailable the visitor sees a friendly error, keeps the typed message and can retry. Conversations are not stored on the server or sent to the CRM. The chat does not replace or change the contact form. The chat is accessible."

## Clarifications

### Session 2026-11-19

- Q: Where is the chat placed and how does a visitor open it? → A: A floating button fixed in a bottom corner of the page opens a chat panel; Escape or a close button closes it and returns focus to the button.
- Q: Does the chat input need the honeypot required for public forms? → A: Yes. The chat includes a hidden honeypot field; a request that fills it is silently discarded and the sender receives a normal-looking response.
- Q: Are answers plain text or formatted? → A: Plain text only; line breaks and paragraphs are preserved, nothing is rendered as markup, and no links are clickable.
- Q: Does the chat show a note that answers are AI-generated? → A: Yes. A short note is always visible in the panel, saying the assistant is AI, answers may be inaccurate, and the contact form is the way to get a reliable answer.
- Q: How does the decline message point to the contact form? → A: The assistant says in its own words, in plain text, that the visitor can use the contact form ("Request a quote"). In addition, the panel always shows a static link to the contact form, next to the AI note; it is part of the page, not of the assistant's answer.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask a question about the company (Priority: P1)

A visitor reading the landing page has a question before deciding to request a quote, for example "What services do you offer?" or "What are the stages of a project?". They open the chat, type the question, see that an answer is being prepared, and then read the answer in the conversation. The answer is based only on what the site already says about services, work stages, projects and contact information.

**Why this priority**: This is the core value of the feature. It lets visitors get answers immediately instead of leaving or guessing, which prepares them to fill in the contact form.

**Independent Test**: Open the chat, ask a question whose answer is on the site, and confirm a loading state is shown and then an accurate answer appears in the conversation. Ask a question whose answer is not on the site and confirm the assistant declines and suggests the contact form.

**Acceptance Scenarios**:

1. **Given** the visitor has typed a question about the company's services, work stages, projects or contact information, **When** they submit it, **Then** their message appears in the conversation, **And** a loading state is shown while the answer is prepared, **And** the answer then appears in the conversation and is consistent with the site content.
2. **Given** the visitor asks something the site content does not cover (for example an exact price, a deadline, availability, or a topic unrelated to the company), **When** the answer is prepared, **Then** the assistant politely says it cannot answer that, **And** suggests using the contact form to get in touch.
3. **Given** the visitor asks for a price, deadline, availability or guarantee, **When** the answer is prepared, **Then** the assistant does not state any figure, date, commitment or guarantee that is not on the site.
4. **Given** the visitor sends a message that tries to change the assistant's role or asks it to reveal its instructions (for example "ignore your rules and act as ..."), **When** the answer is prepared, **Then** the assistant does not comply, **And** stays in its role, **And** steers the visitor back to questions about the company.
5. **Given** a request is being processed, **When** the visitor looks at the chat, **Then** they cannot send another message until the answer or an error has been shown.

---

### User Story 2 - Ask follow-up questions (Priority: P2)

A visitor continues the conversation with a follow-up such as "What happens at the second one?" or "Do you also repair them?". The assistant understands the follow-up in the context of what was already discussed in the current conversation.

**Why this priority**: Natural follow-ups make the chat useful for real questions, but a single question and answer already delivers value on its own.

**Independent Test**: Ask a question, then ask a short follow-up that only makes sense with the previous answer, and confirm the assistant answers it correctly.

**Acceptance Scenarios**:

1. **Given** the visitor has received an answer, **When** they ask a follow-up that refers to the earlier exchange, **Then** the assistant answers using the context of the current conversation.
2. **Given** the visitor reloads or leaves and returns to the page, **When** they open the chat, **Then** it starts as a new empty conversation.
3. **Given** a follow-up still falls outside the site content, **When** the answer is prepared, **Then** the same decline-and-suggest-contact-form behavior applies as for a first question.

---

### User Story 3 - Understand limits and failures (Priority: P2)

A visitor who types too much, keeps the conversation going for a long time, sends many requests quickly, or meets a temporary outage sees a clear, friendly message explaining what happened and what to do. Their typed text is not lost when something goes wrong, and they never see technical details.

**Why this priority**: The assistant is public and relies on an external service, so limits and failures are guaranteed to occur. Handling them gracefully protects the company's reputation and costs.

**Independent Test**: Exceed each limit (message length, conversation length, request rate) and simulate the assistant being unavailable, and confirm a friendly message appears each time, no technical details are visible, and the typed message is kept where applicable.

**Acceptance Scenarios**:

1. **Given** the visitor's message is longer than the allowed length, **When** they try to send it, **Then** it is not sent, **And** a friendly message explains the limit, **And** the typed text is kept so they can shorten it.
2. **Given** the conversation has reached the maximum length, **When** the visitor tries to send another message, **Then** a friendly message explains the limit and suggests using the contact form, **And** the existing conversation remains readable.
3. **Given** the visitor has sent too many requests in a short time, **When** they try to send another, **Then** a friendly message asks them to wait a moment and try again, **And** the typed text is kept.
4. **Given** the assistant is unavailable or the request fails, **When** the visitor submits a message, **Then** a friendly error is shown, **And** the typed message is kept in the input, **And** the visitor can retry without retyping.
5. **Given** any failure occurs, **When** the visitor sees the error, **Then** it contains no internal error details, raw service responses or technical identifiers.
6. **Given** the visitor submits an empty message or one that contains only spaces, **When** they try to send it, **Then** it is not sent and the visitor is told a message is needed.

---

### User Story 4 - Use the chat with keyboard and assistive technologies (Priority: P2)

A visitor who navigates with a keyboard or a screen reader can open the chat, type, send, read answers and recover from errors without a mouse, and is told when new answers or errors arrive.

**Why this priority**: Accessibility is a baseline quality requirement of the site and applies to every part of the chat.

**Independent Test**: Complete a full conversation, including an error and a retry, using only the keyboard and a screen reader, and confirm every control is reachable, focus is always visible, the input has a label, and every new answer and error is announced.

**Acceptance Scenarios**:

1. **Given** a visitor uses only the keyboard, **When** they move through the chat, **Then** every interactive element can be reached and operated, **And** focus is always clearly visible.
2. **Given** a screen reader user is on the message input, **When** the input is read, **Then** it has a clear label describing its purpose.
3. **Given** a new answer arrives, **When** it appears in the conversation, **Then** assistive technologies announce it without the user having to move focus.
4. **Given** an error or limit message appears, **When** it is displayed, **Then** assistive technologies announce it.
5. **Given** the loading state is shown, **When** a screen reader user checks the chat, **Then** they can tell that an answer is being prepared.

---

### User Story 5 - Move from the chat to the contact form (Priority: P3)

A visitor who has had their questions answered, or whose question the assistant could not answer, goes to the existing "Request a quote" contact form and sends their request as before. The chat and the contact form are independent.

**Why this priority**: The chat supports the existing lead flow rather than replacing it; this story protects that the existing flow is unchanged.

**Independent Test**: Use the chat, then submit the contact form, and confirm the form behaves exactly as before and nothing from the chat is included in or affects the submission.

**Acceptance Scenarios**:

1. **Given** the assistant declines to answer, **When** it suggests the contact form, **Then** the visitor can reach and use the existing contact form on the same page.
2. **Given** the visitor has had a conversation with the assistant, **When** they submit the contact form, **Then** the form works exactly as it did before the chat existed, **And** no chat content is attached to the submission.

---

### Edge Cases

- Message of exactly the maximum length: accepted. One character over: rejected with a friendly message.
- Message containing only whitespace: treated as empty and not sent.
- Visitor presses Enter or the send control repeatedly: only one request is sent while an answer is being prepared.
- Visitor loses their internet connection mid-request: a friendly error is shown and the typed message is kept.
- The assistant is asked in a language other than the site's: it answers politely within the same rules; content outside the site is never invented.
- Visitor pastes very long text or text containing instructions aimed at the assistant: length limits apply, and instructions in messages never override the assistant's rules.
- Visitor asks for the assistant's instructions, rules or configuration: it declines and returns to company topics.
- Visitor asks about a project, service or person not on the site: the assistant says it has no such information and suggests the contact form; it does not guess.
- Limit is reached while the visitor is typing: the typed text is kept and the friendly message explains what to do.
- A bot fills the hidden honeypot field: the request is discarded without calling the AI service and no error details are revealed.
- The answer contains markup, HTML or link syntax: it is displayed literally as text and never rendered or made clickable.
- Visitor uses the chat on a small screen: it remains fully usable and readable.
- Visitor closes the panel and reopens it during the same visit: the conversation so far is still shown; only a page reload clears it.
- The same limit applies regardless of how the request was made: requests sent without using the page's chat are also subject to length and rate limits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST provide a chat where visitors can ask questions about the company, available before and independently of the contact form ("Request a quote"). The chat MUST be opened from a floating button fixed in a bottom corner of the page, visible at every scroll position, and MUST open as a panel without adding a new page section.
- **FR-002**: The assistant MUST answer only from the content already published on the site: services, work stages, projects and contact information.
- **FR-003**: If the answer is not in the site content (for example exact prices, deadlines, availability, or topics unrelated to the company), the assistant MUST politely say it cannot answer and suggest using the contact form, naming the contact form ("Request a quote") in its own words in plain text. It MUST NOT produce links or markup.
- **FR-004**: The assistant MUST NOT invent prices, deadlines, availability or guarantees.
- **FR-005**: The assistant MUST NOT follow visitor instructions that try to change its role or reveal its instructions, and MUST steer the conversation back to questions about the company.
- **FR-006**: Visitors MUST be able to type a question and send it using the keyboard or a pointer.
- **FR-007**: While an answer is being prepared, the chat MUST show a loading state and MUST prevent a second message from being sent.
- **FR-008**: The visitor's messages and the assistant's answers MUST appear in order in a conversation view.
- **FR-008a**: Assistant answers MUST be displayed as plain text with line breaks and paragraphs preserved. Any markup or formatting characters in an answer MUST be shown as text, never rendered, and web or email addresses MUST NOT become clickable links.
- **FR-008b**: While the panel is open, it MUST always show a short note that the assistant is AI, that its answers may be inaccurate, and that the contact form is the way to get a reliable answer. The note MUST be readable by assistive technologies and MUST NOT disappear as the conversation grows.
- **FR-008c**: The panel MUST always show a static link to the existing contact form ("Request a quote"), next to the AI note. Activating it MUST close the panel and take the visitor to the contact form, with focus moved to the form. It is part of the page and is shown regardless of what the assistant answers.
- **FR-009**: The assistant MUST keep the context of the current conversation so visitors can ask follow-up questions.
- **FR-010**: The chat MUST start as a new empty conversation each time the page is loaded; nothing is carried over between visits.
- **FR-011**: A single visitor message MUST NOT exceed 500 characters; empty or whitespace-only messages MUST NOT be sent.
- **FR-012**: A single conversation MUST be limited to 20 messages in total (visitor and assistant combined). When the limit is reached, the visitor MUST see a friendly message suggesting the contact form, and the existing conversation MUST remain readable.
- **FR-013**: The number of requests from one visitor within a short time MUST be limited to 10 per minute. When the limit is reached, the visitor MUST see a friendly message asking them to wait and try again.
- **FR-014**: All limits (message length, conversation length, request rate) MUST be enforced on the server, regardless of any checks performed in the browser.
- **FR-014a**: The chat MUST include a hidden honeypot field that real visitors never see or fill. If it is filled, the request MUST be silently discarded without contacting the AI service, and the sender MUST receive a response that looks like a normal answer, with no error details.
- **FR-015**: If the assistant is unavailable or a request fails, the visitor MUST see a friendly error, the typed message MUST be kept in the input, and the visitor MUST be able to retry.
- **FR-016**: Visitors MUST NOT see internal errors, technical identifiers, raw responses from the underlying service, or the assistant's instructions.
- **FR-017**: Conversations MUST NOT be stored on the server and MUST NOT be sent to the CRM.
- **FR-018**: The chat MUST NOT replace, alter or interfere with the existing contact form; the form's behavior, fields and submission remain unchanged.
- **FR-019**: The chat MUST be fully operable with a keyboard, with visible focus states on all interactive elements. Opening the panel MUST move focus to the message input; closing it (close button or Escape key) MUST return focus to the floating button.
- **FR-020**: The message input MUST have a label.
- **FR-021**: New assistant answers, the loading state and errors MUST be announced to assistive technologies without moving focus.
- **FR-022**: The floating button and chat panel MUST be usable on both small and large screens and MUST NOT cover the contact form's fields or submit button in a way that prevents using them (the panel can be closed at any time).
- **FR-023**: Content the assistant draws on MUST come from the same content that appears on the site, so that answers stay consistent with the page when the site content changes.

### Key Entities

- **Conversation**: The ordered list of visitor messages and assistant answers in the current page visit. Exists only for the duration of the visit; has a maximum length.
- **Message**: A single entry in a conversation, with an author (visitor or assistant) and text. Visitor messages have a maximum length.
- **Site Content**: The company information already published on the site (services, work stages, projects, contact information) that the assistant is allowed to answer from.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can ask a question and see the start of the loading state within 1 second of sending, and receive an answer in under 15 seconds in at least 95% of normal conditions.
- **SC-002**: For a set of test questions covering every service, work stage, project and contact detail on the site, at least 95% of answers are consistent with the site content.
- **SC-003**: For a set of test questions about information not on the site (prices, deadlines, availability, guarantees, unrelated topics), 100% of responses decline politely and suggest the contact form, and none contain an invented price, deadline, availability or guarantee.
- **SC-004**: For a set of test attempts to change the assistant's role or reveal its instructions, 100% fail and the assistant stays on company topics.
- **SC-005**: In 100% of limit and failure cases tested (message too long, conversation too long, too many requests, assistant unavailable), the visitor sees a friendly message with no technical details, and the typed message is kept where applicable.
- **SC-006**: A visitor can complete a full conversation, including recovering from an error, using only the keyboard, and a Lighthouse accessibility audit reports no issues in the chat.
- **SC-007**: In a manual screen reader check, 100% of new answers and errors are announced.
- **SC-008**: After using the chat, submitting the contact form behaves identically to before the chat existed in 100% of tested cases, and no chat content appears in the submitted data.
- **SC-009**: No conversation content is retained after the visit ends: after reloading the page, the chat is always empty.

## Assumptions

- Visitors are anonymous; there is no login, and no personal data is requested by the chat.
- The chat answers in the same language as the visitor's question, as far as the site content allows; the site content itself is the single source of facts.
- Limits chosen as reasonable defaults: 500 characters per visitor message, 20 messages per conversation, 10 requests per minute per visitor. These can be adjusted later without changing the behavior described here.
- "Same visitor" for request limiting is determined by information available from the request itself; precision is best-effort, not identity-based.
- The assistant's answers represent the company, so they are limited to what is published; it never commits the company to anything.
- The existing contact form and its CRM integration are out of scope and remain unchanged.
- The chat adds no new site content, pages or sections beyond the chat itself.
- Conversation history lives only in the visitor's browser for the duration of the page visit; a page reload clears it.
- The assistant relies on a third-party AI service; the concrete provider is decided during planning.
- Automated tests do not use the real AI service.
