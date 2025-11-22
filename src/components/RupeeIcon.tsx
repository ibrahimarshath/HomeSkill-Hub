import { LucideProps } from "lucide-react";

export function RupeeIcon({ className, ...props }: LucideProps) {
  return (
    <span className={className} {...props} style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
      ₹
    </span>
  );
}

