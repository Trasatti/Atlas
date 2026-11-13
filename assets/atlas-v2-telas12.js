/* Atlas v2 · telas12 — "para humanos"
   1) Guia do Bom Projeto dinâmico (substitui AV2_TELAS.guia de atlas-v2-telas.js; carregar DEPOIS dele e ANTES de atlas-v2.js)
   2) Cartões enxutos + modal de detalhes em todas as listas (.op), sem editar as telas
   3) Todo link externo abre em nova guia */
(function () {
  'use strict';
  var T = window.AV2_TELAS = window.AV2_TELAS || {};
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }

  /* ======================================================================
     1. GUIA DO BOM PROJETO
     ====================================================================== */
  var FASES = [
    {n: 'Pensar', d: 'Antes de escrever uma linha', ids: ['enquadramento', 'problema', 'risco-tecnologico']},
    {n: 'Desenhar', d: 'O miolo técnico e financeiro', ids: ['plano-de-trabalho', 'parcerias', 'orcamento', 'impacto']},
    {n: 'Convencer e proteger', d: 'Texto, PI e combinação de recursos', ids: ['comunicacao-storytelling-tecnico', 'propriedade-intelectual-valoracao', 'combinacao-instrumentos-stacking']},
    {n: 'Executar e prestar contas', d: 'Governança, contas, horas e riscos', ids: ['governanca', 'governanca-comite-gestor', 'prestacao-contas-compliance', 'controle-horas-timesheet', 'gestao-riscos']},
    {n: 'Depois do projeto', d: 'Do protótipo ao mercado', ids: ['pos-projeto-escalonamento']}
  ];
  /* Erro comum x como fazer: cada par é o inverso direto do que o próprio capítulo recomenda (sem fato novo). */
  var ER = {
    'enquadramento': ['Escrever o projeto e só depois descobrir que a empresa não é elegível ao instrumento.', 'Checar porte, regularidade fiscal, TRL e contrapartida antes de redigir.'],
    'problema': ['Abrir o texto já descrevendo a solução e adjetivando a ideia.', 'Começar pelo gap: o que não existe hoje no estado da arte, com número de impacto.'],
    'risco-tecnologico': ['Apresentar um projeto sem incerteza técnica, que o avaliador lê como serviço.', 'Declarar hipóteses que podem falhar, TRL inicial e alvo, e um plano B por marco crítico.'],
    'plano-de-trabalho': ['Marcos vagos e custo concentrado no fim do cronograma.', 'Etapas com produto verificável, critério de aceite e cronograma físico-financeiro coerente.'],
    'parcerias': ['Escolher a ICT por relação prévia e deixar PI e confidencialidade para o meio do projeto.', 'Justificar a ICT pela competência específica e minutar o acordo de PI antes de submeter.'],
    'orcamento': ['Perseguir o orçamento mais baixo, com linhas sem memória de cálculo.', 'Linhas justificadas, bens com cotação real e contrapartida comprovada.'],
    'impacto': ['Prometer "impacto positivo" sem número, prazo ou forma de medir.', '3 a 5 KPIs SMART, com baseline e meta em 12, 24 e 36 meses, ligados ao plano de absorção.'],
    'governanca': ['Pensar em compliance só na hora da prestação de contas.', 'Contabilidade segregada, compras formalizadas e atas desde o primeiro dia.'],
    'comunicacao-storytelling-tecnico': ['Texto denso e cheio de adjetivos, com a conclusão escondida no fim.', 'Conclusão primeiro (BLUF), uma ideia por parágrafo e os mesmos termos para as mesmas coisas.'],
    'propriedade-intelectual-valoracao': ['Deixar a titularidade da PI para depois e tratar tudo como patente.', 'Pactuar quem detém o quê por escrito e escolher o instrumento de proteção certo para cada ativo.'],
    'combinacao-instrumentos-stacking': ['Declarar a mesma despesa em dois instrumentos públicos.', 'Segmentar por pacote ou rubrica e montar a matriz instrumento x despesa x regra antes de submeter.'],
    'pos-projeto-escalonamento': ['Declarar TRL 8-9 sem falar de manufatura nem de mercado.', 'Declarar TRL com evidência, MRL e CRL coerentes e um cliente âncora para o escalonamento.'],
    'governanca-comite-gestor': ['Ninguém sabe quem decide, e a mudança de plano nunca fica registrada.', 'Papéis definidos, matriz RACI, Comitê mensal com ata e declaração de conflito de interesse.'],
    'prestacao-contas-compliance': ['Pagar pela conta da empresa e juntar os comprovantes no fim.', 'Conta exclusiva, nota com número do contrato, pasta por rubrica e conciliação mensal.'],
    'controle-horas-timesheet': ['Preencher as horas de uma vez, retroativamente, no fim do mês.', 'Apontar diária ou semanalmente, cada hora ligada a um pacote de trabalho, com aprovação mensal.'],
    'gestao-riscos': ['Uma lista de riscos escrita uma vez e esquecida.', 'Matriz probabilidade x impacto revisada em todo Comitê, com dono, ação, prazo e gatilho.']
  };
  var ICO = [
    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17.5" cy="9" r="2.4"/><path d="M17 14.2c2.4.3 4 2.2 4 4.8"/>',
    '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.4-1-1.4-1.5-2.8-1.5-1.7 0-2.8.9-2.8 2.1 0 3 5.8 1.5 5.8 4.4 0 1.2-1.2 2.1-3 2.1-1.4 0-2.5-.6-3-1.7M12 6v1.7M12 16.3V18"/>',
    '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>'
  ];
  function svg(i) { return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[i % ICO.length] + '</svg>'; }

  /* Técnica de escrita por capítulo: o que se aprende (cartão), 3 passos, exemplo ruim x bom e frase-modelo (texto didático, sem número de edital) */
  var TEC = {
    'enquadramento': {ap: 'Como escolher o instrumento certo antes de escrever', p: ['Liste o que a empresa precisa: risco, prazo, caixa.', 'Cruze com porte, regime, TRL e contrapartida de cada instrumento.', 'Escreva a justificativa da escolha em duas frases.'],
      ruim: 'Vamos submeter a este edital porque ele está aberto.', bom: 'Este instrumento atende projetos de risco em TRL 4 a 6, que é onde estamos, e nossa contrapartida está comprovada.',
      m: 'O projeto se enquadra em [instrumento] porque [risco/TRL/porte], e foi escolhido em vez de [alternativa] por [razão estratégica].'},
    'problema': {ap: 'Como mostrar o problema antes da solução', p: ['Descreva a dor de quem sofre, com um dado mensurável.', 'Mostre por que o estado da arte atual não resolve.', 'Só então apresente a solução como resposta ao gap.'],
      ruim: 'Desenvolveremos uma plataforma inovadora de inteligência artificial.', bom: 'Hoje o operador perde horas conferindo dados à mão e as ferramentas existentes não cobrem esse caso; falta um método que o faça em tempo útil.',
      m: 'Hoje, [quem] enfrenta [problema], com custo de [dado de impacto]; as soluções existentes falham em [limitação]. Este projeto fecha esse gap.'},
    'risco-tecnologico': {ap: 'Como declarar a incerteza técnica sem perder o avaliador', p: ['Diga o que ainda não se sabe fazer.', 'Escreva a hipótese que pode falhar e como será testada.', 'Defina o TRL de partida, o alvo e um plano B por marco.'],
      ruim: 'A tecnologia é conhecida e a execução é de baixo risco.', bom: 'Não sabemos se o método mantém a precisão fora do laboratório; testaremos em ambiente relevante e, se falhar, adotamos a rota alternativa.',
      m: 'A incerteza central é [o que não se sabe]. Testaremos a hipótese [H] por meio de [experimento]; se falhar, seguiremos pelo plano B [alternativa].'},
    'plano-de-trabalho': {ap: 'Como desenhar etapas que o avaliador consegue auditar', p: ['Quebre o projeto em etapas com um produto verificável cada.', 'Dê a cada etapa um critério de aceite objetivo.', 'Amarre cronograma físico e desembolso na mesma tabela.'],
      ruim: 'Etapa 2: desenvolvimento do sistema (meses 3 a 18).', bom: 'Etapa 2: protótipo funcional validado em bancada, aceito quando atingir o critério definido na meta técnica.',
      m: 'A etapa [n] entrega [produto verificável], é aceita quando [critério mensurável] e consome [parcela] do orçamento.'},
    'parcerias': {ap: 'Como justificar cada parceiro e organizar a rede', p: ['Escolha a ICT pela competência que ela tem e você não tem.', 'Descreva o papel de cada parceiro, da empresa âncora ao usuário final.', 'Minute o acordo de PI e confidencialidade antes de submeter.'],
      ruim: 'Escolhemos a universidade X por já termos trabalhado juntos.', bom: 'A ICT escolhida domina o ensaio que não temos; as regras de titularidade já estão acordadas por escrito.',
      m: 'A parceria com [parceiro] traz [competência específica], com papel de [função] e titularidade da PI definida em [acordo].'},
    'orcamento': {ap: 'Como justificar cada linha do orçamento', p: ['Ligue cada linha a uma etapa do plano de trabalho.', 'Mostre a memória de cálculo e a cotação real dos bens.', 'Comprove a contrapartida e compare com referências do setor.'],
      ruim: 'Equipamentos: valor global estimado.', bom: 'Equipamento necessário à etapa 3, com três cotações anexas e justificativa de por que não há alternativa já disponível.',
      m: 'A linha [rubrica] corresponde a [item], necessária à etapa [n], com custo baseado em [cotação/referência].'},
    'impacto': {ap: 'Como prometer impacto que dá para medir', p: ['Escolha de 3 a 5 indicadores que você consegue medir.', 'Registre o ponto de partida (baseline) de cada um.', 'Defina a meta e o prazo, ligados ao plano de absorção.'],
      ruim: 'O projeto trará impacto positivo para a empresa e a sociedade.', bom: 'Reduzir o tempo de [processo] de [baseline] para [meta] em 24 meses, medido por [fonte], com cliente piloto já identificado.',
      m: 'Indicador: [KPI]. Hoje: [baseline]. Meta: [valor] em [prazo]. Medido por [método] e absorvido pela empresa via [plano].'},
    'governanca': {ap: 'Como pensar em compliance desde o primeiro dia', p: ['Separe a contabilidade do projeto desde o início.', 'Formalize compras e contratações com registro.', 'Guarde atas e evidências à medida que acontecem.'],
      ruim: 'Os comprovantes serão reunidos na prestação de contas.', bom: 'Conta exclusiva do projeto, compras com cotação registrada e ata de cada decisão arquivada na hora.',
      m: 'A governança do projeto prevê [conta/controle], [rito de decisão] e arquivo de evidências mantido desde [marco inicial].'},
    'comunicacao-storytelling-tecnico': {ap: 'Como escrever para quem avalia com pouco tempo', p: ['Abra com a conclusão (BLUF), não com o contexto.', 'Uma ideia por parágrafo e os mesmos termos para as mesmas coisas.', 'Troque adjetivo por dado e ligue problema, objetivo e entrega.'],
      ruim: 'Este revolucionário projeto representa um salto de qualidade sem precedentes.', bom: 'O projeto entrega [resultado] para resolver [problema]; a seguir, mostramos como e com que evidência.',
      m: 'Em uma frase: este projeto [faz o quê] para [quem], resolvendo [problema], e entrega [resultado verificável] até [prazo].'},
    'propriedade-intelectual-valoracao': {ap: 'Como definir quem é dono do quê e como proteger', p: ['Liste os ativos que o projeto vai gerar.', 'Defina por escrito a titularidade de cada um.', 'Escolha a proteção adequada (patente, software, segredo) e o modo de explorar.'],
      ruim: 'A propriedade intelectual será discutida depois, conforme o resultado.', bom: 'A empresa detém o software; a ICT, o método de ensaio; a exploração comercial segue o acordo assinado antes do início.',
      m: 'Os ativos gerados são [lista]; a titularidade de cada um é [parte], protegida por [mecanismo] e explorada por [modelo].'},
    'combinacao-instrumentos-stacking': {ap: 'Como combinar recursos sem declarar a mesma despesa duas vezes', p: ['Liste as fontes de recurso que o projeto pode usar.', 'Monte a matriz instrumento x despesa x regra.', 'Segmente por pacote ou rubrica para nenhuma despesa repetir.'],
      ruim: 'Vamos usar subvenção e incentivo fiscal para cobrir os mesmos custos.', bom: 'A subvenção cobre as etapas 1 e 2; o incentivo fiscal, os custos da etapa 3, com a matriz de despesas anexa.',
      m: 'O projeto combina [instrumento A] para [pacote/rubrica] e [instrumento B] para [outro pacote], sem sobreposição de despesas.'},
    'pos-projeto-escalonamento': {ap: 'Como mostrar o legado depois que o projeto termina', p: ['Declare o TRL final com a evidência que o sustenta.', 'Mostre a maturidade de manufatura (MRL) e de mercado (CRL).', 'Nomeie o cliente âncora e o próximo passo de escala.'],
      ruim: 'Ao final, a solução estará pronta para o mercado.', bom: 'Ao final, o protótipo estará validado em ambiente operacional e há um cliente âncora para a primeira série de produção.',
      m: 'Ao final, a solução atinge TRL [n], comprovado por [evidência], com [cliente âncora] e plano de escala em [prazo].'},
    'governanca-comite-gestor': {ap: 'Como deixar claro quem decide no projeto', p: ['Defina papéis e responsabilidades por escrito.', 'Monte uma matriz RACI para as decisões principais.', 'Faça Comitê com ata e registre mudanças de plano e conflitos de interesse.'],
      ruim: 'A equipe decidirá em conjunto quando necessário.', bom: 'O Comitê se reúne todo mês, decide mudanças de plano em ata e cada decisão tem um responsável nomeado.',
      m: 'O Comitê Gestor, formado por [papéis], reúne-se [frequência], registra decisões em ata e escala impasses para [instância].'},
    'prestacao-contas-compliance': {ap: 'Como organizar a prestação de contas desde o início', p: ['Use conta exclusiva e identifique cada nota com o contrato.', 'Crie uma pasta por rubrica, abastecida ao longo do projeto.', 'Faça a conciliação todo mês, não só no fim.'],
      ruim: 'Pagamos pela conta da empresa e juntamos os comprovantes depois.', bom: 'Cada despesa sai da conta do projeto, com nota identificada e arquivada na pasta da rubrica no mesmo mês.',
      m: 'Toda despesa do projeto é paga pela conta [exclusiva], documentada com [nota/contrato] e conciliada [mensalmente].'},
    'controle-horas-timesheet': {ap: 'Como registrar horas que resistem à auditoria', p: ['Aponte as horas todo dia ou toda semana.', 'Ligue cada hora a um pacote de trabalho do projeto.', 'Faça aprovação mensal do responsável.'],
      ruim: 'As horas foram preenchidas no fim do mês, de memória.', bom: 'Cada pessoa aponta as horas semanalmente por pacote de trabalho e o coordenador aprova ao fim do mês.',
      m: 'O esforço é apontado [frequência] por pacote de trabalho, aprovado por [responsável] e arquivado como prova da contrapartida.'},
    'gestao-riscos': {ap: 'Como manter uma matriz de riscos viva', p: ['Liste riscos e classifique por probabilidade e impacto.', 'Dê a cada risco um dono, uma ação, um prazo e um gatilho.', 'Revise a matriz em toda reunião do Comitê.'],
      ruim: 'Os riscos foram listados na submissão do projeto.', bom: 'A matriz é revisada a cada Comitê; cada risco tem dono, ação de mitigação e um gatilho que aciona o plano de contingência.',
      m: 'O risco [R] tem probabilidade [P] e impacto [I]; dono: [nome]; mitigação: [ação]; gatilho: [sinal] aciona [contingência].'}
  };
  function copiar(txt, btn) {
    function ok() { var o = btn.textContent; btn.textContent = 'Copiado ✓'; setTimeout(function () { btn.textContent = o; }, 1500); }
    function velho() { var t = document.createElement('textarea'); t.value = txt; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (e) {} document.body.removeChild(t); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, velho); else velho();
  }

  T.guia = function (A, sub, q, box, mesma) {
    var G = A.D.guia || [], feitos = {};
    try { feitos = JSON.parse(localStorage.getItem('atlas-guia') || '{}'); } catch (e) {}
    var faseDe = {}; FASES.forEach(function (f, k) { f.ids.forEach(function (id) { faseDe[id] = k; }); });

    function nome(g) { return String(g.titulo).replace(/^\d+\.\s*/, ''); }
    function num(g) { var m = /^(\d+)\./.exec(g.titulo); return m ? m[1] : String(G.indexOf(g) + 1); }
    function fase(g) { var k = faseDe[g.id]; return k == null ? FASES.length : k; }
    function idx(id) { for (var i = 0; i < G.length; i++) if (G[i].id === id) return i; return -1; }
    function nFeitos(g) { return (g.checklist || []).filter(function (x, k) { return feitos[g.id + ':' + k]; }).length; }
    function pct(g) { var n = (g.checklist || []).length; return n ? Math.round(nFeitos(g) / n * 100) : 0; }
    function totais() { var t = 0, f = 0; G.forEach(function (g) { t += (g.checklist || []).length; f += nFeitos(g); }); return {t: t, f: f, p: t ? Math.round(f / t * 100) : 0}; }
    function primeiraFrase(s) { s = String(s || ''); var m = /^(.+?[.!?])(\s+|$)/.exec(s); if (!m) return [s, '']; var r = s.slice(m[0].length); return r.length < 45 ? [s, ''] : [m[1], r]; }
    function curta(s) {
      s = primeiraFrase(s)[0].replace(/[.!?]+$/, '');
      if (s.length <= 74) return s;
      var c = s.slice(0, 74), i = c.lastIndexOf(' '); c = (i > 40 ? c.slice(0, i) : c).replace(/[\s,;:\-—]+$/, '');
      return c + '…';
    }
    function quebra(p) {
      p = String(p); var i = p.indexOf(':'), h, t;
      if (i > 3 && i < 110) { h = p.slice(0, i); t = p.slice(i + 1).trim(); }
      else if ((i = p.indexOf(' — ')) > 3 && i < 110) { h = p.slice(0, i); t = p.slice(i + 3).trim(); }
      else { h = p; t = ''; }
      return [h, t];
    }
    function anel(p, r) {
      var c = 2 * Math.PI * r;
      return '<svg viewBox="0 0 100 100" class="hg-anel-svg" aria-hidden="true"><circle cx="50" cy="50" r="' + r + '" class="hg-a0"/><circle cx="50" cy="50" r="' + r + '" class="hg-a1" data-hg-arc stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - p / 100)).toFixed(1) + '" transform="rotate(-90 50 50)"/></svg>';
    }
    function cont() { for (var i = 0; i < G.length; i++) if (pct(G[i]) < 100) return i; return 0; }

    /* ---------- grade: atualiza só o progresso (sem re-render) ---------- */
    function marcas() {
      G.forEach(function (g) {
        var e = box.querySelector('[data-cap="' + g.id + '"]'); if (!e) return;
        var p = pct(g), b = e.querySelector('[data-hg-cb]'), t = e.querySelector('[data-hg-ct]');
        e.classList.toggle('feito', p === 100);
        if (b) b.style.width = p + '%';
        if (t) t.textContent = p === 100 ? '✓ completo' : nFeitos(g) + ' de ' + (g.checklist || []).length;
      });
      var t = totais(), h = box.querySelector('[data-hg-tot]'), a = box.querySelector('[data-hg-arc]'), pc = box.querySelector('[data-hg-pc]');
      if (h) h.textContent = t.f + ' de ' + t.t + ' itens marcados';
      if (pc) pc.textContent = t.p + '%';
      if (a) { var c = 2 * Math.PI * 42; a.setAttribute('stroke-dashoffset', (c * (1 - t.p / 100)).toFixed(1)); }
    }

    /* ---------- painel (modal) ---------- */
    var modal = null, atual = -1, retorno = null;
    function corpo(i) {
      var g = G[i], ant = G[i - 1], prox = G[i + 1], fr = primeiraFrase(g.resumo), er = ER[g.id], C = g.checklist || [], n = nFeitos(g), P = (g.pontos || []).slice(0, 5), f = fase(g);
      return '<header class="hg-cab" data-f="' + f + '"><span class="hg-num">' + esc(num(g)) + '</span><div><p class="hg-eyebrow">' + (FASES[f] ? 'Fase ' + (f + 1) + ' · ' + esc(FASES[f].n) : 'Capítulo') + '</p><h2 id="hg-t" tabindex="-1">' + esc(nome(g)) + '</h2></div></header>' +
        '<p class="hg-ideia">' + esc(fr[0]) + '</p>' +
        (fr[1] ? '<details class="hg-ctx"><summary>Mais contexto</summary><p>' + esc(fr[1]) + '</p></details>' : '') +
        (P.length ? '<section class="hg-sec"><h3 class="hg-h">O que não pode faltar</h3><div class="hg-pontos">' + P.map(function (p, k) {
          var b = quebra(p), longo = b[1].length > 120;
          return '<article class="hg-ponto"><span class="hg-pn">' + (k + 1) + '</span><h4>' + esc(b[0]) + '</h4>' +
            (b[1] ? '<p class="hg-tail">' + esc(b[1]) + '</p>' + (longo ? '<button type="button" class="hg-mais" data-hg-mais aria-expanded="false">ler mais</button>' : '') : '') + '</article>';
        }).join('') + '</div></section>' : '') +
        tecnica(g.id) + (er ? '<section class="hg-sec"><h3 class="hg-h">Erro comum × Como fazer</h3><div class="hg-vs"><div class="hg-erro"><span>Erro comum</span><p>' + esc(er[0]) + '</p></div><div class="hg-certo"><span>Como fazer</span><p>' + esc(er[1]) + '</p></div></div></section>' : '') +
        '<section class="hg-sec"><div class="hg-chk-cab"><h3 class="hg-h">Seu checklist</h3><span class="hg-chk-n"><b data-hg-n>' + n + '</b> de ' + C.length + '</span></div>' +
        '<div class="hg-barra" role="progressbar" aria-label="Progresso do capítulo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct(g) + '"><i data-hg-bar style="width:' + pct(g) + '%"></i></div>' +
        '<div class="hg-chk">' + C.map(function (c, k) { var key = g.id + ':' + k; return '<label><input type="checkbox" data-chk="' + esc(key) + '"' + (feitos[key] ? ' checked' : '') + '><span class="hg-cx" aria-hidden="true"></span><span class="hg-ct">' + esc(c) + '</span></label>'; }).join('') + '</div>' +
        '<p class="hg-ok" data-hg-ok' + (C.length && n === C.length ? '' : ' hidden') + '>Capítulo completo. Siga para o próximo.</p></section>' +
        '<div class="hg-nav">' + (ant ? '<button type="button" class="btn-linha" data-gc="' + esc(ant.id) + '">← Anterior</button>' : '<span></span>') + (prox ? '<button type="button" class="btn-azul" data-gc="' + esc(prox.id) + '">Próximo →</button>' : '<span></span>') + '</div>';
    }
    function tecnica(id) {
      var t = TEC[id]; if (!t) return '';
      return '<section class="hg-sec hg-tec"><h3 class="hg-h">A técnica em 3 passos</h3><ol class="hg-passos">' + t.p.map(function (s, k) { return '<li><b>' + (k + 1) + '</b><span>' + esc(s) + '</span></li>'; }).join('') + '</ol>' +
        '<div class="hg-vs"><div class="hg-erro"><span>Exemplo ruim</span><p>“' + esc(t.ruim) + '”</p></div><div class="hg-certo"><span>Exemplo bom</span><p>“' + esc(t.bom) + '”</p></div></div>' +
        '<div class="hg-modelo"><h3 class="hg-h">Frase-modelo</h3><p data-hg-fm>' + esc(t.m) + '</p><button type="button" class="hg-copia" data-hg-copia>Copiar</button></div></section>';
    }
    function marcasModal() {
      if (!modal || atual < 0) return;
      var g = G[atual], b = modal.querySelector('[data-hg-bar]'), n = modal.querySelector('[data-hg-n]'), ok = modal.querySelector('[data-hg-ok]'), C = (g.checklist || []).length;
      if (b) { b.style.width = pct(g) + '%'; if (b.parentNode) b.parentNode.setAttribute('aria-valuenow', pct(g)); }
      if (n) n.textContent = nFeitos(g);
      if (ok) ok.hidden = !(C && nFeitos(g) === C);
    }
    function focaveis() { return [].slice.call(modal.querySelectorAll('a[href],button:not([disabled]),input,summary,[tabindex]:not([tabindex="-1"])')).filter(function (x) { return x.offsetParent !== null; }); }
    function teclas(e) {
      if (!modal) return;
      if (e.key === 'Escape') { e.preventDefault(); fecha(true); return; }
      if (e.key !== 'Tab') return;
      var l = focaveis(); if (!l.length) return;
      var a = document.activeElement, p = l[0], u = l[l.length - 1];
      if (!modal.contains(a)) { e.preventDefault(); p.focus(); }
      else if (e.shiftKey && (a === p || a === modal.querySelector('.hg-caixa'))) { e.preventDefault(); u.focus(); }
      else if (!e.shiftKey && a === u) { e.preventDefault(); p.focus(); }
    }
    function sai() { if (location.hash.indexOf('#/guia') !== 0) fecha(false); }
    function mostra(i) {
      atual = i;
      var c = modal.querySelector('.hg-corpo-m'); c.innerHTML = corpo(i);
      modal.querySelector('.hg-caixa').scrollTop = 0;
      var h = c.querySelector('#hg-t'); if (h) h.focus({preventScroll: true});
    }
    function abre(i, viaClique) {
      if (i < 0 || i >= G.length) return;
      if (!modal) {
        retorno = document.activeElement;
        modal = document.createElement('div'); modal.id = 'hg-modal'; modal.className = 'hg-modal';
        modal.innerHTML = '<div class="hg-veu" data-hg-x></div><div class="hg-caixa" role="dialog" aria-modal="true" aria-labelledby="hg-t" tabindex="-1"><button type="button" class="hg-fecha" data-hg-x aria-label="Fechar">×</button><div class="hg-corpo-m"></div></div>';
        document.body.appendChild(modal);
        document.documentElement.classList.add('hm-trava');
        document.addEventListener('keydown', teclas, true);
        window.addEventListener('hashchange', sai);
        modal.addEventListener('click', function (e) {
          if (e.target.closest('[data-hg-x]')) { fecha(true); return; }
          var b = e.target.closest('button[data-gc]'), m = e.target.closest('[data-hg-mais]'), cp = e.target.closest('[data-hg-copia]');
          if (cp) { var fm = cp.parentNode.querySelector('[data-hg-fm]'); copiar(fm ? fm.textContent : '', cp); return; }
          if (b) { var j = idx(b.getAttribute('data-gc')); if (j >= 0) { mostra(j); try { history.replaceState(null, '', '#/guia/' + G[j].id); } catch (x) {} } return; }
          if (m) { var card = m.closest('.hg-ponto'), on = !card.classList.contains('aberto'); card.classList.toggle('aberto', on); m.setAttribute('aria-expanded', String(on)); m.textContent = on ? 'ler menos' : 'ler mais'; }
        });
        modal.addEventListener('change', function (e) {
          var k = e.target.getAttribute && e.target.getAttribute('data-chk'); if (!k) return;
          if (e.target.checked) feitos[k] = 1; else delete feitos[k];
          try { localStorage.setItem('atlas-guia', JSON.stringify(feitos)); } catch (x) {}
          marcasModal(); marcas();
        });
        requestAnimationFrame(function () { if (modal) modal.classList.add('on'); });
      }
      mostra(i);
      try { history.replaceState(null, '', '#/guia/' + G[i].id); } catch (x) {}
    }
    function fecha(volta) {
      if (!modal) return;
      var m = modal; modal = null; atual = -1;
      document.removeEventListener('keydown', teclas, true);
      window.removeEventListener('hashchange', sai);
      document.documentElement.classList.remove('hm-trava');
      m.classList.remove('on');
      setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 180);
      if (volta) { try { history.replaceState(null, '', '#/guia'); } catch (x) {} }
      marcas();
      if (retorno && retorno.focus && document.contains(retorno)) { try { retorno.focus({preventScroll: true}); } catch (x) {} }
      retorno = null;
    }
    if (window.__hgFecha) { try { window.__hgFecha(false); } catch (e) {} }
    window.__hgFecha = fecha;

    var pedido = sub || ((/(?:^|&)aba=([^&]*)/.exec(q || '') || [])[1] || '');
    try { pedido = decodeURIComponent(pedido); } catch (e) {}
    var ini = idx(pedido);

    if (!mesma || !box.querySelector('.hg-grade')) {
      var tt = totais();
      var dir = '<div class="hg-prog"><div class="hg-anel-g">' + anel(tt.p, 42) + '<b data-hg-pc>' + tt.p + '%</b></div><p class="hg-prog-t" data-hg-tot>' + tt.f + ' de ' + tt.t + ' itens marcados</p><button type="button" class="btn-azul peq" data-hg-cont>Continuar de onde parei</button></div>';
      var fx = window.AV2_UTIL.faixa(A, {olho: 'Guia do Bom Projeto · ' + G.length + ' capítulos', tit: 'O que decide um projeto,<br><em>capítulo por capítulo</em>', txt: 'Escolha um capítulo: <b>ideia central, pontos críticos e um checklist</b> para marcar.', dir: dir});
      box.innerHTML = fx + '<div class="wrap hg-corpo"><ul class="hg-leg" aria-label="Fases do projeto">' + FASES.map(function (f, k) { return '<li data-f="' + k + '"><i></i>' + esc(f.n) + '</li>'; }).join('') + '</ul>' +
        '<div class="hg-grade" role="list">' + G.map(function (g) {
          var p = pct(g), C = (g.checklist || []).length;
          return '<button type="button" role="listitem" class="hg-c' + (p === 100 ? ' feito' : '') + '" data-cap="' + esc(g.id) + '" data-f="' + fase(g) + '" aria-haspopup="dialog">' +
            '<span class="hg-c-n">' + esc(num(g)) + '</span><span class="hg-c-t">' + esc(nome(g)) + '</span><span class="hg-c-i">' + esc(TEC[g.id] ? TEC[g.id].ap : curta(g.resumo)) + '</span>' +
            '<span class="hg-c-b"><i data-hg-cb style="width:' + p + '%"></i></span><span class="hg-c-p" data-hg-ct>' + (p === 100 ? '✓ completo' : nFeitos(g) + ' de ' + C) + '</span></button>';
        }).join('') + '</div></div>';
      if (window.AV2_UTIL.ativaCampos) window.AV2_UTIL.ativaCampos(A, box);
    } else marcas();

    box.onclick = function (e) {
      var a = e.target.closest('button[data-cap]'), c = e.target.closest('[data-hg-cont]');
      if (a) { retorno = null; abre(idx(a.getAttribute('data-cap'))); if (modal) retorno = a; return; }
      if (c) { abre(cont()); if (modal) retorno = c; }
    };
    box.onkeydown = null; box.onchange = null; box.oninput = null;
    if (ini >= 0) abre(ini);
  };

  /* ======================================================================
     2. CARTÕES ENXUTOS + MODAL
     ====================================================================== */
  var MAX_FATOS = 3, MAX_TAGS = 3;
  function txt(n) { return (n && n.textContent || '').replace(/\s+/g, ' ').trim(); }
  function rotulo(l) { var s = l.firstElementChild; return txt(s); }
  function prio(label, valor) {
    var p;
    if (/valor|quanto|aporte|benef[ií]cio|investimento|montante/i.test(label)) p = 0;
    else if (/prazo|status|situa|vig[eê]ncia|encerra/i.test(label)) p = 1;
    else if (/modalidade|recurso|tipo|instrumento|natureza/i.test(label)) p = 2;
    else if (/onde|local|canal|abrang/i.test(label)) p = 3;
    else if (/nota|para quem|dom[ií]nios|plataformas|credenciad|pncp|para o brasil|vencedores|p[uú]blico/i.test(label)) p = 8;
    else p = 5;
    return p;
  }
  function externo(a) {
    var h = a.getAttribute('href') || '';
    if (/^www\./i.test(h)) { a.setAttribute('href', 'https://' + h); h = a.getAttribute('href'); }
    if (!/^https?:\/\//i.test(h)) return false;
    try { return new URL(h, location.href).host !== location.host; } catch (e) { return false; }
  }
  function marcaLink(a) { if (externo(a)) { if (a.getAttribute('target') !== '_blank') a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); } }
  function marcaExternos(raiz) { (raiz || document).querySelectorAll('a[href]').forEach(marcaLink); }

  function enxuga(card) {
    if (card.hasAttribute('data-hum')) return; card.setAttribute('data-hum', '1'); card.classList.add('hum-card');
    var linhas = [].slice.call(card.querySelectorAll('.op-linhas > .op-linha')).filter(function (l) { return !l.closest('.op-det'); });
    var cand = linhas.map(function (l, k) { var v = l.children[1], len = txt(v).length, p = prio(rotulo(l), v); if (len > 110) p += 10; return {l: l, p: p, k: k}; });
    var ord = cand.slice().sort(function (a, b) { return a.p - b.p || a.k - b.k; }), mostra = [];
    /* primeira leitura: só valor e prazo/status (prio 0 e 1); se não houver nenhum, 1 fato curto (prio até 3) */
    ord.forEach(function (c) { if (mostra.length < MAX_FATOS && c.p <= 1) mostra.push(c); });
    if (!mostra.length) ord.forEach(function (c) { if (!mostra.length && c.p <= 3) mostra.push(c); });
    cand.forEach(function (c) { if (mostra.indexOf(c) < 0) c.l.classList.add('hum-oculto'); });
    card.querySelectorAll('.tags').forEach(function (t) {
      if (t.closest('.op-det')) return;
      var tags = [].slice.call(t.children).filter(function (x) { return x.classList.contains('tag') && !x.classList.contains('mais'); });
      var jaMais = t.querySelector('.tag.mais');
      if (tags.length > MAX_TAGS) {
        tags.slice(MAX_TAGS).forEach(function (x) { x.classList.add('hum-oculto'); });
        if (jaMais) jaMais.textContent = '+' + (tags.length - MAX_TAGS + (parseInt(jaMais.textContent.replace(/\D/g, ''), 10) || 0));
        else { var s = document.createElement('span'); s.className = 'tag mais hum-sint'; s.textContent = '+' + (tags.length - MAX_TAGS); t.appendChild(s); }
      }
    });
    var base = card.querySelector('.op-base');
    /* rodapé do cartão: só o prazo; fonte, instrumento e links vão para o modal (guardamos o original) */
    var fo = base && base.querySelector('.fonte');
    if (fo) {
      card._hmFonte = fo.cloneNode(true);
      var tp = /(Prazo|Abriu|Encerra[^·]*|Conferido|Data)[^·]*/i.exec(txt(fo)), pz = /Prazo[^·]*/i.exec(txt(fo));
      if (pz) { fo.textContent = pz[0].trim(); fo.classList.add('hum-prazo'); } else fo.classList.add('hum-oculto');
    }
    var b = document.createElement('button'); b.type = 'button'; b.className = 'hum-mais'; b.setAttribute('aria-haspopup', 'dialog');
    var lkI = card.querySelector('h3 a[href^="#/"]'), temPag = lkI && /^#\/(agentes|dna|icts|instrumentos)\//.test(lkI.getAttribute('href'));
    b.innerHTML = (temPag ? 'Abrir página' : 'Ver detalhes') + ' <span aria-hidden="true">›</span>';
    if (base) base.appendChild(b); else card.appendChild(b);
    marcaExternos(card);
  }
  /* coluna de filtros mais leve: 2 grupos principais abertos (e os que têm marcação), resto recolhido; 6 opções + "mostrar todas" */
  var MAX_ABERTOS = 2, MAX_OPC = 6;
  function leveFiltros() {
    document.querySelectorAll('.filtros-col').forEach(function (col) {
      var gs = [].slice.call(col.querySelectorAll('details.f-grupo:not([data-hf])'));
      if (!gs.length) return;
      var todos = [].slice.call(col.querySelectorAll('details.f-grupo'));
      gs.forEach(function (d) {
        d.setAttribute('data-hf', '1');
        var marcado = !!d.querySelector('input:checked'), pos = todos.indexOf(d);
        if (!marcado) { if (pos < MAX_ABERTOS) d.setAttribute('open', ''); else d.removeAttribute('open'); }
        var box = d.querySelector('.f-opcoes'); if (!box) return;
        var ls = [].slice.call(box.children).filter(function (x) { return x.tagName === 'LABEL'; });
        if (ls.length > MAX_OPC + 1) {
          var extra = ls.slice(MAX_OPC).filter(function (l) { return !l.querySelector('input:checked'); });
          if (extra.length > 1) {
            extra.forEach(function (l) { l.classList.add('hf-extra'); });
            var b = document.createElement('button'); b.type = 'button'; b.className = 'hf-todas'; b.textContent = 'Mostrar todas (' + ls.length + ')';
            b.addEventListener('click', function () { var on = box.classList.toggle('hf-tudo'); b.textContent = on ? 'Mostrar menos' : 'Mostrar todas (' + ls.length + ')'; });
            box.appendChild(b);
          }
        }
      });
    });
  }
  function varre() {
    leveFiltros();
    document.querySelectorAll('.op:not([data-hum])').forEach(function (c) { if (!c.closest('.hm-modal')) enxuga(c); });
    marcaExternos(document);
  }

  /* ---------- modal ---------- */
  var modal = null, retorno = null;
  function clonaValor(n) {
    var c = n.cloneNode(true);
    c.querySelectorAll('.hum-oculto').forEach(function (x) { if (x.classList.contains('hum-sint')) x.remove(); else x.classList.remove('hum-oculto'); });
    c.querySelectorAll('.tag.mais:not(.hum-sint)').forEach(function (x) { if (/^\+\d+$/.test(txt(x))) x.remove(); });
    c.removeAttribute('style'); c.classList.remove('hum-oculto'); marcaExternos(c);
    return c;
  }
  function monta(card) {
    var sigla = card.querySelector('.op-sigla'), h3 = card.querySelector('h3'), inst = card.querySelector('.op-inst'), ha = h3 && h3.querySelector('a');
    var titulo = txt(h3) || txt(sigla), cab = [txt(sigla), txt(inst), titulo].join(' ');
    var pagina = '', ext = '', extRot = 'Abrir no site oficial';
    if (ha) { var hr = ha.getAttribute('href') || ''; if (/^#\//.test(hr)) pagina = hr; else if (externo(ha)) ext = hr; }
    var rows = [], mapa = {};
    function norm(s) { return s.toLowerCase().replace(/[^a-z0-9à-ú]/g, ''); }
    function add(label, node, sobrescreve) {
      var k = norm(label); if (!k || !txt(node) && !node.querySelector('a')) return;
      if (mapa[k] != null) { if (sobrescreve) rows[mapa[k]].node = node; return; }
      mapa[k] = rows.length; rows.push({label: label, node: node});
    }
    card.querySelectorAll('.op-linhas > .op-linha').forEach(function (l) { if (l.closest('.op-det') || !l.children[1]) return; add(rotulo(l), clonaValor(l.children[1])); });
    card.querySelectorAll('.op-det dl > div').forEach(function (d) {
      var dt = d.querySelector('dt'), dd = d.querySelector('dd'); if (!dt || !dd) return;
      var v = txt(dd); if (!v || v === '—') return;
      add(txt(dt), clonaValor(dd), true);
    });
    card.querySelectorAll('.op-det .op-linhas > .op-linha').forEach(function (l) { if (l.children[1]) add(rotulo(l), clonaValor(l.children[1]), true); });
    var dba = card.querySelector('.op-det a.btn-azul'); if (dba) { var h = dba.getAttribute('href'); if (externo(dba)) { ext = ext || h; if (h === ext) extRot = txt(dba).replace(/\s*↗\s*$/, '') || extRot; } }
    if (!ext) { var oa = [].slice.call(card.querySelectorAll('.op-base a, .op-linha a')).concat([].slice.call(card._hmFonte ? card._hmFonte.querySelectorAll('a') : [])).filter(externo)[0]; if (oa) ext = oa.getAttribute('href'); }
    var resumoEl = card.querySelector('.op-resumo, .op-txt'), resumo = txt(resumoEl);
    var nota = card.querySelector('.op-nota'), notaT = txt(nota);
    rows = rows.filter(function (r) {
      var v = txt(r.node), nl = norm(r.label);
      if (resumo && v && (resumo.indexOf(v.slice(0, 80)) === 0 || v.indexOf(resumo.slice(0, 80)) === 0) && v.length > 40) return false;
      if (notaT && v && /nota/.test(nl) && notaT.indexOf(v.slice(0, 60)) >= 0 && v.length >= notaT.length) return false;
      if (v && v.length < 90 && cab.toLowerCase().indexOf(v.toLowerCase()) >= 0 && !/valor|prazo|modalidade/.test(nl)) return false;
      return true;
    });
    if (notaT) { var tem = rows.some(function (r) { return /^nota/.test(norm(r.label)); }); if (tem) notaT = ''; }
    var tiles = [], resto = [];
    rows.forEach(function (r) { var p = prio(r.label), t = txt(r.node); if (p <= 3 && t.length <= 60 && tiles.length < 3) tiles.push(r); else resto.push(r); });
    var nums = card.querySelector('.op-nums'), st = card.querySelector('.op-base .status'), fonte = card._hmFonte || card.querySelector('.op-base .fonte');
    var el = document.createElement('div'); el.className = 'hm-modal'; el.innerHTML = '<div class="hm-veu" data-hm-fecha></div><div class="hm-caixa" role="dialog" aria-modal="true" aria-labelledby="hm-t" tabindex="-1">' +
      '<button type="button" class="hm-x" data-hm-fecha aria-label="Fechar">×</button><div class="hm-corpo"><header class="hm-cab">' +
      (sigla ? '<p class="hm-eyebrow">' + sigla.innerHTML + '</p>' : '') + '<h2 id="hm-t">' + esc(titulo) + '</h2>' + (inst ? '<p class="hm-inst">' + esc(txt(inst)) + '</p>' : '') +
      (st ? '<p class="hm-st"></p>' : '') + '</header><div class="hm-tiles"></div><div class="hm-nums"></div>' + (resumo ? '<p class="hm-resumo">' + esc(resumo) + '</p>' : '') +
      (notaT ? '<p class="hm-nota">' + esc(notaT) + '</p>' : '') + '<dl class="hm-dl"></dl><p class="hm-fonte"></p></div>' +
      '<footer class="hm-rodape"></footer></div>';
    if (st) el.querySelector('.hm-st').appendChild(st.cloneNode(true));
    var tl = el.querySelector('.hm-tiles');
    tiles.forEach(function (r) { var d = document.createElement('div'); d.className = 'hm-tile'; var s = document.createElement('span'); s.textContent = r.label; d.appendChild(s); var b = document.createElement('div'); b.className = 'hm-tv'; b.appendChild(r.node); if (/valor|quanto|aporte|benef/i.test(r.label) && (b.textContent || '').trim().length <= 22) b.classList.add('grande'); d.appendChild(b); tl.appendChild(d); });
    if (!tiles.length) tl.remove();
    var nm = el.querySelector('.hm-nums'); if (nums) { var cn = nums.cloneNode(true); cn.classList.add('op-nums'); nm.appendChild(cn); } else nm.remove();
    var dl = el.querySelector('.hm-dl');
    resto.forEach(function (r) { var d = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = r.label; dd.appendChild(r.node); d.appendChild(dt); d.appendChild(dd); dl.appendChild(d); });
    if (!resto.length) dl.remove();
    var ft = el.querySelector('.hm-fonte'); if (fonte) { ft.appendChild(fonte.cloneNode(true)); marcaExternos(ft); } else ft.remove();
    var rod = el.querySelector('.hm-rodape');
    if (ext) { var a = document.createElement('a'); a.className = 'btn-azul'; a.href = ext; a.target = '_blank'; a.rel = 'noopener'; a.textContent = extRot + ' ↗'; rod.appendChild(a); }
    if (pagina) { var p = document.createElement('a'); p.className = ext ? 'btn-linha' : 'btn-azul'; p.href = pagina; p.setAttribute('data-hm-pagina', ''); p.textContent = 'Ver página completa →'; rod.appendChild(p); }
    var fec = document.createElement('button'); fec.type = 'button'; fec.className = 'btn-txt hm-fecha2'; fec.setAttribute('data-hm-fecha', ''); fec.textContent = 'Fechar'; rod.appendChild(fec);
    return el;
  }
  function focaveis() { return [].slice.call(modal.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function (x) { return x.offsetParent !== null; }); }
  function abre(card) {
    if (modal) fecha(true);
    retorno = document.activeElement && document.activeElement !== document.body ? document.activeElement : card.querySelector('.hum-mais');
    modal = monta(card); document.body.appendChild(modal);
    document.documentElement.classList.add('hm-trava');
    requestAnimationFrame(function () { if (!modal) return; modal.classList.add('on'); var x = modal.querySelector('.hm-x'); if (x) x.focus({preventScroll: true}); });
  }
  function fecha(rapido) {
    if (!modal) return; var m = modal; modal = null; document.documentElement.classList.remove('hm-trava');
    m.classList.remove('on'); setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, rapido ? 0 : 160);
    if (retorno && document.contains(retorno) && !rapido) { try { retorno.focus({preventScroll: true}); } catch (e) {} } retorno = null;
  }
  document.addEventListener('keydown', function (e) {
    if (!modal) return;
    if (e.key === 'Escape') { e.preventDefault(); fecha(); return; }
    if (e.key === 'Tab') {
      var f = focaveis(); if (!f.length) { e.preventDefault(); return; }
      var i = f.indexOf(document.activeElement), ult = f.length - 1;
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[ult].focus(); }
      else if (!e.shiftKey && (i === ult || i < 0)) { e.preventDefault(); f[0].focus(); }
    }
  }, true);
  window.addEventListener('hashchange', function () { fecha(true); });

  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) return;
    var al = t.closest('a[href]'); if (al) marcaLink(al);
    if (modal) {
      if (t.closest('[data-hm-fecha]')) { fecha(); return; }
      var pg = t.closest('[data-hm-pagina]'); if (pg) { fecha(true); return; }
      return;
    }
    var card = t.closest('.hum-card'); if (!card) return;
    var mais = t.closest('.hum-mais');
    if (!mais) {
      if (e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      var h3a = t.closest('h3 a');
      if (t.closest('button, input, select, textarea, label, summary, .estrela') || (al && !h3a)) return;
      if (window.getSelection && String(window.getSelection()).length > 0 && !h3a) return;
      if (t.closest('details') && !t.closest('summary')) return;
    }
    /* cartão com página própria no Atlas (financiador, empresa, ICT, instrumento): vai direto para a página, sem modal repetindo o cartão */
    var interno = card.querySelector('h3 a[href^="#/"]');
    if (interno && /^#\/(agentes|dna|icts|instrumentos)\//.test(interno.getAttribute('href'))) { e.preventDefault(); location.hash = interno.getAttribute('href'); return; }
    e.preventDefault(); abre(card);
  });

  /* ---------- observer ---------- */
  var tm = null;
  function agenda() { if (tm) return; tm = setTimeout(function () { tm = null; try { varre(); } catch (er) { if (window.console) console.warn('telas12', er); } }, 60); }
  function inicia() {
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) { var m = ms[i]; if (m.target && m.target.closest && m.target.closest('.hm-modal')) continue; if (m.addedNodes && m.addedNodes.length) { agenda(); return; } }
    }).observe(document.body, {childList: true, subtree: true});
    varre();
  }
  if (document.body) inicia(); else document.addEventListener('DOMContentLoaded', inicia);

  /* Rede de segurança: cartões .op.entra inseridos depois da carga também aparecem (sem isso ficam invisíveis) */
  (function () {
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove('entra'); en.target.classList.add('visto'); io.unobserve(en.target); } }); }, {rootMargin: '0px 0px -5% 0px'}) : null;
    var t = null;
    function varreEntra() { t = null; [].forEach.call(document.querySelectorAll('.op.entra:not([data-io])'), function (el) { el.setAttribute('data-io', '1'); if (io) io.observe(el); else { el.classList.remove('entra'); el.classList.add('visto'); } }); }
    if (window.MutationObserver) new MutationObserver(function () { if (!t) t = setTimeout(varreEntra, 80); }).observe(document.body, {childList: true, subtree: true});
    varreEntra();
  })();
})();
