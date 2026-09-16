import { cn } from '@/lib/utils'

export function Skeleton({ className }) {
  return <div className={cn('bg-onLight/5 rounded-lg animate-pulse', className)} />
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
      <div className="aspect-square bg-onLight/5 animate-pulse" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between mt-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  )
}

export function TextSkeleton({ className }) {
  return <Skeleton className={className} />
}