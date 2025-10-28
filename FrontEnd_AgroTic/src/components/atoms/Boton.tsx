import { Button } from "@heroui/react";
import type { ButtonProps } from "../../types/Boton.type";

const CustomButton: React.FC<ButtonProps> = ({
    label,
    text,
    children,
    onClick,
    disabled = false,
    color = "success",
    variant = "solid",
    type = "button",
    className = "",
    ariaLabel,
    size = "md"
}) => {
    // Determine the button content
    const buttonContent = label || text || children;

    // Custom styling for a more beautiful button
    const customClass = `
        relative overflow-hidden
        bg-gradient-to-r from-green-500 to-green-600
        hover:from-green-600 hover:to-green-700
        text-white font-semibold
        rounded-xl px-6 py-3
        shadow-lg hover:shadow-xl
        transform hover:scale-105
        transition-all duration-300 ease-in-out
        before:absolute before:inset-0 before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md
        focus:outline-none focus:ring-4 focus:ring-green-300
        active:scale-95 
    `;

    return (
        <Button
            color={color as any}
            variant={variant}
            size={size}
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${customClass} ${className}`}
            aria-label={ariaLabel}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {buttonContent}
            </span>
        </Button>
    );
};

export default CustomButton;
