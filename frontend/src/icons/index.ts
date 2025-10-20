export interface IconProps {
    size:"small" | "medium" | "large" | "xlarge" | "xxlarge";
    color?: string; 
}

export const iconSizeVariants={
    "small":"size-2",
    "medium":"size-4",
    "large":"size-6",
    "xlarge":"size-8",
    "xxlarge":"size-14"
}