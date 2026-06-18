# Enterprise UI Design System

This directory `src/components/ui/` contains atomic, reusable, and keyboard-accessible UI widgets.

## Core Component Documentation

---

### 1. Button (`src/components/ui/Button.jsx`)
Standardized actions button.
```jsx
import Button from '../components/ui/Button';

<Button variant="primary" onClick={handleClick}>
  Submit Request
</Button>
```
* **Props**:
  - `variant`: `'primary' | 'secondary' | 'danger' | 'success' | 'approve' | 'reject'`
  - `type`: `'button' | 'submit' | 'reset'`
  - `disabled`: `boolean`
  - `onClick`: `function`
  - `ariaLabel`: `string`

---

### 2. Input & Textarea (`src/components/ui/Input.jsx` & `src/components/ui/Textarea.jsx`)
Form fields with integrated labels, error states, and ARIA labels.
```jsx
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

<Input
  id="title"
  label="Request Title"
  value={title}
  onChange={e => setTitle(e.target.value)}
  error={validationErrors.title}
  required
/>
```

---

### 3. Select (`src/components/ui/Select.jsx`)
Styled dropdown list.
```jsx
import Select from '../components/ui/Select';

<Select
  id="reviewer"
  label="Assign Reviewer"
  options={reviewers.map(r => ({ value: r.id, label: r.name }))}
  value={selectedId}
  onChange={e => setSelectedId(e.target.value)}
  required
/>
```

---

### 4. Modal (`src/components/ui/Modal.jsx`)
Centralized glassmorphic dialogue overlay with ARIA attributes.
```jsx
import Modal from '../components/ui/Modal';

<Modal isOpen={isOpen} title="Confirm Decision" onClose={closeModal}>
  <p>Dialogue contents...</p>
</Modal>
```

---

### 5. Card (`src/components/ui/Card.jsx`)
Container wrapper for dashboards and lists.
```jsx
import Card from '../components/ui/Card';

<Card title="Workflow Parties">
  <div>Content details...</div>
</Card>
```

---

### 6. Badge (`src/components/ui/Badge.jsx`)
Colored status/priority indicator labels.
```jsx
import Badge from '../components/ui/Badge';

<Badge variant="success">APPROVED</Badge>
```

---

### 7. Table (`src/components/ui/Table.jsx`)
Mobile-responsive data grid.
```jsx
import Table from '../components/ui/Table';

<Table headers={[{ label: 'Title' }, { label: 'Status' }]}>
  <tr>
    <td>Project budget</td>
    <td>PENDING</td>
  </tr>
</Table>
```

---

### 8. Loader, EmptyState & ErrorState
Centralized network response widgets.
```jsx
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

{loading && <Loader fullPage />}
{error && <ErrorState message={error} onRetry={fetchData} />}
{!loading && data.length === 0 && (
  <EmptyState
    title="No Requests"
    description="Submit a new request to begin"
    actionLabel="New Request"
    onAction={createNew}
  />
)}
```
