import React from 'react';
export const Button = ({ children, variant = '', ...props }) => (
  <button className={`button ${variant}`} {...props}>
    {children}
  </button>
);
export const Card = ({ children, className = '' }) => (
  <section className={`card ${className}`}>{children}</section>
);
export const Input = ({ label, ...props }) => (
  <label className="field">
    <span>{label}</span>
    <input {...props} />
  </label>
);
export const Empty = ({ children }) => <p className="empty">{children}</p>;
export function PageTitle({ eyebrow, title, children }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
