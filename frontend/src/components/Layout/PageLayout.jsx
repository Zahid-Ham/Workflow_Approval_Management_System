import React from 'react';

export const PageLayout = ({ title, description, actions, children }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{title}</h1>
          {description && <p style={styles.description}>{description}</p>}
        </div>
        {actions && <div style={styles.actions}>{actions}</div>}
      </div>
      <div style={styles.body}>{children}</div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #374151',
    paddingBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  description: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#9ca3af',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  body: {
    marginTop: '8px',
  },
};

export default PageLayout;
