import { type FormEvent, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ApiError } from "@/types/api";
import type { BillingCustomerData, BillingCustomerInput } from "@/types/billing";

interface BillingCustomerFormProps {
  value: BillingCustomerData;
  isSaving: boolean;
  error?: unknown;
  onSubmit: (input: BillingCustomerInput) => Promise<unknown>;
}

type FormErrors = Partial<Record<keyof BillingCustomerInput, string>>;

const emptyValues: BillingCustomerInput = {
  billingEmail: "",
  billingCpfCnpj: "",
  billingPhone: "",
  billingAddress: "",
  billingAddressNumber: "",
  billingPostalCode: "",
  billingProvince: "",
};

function onlyDigits(input: string): string {
  return input.replace(/\D/g, "");
}

function normalizeValue(value: BillingCustomerData): BillingCustomerInput {
  return {
    billingEmail: value.billingEmail ?? "",
    billingCpfCnpj: value.billingCpfCnpj ?? "",
    billingPhone: value.billingPhone ?? "",
    billingAddress: value.billingAddress ?? "",
    billingAddressNumber: value.billingAddressNumber ?? "",
    billingPostalCode: value.billingPostalCode ?? "",
    billingProvince: value.billingProvince ?? "",
  };
}

function validate(values: BillingCustomerInput): FormErrors {
  const errors: FormErrors = {};

  if (!/^\S+@\S+\.\S+$/.test(values.billingEmail.trim())) {
    errors.billingEmail = "Informe um email de cobranca valido.";
  }
  if (!/^\d{11}$|^\d{14}$/.test(values.billingCpfCnpj)) {
    errors.billingCpfCnpj = "Informe CPF com 11 digitos ou CNPJ com 14 digitos.";
  }
  if (!/^\d{10,11}$/.test(values.billingPhone)) {
    errors.billingPhone = "Informe telefone com DDD, somente numeros.";
  }
  if (values.billingAddress.trim().length < 2) {
    errors.billingAddress = "Informe o logradouro.";
  }
  if (values.billingAddressNumber.trim().length < 1) {
    errors.billingAddressNumber = "Informe o numero.";
  }
  if (!/^\d{8}$/.test(values.billingPostalCode)) {
    errors.billingPostalCode = "Informe CEP com 8 digitos.";
  }
  if (values.billingProvince.trim().length < 2) {
    errors.billingProvince = "Informe o bairro.";
  }

  return errors;
}

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Nao foi possivel salvar os dados de cobranca.";
}

export function BillingCustomerForm({
  value,
  isSaving,
  error,
  onSubmit,
}: BillingCustomerFormProps) {
  const [values, setValues] = useState<BillingCustomerInput>(() => normalizeValue(value));
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValues(normalizeValue(value));
    setErrors({});
  }, [value]);

  function updateValue<K extends keyof BillingCustomerInput>(
    key: K,
    nextValue: BillingCustomerInput[K],
  ) {
    setValues((current) => ({ ...current, [key]: nextValue }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaved(false);
      return;
    }

    await onSubmit({
      billingEmail: values.billingEmail.trim().toLowerCase(),
      billingCpfCnpj: values.billingCpfCnpj,
      billingPhone: values.billingPhone,
      billingAddress: values.billingAddress.trim(),
      billingAddressNumber: values.billingAddressNumber.trim(),
      billingPostalCode: values.billingPostalCode,
      billingProvince: values.billingProvince.trim(),
    });
    setSaved(true);
  }

  const apiError = getErrorMessage(error);

  return (
    <Card variant="glass" padding="lg">
      <div>
        <CardTitle>Dados de cobranca Asaas</CardTitle>
        <CardDescription className="mt-2">
          Esses dados sao enviados ao Asaas para criar o customer e preencher o checkout recorrente.
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4" noValidate>
        {apiError ? <FeedbackBanner title="Falha ao salvar" description={apiError} tone="danger" /> : null}
        {saved ? (
          <FeedbackBanner
            title="Dados salvos"
            description="Os dados de cobranca foram atualizados."
            tone="info"
          />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="billing-email"
            label="Email de cobranca"
            value={values.billingEmail}
            onChange={(nextValue) => updateValue("billingEmail", nextValue)}
            placeholder="financeiro@exemplo.com"
            error={errors.billingEmail}
            disabled={isSaving}
          />
          <Field
            id="billing-cpf-cnpj"
            label="CPF/CNPJ"
            value={values.billingCpfCnpj}
            onChange={(nextValue) => updateValue("billingCpfCnpj", onlyDigits(nextValue))}
            placeholder="12345678000195"
            error={errors.billingCpfCnpj}
            disabled={isSaving}
          />
          <Field
            id="billing-phone"
            label="Telefone"
            value={values.billingPhone}
            onChange={(nextValue) => updateValue("billingPhone", onlyDigits(nextValue))}
            placeholder="11999999999"
            error={errors.billingPhone}
            disabled={isSaving}
          />
          <Field
            id="billing-postal-code"
            label="CEP"
            value={values.billingPostalCode}
            onChange={(nextValue) => updateValue("billingPostalCode", onlyDigits(nextValue))}
            placeholder="01001000"
            error={errors.billingPostalCode}
            disabled={isSaving}
          />
          <Field
            id="billing-address"
            label="Logradouro"
            value={values.billingAddress}
            onChange={(nextValue) => updateValue("billingAddress", nextValue)}
            placeholder="Rua Exemplo"
            error={errors.billingAddress}
            disabled={isSaving}
          />
          <Field
            id="billing-address-number"
            label="Numero"
            value={values.billingAddressNumber}
            onChange={(nextValue) => updateValue("billingAddressNumber", nextValue)}
            placeholder="123"
            error={errors.billingAddressNumber}
            disabled={isSaving}
          />
          <Field
            id="billing-province"
            label="Bairro"
            value={values.billingProvince}
            onChange={(nextValue) => updateValue("billingProvince", nextValue)}
            placeholder="Centro"
            error={errors.billingProvince}
            disabled={isSaving}
          />
        </div>

        <div>
          <Button type="submit" size="md" disabled={isSaving}>
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar dados de cobranca
          </Button>
        </div>
      </form>
    </Card>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function Field({ id, label, value, placeholder, error, disabled, onChange }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-white">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
