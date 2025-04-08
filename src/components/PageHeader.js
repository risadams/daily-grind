import React from 'react';

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-coffee-dark">{title}</h1>
      {subtitle && <p className="mt-1 text-coffee-medium">{subtitle}</p>}
    </div>
  );
};

export default PageHeader;