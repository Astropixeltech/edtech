import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-sm border border-slate-200 dark:border-slate-800",
        "bg-gradient-to-b from-muted/50 to-muted/10 dark:from-slate-900/60 dark:to-slate-950/40",
        "p-4 text-start sm:p-6",
        "hover:from-muted/60 hover:to-muted/20 dark:hover:from-slate-900/80 dark:hover:to-slate-900/50",
        "w-full transition-all duration-300 shadow-xs hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-emerald-500/20 shadow-xs">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-sm sm:text-md font-bold text-slate-900 dark:text-white leading-none">
            {author.name}
          </h3>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="sm:text-md mt-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
        {text}
      </p>
    </Card>
  )
}
