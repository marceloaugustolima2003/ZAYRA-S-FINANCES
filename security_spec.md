# Security Specification - Zayra's Finance

## 1. Data Invariants
1. **User Isolation**: A user's financial documents (transactions, goals, budgets) can only exist under their authenticated UID path `/users/{userId}/*`. Cross-user access is strictly forbidden.
2. **Identity Integrity**: All written records must strictly enforce `incoming().userId == request.auth.uid`.
3. **Immutability of Ownership**: Updates cannot change the `userId` of an existing document (`incoming().userId == existing().userId`).
4. **Boundary Limits**: Document IDs must not exceed 128 characters and must match the safe regex pattern `^[a-zA-Z0-9_\-]+$`.
5. **Type & Volumetric Enforcement**: String fields must have strict size checks (`title` <= 120 chars, `category` <= 50 chars, `amount` must be a valid number).

## 2. The Dirty Dozen Payloads (Designed to Return PERMISSION_DENIED)
1. **Unauthenticated Read**: Attempting to read `/users/other_user_uid/transactions/tx-1` without authentication.
2. **Cross-User Injection**: Authenticated user `user_A` attempting to write a transaction into `/users/user_B/transactions/tx-bad`.
3. **Spoofed Ownership**: Authenticated user `user_A` writing a transaction into `/users/user_A/transactions/tx-bad` with `{ userId: 'user_B' }`.
4. **Excessive String Payload**: Writing a transaction with a title length > 120 characters (Denial-of-Wallet buffer attack).
5. **Path Traversal / Poisoned ID**: Writing a document with ID containing `../` or exceeding 128 characters.
6. **Negative / Non-Numeric Amount**: Writing a transaction where `amount` is a string or boolean instead of a number.
7. **Invalid Transaction Direction**: Setting `type` to `'unauthorized_action'` instead of `'income'` or `'expense'`.
8. **Orphaned User Profile Read**: Attempting to list all users via a collection query on `/users`.
9. **Tampering with Ownership**: Updating an existing transaction to reassign `userId` to another user.
10. **Shadow Field Injection**: Writing a user profile document with rogue privilege fields like `{ isAdmin: true, bypassRules: true }`.
11. **Malicious Goal Target**: Creating a goal with string-type `targetAmount` instead of number.
12. **Tampering with Budget Limits**: A user attempting to modify another user's budget document.

## 3. Test Invariant Runner
All 12 adversarial payloads are strictly rejected by `firestore.rules` with `PERMISSION_DENIED`.
