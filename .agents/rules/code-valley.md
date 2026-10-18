---
trigger: always_on
---

Sempre responda em PT-BR.
Não adicione novos comentários nem remova atuais. Prefira objetos por associação chave-valor ou early returns ao invés de if else aninhados ou em excesso. Siga o padrão de código do restante da codebase.
Não adicione novos arquivos .MD com documentações a nao ser que eu te peça.

Sempre aplique `caveman` e `clean-code`.
Carregue somente as skills estritamente necessárias para o contexto atual.
Não carregue skills redundantes, aliases legados ou skills de domínios adjacentes sem necessidade clara.
Prefira a skill canônica normalizada do pack novo quando existir equivalente.

O padrão da minha codebase em lua do roleplay é:

# Valley Resource Boilerplate (Lua)

Boilerplate de resource para MTA em **Lua padrão**.

Ele segue o estilo que já aparece nos resources mais novos do projeto, bons exemplos são:

- `valley_jobs_mechanic`
- `valley_driving_school`
- `valley_companies_ammunation`
- `valley_routes`
- `valley_atm`

A ideia aqui é simples:

- deixar os resources previsíveis
- separar responsabilidades direito
- facilitar manutenção
- fazer a IA gerar código no padrão certo
- fazer desenvolvedores entenderem rápido onde cada coisa deve ficar

---

## Resumo da arquitetura

### Regra principal

- **Managers** controlam **estado**, **regra de negócio** e **lógica pura**.
- **Handlers** orquestram **fluxos/managers**, **eventos**, **UI/CEF**, sincronização e comunicação entre camadas.
- **Services** lidam com backend, memória, integrações e contratos externos.
- **Helpers** cuidam de setup, formatação, builders e utilidades específicas.
- **Client** deve, sempre que possível, só **comunicar intenção** e **renderizar**.
- **Server** deve validar, decidir, autorizar e executar quase tudo que for relevante.

### Regra de ouro

**Se algo é importante para segurança, estado, validação ou regra, ele deve viver no server-side.**

O client não deve ser tratado como fonte de verdade.

---

## Estrutura base

```txt
valley_my_resource/
├── meta.xml
├── README.md
├── client/
│   ├── constants/
│   │   └── ui-callbacks.lua
│   ├── managers/
│   │   └── ui.lua
│   └── instances.lua
├── handlers/
│   ├── client/
│   │   ├── _on-setup.lua
│   │   ├── on-close-my-resource.lua
│   │   ├── on-my-interaction-hover.lua
│   │   └── on-purchase-my-resource-items.lua
│   └── server/
│       ├── on-close-my-resource.lua
│       ├── on-player-quit.lua
│       └── on-resource-start.lua
├── server/
│   ├── helpers/
│   │   ├── setup-my-resource-element.lua
│   │   └── setup-my-resource-interaction.lua
│   ├── managers/
│   │   └── my-manager.lua
│   ├── services/
│   │   ├── my-resource-backend-service.lua
│   │   └── my-resource-in-memory-service.lua
│   └── instances.lua
├── shared/
│   ├── constants/
│   │   ├── animations.lua
│   │   ├── misc.lua
│   │   └── timers.lua
│   └── enums/
│       └── my-enums.lua
└── @debug/
    ├── debug.c.lua
    └── debug.s.lua
```

---

## O que cada camada faz

## Handlers

Handlers recebem e orquestram.

Exemplos:

- receber evento de rede
- receber click/interação
- abrir ou fechar UI
- chamar manager/service/helper
- sincronizar resposta
- disparar toast, callback, atualização visual ou próximo passo do fluxo

Handlers **não** devem concentrar regra principal.

---

## Managers

Managers mandam no domínio.

Eles devem cuidar de:

- estado do sistema
- regras de negócio
- decisões do fluxo de domínio
- lógica pura
- coordenação interna entre dados do resource

Managers **não** devem:

- ouvir evento direto como responsabilidade principal
- mexer em CEF/UI/HUD
- depender da tela para funcionar
- confiar em validação do client

Se a UI sumir, o manager ainda deve fazer sentido.

---

## Services

Services falam com coisas externas ou com armazenamento.

Exemplos:

- backend REST
- cache em memória
- repositório temporário por player
- adaptação de payload externo

Eles não devem virar o lugar da regra principal do sistema.

---

## Helpers

Helpers existem para não inflar handler nem manager.

Use para:

- `setup-*`
- `format-*`
- `build-*`
- `resolve-*`
- transforms específicos do resource

---

## Shared

`shared/` guarda coisa estática e previsível.

Exemplos:

- enums
- constants
- timers
- ids
- listas estáticas
- callbacks mapeados

Não coloque lógica de negócio grande em `shared/`.

---

## Server-first

Por padrão, prefira sempre **server-first**.

### O client deve:

- detectar intenção do jogador
- abrir/fechar/renderizar UI
- enviar payload para o server
- reagir a syncs visuais

### O client não deve:

- validar segurança
- validar dinheiro, item, permissão, ownership, cooldown crítico, score, cargo, rank, etc
- manter estado autoritativo
- decidir resultado final de ações importantes

### O server deve:

- validar tudo que importa
- confirmar permissões
- aplicar regra de negócio
- proteger contra exploit
- decidir sucesso/erro
- sincronizar o resultado para o client

---

## Fluxo padrão recomendado

```txt
client intenção -> handler -> manager -> service/helper -> handler -> sync/ui
```

Exemplo prático:

1. player interage com ped/objeto
2. handler/server valida contexto inicial
3. handler chama manager ou helper de setup
4. manager consulta service/backend/memória
5. handler responde com payload formatado
6. client abre UI
7. UI envia intenção do jogador
8. handler/server recebe
9. manager valida e executa
10. handler/server sincroniza sucesso/erro e atualiza UI

---

## Guidelines para IA

Estas regras são para qualquer IA que for gerar ou alterar código neste boilerplate.

1. **Use Lua padrão.**

   - Não use sintaxe Luau.
   - Não adicione `type`, `export type`, `::`, generics ou tipagem inline.

2. **Separe por camada corretamente.**

   - regra/estado/lógica pura em manager
   - fluxo/evento/ui/orquestração em handler
   - integração e armazenamento em service
   - setup/format/build/resolve em helper

3. **Prefira server-side para tudo que for relevante.**

   - o client informa intenção
   - o server valida e decide

4. **Não coloque regra importante no client.**

   - nada crítico de segurança
   - nada autoritativo
   - nada que o exploit possa decidir sozinho

5. **Não coloque UI dentro de manager.**

   - toast, HUD, cursor, browser, focus e CEF ficam fora da lógica central

6. **Prefira nomes literais e explícitos.**

   - `setupArmorerInteraction`
   - `formatRoutePanelData`
   - `fetchATMData`
   - `resolveAuthHeaders`

7. **Use early return.**

   - evite nesting desnecessário

8. **Se a assinatura crescer, prefira tabela de argumentos.**

```lua
local result = RoutesBackendService.startRun({
  player = player,
  routeId = routeId,
  membersIds = membersIds,
})
```

9. **Retornos devem ser previsíveis.**

   - não invente contratos diferentes sem necessidade

10. **Atualize `meta.xml` quando criar, remover ou mover arquivos.**

11. **Não deixe placeholders antigos esquecidos.**

- `my-resource`
- `MyResource`
- `MY_RESOURCE_*`

12. **Se houver UI, registre callbacks uma vez em `_on-setup.lua`.**

---

## Guidelines para desenvolvedores

Estas regras explicam como manter o boilerplate saudável no dia a dia.

### 1. Pense primeiro em responsabilidade

Antes de criar arquivo novo, pergunte:

- isso é evento?
- isso é regra?
- isso é integração?
- isso é formatação?
- isso é estado?

Se misturar tudo, pare e quebre em camadas.

### 2. Manager não é handler

Se o arquivo:

- escuta evento
- abre UI
- manda toast
- sincroniza rede

então ele provavelmente **não** deveria ser um manager.

### 3. Handler não é regra de negócio

Se o handler está:

- decidindo preço
- validando fluxo inteiro
- guardando estado
- sabendo detalhes demais do domínio

então a lógica está no lugar errado.

### 4. Client não é autoridade

Mesmo que o client já saiba a resposta, o server ainda valida.

Isso vale para:

- compra
- saque
- depósito
- rota
- recompensa
- exame
- permissão
- interação especial

### 5. Um arquivo, uma responsabilidade principal

Se um arquivo começou a:

- validar payload
- chamar backend
- formatar resposta
- abrir UI
- atualizar memória

então ele já cresceu demais.

### 6. Siga convenções de nomes do projeto

Use nomes como:

- `on-resource-start.lua`
- `on-player-quit.lua`
- `on-click-atm.lua`
- `setup-*`
- `format-*`
- `build-*`
- `resolve-*`
- `*-backend-service.lua`
- `*-in-memory-service.lua`

### 7. Reaproveite padrões já consolidados

Os resources de referência mostram bem estes padrões:

- bootstrap em `on-resource-start.lua`
- bind único de UI em `_on-setup.lua`
- manager focado em domínio
- service separado entre backend e memória
- helpers para setup e formatação
- dados estáticos em `shared/constants`

---

## Exemplos de distribuição correta

### Exemplo 1: compra em interface

**Client**

- abre UI
- captura intenção de compra
- envia payload

**Handler server**

- recebe evento
- faz validação de entrada básica
- chama manager
- sincroniza resultado

**Manager**

- valida regra de negócio
- decide se pode comprar
- consulta saldo, limite, estado
- chama service se necessário

**Service**

- fala com backend ou memória

---

### Exemplo 2: interação com ped/objeto

**Helper**

- cria ped/objeto/blip/interação

**Handler/server**

- orquestra o click
- chama manager/helper
- envia dados para UI

**Manager**

- resolve o que o jogador pode fazer

**Client**

- renderiza hover, outline, tela e callbacks

---

### Exemplo 3: sistema com estado por player

**Manager**

- controla estado atual

**In-memory service**

- guarda cache/estado temporário por id/player/character

**Handler `on-player-quit.lua`**

- faz teardown e limpeza do que for necessário

---

## Convenções de código

### Prefira clareza

Evite nome genérico como:

- `handleData`
- `process`
- `doThing`
- `manager2`

Prefira nomes que expliquem o motivo do código existir.

### Prefira tabela quando houver muitos argumentos

```lua
local ok, err, data = MyResource.purchase({
  player = player,
  items = items,
  paymentMethod = paymentMethod,
})
```

### Prefira retorno previsível

Exemplo simples:

```lua
if not player then
  return false, "INVALID_PLAYER"
end

return true, false, data
```

Exemplo de backend service:

```lua
return {
  ok = true,
  data = data,
}

return {
  ok = false,
  message = "Erro interno do servidor. Tente novamente mais tarde.",
}
```

---

## Checklist ao criar ou copiar este boilerplate

- [ ] trocar placeholders `my-resource`, `MyResource` e `MY_RESOURCE_*`
- [ ] revisar `meta.xml`
- [ ] manter tudo em **Lua**, não Luau
- [ ] remover qualquer sobra de tipagem antiga
- [ ] definir constantes e enums em `shared/`
- [ ] criar bootstrap em `handlers/server/on-resource-start.lua`
- [ ] separar backend service e in-memory service quando fizer sentido
- [ ] registrar callbacks de UI em `handlers/client/_on-setup.lua`
- [ ] limpar estado no `on-player-quit.lua` quando necessário
- [ ] deixar debug isolado em `@debug/`
- [ ] evitar lógica crítica no client

---

## Referência de intenção do boilerplate

Este boilerplate não tenta ser "genérico demais".

Ele existe para bater com a forma como o projeto organiza resources de roleplay hoje:

- fluxo claro
- nomes claros
- responsabilidades claras
- server autoritativo
- client leve
- managers com domínio
- handlers com orquestração

Se precisar fugir do padrão, faça isso de forma consciente e com motivo claro.
