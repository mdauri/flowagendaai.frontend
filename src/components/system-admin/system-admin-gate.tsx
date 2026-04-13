import { Card, CardDescription, CardTitle } from "@/components/flow/card";

interface SystemAdminGateProps {
  isAllowed: boolean;
  fallbackTitle?: string;
  fallbackDescription?: string;
  children: React.ReactNode;
}

export function SystemAdminGate({
  isAllowed,
  fallbackTitle = "Acesso restrito",
  fallbackDescription = "Voce nao tem permissao para provisionar mandantes.",
  children,
}: SystemAdminGateProps) {
  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <Card variant="premium" padding="lg" className="mx-auto max-w-3xl">
      <CardTitle>{fallbackTitle}</CardTitle>
      <CardDescription className="mt-3">{fallbackDescription}</CardDescription>
    </Card>
  );
}
