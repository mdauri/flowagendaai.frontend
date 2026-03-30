import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ApiError } from "@/types/api";
import { useForgotMutation } from "../../hooks/use-forgot-mutation";

export function ForgotForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const forgotMutation = useForgotMutation();
  const [email, setEmail] = useState("");

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const error = forgotMutation.error;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await forgotMutation.mutateAsync({
        email,
      });
    } catch {
      // The mutation state already drives the visible feedback for invalid login.
    }
  };

  const feedback = (() => {
    if (forgotMutation.isSuccess) {
      return {
        title: "Verifique seu e-mail",
        description:
          "Se o e-mail informado estiver cadastrado, voce recebera um link para redefinir sua senha.",
        tone: "info" as const,
      };
    }

    if (!(error instanceof ApiError)) {
      return null;
    }

    return {
      title: "Nao foi possivel continuar",
      description:
        "Tente novamente em instantes. Se o problema continuar, revise o e-mail informado ou tente mais tarde.",
      tone: "danger" as const,
    };
  })();

  return (
    <Card padding="lg" className="mx-auto max-w-xl">
      <CardTitle>Recuperar acesso</CardTitle>
      <CardDescription className="mt-2">
        Informe o e-mail da sua conta para receber um link seguro de redefinicao
        de senha.
      </CardDescription>

      {feedback ? (
        <FeedbackBanner
          className="mt-6"
          title={feedback.title}
          description={feedback.description}
          tone={feedback.tone}
        />
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            className="mb-2 block text-sm font-semibold text-white"
            htmlFor="email"
          >
            E-mail
          </label>
          <Input
            ref={emailRef}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={feedback ? true : undefined}
            disabled={forgotMutation.isPending}
            required
          />
        </div>

        <div className="flex justify-start">
          <p className="text-sm text-text-soft">
            Use o mesmo e-mail cadastrado para receber o link de acesso.
          </p>
        </div>
        <Button
          className="w-full"
          type="submit"
          disabled={forgotMutation.isPending}
        >
          {forgotMutation.isPending ? "Enviando link..." : "Enviar link de redefinicao"}
        </Button>
        <div className="flex justify-center">
          <Link to="/login" className="text-sm font-semibold text-secondary">
            Voltar para o login
          </Link>
        </div>
      </form>
    </Card>
  );
}
