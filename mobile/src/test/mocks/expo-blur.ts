import React from 'react';

export const BlurView: React.FC<any> = ({ children, ...props }) => (
  React.createElement('view', { ...props }, children)
);
