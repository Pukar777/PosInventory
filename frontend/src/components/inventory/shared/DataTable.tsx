import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function DataTableCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <Card className={cn("overflow-hidden border border-border bg-card", className)}>
            {children}
        </Card>
    );
}

export function DataTableHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <TableHeader className={cn("bg-secondary/50", className)}>
            <TableRow className="hover:bg-transparent border-b border-border">
                {children}
            </TableRow>
        </TableHeader>
    );
}

export function DataTableHead({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <TableHead className={cn(
            "h-auto py-[11px] px-[16px] text-left text-[10px] tracking-[1.5px] uppercase text-muted-foreground font-medium",
            className
        )} {...props}>
            {children}
        </TableHead>
    );
}

export function DataTableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return (
        <TableRow className={cn(
            "border-b border-border hover:bg-secondary/40 transition-colors",
            className
        )} {...props}>
            {children}
        </TableRow>
    );
}

export function DataTableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <TableCell className={cn(
            "py-[14px] px-[16px] text-[13px] text-foreground align-middle",
            className
        )} {...props}>
            {children}
        </TableCell>
    );
}

export { Table, TableBody };
