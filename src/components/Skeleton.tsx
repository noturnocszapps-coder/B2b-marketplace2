import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse bg-zinc-900 rounded-xl overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className
      )} 
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 space-y-4">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}
