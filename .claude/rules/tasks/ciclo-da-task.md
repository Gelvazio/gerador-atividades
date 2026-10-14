# 🔁 Ciclo de uma tarefa (TASK)

Reutilizável em qualquer projeto. Onde fica cada informação: `quadro.md`.

## O que vira TASK

- ✅ Todo pedido que **muda** arquivo, banco ou configuração vira TASK **antes** de executar.
- ❌ Pergunta, explicação ou análise que não muda nada **não** vira TASK: só responder.
  Se a resposta levar a mudanças, a TASK nasce quando o usuário pedir.

## 1. Abrir

1. Sincronizar com o remoto (regras de git do projeto) e ler o `tasks/STATUS.md`.
2. Criar a etapa (`quadro.md`), a linha em "📌 Tarefas" e a linha em "🗂️ Etapas".
3. Reservar a tarefa (`frentes-e-reserva.md`).
4. **Pedir detalhes ao solicitante**, numa mensagem só: objetivo e resultado esperado, escopo
   (entra / não entra), arquivos ou partes envolvidas, critério de pronto, prazo.
   - Não perguntar o que já está no pedido, no quadro ou no código.
   - Pedido completo → confirmar o entendimento em 1 frase e seguir.
   - ❌ Não assumir detalhe crítico em silêncio.

## 2. Pequena ou grande

| Tipo | Definição | Exige |
|------|-----------|-------|
| **Pequena** | Ajuste pontual em até ~3 arquivos, sem nada da linha de baixo | Etapa com itens |
| **Grande** | Mexe em **banco**, **segurança** (login, papéis, permissões, chaves), tem **várias partes**, cria estrutura/gerador novo, faz **mudança em massa** ou **apaga dados** | Plano na **própria etapa** + **aprovação** |

Na dúvida, é grande. O projeto pode definir exceções (rotinas já autorizadas).

**Tarefa grande — o plano é a etapa:**
1. Escrever na etapa: objetivo, escopo (entra / não entra), critério de pronto, premissas, riscos
   com plano B e os itens com a verificação de cada um.
2. Mostrar ao usuário um resumo (itens, arquivos, riscos, verificações) e perguntar se está certo.
3. Esperar um **"sim" claro**; registrar a aprovação como item ✅ da etapa (quem, quando).
4. Executar **só o escopo aprovado**. Mudança material de escopo → atualizar a etapa e pedir
   **nova** aprovação.

## 3. Executar

- **Um item por vez:** só um 🔄 na etapa; terminar antes de começar outro.
- Atualizar **na hora**: 🔄 ao começar, ✅ com data e hora ao terminar — nunca acumular.
- **Próximo passo** da etapa sempre atualizado: é a última coisa a escrever ao parar e a primeira
  a ler ao retomar.
- Bloqueio → item ⛔ com motivo e o que destrava, **na hora**. Depende do usuário → item 👀.
- Cada item com **verificação** (como foi conferido), conforme as regras de validação do projeto.
- Decisão tomada no caminho → seção Decisões da etapa (o quê, quando, quem, por quê); se valer
  para o projeto todo, também no "Registro de decisões" do `STATUS.md`.

## 4. Encerrar

1. Etapa: todos os itens ✅ (ou ⛔ justificados); o último é o **aceite** de quem pediu (👀 até ele
   confirmar).
2. Pendências que ficaram para depois → "Pendências" do `STATUS.md`, com motivo.
3. Lição aprendida que vira regra → "Lições aprendidas" do `STATUS.md` (e a regra no lugar certo).
4. `STATUS.md`: status da tarefa atualizado, "Em uso por" = `—`, linha da frente atualizada.
5. **Um commit por tarefa** com o quadro no mesmo commit (e push, conforme a regra do projeto).
6. Responder **apenas**: **TAREFA FINALIZADA!, AJUDO EM ALGO MAIS?** — sem resumo nem tabela
   (perguntas e bloqueios são respondidos normalmente).

## Retomar (sessão nova ou que caiu)

1. Ler o `STATUS.md`: linha da sua frente e da tarefa reservada.
2. Ler o **Próximo passo** da etapa; item 🔄/⬜ de tarefa aprovada → conferir o que já foi feito
   (arquivos e commits) e **continuar de onde parou**.
3. ❌ Não recomeçar do zero, não refazer itens ✅, não pular itens.
