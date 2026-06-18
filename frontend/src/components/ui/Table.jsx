import React from 'react';

export const Table = ({ headers = [], children, ariaLabel }) => {
  return (
    <div className="assigned-requests-table-container">
      <table className="assigned-requests-table" aria-label={ariaLabel || 'Data Table'}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" className={h.align === 'right' ? 'text-right' : ''}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
