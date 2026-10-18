# Guias de implementação

Estas regras mantêm os apps front-end consistentes, acessíveis e fáceis de evoluir. Siga-as ao criar ou alterar qualquer tela, componente ou fluxo.

## Tokens de cor e tema

- Use os tokens semânticos registrados pelo app ou pelo design system. Não use cores hard-coded (`#...`, `rgb(...)`, `hsl(...)`) nem valores arbitrários de cor em JSX.
- Cada app deve manter seus tokens no arquivo de tema correspondente. Antes de criar uma cor, procure um token com o mesmo significado; caso não exista, crie um token semântico no tema do app.
- Use utilidades Tailwind baseadas em tokens, como `bg-tor-surface`, `text-marketplace-text-muted` e `border-app-border`, em vez de `bg-[var(--...)]` ou valores arbitrários.
- Prefira tokens de intenção e estado (`danger`, `warning`, `accent`, `text-subtle`) a tokens de superfície quando a cor comunicar feedback, prioridade ou estado.

> Exemplo: `tor-accent` e `marketplace-danger` são nomes de tokens específicos de app; a regra é usar o token semântico disponível no contexto em que o componente vive.

## Design system e escopo de componentes

- Antes de criar um controle, procure uma alternativa em `src/components/` e em `packages/ui`. Componentes compartilhados devem concentrar estrutura, foco, estados, acessibilidade e comportamento recorrente.
- Componentes de app podem estender ou adaptar os componentes de `packages/ui` e de `tooling/tailwind-config` para preservar os padrões visuais e utilitários existentes.
- A customização local é permitida quando uma tela ou app exige uma variação real — por exemplo, um `TorInput` com aparência própria —, mas não duplique um controle compartilhado apenas para repetir estilos.
- Telas devem compor controles e cuidar principalmente de fluxo e layout; controles não devem conhecer regras de uma tela específica.
- Ações interativas devem usar o botão compartilhado do app ou do design system. Não recrie `<button>` com estilos locais quando uma variante ou extensão do componente existente atender ao caso.
- Para estados de componentes encapsulados, prefira props semânticas como `error`, `invalid` e `disabled` em vez de reenviar classes condicionais de aparência através de múltiplos wrappers.

### Organização por proximidade

Mantenha cada componente no menor escopo em que ele é reutilizado:

| Escopo            | Local                       |
| ----------------- | --------------------------- |
| Todo o App        | `src/components/`           |
| Uma tela ou fluxo | `src/pages/job/components/` |

Prefira um componente relevante por arquivo. Componentes pequenos de apoio podem compartilhar um arquivo quando são estritamente internos e coesos. Evite módulos de UI monolíticos: agrupe componentes por responsabilidade em arquivos próprios e exponha um barrel apenas para compatibilidade de imports. Em telas compostas, mantenha o `index.tsx` como orquestrador e extraia blocos visuais e interativos para `components/` locais. Para `Props` locais e não exportadas, use `type Props = { ... }`.

## Renderização por associação

Para variações finitas de UI — status, ações, abas, etapas ou tipos — prefira um `Record` indexado pela chave de domínio. O registro deve reunir o conteúdo associado (rótulo, ícone, descrição e classes), deixando a tela responsável apenas por escolher a configuração.

```tsx
const ACTION_CONTENT: Record<ConfirmationAction, ActionContent> = {
  delete: { title: 'Excluir anúncio?', icon: LucideTrash2, className: 'text-tor-danger' },
  sold: { title: 'Marcar como vendido?', icon: LucideBadgeCheck, className: 'text-tor-accent' },
}

const content = ACTION_CONTENT[action]
```

Use condicionais simples para presença/ausência de conteúdo e regras de fluxo. Não force um `Record` para validações, guard clauses ou lógica que não representa uma variação finita.

## Condicionais e `className`

- Para conteúdo opcional, prefira `condition && <Content />` a `condition ? <Content /> : null`. Quando a condição for numérica, compare explicitamente (`items.length > 0`) para não renderizar `0` no JSX.
- Para escolher entre conteúdo principal e fallback, prefira `<Show>` de `@/components/show` a ternários ou ternários aninhados no JSX. Ele deixa os dois estados explícitos e aceita uma função filha quando o valor validado é necessário.
- Evite ternários aninhados no JSX. Extraia condições nomeadas, use `<Show>` para bifurcações de renderização ou use renderização por associação quando houver uma lista finita de alternativas.
- Use `cn` de `@valley/ui/cn` para classes condicionais; não concatene `className` com template literals.

```tsx
<Show when={pagedResults.length} fallback={<EmptyResults onClear={onClear} />}>
  {() => <ResultsList results={pagedResults} />}
</Show>
```

Use `&&` quando somente um conteúdo opcional for exibido; use `<Show>` quando houver um fallback ou duas alternativas de renderização claras. Dê à condição um nome que descreva o ramo verdadeiro e mantenha esse ramo como `children`; `fallback` representa o ramo falso. O `TorMarketScreen` demonstra os dois padrões.

- Em componentes que aceitam `className`, aplique as classes-base primeiro, estados depois e `className` por último, permitindo sobrescrita previsível.

```tsx
className={cn(
  'rounded-xl bg-tor-surface',
  selected && 'border-tor-accent',
  className,
)}
```

## Legibilidade e manutenção

- Siga princípios de clean code: nomes explícitos, early returns, condições complexas extraídas em variáveis nomeadas e separação visual entre blocos sem relação direta.
- Evite abstrações prematuras. Extraia um componente ou utilitário quando ele tiver uma responsabilidade clara ou reutilização real.
- Preserve o comportamento ao refatorar. Inclua tipos nas fronteiras do componente e mantenha regras de domínio fora de componentes puramente visuais.
- Não mantenha etapas, controles ou estados de fluxos que não estejam disponíveis no produto atual. Remova-os integralmente — UI, validação, importações e arquivos locais — para não criar caminhos mortos.

## Checklist de revisão

- [ ] Não há cores arbitrárias, hard-coded ou `var(--...)` em classes Tailwind.
- [ ] Tokens novos são semânticos e foram registrados no tema do app correto.
- [ ] Controles repetidos usam ou estendem componentes compartilhados.
- [ ] Componentes estão no escopo mais próximo da reutilização e arquivos mantêm responsabilidades coesas.
- [ ] Variações finitas usam configuração por associação quando apropriado.
- [ ] Classes condicionais usam `cn`, e `className` do consumidor vem por último.
- [ ] JSX não contém ternários `: null` evitáveis nem ternários aninhados; bifurcações com fallback usam `<Show>`.
- [ ] A alteração preserva acessibilidade, legibilidade e comportamento existente.
