/* Atlas v2 · rodada 10 — Guia de PI (parte editorial da tela #/pi).
   Textos do Atlas (bab0:4404-4493 e PiOQueE), com os erros de redação corrigidos e os valores de taxa trocados por remissão à tabela vigente do INPI.
   Expõe window.AV2_PI_EDIT = {secoes: [[id, rótulo]], html: function (A, id)}; o telas3.js chama. */
(function () {
  'use strict';

  var POR_QUE = [
    ['Monopólio temporário de exploração', 'você pode impedir cópias, licenciar a terceiros e valorar o ativo para venda ou aporte societário.'],
    ['Diferenciação competitiva', 'barreira de entrada para concorrentes que não podem replicar livremente.'],
    ['Ativos negociáveis', 'patentes, marcas e softwares podem ser vendidos, licenciados ou usados como garantia.'],
    ['Captação e fomento', 'a Lei do Bem prevê exclusão adicional quando há patente concedida ou cultivar registrado; investidores valorizam PI registrada.'],
    ['Segurança jurídica em parcerias', 'sem cláusulas claras de PI, contratos entre ICT e empresa viram litígio.']
  ];

  var TIPOS = [
    {nome: 'Patente de Invenção (PI)', protege: 'Solução técnica nova, inventiva e com aplicação industrial.', prazo: '20 anos do depósito. Desde a decisão do STF na ADI 5529 (2021), não há mais prazo mínimo após a concessão.', onde: 'INPI', custo: 'Taxas do INPI (depósito, exame e anuidades) mais honorários de agente de PI. Há desconto para MPE, ICT e pessoa física: confira a tabela vigente.', exemplo: 'Novo composto químico, processo industrial inovador, dispositivo eletrônico.', pegadinha: 'Divulgação prévia (paper, evento, post) destrói a novidade: deposite ANTES de qualquer divulgação.'},
    {nome: 'Modelo de Utilidade (MU)', protege: 'Forma ou disposição introduzida em objeto que resulta em melhoria funcional.', prazo: '15 anos do depósito.', onde: 'INPI', custo: 'Mesmo regime de taxas da patente de invenção.', exemplo: 'Nova geometria de cabo USB; gabinete com sistema de fixação aprimorado.', pegadinha: 'MU não admite processos nem composições: só objetos físicos com melhoria funcional concreta.'},
    {nome: 'Desenho Industrial (DI)', protege: 'Forma plástica ornamental de objeto (estética).', prazo: '10 anos do depósito, prorrogável por 3 períodos de 5 anos (máximo de 25).', onde: 'INPI', custo: 'Mais barato que patente: depósito, figuras e manutenção quinquenal.', exemplo: 'Design de cadeira, garrafa, embalagem, interface gráfica.', pegadinha: 'Protege a aparência, não a função. A função fica para MU ou patente.'},
    {nome: 'Marca', protege: 'Sinal distintivo (nome, logotipo, mascote) que identifica produto ou serviço no mercado.', prazo: '10 anos do registro, renovável indefinidamente.', onde: 'INPI', custo: 'Taxa por classe; busca prévia recomendada.', exemplo: 'Nome da empresa, nome do produto, slogan distintivo.', pegadinha: 'Marca é por CLASSE (Nice): a mesma marca pode coexistir em classes diferentes. Faça busca prévia para evitar oposição.'},
    {nome: 'Programa de Computador', protege: 'Código-fonte e código-objeto (proteção sui generis, análoga ao direito autoral).', prazo: '50 anos contados de 1º de janeiro do ano seguinte à publicação ou, na falta dela, à criação.', onde: 'INPI (registro facultativo; dá prova de anterioridade)', custo: 'Taxa de registro e depósito do código em cópia cifrada.', exemplo: 'Aplicativo, sistema embarcado, biblioteca.', pegadinha: 'O registro não é obrigatório (a proteção é automática pela criação), mas dá prova sólida de autoria em litígio.'},
    {nome: 'Cultivar', protege: 'Nova variedade vegetal distinguível, homogênea e estável.', prazo: '15 anos (18 para videiras, frutíferas, florestais e ornamentais, inclusive porta-enxertos).', onde: 'SNPC/MAPA (não no INPI)', custo: 'Taxa do SNPC mais ensaios DHE.', exemplo: 'Nova variedade de soja, café, cana, eucalipto.', pegadinha: 'Sistema próprio do MAPA: não confunda com patente. Exige ensaios técnicos longos (DHE: distinguibilidade, homogeneidade, estabilidade).'},
    {nome: 'Topografia de Circuito Integrado', protege: 'Layout físico de circuito integrado (chip).', prazo: '10 anos do depósito ou da primeira exploração, o que ocorrer primeiro.', onde: 'INPI', custo: 'Taxa do INPI e desenhos técnicos.', exemplo: 'Layout de microchip, máscara fotolitográfica.', pegadinha: 'Específico para semicondutores; faz interface com o PADIS.'},
    {nome: 'Indicação Geográfica (IG)', protege: 'Nome de região associado a produto ou serviço com qualidades vinculadas àquela origem.', prazo: 'Indeterminado, enquanto mantidas as condições.', onde: 'INPI', custo: 'Taxa coletiva (associação de produtores).', exemplo: 'Cachaça de Paraty, Café do Cerrado Mineiro, Vinhos do Vale dos Vinhedos.', pegadinha: 'Não é da empresa: é coletiva, gerida por associação representativa.'},
    {nome: 'Direito Autoral', protege: 'Obras literárias, artísticas, científicas e audiovisuais; manuais, vídeos, treinamentos.', prazo: 'Vida do autor mais 70 anos.', onde: 'Automático na criação; registro facultativo (Biblioteca Nacional, EBA, ECA, conforme a natureza da obra).', custo: 'Baixo no registro, zero na proteção automática.', exemplo: 'Manual técnico, vídeo de treinamento, livro, artigo.', pegadinha: 'Não cobre ideias nem métodos, só a forma expressa. Para método ou processo é preciso patente.'},
    {nome: 'Segredo Industrial e Know-how', protege: 'Informação confidencial de valor competitivo (fórmula, processo, lista de clientes).', prazo: 'Indeterminado, enquanto mantido em sigilo.', onde: 'Não há registro: protege-se por NDAs, política de sigilo e medidas físicas.', custo: 'Custo de gestão do sigilo, não de registro.', exemplo: 'Fórmula de bebida, processo de produção proprietário, métodos comerciais internos.', pegadinha: 'Uma divulgação acidental destrói o segredo para sempre. Para tecnologias com risco alto de engenharia reversa, prefira patente.'}
  ];

  var COMO = [
    ['Estratégia ex-ante', 'Antes de pesquisar, defina o que vai proteger e como. Patente protege tudo, mas publica em 18 meses; segredo industrial mantém a vantagem por tempo indeterminado, mas é frágil; marca protege a identidade comercial.', 'Para cada projeto novo, faça um mapa de proteção: ativo, instrumento de PI, prazo e custo estimado.'],
    ['Busca de anterioridade', 'Antes de depositar, busque em bases como Espacenet, Google Patents, INPI e PubMed. Sem ineditismo, o pedido é indeferido.', 'Documente o resultado da busca: é prova de ineditismo durante o exame técnico.'],
    ['Depósito no INPI', 'Petição de depósito, relatório descritivo, reivindicações, figuras e resumo. A data do depósito fixa a prioridade.', 'Use agente de PI (advogado ou engenheiro especializado). Reivindicações mal redigidas inviabilizam a proteção real do ativo.'],
    ['Publicação (18 meses)', 'O pedido fica em sigilo por 18 meses; depois é publicado na RPI (Revista da Propriedade Industrial).', 'Pode-se requerer publicação antecipada; ou retirar o pedido antes dos 18 meses para preservar o segredo se a estratégia mudar.'],
    ['Pedido de exame técnico', 'Até 36 meses do depósito é preciso requerer o exame, com pagamento de taxa. Sem isso, o pedido é arquivado.', 'O examinador pode fazer exigências; cumpra os prazos sob pena de arquivamento definitivo.'],
    ['Decisão (deferimento ou indeferimento)', 'Após o exame, o INPI defere (concede) ou indefere (recusa). O indeferimento admite recurso administrativo.', 'As Patentes Verdes têm trâmite prioritário (cerca de 2 anos, contra cerca de 10 no fluxo comum), para invenções de sustentabilidade.'],
    ['Manutenção (anuidades)', 'Anuidades anuais para manter o título. Não pagar leva à caducidade.', 'As anuidades pesam mais nos últimos anos de vigência: avalie se vale manter, licenciar ou abandonar.'],
    ['Exploração comercial', 'Use você mesmo (vantagem competitiva), licencie (royalty), ceda (venda da titularidade) ou aporte em sociedade (equity).', 'Averbe no INPI todo contrato de licenciamento ou cessão: sem isso, não vale contra terceiros.']
  ];

  var ICT = [
    {cenario: 'Cotitularidade ICT e empresa', lei: 'Lei 10.973/2004, art. 9º', como: 'Quando o projeto é desenvolvido em conjunto, a PI gerada é cotitulada na proporção definida em contrato (em geral, pelo aporte técnico e financeiro). Em regra, cada cotitular pode explorar por si; venda ou licença exclusiva exige o consentimento do outro.', criticos: 'Definir o percentual de cotitularidade ANTES do início. Quem paga a manutenção? Quem decide licenciar?', dica: 'Cotitularidade 50/50 sem governança clara é gatilho de paralisia. Prefira um cotitular majoritário com direito de decisão.'},
    {cenario: 'Encomenda tecnológica', lei: 'Lei 10.973/2004, art. 20; Lei 14.133/2021, art. 75, V (dispensa de licitação)', como: 'Órgão público contrata ICT ou empresa para desenvolver solução com risco tecnológico. Pagamento por etapas, com remuneração adicional pelo risco; permite contratar o fornecimento em escala sem nova licitação (art. 20, § 4º).', criticos: 'O risco tecnológico deve ser comprovado (a solução não existe pronta). A titularidade da PI depende do contrato; o usual é ficar com o executor, com licença ao contratante.', dica: 'Bom mecanismo para defesa, saúde pública e infraestrutura.'},
    {cenario: 'Licenciamento de tecnologia da ICT', lei: 'Lei 10.973/2004, arts. 6º e 13; Decreto 9.283/2018', como: 'A ICT licencia (exclusiva ou não) tecnologia já desenvolvida. Licença exclusiva exige edital de oferta tecnológica; a não exclusiva pode ser direta. O criador faz jus a 5% a um terço dos ganhos econômicos auferidos pela ICT (art. 13).', criticos: 'Royalty de referência de mercado: 2% a 8% da receita líquida, conforme o setor. Cláusula de desempenho mínimo evita que o licenciado engavete a tecnologia.', dica: 'Para tecnologias já prontas na ICT, licenciar costuma ser mais rápido que cotitular.'},
    {cenario: 'Bônus tecnológico', lei: 'Lei 10.973/2004 e Decreto 9.283/2018', como: 'A MPE recebe subvenção (voucher) para contratar serviços técnicos especializados, P&D ou compartilhamento de infraestrutura com ICTs. A ICT executa; a empresa é a beneficiária.', criticos: 'Limitado a MPE; a PI costuma ficar com a ICT, com licença não exclusiva para a MPE, conforme o instrumento.', dica: 'Caminho barato para a MPE ter a primeira experiência com PI gerada em ICT.'},
    {cenario: 'Spin-off de pesquisador-empreendedor', lei: 'Lei 10.973/2004, arts. 14 e 14-A', como: 'O pesquisador público pode se afastar para constituir empresa e, nas condições da lei, atuar nela. A ICT pode licenciar PI à spin-off com royalties e, conforme a política da ICT, participação societária.', criticos: 'Conflito de interesse precisa ser declarado; a ICT define sua política de participação no capital.', dica: 'Empresa de base tecnológica com licença exclusiva e participação da ICT é modelo consolidado em USP, Unicamp e COPPE.'},
    {cenario: 'Acordo de parceria de PD&I (sem repasse de recursos)', lei: 'Lei 10.973/2004, art. 9º', como: 'ICT e empresa unem esforços, cada um aportando recursos próprios (horas, infraestrutura, materiais). Define-se ex-ante a titularidade da PI, a divisão de royalties e o direito de exploração.', criticos: 'Sem fluxo financeiro entre as partes. Bom para cooperação simétrica.', dica: 'Não confunda com contrato (que tem repasse). O acordo de parceria é juridicamente mais leve.'},
    {cenario: 'Sigilo (NDA) prévio à negociação', lei: 'Boa-fé objetiva; Lei 9.279/1996, art. 195 (concorrência desleal)', como: 'Antes de discutir detalhes técnicos com a ICT (ou o inverso), assine NDA bilateral cobrindo as informações trocadas, o prazo de sigilo (3 a 5 anos é usual) e as penalidades.', criticos: 'O NDA deve definir com clareza o que é informação confidencial (com marcação) e o prazo.', dica: 'Use o modelo do NIT da ICT: em geral já é juridicamente robusto.'},
    {cenario: 'Royalties por setor (referência de mercado)', lei: 'Benchmarks de mercado, não norma', como: 'Referências usuais sobre a receita líquida: software 5% a 15%; biotecnologia e farma 3% a 8%, mais pagamentos por marco; eletrônica 2% a 6%; química 2% a 5%; mecânica 1% a 4%. Alguns contratos preferem valor fixo por unidade.', criticos: 'Royalty muito alto inviabiliza a exploração; muito baixo desvaloriza a tecnologia. Os números variam muito por caso.', dica: 'Compare com bases de royalty rates e com contratos públicos de ICTs (alguns NITs publicam).'}
  ];

  var LEIS = [
    ['Lei 9.279/1996', 'LPI: Lei da Propriedade Industrial', 'Patente, MU, DI, marca, IG e repressão à concorrência desleal.', 'Marco geral. Toda discussão de patente, marca, DI ou IG passa por aqui.'],
    ['Lei 9.609/1998', 'Lei do Software', 'Proteção de programa de computador como direito sui generis.', 'Registro no INPI é facultativo; contrato de licença ou cessão deve ser averbado para valer contra terceiros.'],
    ['Lei 9.456/1997', 'Lei de Proteção de Cultivares', 'Direito do obtentor de nova variedade vegetal.', 'Registro no SNPC/MAPA, não no INPI. Distinguibilidade, homogeneidade e estabilidade.'],
    ['Lei 9.610/1998', 'Lei de Direitos Autorais', 'Obras literárias, artísticas e científicas; bancos de dados.', 'Proteção automática; o registro só dá prova. O direito moral é inalienável.'],
    ['Lei 10.973/2004', 'Lei de Inovação', 'Arts. 6º (transferência), 9º (parceria e titularidade), 13 (participação do criador), 14 e 14-A (pesquisador-empreendedor) e 20 (encomenda).', 'Coração jurídico das parcerias entre ICT e empresa em PI.'],
    ['Lei 13.243/2016', 'Marco Legal de CT&I', 'Altera nove leis; flexibiliza o compartilhamento de laboratórios e o regime do pesquisador público.', 'Operacionaliza a Lei de Inovação.'],
    ['Decreto 9.283/2018', 'Regulamenta o Marco Legal de CT&I', 'Detalha encomenda tecnológica, subvenção, bônus tecnológico, compartilhamento e parcerias.', 'Referência operacional: leia junto com a lei.'],
    ['Lei 11.196/2005', 'Lei do Bem (capítulo III)', 'Incentivo fiscal a P&D, com exclusão adicional quando há patente concedida ou cultivar registrado.', 'Incentiva diretamente o depósito e a concessão de PI.'],
    ['Convenção da União de Paris', 'Tratado internacional', 'Prioridade unionista: 12 meses para patente e MU, 6 meses para DI e marca, em outros países.', 'Para internacionalizar, deposite no Brasil primeiro e use a prioridade nos demais países.'],
    ['Tratado de Cooperação em Patentes (PCT)', 'Tratado internacional', 'Depósito internacional único, com entrada posterior na fase nacional em mais de 150 países.', 'Estratégia padrão de internacionalização: adia a decisão e os custos para 30 ou 31 meses após o depósito.']
  ];

  var VALOR = {
    intro: 'Antes de licenciar, vender ou aportar PI em sociedade, é preciso valorá-la. Há três métodos clássicos.',
    metodos: [
      {nome: 'Custo (histórico ou de reposição)', desc: 'Soma os custos para gerar, ou regerar, o ativo. Útil quando o ativo é recente e não há mercado comparável.', quando: 'PI nascente, sem histórico de exploração.', formula: 'Σ (custos de P&D + registro + manutenção)'},
      {nome: 'Mercado (comparáveis)', desc: 'Busca transações de PI similar (licenciamento, venda) no mesmo setor e infere o valor.', quando: 'Setores maduros com transações públicas, como farma e eletrônica.', formula: 'Royalty × receita projetada do licenciado'},
      {nome: 'Renda (fluxo de caixa descontado ou relief-from-royalty)', desc: 'Projeta o fluxo de caixa que o ativo gera, ou a economia de royalty que a empresa teria se fosse licenciada, e desconta a uma taxa adequada ao risco.', quando: 'Ativo com exploração projetável e referência de royalty disponível.', formula: 'VP = Σ [FCₜ × (1 − imposto) / (1 + r)ᵗ]'}
    ],
    dica: 'Use mais de um método e triangule. Documente as premissas (volume, royalty, taxa de desconto, vida útil): elas sustentam a negociação.'
  };

  var ERROS = [
    'Divulgar a invenção (artigo, evento, post, vídeo) ANTES do depósito da patente: perde-se a novidade no Brasil e em quase todo o mundo.',
    'Não fazer busca de anterioridade: depositar algo que já existe gera indeferimento e custos perdidos.',
    'Reivindicações mal redigidas: a proteção real fica bem menor que a invenção. Use agente de PI especializado.',
    'Não negociar a PI no contrato de parceria entre ICT e empresa ANTES do início do projeto: vira batalha jurídica depois.',
    'Confundir registro de software com patente: software pode ter aspectos patenteáveis (método implementado por computador). Avalie as duas proteções.',
    'Cotitularidade 50/50 sem governança definida: paralisa as decisões de licenciamento e manutenção.',
    'Não pagar a anuidade: a patente caduca. Use lembretes ou serviço de monitoramento.',
    'Não averbar o contrato de licença ou cessão no INPI: não vale contra terceiros, e os royalties podem ser questionados pela Receita Federal.',
    'Registrar a marca na classe errada: a empresa de software que registra em "papelaria" fica sem proteção real.',
    'Tratar segredo industrial sem política formal (NDA, acesso restrito, marcação): perde-se o status legal de segredo.',
    'Não declarar a invenção ao NIT da ICT (no caso de pesquisador público): gera glosa de incentivos e questionamento da titularidade.',
    'Ignorar a prioridade unionista (12 meses): perde-se a janela para internacionalizar, e depois fica muito mais caro.'
  ];

  var GLOSS = [
    ['INPI', 'Instituto Nacional da Propriedade Industrial', 'Autarquia federal vinculada ao MDIC. Registra patentes, marcas, DI, IG, programas de computador e topografias.'],
    ['SNPC', 'Serviço Nacional de Proteção de Cultivares', 'Órgão do MAPA responsável pelo registro de cultivares, fora do INPI.'],
    ['RPI', 'Revista da Propriedade Industrial', 'Publicação semanal do INPI que oficializa os atos (depósitos, exigências, decisões). Acompanhá-la é obrigação de quem tem pedido em andamento.'],
    ['Reivindicação', 'Claim de patente', 'Texto que delimita o escopo da proteção. É o coração jurídico da patente: ataque e defesa em litígio giram em torno dela.'],
    ['Anterioridade', 'Prior art', 'Todo conhecimento técnico disponível antes do depósito que pode ser usado para negar novidade.'],
    ['Prioridade unionista', 'Convenção de Paris, art. 4º', 'Direito de reivindicar a data de depósito de um país (o Brasil) em outros países dentro de 12 meses (patente e MU) ou 6 meses (DI e marca).'],
    ['PCT', 'Patent Cooperation Treaty', 'Tratado que permite depósito único com efeito em mais de 150 países; a fase nacional começa em até 30 ou 31 meses.'],
    ['Classe de Nice', 'Classificação Internacional de Produtos e Serviços', 'São 45 classes para marca. A mesma marca pode coexistir em classes diferentes.'],
    ['CPC', 'Classificação Cooperativa de Patentes', 'Esquema de classificação técnica usado por USPTO e EPO; o INPI adota a CIP (IPC).'],
    ['Caducidade', 'Extinção da PI', 'Perda do direito por falta de pagamento de anuidade ou, no caso de marca, por falta de uso continuado por 5 anos.'],
    ['Averbação', 'Registro no INPI', 'Ato pelo qual contratos de licenciamento, cessão ou transferência de tecnologia ganham eficácia contra terceiros e produzem efeitos fiscais.'],
    ['NIT', 'Núcleo de Inovação Tecnológica', 'Estrutura obrigatória das ICTs públicas (Lei 10.973). Gere parcerias, PI e transferência de tecnologia.'],
    ['Patentes Verdes', 'Programa do INPI', 'Exame acelerado para invenções em sustentabilidade (cerca de 2 anos, contra cerca de 10 no fluxo comum).'],
    ['DHE', 'Distinguibilidade, Homogeneidade e Estabilidade', 'Tripé de avaliação técnica de novas cultivares pelo SNPC.'],
    ['Royalty rate', 'Taxa de royalty', 'Percentual sobre a receita líquida (ou valor fixo por unidade) pago ao titular pelo licenciado. Varia por setor.']
  ];

  var SECOES = [['oque', 'O que é PI'], ['tipos', 'Os 10 tipos'], ['como', 'Como funciona'], ['ict', 'Negociar com ICT'], ['leis', 'Leis e regras'], ['valor', 'Valoração'], ['erros', 'Erros comuns'], ['gloss', 'Glossário de PI']];

  function cab(A, olho, tit, lede) {
    return '<header class="pg-cab"><p class="olho">' + A.esc(olho) + '</p><h2 class="tit-md">' + A.esc(tit) + '</h2>' + (lede ? '<p class="pg-lede">' + A.esc(lede) + '</p>' : '') + '</header>';
  }
  function campo(A, rot, txt) { return '<div class="pg-campo"><span>' + A.esc(rot) + '</span><p>' + A.esc(txt) + '</p></div>'; }

  var CONSTROI = {
    oque: function (A) {
      return cab(A, 'Conceito', 'O que é Propriedade Intelectual', 'Conjunto de direitos legais sobre criações da mente (invenções, obras, marcas, designs, segredos comerciais) que permitem ao titular controlar a exploração econômica desses ativos por tempo determinado.') +
        '<div class="bloco pg-bloco"><h4 class="olho">Por que importa</h4><ul class="pg-checks">' + POR_QUE.map(function (x) { return '<li><b>' + A.esc(x[0]) + '</b>' + A.esc(' — ' + x[1]) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="bloco alerta pg-bloco"><h4 class="olho">Princípio crítico</h4><p class="txt">PI mal tratada destrói valor de inovação. Defina titularidade, estratégia de proteção e plano de exploração <b>antes</b> de submeter o projeto ou divulgar o resultado: corrigir depois é muito mais caro, e às vezes impossível.</p></div>';
    },
    tipos: function (A) {
      return cab(A, '10 tipos de proteção', 'Tipos de PI no Brasil', 'Cada tipo protege uma coisa diferente, com prazo, órgão e custo próprios. Valores de taxa mudam: confira a tabela de retribuições vigente do INPI.') +
        '<div class="pg-grade">' + TIPOS.map(function (t) {
          return '<article class="bloco pg-card"><h3>' + A.esc(t.nome) + '</h3><p class="pg-prot">' + A.esc(t.protege) + '</p>' +
            '<div class="pg-duas">' + campo(A, 'Prazo', t.prazo) + campo(A, 'Onde', t.onde) + '</div>' + campo(A, 'Custo', t.custo) + campo(A, 'Exemplo', t.exemplo) +
            '<p class="pg-pega"><b>Pegadinha.</b> ' + A.esc(t.pegadinha) + '</p></article>';
        }).join('') + '</div>';
    },
    como: function (A) {
      return cab(A, 'Do pedido à exploração', 'Como funciona a proteção de uma patente', 'Oito etapas, da estratégia à exploração comercial. Os prazos são os da Lei 9.279/1996.') +
        '<ol class="pg-passos">' + COMO.map(function (p, i) {
          return '<li class="bloco"><span class="pg-n">' + (i + 1) + '</span><div><h3>' + A.esc(p[0]) + '</h3><p>' + A.esc(p[1]) + '</p><p class="pg-dica"><b>Dica.</b> ' + A.esc(p[2]) + '</p></div></li>';
        }).join('') + '</ol>';
    },
    ict: function (A) {
      return cab(A, '8 cenários', 'Negociar PI com ICT', 'Quem fica com a PI quando empresa e ICT trabalham juntas depende do instrumento. Abra o cenário que se parece com o seu.') +
        '<div class="pg-acord">' + ICT.map(function (c, i) {
          return '<details class="bloco pg-det"' + (i === 0 ? ' open' : '') + '><summary><span>' + A.esc(c.cenario) + '</span><small>' + A.esc(c.lei) + '</small></summary><div class="pg-corpo">' +
            campo(A, 'Como funciona', c.como) + campo(A, 'Pontos críticos', c.criticos) + '<p class="pg-dica"><b>Dica.</b> ' + A.esc(c.dica) + '</p></div></details>';
        }).join('') + '</div><p class="aviso-txt">Resumo informativo. A redação do contrato e a escolha do instrumento exigem advogado de PI e o NIT da ICT.</p>';
    },
    leis: function (A) {
      return cab(A, '10 normas', 'Leis e regras que importam', 'O arcabouço jurídico de PI e das parcerias de inovação.') +
        '<div class="pg-grade pg-leis">' + LEIS.map(function (l) {
          return '<article class="bloco pg-card"><p class="pg-sigla">' + A.esc(l[0]) + '</p><h3>' + A.esc(l[1]) + '</h3>' + campo(A, 'Escopo', l[2]) + campo(A, 'Na prática', l[3]) + '</article>';
        }).join('') + '</div>';
    },
    valor: function (A) {
      return cab(A, 'Quanto vale', 'Valoração de PI', VALOR.intro) +
        '<div class="pg-grade pg-tres">' + VALOR.metodos.map(function (m, i) {
          return '<article class="bloco pg-card"><p class="pg-sigla">Método ' + (i + 1) + '</p><h3>' + A.esc(m.nome) + '</h3><p class="pg-prot">' + A.esc(m.desc) + '</p>' + campo(A, 'Quando usar', m.quando) + '<p class="pg-formula">' + A.esc(m.formula) + '</p></article>';
        }).join('') + '</div><div class="bloco alerta pg-bloco"><h4 class="olho">Dica</h4><p class="txt">' + A.esc(VALOR.dica) + '</p></div>';
    },
    erros: function (A) {
      return cab(A, 'O que evitar', 'Erros comuns em PI', 'Os doze tropeços que mais custam caro a quem inova.') +
        '<ol class="pg-erros bloco">' + ERROS.map(function (e) { return '<li>' + A.esc(e) + '</li>'; }).join('') + '</ol>';
    },
    gloss: function (A) {
      return cab(A, 'Termos', 'Glossário de PI', 'Quinze termos que aparecem em todo contrato e em toda conversa com o INPI. O Dicionário do Atlas traz o vocabulário completo.') +
        '<dl class="pg-gloss">' + GLOSS.map(function (g) { return '<div class="bloco"><dt>' + A.esc(g[0]) + '<small>' + A.esc(g[1]) + '</small></dt><dd>' + A.esc(g[2]) + '</dd></div>'; }).join('') + '</dl>' +
        '<p><a class="btn-linha peq" href="#/glossario">Abrir o Dicionário completo</a></p>';
    }
  };

  window.AV2_PI_EDIT = {
    secoes: SECOES,
    html: function (A, id) { return (CONSTROI[id] || CONSTROI.oque)(A); }
  };
})();
