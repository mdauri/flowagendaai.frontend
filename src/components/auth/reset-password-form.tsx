import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { useResetPasswordMutation } from "@/hooks/use-reset-password-mutation";
import { ApiError } from "@/types/api";

type ResetFeedbackState =
  | {
      kind: "invalid";
      title: string;
      description: string;
      tone: "danger";
    }
  | {
      kind: "weakPassword";
      title: string;
      description: string;
      tone: "warning";
    }
  | {
      kind: "expired";
      title: string;
      description: string;
      tone: "warning";
    }
  | {
      kind: "success";
      title: string;
      description: string;
      tone: "info";
    }
  | {
      kind: "generic";
      title: string;
      description: string;
      tone: "danger";
    };

function isExpiredTokenError(error: ApiError) {
  const content = `${error.code} ${error.message}`.toLowerCase();
  return content.includes("expired") || content.includes("expir");
}

function isInvalidTokenError(error: ApiError) {
  const content = `${error.code} ${error.message}`.toLowerCase();
  return content.includes("invalid") || content.includes("inval");
}

function isWeakPasswordError(error: ApiError) {
  const content = `${error.code} ${error.message}`.toLowerCase();
  return (
    error.code === "WEAK_PASSWORD" ||
    content.includes("weak_password") ||
    (content.includes("senha") && content.includes("minimo"))
  );
}

export function ResetPasswordForm() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const resetPasswordMutation = useResetPasswordMutation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const hasToken = token.length > 0;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  const feedback = useMemo<ResetFeedbackState | null>(() => {
    if (!hasToken) {
      return {
        kind: "invalid",
        title: "Link invalido",
        description:
          "Este link de redefinicao nao e valido. Solicite um novo link para continuar.",
        tone: "danger",
      };
    }

    if (resetPasswordMutation.isSuccess) {
      return {
        kind: "success",
        title: "Senha atualizada",
        description:
          "Sua senha foi redefinida com sucesso. Voce ja pode entrar com a nova senha.",
        tone: "info",
      };
    }

    if (clientError) {
      return {
        kind: "generic",
        title: "Nao foi possivel redefinir",
        description: clientError,
        tone: "danger",
      };
    }

    const error = resetPasswordMutation.error;

    if (!(error instanceof ApiError)) {
      return null;
    }

    if (isExpiredTokenError(error)) {
      return {
        kind: "expired",
        title: "Link expirado",
        description:
          "Este link expirou por seguranca. Solicite um novo link para redefinir sua senha.",
        tone: "warning",
      };
    }

    if (isWeakPasswordError(error)) {
      return {
        kind: "weakPassword",
        title: "Senha invalida",
        description:
          "A senha deve ter no minimo 8 caracteres e incluir pelo menos uma letra e um numero.",
        tone: "warning",
      };
    }

    if (isInvalidTokenError(error) || error.status === 401) {
      return {
        kind: "invalid",
        title: "Link invalido",
        description:
          "Este link de redefinicao nao e valido. Solicite um novo link para continuar.",
        tone: "danger",
      };
    }

    return {
      kind: "generic",
      title: "Nao foi possivel redefinir",
      description:
        "Tente novamente em instantes. Se o problema continuar, solicite um novo link de redefinicao.",
      tone: "danger",
    };
  }, [clientError, hasToken, resetPasswordMutation.error, resetPasswordMutation.isSuccess]);

  const isTerminalState =
    feedback?.kind === "invalid" || feedback?.kind === "expired" || feedback?.kind === "success";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasToken) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setClientError("As senhas informadas precisam ser iguais para continuar.");
      return;
    }

    setClientError(null);

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword,
      });
    } catch {
      // The mutation state already drives the visible feedback.
    }
  };

  return (
    <Card padding="lg" className="mx-auto max-w-xl">
      <CardTitle>Definir nova senha</CardTitle>
      <CardDescription className="mt-2">
        Crie uma nova senha para voltar ao Agendoro com seguranca.
      </CardDescription>

      {feedback ? (
        <FeedbackBanner
          className="mt-6"
          title={feedback.title}
          description={feedback.description}
          tone={feedback.tone}
        />
      ) : null}

      {!isTerminalState ? (
        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-white"
              htmlFor="new-password"
            >
              Nova senha
            </label>
            <Input
              ref={passwordRef}
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              aria-invalid={feedback?.kind === "generic" ? true : undefined}
              disabled={resetPasswordMutation.isPending}
              required
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-semibold text-white"
              htmlFor="confirm-password"
            >
              Confirmar nova senha
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={feedback?.kind === "generic" ? true : undefined}
              disabled={resetPasswordMutation.isPending}
              required
            />
          </div>

          <div className="flex justify-start">
            <p className="text-sm text-text-soft">
              Use pelo menos 8 caracteres, com letras e numeros.
            </p>
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? "Redefinindo senha..." : "Redefinir senha"}
          </Button>

          <div className="flex justify-center">
            <Link to="/login" className="text-sm font-semibold text-secondary">
              Voltar para o login
            </Link>
          </div>
        </form>
      ) : (
        <div className="mt-6 space-y-4">
          {(feedback.kind === "invalid" || feedback.kind === "expired") && (
            <Button as={Link} to="/forgot-password" className="w-full">
              Solicitar novo link
            </Button>
          )}

          {feedback.kind === "success" && (
            <Button as={Link} to="/login" className="w-full">
              Ir para o login
            </Button>
          )}

          <div className="flex justify-center">
            <Link to="/login" className="text-sm font-semibold text-secondary">
              Voltar para o login
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
