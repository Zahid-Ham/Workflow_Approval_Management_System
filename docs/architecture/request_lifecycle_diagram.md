# Request Lifecycle Diagram

This diagram displays the transitions and states of an approval request, including role restrictions.

```mermaid
stateDiagram-v2
    [*] --> PENDING : Create Request (Requester)
    
    state PENDING {
        [*] --> Draft
        Draft --> UpdateDetails : Edit (Requester)
        UpdateDetails --> Draft
        Draft --> Deleted : Delete (Requester)
    }
    
    PENDING --> APPROVED : Approve Request (Assigned Reviewer)
    PENDING --> REJECTED : Reject Request (Assigned Reviewer)

    APPROVED --> [*] : Complete (Archived/Read-Only)
    REJECTED --> [*] : Complete (Archived/Read-Only)
    Deleted --> [*]

    note right of PENDING
        Requesters can modify/delete 
        requests ONLY when status is PENDING.
    end note

    note right of APPROVED
        Once APPROVED or REJECTED, 
        records are immutable.
    end note
```

## State Definitions

1. **PENDING**:
   - Initial state when a requester submits details.
   - Requesters can edit details (title, description, priority, reviewer) or delete the request entirely.
   - Reviewers can view the request in their queue and approve/reject it.
2. **APPROVED**:
   - Final state. The request has been signed off. It is locked and can no longer be edited or deleted.
3. **REJECTED**:
   - Final state. The request has been turned down. It is locked and can no longer be edited or deleted.
4. **Deleted**:
   - The request is completely removed from active tracking.
