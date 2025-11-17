"use client";
import { cn } from "@/lib/utils";
import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function CardComponent({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-rose-100 bg-white/90 shadow-inner shadow-rose-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

