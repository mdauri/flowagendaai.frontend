import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { useLoginMutation } from "@/hooks/use-login-mutation";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/types/api";

export function LoginForm() {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const loginMutation = useLoginMutation();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (loginMutation.isSuccess) {
      void auth.refetchCurrentUser().then(() => {
        navigate("/app", { replace: true });
      });
    }
  }, [auth, loginMutation.isSuccess, navigate]);

  const error = loginMutation.error;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginMutation.mutateAsync({
      email,
      password,
    });
  };

  const feedback = (() => {
    if (!(error instanceof ApiError)) {
      return null;
    }

    if (error.status === 401) {
      return {
        title: "Nao foi possivel entrar",
        description: "Verifique seu email e senha e tente novamente.",
      };
    }

    if (error.status === 403) {
      return {
        title: "Acesso nao autorizado",
        description: "Sua conta nao tem permissao para acessar esta operacao.",
      };
    }

    return {
      title: "Erro ao entrar",
      description: "Tente novamente em instantes. Se o problema continuar, revise a configuracao da API.",
    };
  })();

  return (
    <Card padding="lg" className="mx-auto max-w-xl">
      <CardTitle>Login</CardTitle>
      <CardDescription className="mt-2">
        Entre com as credenciais configuradas para o seu tenant.
      </CardDescription>

      {feedback ? (
        <FeedbackBanner
          className="mt-6"
          title={feedback.title}
          description={feedback.description}
        />
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-2 block text-sm font-semibold text-white" htmlFor="email">
            Email
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
            disabled={loginMutation.isPending}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-white" htmlFor="password">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={feedback ? true : undefined}
            disabled={loginMutation.isPending}
            required
          />
        </div>

        <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Card>
  );
}
