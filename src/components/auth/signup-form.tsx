import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Checkbox } from "@/components/flow/checkbox";
import { Input } from "@/components/flow/input";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { useAuth } from "@/hooks/use-auth";
import { usePublicSignupMutation } from "@/hooks/use-public-signup-mutation";
import { ApiError } from "@/types/api";

type SignupField =
  | "responsibleName"
  | "email"
  | "phone"
  | "companyName"
  | "cpfCnpj"
  | "password"
  | "confirmPassword"
  | "acceptedTerms";

interface SignupFormValues {
  responsibleName: string;
  email: string;
  phone: string;
  companyName: string;
  cpfCnpj: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

type SignupFormErrors = Partial<Record<SignupField, string>>;

const initialValues: SignupFormValues = {
  responsibleName: "",
  email: "",
  phone: "",
  companyName: "",
  cpfCnpj: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

const fieldOrder: SignupField[] = [
  "responsibleName",
  "email",
  "phone",
  "companyName",
  "cpfCnpj",
  "password",
  "confirmPassword",
  "acceptedTerms",
];

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  const digits = onlyDigits(value);
  return digits.length >= 10 && digits.length <= 13;
}

function isValidCpfCnpj(value: string) {
  const digits = onlyDigits(value);
  return digits.length === 11 || digits.length === 14;
}

function validateSignupForm(values: SignupFormValues): SignupFormErrors {
  const errors: SignupFormErrors = {};

  if (!values.responsibleName.trim()) {
    errors.responsibleName = "Informe seu nome.";
  }

  if (!isValidEmail(values.email)) {
    errors.email = "Informe um e-mail valido.";
  }

  if (!isValidPhone(values.phone)) {
    errors.phone = "Informe um WhatsApp valido.";
  }

  if (!values.companyName.trim()) {
    errors.companyName = "Informe o nome da empresa.";
  }

  if (!isValidCpfCnpj(values.cpfCnpj)) {
    errors.cpfCnpj = "Informe um CPF ou CNPJ valido.";
  }

  if (values.password.length < 8) {
    errors.password = "A senha precisa ter pelo menos 8 caracteres.";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "As senhas precisam ser iguais.";
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = "Aceite os termos para continuar.";
  }

  return errors;
}

function signupFeedback(error: unknown) {
  if (!error) {
    return null;
  }

  if (!(error instanceof ApiError)) {
    return {
      title: "Erro ao criar conta",
      description: "Erro ao criar conta. Tente novamente em instantes.",
    };
  }

  if (error.status === 409 || error.code === "SIGNUP_CONFLICT") {
    return {
      title: "Nao foi possivel criar a conta",
      description: "Ja existe uma conta com esses dados.",
    };
  }

  if (error.status === 429 || error.code === "RATE_LIMIT_EXCEEDED") {
    return {
      title: "Muitas tentativas",
      description: "Muitas tentativas. Tente novamente em alguns minutos.",
    };
  }

  if (error.status === 400 || error.code === "VALIDATION_ERROR") {
    return {
      title: "Revise os dados",
      description: "Revise os dados e tente novamente.",
    };
  }

  return {
    title: "Erro ao criar conta",
    description: "Erro ao criar conta. Tente novamente em instantes.",
  };
}

export function SignupForm() {
  const navigate = useNavigate();
  const auth = useAuth();
  const signupMutation = usePublicSignupMutation();
  const nameRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Partial<Record<SignupField, HTMLInputElement | null>>>({});
  const [values, setValues] = useState<SignupFormValues>(initialValues);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [bootstrapError, setBootstrapError] = useState(false);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const isSubmitting = signupMutation.isPending;
  const feedback = useMemo(() => {
    if (bootstrapError) {
      return {
        title: "Conta criada",
        description:
          "Sua conta foi criada, mas nao foi possivel abrir o painel automaticamente. Acesse pelo login.",
      };
    }

    return signupFeedback(signupMutation.error);
  }, [bootstrapError, signupMutation.error]);

  function updateValue<Field extends keyof SignupFormValues>(
    field: Field,
    value: SignupFormValues[Field],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field as SignupField]) {
        return current;
      }
      const next = { ...current };
      delete next[field as SignupField];
      return next;
    });
    setBootstrapError(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBootstrapError(false);

    const nextErrors = validateSignupForm(values);
    setErrors(nextErrors);

    const firstInvalidField = fieldOrder.find((field) => nextErrors[field]);
    if (firstInvalidField) {
      fieldRefs.current[firstInvalidField]?.focus();
      return;
    }

    try {
      await signupMutation.mutateAsync({
        responsibleName: values.responsibleName.trim(),
        email: values.email.trim(),
        phone: onlyDigits(values.phone),
        cpfCnpj: onlyDigits(values.cpfCnpj),
        companyName: values.companyName.trim(),
        password: values.password,
        acceptedTerms: values.acceptedTerms,
      });

      const currentUserResult = await auth.refetchCurrentUser();
      if (currentUserResult.error || !currentUserResult.data) {
        setBootstrapError(true);
        return;
      }

      navigate("/app", { replace: true });
    } catch {
      // Mutation state drives the visible API feedback.
    }
  }

  function errorId(field: SignupField) {
    return `signup-${field}-error`;
  }

  return (
    <Card padding="lg" className="mx-auto max-w-xl">
      <CardTitle>Comece seu teste gratis</CardTitle>
      <CardDescription className="mt-2">
        Crie sua conta e configure sua agenda depois. 14 dias gratis. Sem cartao agora.
      </CardDescription>

      {feedback ? (
        <FeedbackBanner
          className="mt-6"
          title={feedback.title}
          description={feedback.description}
          tone={bootstrapError ? "warning" : "danger"}
        />
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]" htmlFor="responsibleName">
            Seu nome
          </label>
          <Input
            ref={(element) => {
              nameRef.current = element;
              fieldRefs.current.responsibleName = element;
            }}
            id="responsibleName"
            autoComplete="name"
            placeholder="Ex.: Ana Silva"
            value={values.responsibleName}
            onChange={(event) => updateValue("responsibleName", event.target.value)}
            aria-invalid={Boolean(errors.responsibleName)}
            aria-describedby={errors.responsibleName ? errorId("responsibleName") : undefined}
            disabled={isSubmitting}
            required
          />
          {errors.responsibleName ? (
            <p id={errorId("responsibleName")} className="mt-2 text-sm text-red-200">
              {errors.responsibleName}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]" htmlFor="signup-email">
            E-mail
          </label>
          <Input
            ref={(element) => {
              fieldRefs.current.email = element;
            }}
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errorId("email") : undefined}
            disabled={isSubmitting}
            required
          />
          {errors.email ? (
            <p id={errorId("email")} className="mt-2 text-sm text-red-200">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]" htmlFor="phone">
              WhatsApp
            </label>
            <Input
              ref={(element) => {
                fieldRefs.current.phone = element;
              }}
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              value={values.phone}
              onChange={(event) => updateValue("phone", event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? errorId("phone") : undefined}
              disabled={isSubmitting}
              required
            />
            {errors.phone ? (
              <p id={errorId("phone")} className="mt-2 text-sm text-red-200">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]" htmlFor="cpfCnpj">
              CPF ou CNPJ
            </label>
            <Input
              ref={(element) => {
                fieldRefs.current.cpfCnpj = element;
              }}
              id="cpfCnpj"
              inputMode="numeric"
              placeholder="Somente numeros"
              value={values.cpfCnpj}
              onChange={(event) => updateValue("cpfCnpj", event.target.value)}
              aria-invalid={Boolean(errors.cpfCnpj)}
              aria-describedby={errors.cpfCnpj ? errorId("cpfCnpj") : undefined}
              disabled={isSubmitting}
              required
            />
            {errors.cpfCnpj ? (
              <p id={errorId("cpfCnpj")} className="mt-2 text-sm text-red-200">
                {errors.cpfCnpj}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]" htmlFor="companyName">
            Nome da empresa
          </label>
          <Input
            ref={(element) => {
              fieldRefs.current.companyName = element;
            }}
            id="companyName"
            autoComplete="organization"
            placeholder="Ex.: Studio Bella"
            value={values.companyName}
            onChange={(event) => updateValue("companyName", event.target.value)}
            aria-invalid={Boolean(errors.companyName)}
            aria-describedby={errors.companyName ? errorId("companyName") : undefined}
            disabled={isSubmitting}
            required
          />
          {errors.companyName ? (
            <p id={errorId("companyName")} className="mt-2 text-sm text-red-200">
              {errors.companyName}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]" htmlFor="signup-password">
              Senha
            </label>
            <Input
              ref={(element) => {
                fieldRefs.current.password = element;
              }}
              id="signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimo 8 caracteres"
              value={values.password}
              onChange={(event) => updateValue("password", event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? errorId("password") : undefined}
              disabled={isSubmitting}
              required
            />
            {errors.password ? (
              <p id={errorId("password")} className="mt-2 text-sm text-red-200">
                {errors.password}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]" htmlFor="confirmPassword">
              Confirmar senha
            </label>
            <Input
              ref={(element) => {
                fieldRefs.current.confirmPassword = element;
              }}
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repita sua senha"
              value={values.confirmPassword}
              onChange={(event) => updateValue("confirmPassword", event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? errorId("confirmPassword") : undefined}
              disabled={isSubmitting}
              required
            />
            {errors.confirmPassword ? (
              <p id={errorId("confirmPassword")} className="mt-2 text-sm text-red-200">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm leading-6 text-text-soft">
            <Checkbox
              ref={(element) => {
                fieldRefs.current.acceptedTerms = element;
              }}
              checked={values.acceptedTerms}
              onCheckedChange={(checked) => updateValue("acceptedTerms", checked)}
              aria-invalid={Boolean(errors.acceptedTerms)}
              aria-describedby={errors.acceptedTerms ? errorId("acceptedTerms") : undefined}
              disabled={isSubmitting}
            />
            <span>
              Li e aceito os{" "}
              <Link className="font-semibold text-secondary" to="/termos-de-uso">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link className="font-semibold text-secondary" to="/politica-de-privacidade">
                Politica de Privacidade
              </Link>
              .
            </span>
          </label>
          {errors.acceptedTerms ? (
            <p id={errorId("acceptedTerms")} className="mt-2 text-sm text-red-200">
              {errors.acceptedTerms}
            </p>
          ) : null}
        </div>

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando conta..." : "Criar minha conta"}
        </Button>

        <div className="flex justify-center">
          <Link to="/login" className="text-sm font-semibold text-secondary">
            Ja tenho conta
          </Link>
        </div>
      </form>
    </Card>
  );
}
