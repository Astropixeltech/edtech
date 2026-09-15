import { TestimonialCard } from "@/components/ui/testimonial-card"

const testimonials = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emmaai",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
    },
    text: "Using this AI platform has transformed how we handle data analysis. The speed and accuracy are unprecedented.",
    href: "https://twitter.com/emmaai"
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
    },
    text: "The API integration is flawless. We've reduced our development time by 60% since implementing this solution.",
    href: "https://twitter.com/davidtech"
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80"
    },
    text: "Finally, an AI tool that actually understands context! The accuracy in natural language processing is impressive.",
  },
  {
    author: {
      name: "James Chen",
      handle: "@jamesdev",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80"
    },
    text: "Game-changing ML capabilities. We've automated our entire data pipeline with incredible accuracy.",
    href: "https://twitter.com/jamesdev"
  },
  {
    author: {
      name: "Aisha Patel",
      handle: "@aishatech",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80"
    },
    text: "The real-time processing capabilities are mind-blowing. Our team's productivity has doubled.",
    href: "https://twitter.com/aishatech"
  },
  {
    author: {
      name: "Michael Kim",
      handle: "@mikeai",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80"
    },
    text: "Best decision we made was switching to this platform. The AI models are incredibly accurate and easy to deploy.",
  }
]

export function TestimonialCardDemo() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={i} {...testimonial} />
          ))}
        </div>
      </div>
    </div>
  )
}
