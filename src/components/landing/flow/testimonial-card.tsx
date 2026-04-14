import { Card } from "@/components/landing/flow/card";

interface TestimonialCardProps {
  name: string;
  text: string;
}

export function TestimonialCard({ name, text }: TestimonialCardProps) {
  return (
    <Card>
      <div className="mb-5 text-secondary">★★★★★</div>
      <p className="text-lg leading-8 text-text-soft">“{text}”</p>
      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="font-bold text-white">{name}</p>
        <p className="text-sm text-text-muted">Cliente Agendoro</p>
      </div>
    </Card>
  );
}
