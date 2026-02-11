<!-- CoderLegion: title=Google Drive as Dumb Storage | date=2026-03-04 | tags=google-drive, sovereign-sync, local-first, data-sovereignty -->

# Google Drive as Dumb Storage

Google Drive isn't your backend. **We use it as file storage for a single export file.** The app creates/updates that file and can read it back. Drive does not run business logic, validation, or schema—it's "a folder in the cloud" for the user's own data.

## Drive as "dumb storage"

Real-world sync constraints (bidirectional sync, version detection, conflict handling) are **handled in the client.** Drive is just the persistence layer. The client polls Drive metadata for version/revision changes and owns all sync and conflict semantics. The architectural point: Drive's role is minimal and does not change the "sovereign data" model.

## User-owned files, user-owned schema

The file format is the same as the app's export: trades plus metadata. The user can copy the file, open it elsewhere, or move it. The schema is documented and owned by the product; the user owns the file and the data in it. Sync is **optional** and can be gated without changing the local-first model.

![Local device ↔ Drive ↔ restore. Client exports/imports; Drive stores one file.](https://www.pocketportfolio.app/book-assets/figures/figure-04-drive-sync.svg)

## Trust model

- **Today:** Data is stored in Drive as JSON; OAuth scope is minimal (`drive.file`: only app-created files). Tokens are client-managed.
- **Trust:** The client trusts the Drive API for persistence and availability; the app does not trust Drive with interpretation of the schema—that stays in the app. Future work may add client-side encryption before upload so that Drive sees ciphertext only.

Conflict handling (e.g. optimistic locking with revision IDs) runs in the client; Drive only stores the final blob. So: **Drive is dumb storage; the app owns the schema and sync semantics.**

---

*Part 7 of the **Sovereign Serial**. From [Universal LLM Import](https://www.pocketportfolio.app/book/universal-llm-import).*

**Read the full [Bestseller Edition](https://www.pocketportfolio.app/book/universal-llm-import) or [Try the app](https://www.pocketportfolio.app).**
