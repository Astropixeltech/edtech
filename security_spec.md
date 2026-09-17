# Security Specification & Security TDD Suite

## 1. Data Invariants
1. **User Identity Invariant**: A user cannot create or manipulate a profile with an ID other than their authenticated UID (`request.auth.uid`).
2. **Course Integrity Invariant**: Only designated administrators can create, update, or delete courses. Public users have read-only access to published courses.
3. **Enrollment Boundary**: Students can only view their own enrollments (`userId == request.auth.uid`). Unassigned users cannot view or modify other students' enrollments.
4. **Enrollment Request Anti-Spoofing**: Students can submit enrollment requests with their own `userId`, but cannot approve or modify the review `status` (only admins can approve).
5. **Notice Authority**: Notices and announcements can only be drafted and posted by authenticated administrators.

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)
1. **Payload 01: Profile Identity Hijack**
   - Target: `/profiles/victim_uid_456`
   - Actor: `attacker_uid_123`
   - Content: `{ "userId": "attacker_uid_123", "role": "admin" }`
   - Violation: Cross-user document write attempt.

2. **Payload 02: Admin Privilege Escalation on Profile Creation**
   - Target: `/profiles/attacker_uid_123`
   - Actor: `attacker_uid_123` (non-admin)
   - Content: `{ "userId": "attacker_uid_123", "role": "admin", "email": "hacker@domain.com" }`
   - Violation: Unauthorized self-assignment of administrative roles.

3. **Payload 03: Unauthorized Course Deletion**
   - Target: `/courses/course_web_dev`
   - Actor: `student_uid_789`
   - Action: `DELETE`
   - Violation: Students cannot delete courses.

4. **Payload 04: Course Price Tampering**
   - Target: `/courses/course_web_dev`
   - Actor: `student_uid_789`
   - Content: `{ "price": 0 }`
   - Violation: Non-admin updating catalog pricing.

5. **Payload 05: Unauthenticated Enrollment Reading**
   - Target: `/enrollments/enr_001`
   - Actor: Unauthenticated (`auth == null`)
   - Action: `GET`
   - Violation: Private student data accessed without authentication.

6. **Payload 06: Cross-Student Enrollment Listing (Data Scraping)**
   - Target: `/enrollments`
   - Actor: `student_A` querying `where("userId", "==", "student_B")`
   - Action: `LIST`
   - Violation: Unauthorized enumeration of third-party student enrollment records.

7. **Payload 07: Self-Approval of Enrollment Request**
   - Target: `/enrollment_requests/req_999`
   - Actor: `student_uid_789`
   - Content: `{ "status": "approved" }`
   - Violation: Student cannot approve their own payment/request.

8. **Payload 08: Ghost Field Injection (Shadow Update)**
   - Target: `/profiles/user_uid_123`
   - Actor: `user_uid_123`
   - Content: `{ "fullName": "Test", "isSuperAdminOverride": true }`
   - Violation: Strict key verification failure.

9. **Payload 09: Malicious Large Payload Attack (Denial of Wallet)**
   - Target: `/notices/notice_spam`
   - Actor: `attacker_uid_123`
   - Content: `{ "title": "A".repeat(5000) }`
   - Violation: Exceeding `maxLength` boundaries.

10. **Payload 10: Fake Admin Email Without Verification**
    - Target: `/courses/new_course`
    - Actor: `email: "helloastropixel@gmail.com"`, but `email_verified: false`
    - Action: `CREATE`
    - Violation: Admin privileges require verified authentication.

11. **Payload 11: Document ID Poisoning**
    - Target: `/profiles/../../../etc/passwd`
    - Actor: `attacker_uid_123`
    - Violation: Invalid ID path containing illegal characters or path traversal.

12. **Payload 12: Unauthorized Notice Publication**
    - Target: `/notices/announcement_1`
    - Actor: `student_uid_789`
    - Action: `CREATE`
    - Violation: Standard students cannot post site-wide notices.
