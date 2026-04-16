import { useMemo, useState } from "react";
import { Loader2, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Select } from "@/components/flow/select";
import { Checkbox } from "@/components/flow/checkbox";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useApiTokensQuery } from "@/hooks/use-api-tokens-query";
import { useSystemAdminTenantsQuery } from "@/hooks/use-system-admin-tenants-query";
import { useCreateApiTokenMutation } from "@/hooks/use-create-api-token-mutation";
import { useRevokeApiTokenMutation } from "@/hooks/use-revoke-api-token-mutation";
import { ApiError } from "@/types/api";
import type { ApiTokenScope, CreateApiTokenInput } from "@/types/api-token";

const DEFAULT_SCOPE_OPTIONS: Array<{ value: ApiTokenScope; label: string; description: string }> = [
  {
    value: "messages:read",
    label: "messages:read",
    description: "Permite leitura de mensagens.",
  },
  {
    value: "messages:send",
    label: "messages:send",
    description: "Permite envio de mensagens.",
  },
  {
    value: "customers:read",
    label: "customers:read",
    description: "Permite leitura de clientes.",
  },
  {
    value: "ai:respond",
    label: "ai:respond",
    description: "Permite respostas de fluxos de IA.",
  },
  {
    value: "webhooks:receive",
    label: "webhooks:receive",
    description: "Permite recebimento de webhooks.",
  },
];

interface FormState {
  name: string;
  prefix: string;
  expiresAt: string;
  scopes: ApiTokenScope[];
}

const emptyFormState: FormState = {
  name: "",
  prefix: "n8n",
  expiresAt: "",
  scopes: ["messages:read"],
};

function formatDateTimeBr(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function mapApiError(error: ApiError): string {
  if (error.status === 401) {
    return "Sessao invalida. Faca login novamente.";
  }

  if (error.status === 403) {
    return "Voce nao tem permissao para gerenciar tokens.";
  }

  if (error.status === 400) {
    return "Dados invalidos. Revise os campos informados.";
  }

  return "Nao foi possivel concluir a operacao agora.";
}

export function ApiTokensPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const tenantsQuery = useSystemAdminTenantsQuery();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const listQuery = useApiTokensQuery(selectedTenantId || null);
  const createMutation = useCreateApiTokenMutation();
  const revokeMutation = useRevokeApiTokenMutation();
  const [form, setForm] = useState<FormState>(emptyFormState);
  const [oneTimeToken, setOneTimeToken] = useState<string | null>(null);

  const isAllowed = useMemo(
    () => auth.user?.role === "system-admin",
    [auth.user?.role]
  );

  const allowedScopes = useMemo(() => {
    if (listQuery.data?.allowedScopes?.length) {
      return listQuery.data.allowedScopes;
    }

    return DEFAULT_SCOPE_OPTIONS.map((option) => option.value);
  }, [listQuery.data?.allowedScopes]);

  if (!isAllowed) {
    return (
      <PageState
        title="Acesso restrito"
        description="Apenas system-admin pode gerenciar tokens M2M."
      />
    );
  }

  const tenantOptions = (tenantsQuery.data?.items ?? []).map((tenant) => ({
    value: tenant.id,
    label: `${tenant.name} (${tenant.slug})`,
  }));

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast({
        title: "Nome obrigatorio",
        description: "Informe um nome para o token.",
        variant: "warning",
      });
      return;
    }

    if (form.scopes.length === 0) {
      toast({
        title: "Escopo obrigatorio",
        description: "Selecione ao menos um escopo.",
        variant: "warning",
      });
      return;
    }

    if (!form.expiresAt.trim()) {
      toast({
        title: "Expiracao obrigatoria",
        description: "Informe data e hora de expiracao.",
        variant: "warning",
      });
      return;
    }

    if (!selectedTenantId) {
      toast({
        title: "Mandante obrigatorio",
        description: "Selecione o mandante para gerar o token.",
        variant: "warning",
      });
      return;
    }

    const expiresAtDate = new Date(form.expiresAt);
    if (Number.isNaN(expiresAtDate.getTime()) || expiresAtDate.getTime() <= Date.now()) {
      toast({
        title: "Expiracao invalida",
        description: "A expiracao deve ser uma data futura.",
        variant: "warning",
      });
      return;
    }

    const payload: CreateApiTokenInput = {
      tenantId: selectedTenantId,
      name: form.name.trim(),
      prefix: form.prefix.trim().toLowerCase(),
      scopes: form.scopes,
      expiresAt: expiresAtDate.toISOString(),
    };

    try {
      const response = await createMutation.mutateAsync(payload);
      setOneTimeToken(response.token);
      setForm({
        ...emptyFormState,
        prefix: form.prefix,
      });
      toast({
        title: "Token criado",
        description: "Copie o token agora. Ele nao sera exibido novamente.",
        variant: "success",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Falha ao criar token",
          description: mapApiError(error),
          variant: "danger",
        });
        return;
      }

      toast({
        title: "Falha ao criar token",
        description: "Erro inesperado ao criar token.",
        variant: "danger",
      });
    }
  }

  async function handleRevoke(id: string) {
    if (!selectedTenantId) {
      toast({
        title: "Mandante obrigatorio",
        description: "Selecione um mandante para revogar o token.",
        variant: "warning",
      });
      return;
    }

    try {
      await revokeMutation.mutateAsync({ id, tenantId: selectedTenantId });
      toast({
        title: "Token revogado",
        description: "O token foi revogado com sucesso.",
        variant: "success",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Falha ao revogar token",
          description: mapApiError(error),
          variant: "danger",
        });
        return;
      }

      toast({
        title: "Falha ao revogar token",
        description: "Erro inesperado ao revogar token.",
        variant: "danger",
      });
    }
  }

  function toggleScope(scope: ApiTokenScope, checked: boolean) {
    setForm((current) => {
      if (checked) {
        if (current.scopes.includes(scope)) {
          return current;
        }

        return {
          ...current,
          scopes: [...current.scopes, scope],
        };
      }

      return {
        ...current,
        scopes: current.scopes.filter((item) => item !== scope),
      };
    });
  }

  async function copyOneTimeToken() {
    if (!oneTimeToken) {
      return;
    }

    await navigator.clipboard.writeText(oneTimeToken);
    toast({
      title: "Token copiado",
      description: "Armazene este token em local seguro.",
      variant: "success",
    });
  }

  return (
    <div className="grid gap-6">
      <Card variant="premium" padding="lg">
        <CardTitle>API Tokens M2M</CardTitle>
        <CardDescription className="mt-3">
          Crie e gerencie tokens para mandantes especificos com menor privilegio.
        </CardDescription>
      </Card>

      <Card variant="glass" padding="lg">
        <CardTitle>Mandante alvo</CardTitle>
        <CardDescription className="mt-2">
          Selecione o mandante para criar, listar e revogar tokens.
        </CardDescription>
        {tenantsQuery.isLoading ? (
          <div className="mt-4 flex items-center gap-2 text-text-soft">
            <Loader2 size={16} className="animate-spin" />
            Carregando mandantes...
          </div>
        ) : tenantsQuery.isError ? (
          <PageState
            title="Falha ao carregar mandantes"
            description="Nao foi possivel carregar a lista de mandantes."
            actionLabel="Tentar novamente"
            onAction={() => void tenantsQuery.refetch()}
          />
        ) : (
          <div className="mt-4 grid gap-2">
            <label className="text-sm font-semibold text-white" htmlFor="api-token-tenant">
              Mandante
            </label>
            <Select
              id="api-token-tenant"
              value={selectedTenantId}
              options={tenantOptions}
              placeholder="Selecione um mandante"
              onValueChange={setSelectedTenantId}
            />
          </div>
        )}
      </Card>

      <Card variant="glass" padding="lg">
        <CardTitle>Criar novo token</CardTitle>
        <CardDescription className="mt-2">
          O token sera exibido uma unica vez. Exemplo n8n: configure header
          <span className="font-semibold text-white"> Authorization: Bearer {'<TOKEN>'}</span> no HTTP Request node.
        </CardDescription>
        <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-white" htmlFor="api-token-name">
              Nome do token
            </label>
            <Input
              id="api-token-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Token n8n automacoes"
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2 md:gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white" htmlFor="api-token-prefix">
                Prefixo
              </label>
              <Input
                id="api-token-prefix"
                value={form.prefix}
                onChange={(event) =>
                  setForm((current) => ({ ...current, prefix: event.target.value }))
                }
                placeholder="n8n"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white" htmlFor="api-token-expires-at">
                Expira em
              </label>
              <Input
                id="api-token-expires-at"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, expiresAt: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-semibold text-white">Escopos</p>
            <div className="grid gap-2">
              {DEFAULT_SCOPE_OPTIONS.filter((scope) => allowedScopes.includes(scope.value)).map((scope) => (
                <label
                  key={scope.value}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <Checkbox
                    checked={form.scopes.includes(scope.value)}
                    onCheckedChange={(checked) => toggleScope(scope.value, checked)}
                  />
                  <span className="grid gap-1">
                    <span className="text-sm font-semibold text-white">{scope.label}</span>
                    <span className="text-xs text-text-soft">{scope.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="md"
              disabled={createMutation.isPending || !selectedTenantId || tenantsQuery.isLoading}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar token"
              )}
            </Button>
          </div>
        </form>
      </Card>

      {oneTimeToken ? (
        <Card variant="premium" padding="lg">
          <CardTitle>Token gerado (exibicao unica)</CardTitle>
          <CardDescription className="mt-2">
            Copie e armazene agora. Este token nao sera exibido novamente.
          </CardDescription>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <Input readOnly value={oneTimeToken} />
            <Button type="button" size="md" onClick={copyOneTimeToken}>
              <Copy size={16} />
              Copiar token
            </Button>
            <Button type="button" size="md" variant="secondary" onClick={() => setOneTimeToken(null)}>
              Entendi
            </Button>
          </div>
        </Card>
      ) : null}

      <Card variant="glass" padding="lg">
        <CardTitle>Tokens cadastrados</CardTitle>
        {!selectedTenantId ? (
          <PageState
            title="Selecione um mandante"
            description="Escolha um mandante para visualizar os tokens M2M."
          />
        ) : listQuery.isLoading ? (
          <div className="mt-4 flex items-center gap-2 text-text-soft">
            <Loader2 size={16} className="animate-spin" />
            Carregando tokens...
          </div>
        ) : listQuery.isError ? (
          <PageState
            title="Falha ao carregar tokens"
            description="Nao foi possivel carregar a lista de tokens."
            actionLabel="Tentar novamente"
            onAction={() => void listQuery.refetch()}
          />
        ) : listQuery.data && listQuery.data.items.length === 0 ? (
          <PageState
            title="Nenhum token cadastrado"
            description="Crie o primeiro token M2M para liberar integracoes externas."
          />
        ) : (
          <div className="mt-4 grid gap-3">
            {listQuery.data?.items.map((item) => (
              <Card key={item.id} variant="surface" padding="md" className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-text-soft">
                      Prefixo: {item.prefix}_ | Status: {item.status}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={item.status === "revoked" || revokeMutation.isPending}
                    onClick={() => void handleRevoke(item.id)}
                  >
                    <Trash2 size={14} />
                    Revogar
                  </Button>
                </div>
                <p className="text-xs text-text-soft">Escopos: {item.scopes.join(", ")}</p>
                <p className="text-xs text-text-soft">
                  Expira em: {formatDateTimeBr(item.expiresAt)}
                </p>
                <p className="text-xs text-text-soft">
                  Ultimo uso: {item.lastUsedAt ? formatDateTimeBr(item.lastUsedAt) : "Nunca"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
