// components/TextDisplay.tsx
import React from "react";

interface TextDisplayProps {
    children: React.ReactNode;
    className?: string;
}

export const TextDisplay: React.FC<TextDisplayProps> = ({ children, className }) => {
    return (
        <div
            className={`font-mono text-[14px] p-2 bg-muted text-foreground rounded-md ${className}`}
        >
            {children}
        </div>
    );
};
