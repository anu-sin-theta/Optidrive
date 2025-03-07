// src/components/ui/input.js
import React from 'react';

export const Input = ({ className, ...props }) => {
    return (
        <input className={`input ${className}`} {...props} />
    );
};