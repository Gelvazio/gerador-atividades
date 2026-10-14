# Atividade: Desafio 1 — Aula 02 — Escrever 3 Casos de Teste do Login

- **Aula:** D1-02
- **Rótulo da aula:** Desafio 1 — Aula 02 — Casos de Teste do Login
- **Tema:** Casos de Teste Padronizados do Módulo de Login
- **Ícone:** 🔐
- **Duração:** 30–40 minutos
- **Formato:** Discursiva estruturada (o aluno digita a resposta de cada tópico e exporta o PDF)
- **Total de questões:** 3
- **Pontuação:** 1,0 ponto por questão, dividido em 3 tópicos (0,2 + 0,4 + 0,4) — total: 3 pontos
- **Pontos por questão:** 1,0
- **Página:** DESAFIO-01-CASOS-DE-TESTE-LOGIN.html
- **Bloquear colar:** sim
- **Campo do tamanho da resposta:** sim
- **Data:** 14/10/2026
- **Docente:** GELVAZIO CAMARGO
- **Turma:** T TIIN 2026/1 M1 · SENAI RIO DO SUL MANHÃ (124519)
- **Capacidade avaliada:** Escrever casos de teste padronizados (ID, Título, Pré-requisito, Passos numerados e Resultado esperado verificável) para o módulo de Login de uma aplicação web, conforme a aula 02 (Planejamento, Verificação, Validação e Casos de Teste): caminho feliz, tratamento de erro e validação de formulário no frontend.
- **Correção:** o aluno entrega o PDF exportado; o professor corrige cada tópico pelo padrão de resposta (DESAFIO-01-CASOS-DE-TESTE-LOGIN-GABARITO.md, só do professor).
- **Data de entrega inicial:** 14/10/2026
- **Hora de entrega inicial:** 07:00
- **Data de entrega final:** 14/10/2026
- **Hora de entrega final:** 18:00

**Seu papel em todas as questões:** Você, como aluno consultor, foi chamado para escrever os casos de teste do módulo de Login de uma aplicação web antes de ela ser publicada. A tela de login tem os campos **E-mail** e **Senha** e o botão **Entrar**; depois do login certo, o usuário vai para o **Painel (Dashboard)**.

**Como responder:** Cada questão é **um caso de teste** e tem **3 tópicos**, cada um com o **seu campo**: **(a)** ID, Título e Pré-requisito; **(b)** os Passos numerados (1, 2, 3...), com os dados usados; **(c)** o Resultado esperado. O resultado esperado tem de ser **verificável**: algo que dá para ver na tela (texto exato da mensagem, página de destino, elemento visível) — "o sistema funciona" não vale. Respostas copiadas da internet ou de colegas recebem nota zero no tópico.

**Como a correção funciona:** cada tópico é comparado com o padrão de resposta do professor. Dados de teste, textos de mensagem e IDs diferentes dos do padrão valem, desde que estejam corretos e coerentes com o caso. Erros de português não tiram nota se a ideia estiver clara.

---

## ITEM 01 — Autenticação com Credenciais Válidas (Caminho Feliz)

- **Aula:** 02 · Planejamento, Verificação, Validação e Casos de Teste
- **Capacidade:** C2, C3

**Contexto:**
Você, como aluno consultor, precisa garantir que um usuário cadastrado consegue entrar no sistema com o e-mail e a senha corretos. Este é o primeiro caso da suíte de Login.

**Comando:**
Escreva o caso de teste do login com credenciais válidas.

**Tópicos:**
- a) Escreva o ID, o Título e o Pré-requisito do caso de teste (o que precisa existir antes de começar). (0,2)
- b) Escreva os Passos numerados (1, 2, 3...) do teste, informando os dados digitados em cada campo. (0,4)
- c) Escreva o Resultado esperado de forma verificável (o que deve aparecer na tela ao final). (0,4)

---

## ITEM 02 — Tentativa de Login com Senha Incorreta (Tratamento de Erro)

- **Aula:** 02 · Planejamento, Verificação, Validação e Casos de Teste
- **Capacidade:** C2, C3

**Contexto:**
Você, como aluno consultor, precisa conferir o que o sistema faz quando o usuário digita um e-mail cadastrado com a senha errada. O sistema não pode deixar o usuário entrar e precisa avisá-lo.

**Comando:**
Escreva o caso de teste do login com senha incorreta.

**Tópicos:**
- a) Escreva o ID, o Título e o Pré-requisito do caso de teste. (0,2)
- b) Escreva os Passos numerados (1, 2, 3...) do teste, informando os dados digitados em cada campo. (0,4)
- c) Escreva o Resultado esperado de forma verificável, incluindo a mensagem mostrada e em que página o usuário fica. (0,4)

---

## ITEM 03 — Envio com o Campo de E-mail em Branco (Validação no Frontend)

- **Aula:** 02 · Planejamento, Verificação, Validação e Casos de Teste
- **Capacidade:** C1, C2, C3

**Contexto:**
Você, como aluno consultor, precisa conferir a validação do formulário no navegador: o usuário deixa o campo **E-mail** vazio e clica em **Entrar**. O próprio formulário deve barrar o envio antes de chegar ao servidor.

**Comando:**
Escreva o caso de teste do envio com o campo de e-mail em branco.

**Tópicos:**
- a) Escreva o ID, o Título e o Pré-requisito do caso de teste. (0,2)
- b) Escreva os Passos numerados (1, 2, 3...) do teste, deixando claro qual campo fica vazio e qual é preenchido. (0,4)
- c) Escreva o Resultado esperado de forma verificável, incluindo a mensagem do campo e como saber que o formulário não foi enviado. (0,4)
