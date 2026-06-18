import React from 'react';

export const UserSummary = ({ user }) => {
  if (!user) return null;

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="user-summary-card" role="region" aria-label="User Profile Summary">
      <div className="user-avatar" aria-hidden="true">
        {getInitial(user.name)}
      </div>
      <div className="user-info">
        <h2 className="user-name">{user.name || 'Active User'}</h2>
        <p className="user-email">{user.email}</p>
        <span className={`user-role-badge role-${user.role?.toLowerCase()}`}>
          {user.role}
        </span>
      </div>
    </div>
  );
};

export default UserSummary;
