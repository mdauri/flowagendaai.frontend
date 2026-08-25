import { Link } from "react-router";
import { HelpCenterLayout } from "@/components/help/help-center-layout";
import { HelpSearch } from "@/components/help/help-search";
import { Button } from "@/components/flow/button";
export function HelpNotFoundPage() { return <HelpCenterLayout><div className="mx-auto max-w-xl py-16 text-center"><h1 className="text-3xl font-black text-[var(--theme-text-primary)]">Não encontramos esta página.</h1><p className="mt-4 text-base leading-7 text-text-soft">Confira o endereço ou volte para a Central de Ajuda.</p><div className="mt-8 text-left"><HelpSearch value="" onChange={() => undefined} /></div><Button as={Link} to="/ajuda" className="mt-6">Voltar para a Central</Button></div></HelpCenterLayout>; }
