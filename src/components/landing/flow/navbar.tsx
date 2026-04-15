import { Link } from "react-router-dom";
import { LogIn, MessageCircle } from "lucide-react";
import { Button } from "@/components/landing/flow/button";

const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK ?? "#";
const FRONTEND_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5173";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-6 pt-6 md:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center ">
            <img
              src="/agendoro-logo.png"
              alt="Agendoro"
              className="h-20 w-20"
            />
          </Link>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">
              Agend
              <span className="bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                oro
              </span>
            </p>
            <p className="text-xs text-text-muted">Agendamento inteligente</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-text-soft md:flex">
          <a href="#beneficios" className="transition hover:text-white">
            Benefícios
          </a>
          <a href="#segmentos" className="transition hover:text-white">
            Segmentos
          </a>
          <a href="#depoimentos" className="transition hover:text-white">
            Depoimentos
          </a>
        </nav>
        <Button
          variant="ghost"
          size="sm"
          as="a"
          href={`${FRONTEND_URL}/login`}
          aria-label="Entrar no sistema"
          className="hidden md:inline-flex"
        >
          <LogIn className="w-4 h-4" />
          Entrar
        </Button>
        <Button
          size="md"
          as="a"
          href="#precos"
          //target="_blank"
          //rel="noopener noreferrer"
        >
          <MessageCircle className="w-6 h-6" />
          Quero vender mais
        </Button>
      </div>
    </header>
  );
}
