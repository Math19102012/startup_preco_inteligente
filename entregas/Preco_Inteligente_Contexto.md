# Preço Inteligente: contexto completo da empresa e do projeto

> **Para o assistente que receber este arquivo:** você vai me ajudar com um trabalho da faculdade sobre a startup
> Preço Inteligente, projeto do meu grupo no curso de Análise e Desenvolvimento de Sistemas da FECAP. Use este
> documento como fonte da verdade sobre a empresa: números, decisões, tecnologia e modelo de negócio. Quando algo
> não estiver aqui, diga que não está, em vez de inventar. Os valores marcados como **simulados** ou **estimativas**
> não são dados reais de mercado e devem continuar apresentados assim.

---

## 1. Identidade

- **Nome:** Preço Inteligente
- **Subtítulo:** Apoio à definição de preços no pequeno varejo
- **Promessa:** em uma semana, mostrar ao dono do mercadinho quais produtos ele vende fora do preço da região e
  quanto isso custa por mês.
- **Frase de efeito:** a inteligência de preço das grandes redes no bolso do mercado de bairro.
- **O que é:** uma plataforma web (SaaS por assinatura) para minimercados e mercearias de bairro, com duas partes
  publicadas: um site de apresentação (para banca e investidores) e o painel do lojista (o produto em si).
- **Instituição:** Fundação Escola de Comércio Álvares Penteado (FECAP), São Paulo, curso de Análise e
  Desenvolvimento de Sistemas. Apresentado na Tech Week da FECAP e submetido ao EMTEC 2026 (Emerging Maker
  Technologies Conference), trilha "Sustainability, SDGs, and Social Impact".

### Equipe (responsabilidades na 1ª entrega)

| Integrante | Responsabilidade principal |
|---|---|
| Ana Luiza Ribeiro do Vale | Coleta e carregamento dos dados |
| Gustavo Silva de Moura | Dicionário de dados e classificação das variáveis |
| Henri Seixas Souza | Análise exploratória e gráficos |
| Matheus Fernandes Moraes | Redação e interpretação dos resultados |

**Orientadores:** Aimar Martins Lopes, Eduardo Savino Gomes, Rafael Diogo Rossetti, Ronaldo Araujo Pinto e Victor
Bruno Alexander Rosetti de Quiroz. (Na 1ª entrega, a disciplina Projeto de Análise de Dados teve o professor Eduardo
Savino.)

### Links

- Site de apresentação: https://math19102012.github.io/startup_preco_inteligente/
- Painel do lojista (abre a loja de demonstração): https://math19102012.github.io/startup_preco_inteligente/painel/index.html?demo=1
- Código: https://github.com/Math19102012/startup_preco_inteligente

---

## 2. O problema

O dono do minimercado define preços sem conhecer dois números:

1. **quanto os concorrentes próximos cobram** pelo mesmo produto;
2. **quanto o produto custa de verdade** para ele, depois de imposto, taxa da maquininha, perdas e validade.

Sem essas referências, o preço sai da intuição, de uma margem fixa aplicada a tudo ou de tentativa e erro. Preço acima
do mercado afasta o cliente; preço abaixo do custo real corrói o lucro sem que o dono perceba. Em economia, isso é
**assimetria de informação**.

### Evidência em dados públicos (1ª entrega, metodologia CRISP-DM, fase de Entendimento dos Dados)

- **Fonte principal:** ANP, Série Histórica de Preços de Combustíveis e GLP, recorte do botijão de gás de 13 kg
  (GLP P13), estado de São Paulo, 01/01/2026 a 31/08/2026. Download direto do portal de dados abertos, sem cadastro;
  CSV com ponto e vírgula. Coleta em 15/09/2026. Base legal: Lei 9.478/1997, art. 8º, e Decreto 8.777/2016.
- **Volume:** 108.317 registros no país, **23.880 em São Paulo**, de **882 revendas** em **101 municípios**,
  abastecidas por 9 distribuidoras. 16 colunas originais e 8 criadas pelo grupo (data convertida, preços numéricos,
  margem em reais e em %, mês, semana).
- **Fonte secundária:** INMET, dados históricos de 8 estações meteorológicas de SP (46.656 observações horárias),
  ligadas à base da ANP por município e data, para testar no futuro se o preço do gás muda com o frio. Nesta etapa só
  se verificou que a junção é possível, sem afirmar causa e efeito.
- **Por que o gás de cozinha:** São Paulo não publica os preços da nota fiscal do varejo (o portal da Sefaz-SP só
  consulta uma nota por vez, pela chave de 44 dígitos). O botijão é idêntico em qualquer lugar, é vendido por revendas
  de bairro (o mesmo perfil do cliente) e seu preço não fica exposto na rua. O gás é um **substituto** para provar o
  mecanismo, não o produto final.

### Números principais

| Número | O que mostra |
|---|---|
| 23.880 | preços coletados, em 882 revendas de 101 cidades paulistas |
| **16,6%** | diferença típica entre a revenda mais barata e a mais cara na mesma cidade e semana (mediana de 2.658 combinações de cidade e semana) |
| R$ 17,00 | diferença típica no mesmo botijão |
| 57,9% | caso mais extremo: Sumaré, 1 a 7 de junho de 2026, 9 revendas, de R$ 94,99 a R$ 150,00 (R$ 55 de diferença) |

### Achados da análise

1. **O preço é escolhido, não calculado:** os valores se amontoam em números redondos (R$ 100, 105, 110, 115); o mais
   comum é R$ 110,00. Quase ninguém cobra algo como R$ 113,40, que seria o preço de quem parte do custo.
2. **A diferença não some com o tempo:** o preço mediano mudou uma vez em oito meses (de R$ 110 para R$ 115) e a
   distância entre a mais barata e a mais cara ficou igual do começo ao fim.
3. **O fornecedor não explica a diferença:** as três maiores distribuidoras somam 64,6% das coletas; quem compra do
   mesmo lugar tem custo parecido.
4. **Ninguém publica o custo:** a coluna de preço de compra está vazia em 100% dos registros. Por isso o custo precisa
   vir das notas fiscais da própria loja.

### Faixa de preço do botijão nas 12 cidades com mais coletas (dados reais ANP, 2026)

| Cidade | Coletas | Mediana | Mínimo | Máximo |
|---|---|---|---|---|
| São Paulo | 1.420 | 115,00 | 94,99 | 149,99 |
| São José do Rio Preto | 704 | 120,00 | 104,00 | 145,00 |
| São José dos Campos | 523 | 100,00 | 79,99 | 125,00 |
| Araçatuba | 511 | 104,99 | 95,00 | 116,00 |
| Sorocaba | 492 | 119,99 | 100,00 | 135,00 |
| São Carlos | 437 | 132,00 | 115,00 | 140,00 |
| Presidente Prudente | 416 | 116,50 | 94,90 | 128,00 |
| Osasco | 414 | 109,99 | 94,99 | 124,99 |
| Guarulhos | 411 | 109,99 | 88,99 | 125,00 |
| Campinas | 406 | 114,99 | 99,99 | 129,99 |
| Franca | 380 | 115,00 | 104,90 | 129,00 |
| Araraquara | 379 | 118,80 | 100,00 | 132,00 |

---

## 3. Cliente e mercado

### Público-alvo

Donos de minimercados e mercearias de bairro, com 1 a 3 caixas e margem de lucro apertada, em São Paulo. O começo é
pela zona leste e pela zona norte, priorizando quem já emite nota fiscal eletrônica e usa algum sistema de caixa.

### Perfil do cliente (Value Proposition Design)

- **Tarefas:** revisar o preço de centenas de itens toda semana; repassar aumento do fornecedor sem espantar cliente;
  montar o encarte da semana; girar estoque parado antes de vencer.
- **Dores:** não sabe o preço do concorrente sem ir até lá; o custo real esconde imposto, cartão e perda; vende itens
  no vermelho sem perceber; revisar preço na mão consome noites.
- **Ganhos desejados:** mais margem sem perder movimento; descobrir rápido onde vaza dinheiro; encarte que atrai sem
  destruir o lucro; negociar com fornecedor com dado na mão.

### Mapa de valor (cada dor tem um recurso)

| Dor | Recurso da plataforma |
|---|---|
| Não sabe o preço do concorrente | Painel do preço praticado na região, sem sair da loja |
| O custo real esconde imposto e taxas | Cálculo do custo real e do preço mínimo que não dá prejuízo |
| Vende no vermelho sem perceber | Alerta semanal dos itens fora da faixa de mercado |
| Revisar preço consome noites | Sugestão em número redondo, pronta para a etiqueta |
| Não sabe o que os clientes levam juntos | Combos por dia e horário, a partir dos cupons de venda |

### Tamanho do mercado

- **439.728** lojas no varejo alimentar brasileiro (Ranking ABRAS 2025).
- **26.965** estabelecimentos supermercadistas no estado de SP, **65%** micro e pequenos (Sebrae-SP).
- **162 por dia:** minimercados e mercearias abertos no Brasil no 1º semestre de 2025 (Agência Sebrae).
- **Estimativa do grupo (não é dado de fonte):** se os cerca de 17,5 mil micro e pequenos de SP pagassem o ticket
  médio de R$ 100, seriam cerca de R$ 21 milhões por ano; no Brasil inteiro, cerca de R$ 528 milhões por ano. O
  cenário base (3.000 lojas no ano 5) representa cerca de 0,7% das lojas do país.

### Concorrência e posicionamento (mapas perceptuais, posições estimadas pelo grupo)

- **Concorrentes e alternativas:** planilha, módulo de preço de ERP, Precifica, Predify e InfoPrice.
- **Preço da ferramenta × profundidade da análise:** planilha é barata e rasa; Precifica e Predify são profundas e
  caras; o Preço Inteligente é profundo e barato.
- **Tempo de implantação × facilidade de uso:** o Preço Inteligente é de implantação rápida e fácil de usar.
- **Foco × porte do cliente:** os concorrentes atendem redes maiores; o Preço Inteligente é especializado em loja pequena.
- **Leitura:** nos três mapas o projeto ocupa um espaço vazio. Ninguém entrega análise profunda a preço baixo, com
  implantação rápida, para loja pequena.

### SWOT

| Forças | Fraquezas |
|---|---|
| Base própria de preços por região, montada de dados públicos | Marca inexistente e nenhum cliente ainda |
| Produto digital, custo de operação baixo | Depende de integração com sistemas que ainda não temos |
| Equipe com domínio de dados e desenvolvimento | Custo de compra não é público, precisa vir do dono |
| Nicho definido e pouco disputado | Equipe pequena, sem time comercial |

| Oportunidades | Ameaças |
|---|---|
| Diferença de 16,6% comprovada e sem solução para o pequeno | Sistemas de gestão podem embutir um módulo de preço |
| Avanço da nota fiscal eletrônica e dos sistemas de caixa | Precifica, Predify e InfoPrice descendo de faixa |
| Ferramentas atuais miram médio porte e e-commerce | Baixa disposição a pagar no pequeno varejo |
| Distribuidores e associações como canal de indicação | Resistência do dono, que confia na intuição |

### SWOT cruzada (estratégias)

- **Atacar (Forças + Oportunidades):** entrar em SP usando a evidência de 16,6% como argumento de venda, num nicho que
  nenhum concorrente atende. Dá para começar sem cliente, porque o dado de preço já é público.
- **Defender (Forças + Ameaças):** custo baixo e foco em um nicho permitem um preço que o concorrente grande não
  acompanha sem canibalizar o próprio produto. Especialização é a barreira.
- **Reforçar (Fraquezas + Oportunidades):** parceria com um sistema de gestão do varejo, que resolve a integração e
  entrega canal de distribuição, transformando a ameaça em aliado.
- **Proteger (Fraquezas + Ameaças):** plano gratuito de consulta para derrubar a barreira de entrada e provar valor
  antes de cobrar.

### Matriz BCG dos módulos (posicionamento projetado, por adesão esperada no piloto)

- **Estrela:** painel de preço da região. É a razão da assinatura e recebe a maior parte do investimento.
- **Interrogação:** recomendação automática e previsão sazonal (inclui os combos). É a parte mais inovadora e
  incerta; precisa de validação com cliente real.
- **Vaca leiteira:** cálculo de custo real e preço mínimo. Estável, barato de manter, segura o cliente.
- **Abacaxi:** relatórios e exportações avançadas. Muito pedido, pouco usado, caro de manter.

---

## 4. A solução

### Site de apresentação (9 seções)

1. Início: "Mesmo botijão. Mesma cidade. Mesma semana. R$ 55 de diferença."
2. O problema: faixa de preço nas 12 cidades, achados e perfil do cliente.
3. A solução: mapa de valor, como funciona, exemplo do diagnóstico semanal e matriz BCG.
4. O produto: prints do painel, botão para abri-lo e integrações.
5. A empresa: modelo de negócio, planos e equipe.
6. Mercado: tamanho, mapas de posicionamento, SWOT e estratégias.
7. Lucro do mercadinho: simulador do ganho do dono da loja.
8. Investimento: simulador CDI × startup, cenários, projeção de 5 anos, uso do dinheiro e riscos.
9. Plano de ação: linha do tempo, 5W2H e resgate da promessa.

### Painel do lojista (7 telas)

| Tela | O que faz |
|---|---|
| Visão geral | Quanto a loja deixa na mesa por mês, itens por situação, onde está o dinheiro, quanto já foi recuperado e o combo sugerido |
| Preços da semana | Cada produto comparado com a faixa da região e com o custo real; sugestão de preço aplicada com um clique; detalhe com a decomposição do custo |
| Combos | Produtos que os clientes levam juntos, por dia e horário, tirados dos cupons de venda; preço da promoção e medição antes e depois |
| Produtos | Catálogo da loja; cadastro pelo código de barras (busca nome e foto no Open Food Facts) |
| Nota fiscal | Importa o XML da NF-e de compra, atualiza o custo de cada item e cadastra produtos novos |
| Etiquetas | Fila de etiquetas de gôndola dos preços que mudaram e cartazes dos combos, prontos para imprimir em A4 |
| Minha loja | Cadastro pelo CNPJ e CEP, custos que entram no preço (imposto, cartão, perdas, margem mínima, final dos preços) e plano |

### Implantação prevista (3 passos)

1. **Conectamos o caixa:** a plataforma é ligada ao sistema de caixa ou recebe os arquivos das notas fiscais.
2. **Os dados entram sozinhos:** catálogo, custo de compra e histórico de vendas chegam pela integração.
3. **Diagnóstico em até 7 dias:** a loja recebe a lista de itens fora do preço da região e quanto cada um custa por mês.

### Loja de demonstração (dados simulados)

O painel abre com o "Mercadinho Bom Preço", em Vila Matilde (SP):

- 56 produtos de mercearia, bebidas, laticínios, frios, açougue, padaria, hortifrúti, limpeza, higiene e gás;
- 8 semanas de cupons de venda simulados, cerca de 100 por dia (6.000 cupons);
- histórico de seis semanas de uso: três preços já ajustados (+R$ 211 por mês recuperados) e duas notas importadas.

**Diagnóstico da loja de demonstração:** R$ 672 por mês deixados na mesa em 8 itens. São 3 itens vendidos no prejuízo,
5 abaixo da região, 7 acima e 41 na faixa.

**Combos encontrados (padrões plantados de propósito nos cupons simulados):**

| Combo | Quando |
|---|---|
| Pão francês + leite | Todos os dias de manhã |
| Linguiça + carvão | Fim de semana |
| Salgadinho + refrigerante | Sábado, o dia todo |
| Pão francês + mortadela | Terça à tarde |
| Cerveja + amendoim | Sexta à noite |
| Macarrão + molho de tomate | A semana toda |

---

## 5. Como funciona por dentro

### Motor de preço (`src/painel/lib/precificacao.js`)

Custos padrão, ajustáveis por loja em "Minha loja":

- imposto de 4% sobre o preço (Simples Nacional, faixa inicial do comércio);
- maquininha: taxa de 2,5% sobre os 60% das vendas pagas no cartão;
- perdas de 2% sobre o custo de compra;
- margem mínima de 8%;
- final dos preços em x,49 ou x,99.

Fórmulas:

- deduções sobre o preço = imposto + taxa do cartão × fatia no cartão = 4% + 2,5% × 60% = **5,5%**
- **preço sem prejuízo** = custo × (1 + perdas) ÷ (1 − deduções)
- **preço com margem mínima** = custo × (1 + perdas) ÷ (1 − deduções − margem mínima)
- margem real = [preço × (1 − deduções) − custo × (1 + perdas)] ÷ preço

Situação do item:

- preço abaixo do preço sem prejuízo → **no prejuízo**;
- sem faixa da região → **sem dado**;
- abaixo do mínimo da região → **abaixo da região**;
- acima do máximo da região → **acima da região**;
- caso contrário → **na faixa**.

Sugestão de preço:

- **no prejuízo:** o maior entre o preço com margem mínima e o mais barato da região;
- **abaixo da região:** sobe até 40% do caminho entre o mais barato e a mediana, sem ficar abaixo da margem mínima;
- **acima da região:** desce até perto da mediana;
- **na faixa com margem abaixo da mínima:** sobe até a margem mínima.

A sugestão é arredondada para preço de etiqueta. **Efeito por mês** = (sugestão − preço atual) × vendas por mês.
"Você deixa na mesa" é a soma dos efeitos positivos.

**Exemplo, refrigerante de cola 2 L (no prejuízo):** custo R$ 7,90, preço R$ 8,49, 120 vendas por mês.

- Custo com perdas: R$ 8,06. Preço sem prejuízo: R$ 8,53. Custo real da unidade a R$ 8,49: R$ 8,52, ou seja, perde
  R$ 0,03 por venda.
- Preço com margem: R$ 9,32. Mais barato da região: R$ 9,49. Sugestão: R$ 9,49.
- Efeito: +R$ 120 por mês.

**Exemplo, arroz 5 kg (abaixo da região):** custo R$ 19,80, preço R$ 24,90, 40 vendas por mês, região de R$ 26,50 a
R$ 32,90 (mediana R$ 28,90).

- Preço sem prejuízo: R$ 21,37 (margem atual 13,4%).
- Sugestão: R$ 27,49 (margem 21%).
- Efeito: +R$ 104 por mês.

**Limite:** o cálculo é por item e considera só custos variáveis. Aluguel, salários e energia não entram, então o
painel não diz se a empresa toda dá lucro.

### Preço da região (`src/painel/lib/regiao.js`)

- Botijão: faixa **real** da ANP pela cidade da loja (12 cidades; fora delas, faixa do estado).
- Demais itens: base de referência **simulada** para a demonstração, ajustada por cidade.
- No produto, a base viria da rede de lojas assinantes, com valores agregados e anônimos.

### Leitura de notas fiscais (`src/painel/lib/nfe.js` e `src/painel/lib/cupons.js`)

- **NF-e de compra (modelo 55, layout 4.00 da Sefaz):** lida no próprio navegador.
  - O custo por unidade soma frete, seguro, outras despesas, IPI e ICMS-ST e desconta o desconto.
  - Usa a unidade tributável (normalmente a unidade de venda).
  - Os itens são casados com o catálogo pelo código de barras; itens sem código ("SEM GTIN") entram como produto novo.
  - Funciona com XML real. Ainda não foi testado com nota real de fornecedor, só com notas montadas no padrão.
- **NFC-e de venda (modelo 65):** cada cupom vira uma cesta de compras com data e hora.
  - O CPF do consumidor nunca é lido.
  - Cupons cancelados (evento 110111) são descontados.
  - Notas de compra encontradas na mesma pasta são separadas.

### Combos (`src/painel/lib/combos.js`)

Análise de cesta de compras com regras de associação entre pares de produtos, por dia da semana × período (manhã, até
12h; tarde, de 12h às 18h; noite, depois das 18h) e para a semana toda.

- Para cada par A + B: taxa de quem leva A e também leva B, comparada com os outros cupons do mesmo momento
  (equivale ao lift).
- Filtros: pelo menos 20 cupons juntos, taxa de 25% ou mais e pelo menos 1,5 vez o normal.
- **Teste exato de Fisher** com **correção de Benjamini-Hochberg** (FDR de 5%), porque muitos pares são testados ao
  mesmo tempo.
- Janela da promoção escolhida entre opções de calendário (um horário, um dia inteiro, todas as manhãs, dias úteis,
  fim de semana) pela **estatística G** (p < 0,001); se nenhuma se destaca, vale a semana toda.
- Preço do combo: parte de 10% de desconto no segundo produto e nunca passa da margem mínima. Produto vendido a quilo
  vira "desconto no complemento para quem leva o outro"; os demais viram "leve os dois por R$ X".
- Depois de criado, o combo é medido comparando a taxa de compra conjunta antes e depois.
- Com o volume de um minimercado (cerca de 100 cupons por dia), contar pares basta; Apriori ou FP-Growth seriam
  necessários só para combos de 3 ou mais itens.
- Validação:
  - com compras independentes (sem padrão plantado), o algoritmo não sugere nenhum combo;
  - com os 6 padrões plantados, encontra os 6 com a janela certa, em várias semanas diferentes.

### Integrações

- **BrasilAPI:** CNPJ (dados da Receita Federal) e CEP.
- **ViaCEP:** reserva da busca de CEP.
- **Open Food Facts:** nome, marca e foto pelo código de barras.
- **ANP:** preços do gás.

Todas são chamadas direto do navegador, sem chave de acesso, sempre por HTTPS.

### Pasta conectada

O programa de caixa grava o XML de cada cupom numa pasta do computador da loja. O lojista conecta essa pasta uma vez
(File System Access API, no Chrome ou no Edge de computador) e o painel lê os cupons novos sozinho a cada abertura.
Nos outros navegadores, a pasta é importada manualmente.

---

## 6. Stack e arquitetura

- **Análise de dados:** Python no Google Colab (dados da ANP e do INMET).
- **Site e painel:** JavaScript, React e Vite (duas páginas no mesmo projeto, com versão offline em um arquivo só);
  HTML e CSS próprios; gráficos em SVG sem biblioteca.
- **Armazenamento:** não há servidor nem banco de dados tradicional nesta versão.
  - **localStorage:** dados da loja, produtos, custos, ajustes, notas e combos.
  - **IndexedDB** (banco do navegador): cupons de venda e a pasta conectada.
- **Qualidade e publicação:** 55 testes automatizados (Vitest), Playwright para testar as telas e gerar os prints,
  Git e GitHub com pull requests, GitHub Actions (testa e publica) e GitHub Pages (hospedagem gratuita).
- **Camadas do código:**
  - funções puras sem tela (motor de preço, leitura de notas, combos, preço da região, validação);
  - estado (`estado/loja.jsx` e `estado/cupons.jsx`);
  - serviços (APIs, pasta conectada, armazenamento);
  - telas.

  O arquivo `estado/loja.jsx` é o ponto a trocar por chamadas a uma API com banco de dados quando houver servidor.
- **Atualização da demonstração:** a loja de demonstração tem número de versão; quem tinha a versão antiga salva no
  navegador recebe a nova automaticamente.

### Segurança e dados sensíveis

Custo, margem, vendas e notas do lojista são dados comerciais sensíveis.

**O que existe hoje:**

- os dados não saem do navegador;
- a nota é lida no computador da loja;
- só CNPJ, CEP e código de barras vão para APIs públicas, por HTTPS;
- o CPF do consumidor não é lido (minimização, LGPD).

**O que não existe:**

- criptografia própria dos dados guardados no navegador;
- login.

Além disso, sites de uma mesma conta no `github.io` compartilham a mesma origem; para uso real, o painel precisa de
domínio próprio.

**Plano para a versão com servidor:**

- HTTPS em tudo;
- criptografia AES-256 no banco e nos backups;
- certificado digital em cofre de chaves (KMS);
- senhas com hash (bcrypt ou Argon2);
- isolamento entre lojas (row-level security);
- preço da região só com valores agregados e anônimos (custo e margem nunca compartilhados);
- contrato e consentimento conforme a LGPD.

### Automação (hoje e futuro)

**Hoje:**

- a nota de compra entra pelo envio do XML (o resto é automático);
- os cupons de venda entram sozinhos pela pasta conectada.

**Futuro:**

1. **Distribuição DF-e:** serviço oficial do Ambiente Nacional da NF-e que entrega ao CNPJ da loja todas as notas de
   compra emitidas contra ela, em todos os estados, inclusive SP.
   - Exige o certificado digital A1 da loja, autorizado uma vez, e um servidor (ou uma API intermediária como
     Focus NFe, NFe.io, PlugNotas ou Qive).
   - A nota completa só vem depois da "ciência da operação"; as notas ficam disponíveis por cerca de 3 meses; consulta
     em excesso gera bloqueio de 1 hora.
2. **Caixa de e-mail** que importa os XMLs que os fornecedores já enviam.
3. **Integração com sistemas de caixa e gestão** (parceria).
4. **Preço da região em outros estados:** convênio com secretarias da Fazenda que já divulgam preços de NFC-e
   (Preço da Hora na Paraíba e na Bahia; Menor Preço Brasil em cerca de 15 estados, sem São Paulo) ou a rede de
   lojas assinantes.

Nenhuma API pública entrega notas de outras empresas: isso é protegido por sigilo fiscal.

---

## 7. Modelo de negócio

### Business Model Canvas (blocos principais)

- **Segmento de clientes:** minimercados e mercearias de bairro com 1 a 3 caixas, em SP, começando por quem já emite
  nota fiscal eletrônica e usa sistema de caixa.
- **Proposta de valor:** preço da região, custo real e margem em um só lugar, com ajuste em minutos e justificativa em
  uma linha. O resultado é medido em reais recuperados.
- **Fontes de receita:** assinatura mensal por loja, a partir de R$ 79, em faixas por quantidade de itens; plano
  gratuito como porta de entrada; taxa opcional sobre a margem recuperada.
- **Estrutura de custos:** infraestrutura de dados, equipe de desenvolvimento e visita em campo para conquistar as
  primeiras lojas. Produto 100% digital, sem estoque nem logística.
- **Desejabilidade:** o mercado quer (16,6% medido em dado público).
- **Praticabilidade:** conseguimos construir (dados abertos + integração com o caixa).
- **Viabilidade:** a conta fecha (assinatura recorrente, custo de operação baixo).

### Planos

| Plano | Preço | Inclui |
|---|---|---|
| Consulta | Grátis | Preço da região de até 20 itens (porta de entrada, sem cartão de crédito) |
| Essencial | R$ 79/mês | Até 500 itens, preço da região, custo real e preço mínimo, alerta semanal, etiquetas |
| Completo | R$ 149/mês | Até 2.000 itens, tudo do Essencial, montagem do encarte e relatório de margem |

Sem taxa de instalação, sem fidelidade, sem equipamento e sem custo por usuário. Mix esperado: 70% Essencial e 30%
Completo, o que dá **ticket médio de R$ 100 por mês**.

### Ganho do lojista (simulador do site)

- Premissas: loja de R$ 80 mil por mês, margem bruta de 22%, margem líquida de 4%, 20% das vendas (R$ 16 mil) em
  itens abaixo da região, aumento de 3% nesses itens, 1% de vendas perdidas.
- Ganho = R$ 16.000 × [0,99 × (3% + 22%) − 22%] = **R$ 440 por mês**.
- Descontada a assinatura de R$ 79, sobram **R$ 361 por mês** (R$ 4.332 por ano). O lucro da loja sobe de R$ 3.200
  para R$ 3.561 por mês (+11%).
- A assinatura se paga **5,6 vezes**, em cerca de 5 dias de ganho. Custa R$ 2,63 por dia.

### Custos da startup (premissas do modelo)

- Impostos de 10% sobre a receita (Simples Nacional, serviços de software).
- Nuvem, dados e suporte: R$ 10 por loja por mês, mais R$ 12 mil fixos por ano.
- Custo de aquisição: R$ 350 por loja nova (visita em campo e implantação), inclusive para repor as que cancelam.
- Cancelamento: 1,5% das lojas por mês.
- Equipe e administrativo variam por cenário (abaixo).

**Unit economics (estimativa do grupo a partir das premissas):** sobram cerca de R$ 80 por loja por mês. Com vida
média de cerca de 67 meses (cancelamento de 1,5% ao mês), cada cliente vale cerca de R$ 5.300, contra R$ 350 para
conquistá-lo: cerca de 15 vezes.

---

## 8. Projeção financeira (5 anos)

Receita = lojas pagantes médias no ano × R$ 100 × 12. Valor da empresa = múltiplo × receita recorrente anual (3× no
conservador, 4× no base, 5× no otimista).

### Cenário base: "o piloto valida o produto e a parceria com um sistema de caixa abre o canal"

| Ano | Lojas no fim do ano | Receita | Custo total | Resultado | Caixa | Valor da empresa |
|---|---|---|---|---|---|---|
| 1 | 80 | R$ 48 mil | R$ 196 mil | −R$ 148 mil | R$ 352 mil | R$ 384 mil |
| 2 | 400 | R$ 288 mil | R$ 513 mil | −R$ 225 mil | R$ 127 mil | R$ 1,92 mi |
| 3 | 1.000 | R$ 840 mil | R$ 908 mil | −R$ 68 mil | R$ 59 mil | R$ 4,80 mi |
| 4 | 1.900 | R$ 1,74 mi | R$ 1,49 mi | +R$ 254 mil | R$ 313 mil | R$ 9,12 mi |
| 5 | 3.000 | R$ 2,94 mi | R$ 2,15 mi | +R$ 791 mil | R$ 1,10 mi | R$ 14,4 mi |

Equipe: R$ 120 mil, 280 mil, 420 mil, 640 mil e 900 mil por ano. Administrativo: R$ 24 mil, 36 mil, 54 mil, 80 mil e
110 mil por ano.

### Cenário conservador: "adoção lenta, crescimento só na Grande São Paulo"

- Lojas no fim de cada ano: 50, 200, 450, 800 e 1.200.
- Ano 5: receita de R$ 1,2 mi, lucro de R$ 245 mil, valor da empresa de R$ 4,32 mi.
- Equipe: R$ 120 mil a R$ 440 mil por ano.

### Cenário otimista: "expansão para outras capitais a partir do ano 3"

- Lojas no fim de cada ano: 100, 600, 1.600, 3.200 e 5.000.
- Ano 5: receita de R$ 4,92 mi, lucro de R$ 1,59 mi, valor da empresa de R$ 30 mi.
- Equipe: R$ 120 mil a R$ 1,3 mi por ano.

Nos três cenários, a empresa passa a dar lucro no **ano 4** e o caixa da captação basta, sem aporte extra nem diluição.

---

## 9. Investimento

- **Rodada:** R$ 500 mil por **35%** da empresa. Instrumento: mútuo conversível em participação (investidor-anjo,
  LC 155/2016).
- **Avaliação:** R$ 1,43 mi depois do aporte (R$ 929 mil antes).
- **Horizonte:** saída no fim do ano 5. Participação em startup só tem preço quando é vendida, então até lá vale o
  preço pago.
- **Uso dos recursos:** produto e dados 40% (R$ 200 mil); vendas em campo e implantação 25% (R$ 125 mil); marketing e
  parcerias 15% (R$ 75 mil); reserva de caixa 12% (R$ 60 mil); infraestrutura em nuvem 8% (R$ 40 mil).

**R$ 100 mil investidos hoje (7% da empresa) em 5 anos:**

| Opção | Valor final | Rende ao ano | Multiplica |
|---|---|---|---|
| CDI a 15% ao ano | R$ 201 mil | 15,0% | 2,0× |
| Cenário conservador | R$ 302 mil | 24,8% | 3,0× |
| Cenário base | R$ 1,01 mi | 58,7% | 10,1× |
| Cenário otimista | R$ 2,1 mi | 83,8% | 21× |

Para empatar com o CDI, a empresa precisaria de cerca de 800 lojas no ano 5 no cenário conservador (que prevê 1.200)
e cerca de 600 no base (que prevê 3.000). O investidor ganha com a valorização e a venda da participação (próxima
rodada, fundo ou empresa do setor, como um sistema de gestão do varejo) e com dividendos depois do lucro. Os valores
são brutos (antes do imposto de renda), são estimativas acadêmicas e não incluem o fracasso da empresa.

### Riscos e mitigação

| Risco | Como reduzimos |
|---|---|
| A startup não decolar | Piloto de 8 semanas com 5 lojas antes de acelerar os gastos; dinheiro liberado em etapas conforme as metas |
| Um sistema de gestão lançar módulo de preço | Virar parceiro deles: ser o módulo de preço que eles não têm |
| O dono não querer pagar | Plano gratuito e resultado medido em reais; a mensalidade custa menos de R$ 3 por dia |
| Dinheiro parado por 5 anos | Participação sem liquidez diária; por isso o retorno esperado precisa ser bem maior que o do CDI |

---

## 10. Estratégia comercial e plano de ação

### 5W2H comercial (deck)

- **What:** vender a assinatura mensal, começando pelo plano Essencial.
- **Why:** o comerciante perde margem sem perceber; a venda se apoia num diagnóstico gratuito que mostra, em reais,
  quanto ele deixa na mesa.
- **Where:** porta a porta em bairros da zona leste e da zona norte de SP; depois, indicação de distribuidores de
  alimentos e marketplace de aplicativos dos sistemas de gestão.
- **When:** 4 semanas de prospecção, 8 semanas de piloto gratuito e assinaturas a partir do 3º mês.
- **Who:** dois integrantes em campo (abordagem e demonstração) e dois no diagnóstico e no suporte. Quem decide a
  compra é sempre o dono da loja.
- **How:** cinco passos (visita na loja, diagnóstico gratuito em 48 horas, apresentação do resultado em reais, teste
  de 30 dias e assinatura). Relacionamento por WhatsApp.
- **How much:** R$ 79 ou R$ 149 por mês, sem instalação e sem fidelidade. Meta de 30 lojas pagantes no primeiro ano.
  O custo de conquistar cada loja é a visita em campo.

### 5W2H do ponto de vista do cliente (site)

- **O quê:** um painel que mostra, item por item, os produtos fora do preço da região, quanto isso custa por mês, o
  custo real e a sugestão pronta para a etiqueta.
- **Por quê:** recuperar a margem que escapa sem ele perceber.
- **Onde:** no celular ou no computador do balcão, sem instalar nada, comparando com as lojas do bairro e da cidade.
- **Quando:** primeiro diagnóstico em até 7 dias; lista atualizada toda semana; custo novo assim que a nota é importada.
- **Quem:** donos de minimercados e mercearias de bairro, com 1 a 3 caixas e margem de lucro possivelmente apertada.
- **Como:** cadastra a loja pelo CNPJ, importa o XML da nota, recebe as sugestões, aplica com um clique e imprime as
  etiquetas.
- **Quanto:** grátis até 20 itens; R$ 79 (Essencial) ou R$ 149 (Completo) por mês; ganho estimado de R$ 440 por mês
  na loja típica.

### Linha do tempo

| Quando | Marco |
|---|---|
| Fim do semestre | Versão inicial no ar (painel de preço da região e cálculo do preço mínimo) |
| + 8 semanas | Piloto com 5 lojas, para medir quanto de margem o dado recupera na prática |
| Ano 1 | Primeiras lojas pagantes, com venda em campo na Grande São Paulo |
| Ano 2 | Parceria com sistema de caixa: integração pronta e novo canal |
| Ano 4 | Empresa no lucro: a receita recorrente cobre toda a operação |

---

## 11. O que é real, o que é simulado e limitações

- **Real:**
  - os preços do gás (ANP) e toda a análise da 1ª entrega;
  - os números de mercado (ABRAS, Sebrae);
  - o código do painel e as integrações;
  - a leitura de NF-e e NFC-e reais.
- **Simulado:**
  - a faixa de preço da região dos itens de mercearia;
  - o catálogo e os cupons da loja de demonstração (com os 6 padrões plantados de propósito);
  - o histórico de uso da demonstração.
- **Estimativas do grupo:** cenários de crescimento, valor da empresa, retorno do investidor, ganho do lojista,
  tamanho de mercado em reais e unit economics.
- **Limitações:**
  - a nota de compra entra por envio manual;
  - a pasta conectada só funciona no Chrome e no Edge de computador, e só com caixas que gravam XML;
  - não há servidor, login nem criptografia própria;
  - o cálculo não inclui custos fixos;
  - as APIs públicas não foram testadas ao vivo pelo ambiente de desenvolvimento.
- **Resultados verificados:**
  - 55 testes automatizados (motor de preço, notas, APIs com respostas simuladas, combos);
  - o problema comprovado em dado público;
  - os 6 de 6 padrões de combo reencontrados sem falsos positivos.

---

## 12. Divergências conhecidas entre materiais (alinhar antes de usar)

- **Meta do ano 1:** o deck fala em 30 lojas pagantes; o modelo do site usa 80 no cenário base (50 no conservador, 100
  no otimista). Explicação sugerida: 30 é a meta mínima de vendas em campo; o cenário base conta com a parceria com
  sistema de caixa.
- **Termos do investimento:** o slide 12 do deck usa R$ 100 mil por 30% (avaliação de R$ 333 mil), Selic de 13,75%,
  ticket de R$ 110 e cenários de 800 e 2.000 lojas. Os números atuais, usados no site, no one page e no banner, são
  R$ 500 mil por 35%, CDI de 15% e ticket de R$ 100. **Usar os números atuais.**
- **Banner e one page:** foram feitos com 28 produtos na demonstração; hoje são 56. O diagnóstico de R$ 672 por mês em
  8 itens continua igual.

---

## 13. Materiais já produzidos

- Relatório da 1ª entrega (Entendimento dos Dados, CRISP-DM) e notebook no Google Colab.
- Deck de planejamento estratégico (13 slides: promessa, problema, perfil do cliente, mapa de valor, Canvas, SWOT,
  SWOT cruzada, mapas de posicionamento, BCG, 5W2H comercial, investimento, resgate da promessa).
- Site de apresentação e painel do lojista (links no início).
- Banners de 80 × 120 cm (modelo FECAP, estilo do site e versão mesclada para a Tech Week).
- One page para a banca (A4), resumo do projeto em PDF (4 páginas) e abstract do EMTEC 2026 em inglês e português.

### Critérios de avaliação da banca (FECAP)

- **Eixo acadêmico (professores, 50 pontos):** fundamentação e objetivos; metodologia e estruturação; aplicação das
  tecnologias; desenvolvimento e funcionalidade; testes, resultados e domínio técnico.
- **Eixo business (avaliadores externos, 50 pontos):** problema de mercado e público-alvo; proposta de valor e
  diferenciação; potencial de mercado; modelo de negócios e monetização; viabilidade e estratégia de comercialização.

---

## 14. Fontes

- ANP. Série Histórica de Preços de Combustíveis e GLP (jan a ago/2026):
  https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/serie-historica-de-precos-de-combustiveis
- INMET. Dados históricos das estações meteorológicas: https://portal.inmet.gov.br/dadoshistoricos
- Ranking ABRAS 2025: 439.728 lojas no varejo alimentar brasileiro.
- Sebrae-SP: 26.965 estabelecimentos supermercadistas no estado de SP, 65% micro e pequenos.
- Agência Sebrae: 162 minimercados e mercearias abertos por dia no Brasil no 1º semestre de 2025.
- OSTERWALDER, A. et al. *Value Proposition Design*. Wiley, 2014.
- AGRAWAL, R.; SRIKANT, R. Fast algorithms for mining association rules. VLDB, 1994, p. 487-499.
- BENJAMINI, Y.; HOCHBERG, Y. Controlling the false discovery rate. *Journal of the Royal Statistical Society:
  Series B*, v. 57, n. 1, p. 289-300, 1995.

## Glossário

- **ANP:** Agência Nacional do Petróleo, Gás Natural e Biocombustíveis.
- **GLP / P13:** gás de cozinha / botijão de 13 kg.
- **CRISP-DM:** metodologia de projetos de dados em seis fases; a 1ª entrega foi a fase 2, Entendimento dos Dados.
- **NF-e (modelo 55):** nota fiscal eletrônica entre empresas (do fornecedor para a loja).
- **NFC-e (modelo 65):** nota fiscal de consumidor eletrônica (o cupom de venda da loja).
- **XML:** formato do arquivo da nota; o PDF da nota se chama DANFE.
- **Distribuição DF-e:** serviço oficial que entrega ao CNPJ as notas emitidas contra ele.
- **SaaS:** software como serviço, vendido por assinatura.
- **Ticket médio:** mensalidade média por loja (R$ 100).
- **CAC:** custo para conquistar um cliente (R$ 350).
- **Churn:** taxa de cancelamento (1,5% ao mês).
- **Lift:** quantas vezes a compra conjunta é maior que o esperado ao acaso.
- **FDR:** taxa de descobertas falsas, controlada pela correção de Benjamini-Hochberg.
