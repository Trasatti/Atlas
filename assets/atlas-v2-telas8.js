/* Atlas v2 · Compras públicas no formato das outras listas: Oportunidades, Quem compra, Histórico de compras de inovação e CPSI do Radar. */
(function () {
  'use strict';
  var T = window.AV2_TELAS, U = window.AV2_UTIL, D = window.ATLAS2, IDX = window.ATLAS2_IDX || {raiz: {}};
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function br(n) { return Number(n || 0).toLocaleString('pt-BR'); }
  var C = D.compras || {}, OP = (C.ATLAS_COMPRAS || {}).itens || [], QC = (C.ATLAS_COMPRADORES || {}).entidades || [], HI = (C.COMPRAS_INOV_HIST || {}).compras || [];
  var ESF = {federal: 'Federal', estadual: 'Estadual', municipal: 'Municipal', 'empresa-publica': 'Empresa pública', 'sociedade-economia-mista': 'Sociedade de economia mista', autarquia: 'Autarquia', 'sistema-s': 'Sistema S', consorcio: 'Consórcio'};
  function rotEsf(k) { return ESF[k] || String(k || '—').replace(/-/g, ' ').replace(/^./, function (x) { return x.toUpperCase(); }); }
  T.compras = function (A, sub, q, box, mesma) {
    var aba = sub === 'quem' ? 'quem' : sub === 'historico' ? 'historico' : sub === 'radar' ? 'radar' : 'oportunidades';
    var cpsi = D.chamadas.filter(function (c) { return /compra|cpsi|encomenda/i.test([c.categoria, c.titulo, (c.tags || []).join(' ')].join(' ')); });
    function sit(x) { if (!x.encerramento) return 'aberta'; var d = A.dias(x.encerramento); return d < 0 ? 'encerrada' : d <= 7 ? 'semana' : 'aberta'; }
    var empVenc = (function () { var s = {}; HI.forEach(function (x) { (x.v || []).forEach(function (v) { s[v.r || v.n] = 1; }); }); return Object.keys(s).length; })();
    var qConf = QC.filter(function (e) { return !e.aVerificar; });
    var abertas = OP.filter(function (x) { return sit(x) !== 'encerrada'; });
    var subAbas = '<div class="sub-abas" role="tablist" aria-label="Seções de Compras públicas">' + [['oportunidades', '', 'Oportunidades abertas'], ['quem', '/quem', 'Quem compra'], ['historico', '/historico', 'Histórico de compras de inovação'], ['radar', '/radar', 'CPSI e encomendas no Radar']].map(function (a) { return '<a role="tab" href="#/compras' + a[1] + '" class="chip" aria-pressed="' + (aba === a[0]) + '">' + a[2] + '</a>'; }).join('') + '</div>';
    var abas = U.abasDinheiro('compras');
    var faixa = {olho: 'Compras públicas de tecnologia e inovação · venda, não fomento', tit: 'O Estado como<br><em>primeiro cliente</em>', txt: 'Onde vender software e inovação: <b>oportunidades abertas</b> de órgãos e estatais, <b>quem compra</b> e por qual canal, e o <b>histórico de CPSI, encomendas tecnológicas e diálogos competitivos</b>, com os vencedores.',
      num: [br(abertas.length), 'oportunidades abertas'], quebra: [[br(QC.length), 'compradores mapeados'], [br(HI.length), 'compras de inovação no histórico'], [br(cpsi.filter(function (c) { return c.status !== 'encerrada'; }).length), 'CPSI no Radar']], abas: abas};
    function fx(num, quebra) { var f = {}; Object.keys(faixa).forEach(function (k) { f[k] = faixa[k]; }); f.num = num; f.quebra = quebra; return f; }
    var semana = abertas.filter(function (x) { return sit(x) === 'semana'; }), prox = abertas.filter(function (x) { return x.encerramento && A.dias(x.encerramento) >= 0; }).sort(function (a, b) { return a.encerramento < b.encerramento ? -1 : 1; })[0];
    if (aba === 'oportunidades') return U.catalogo(A, box, {
      chave: 'compras', titulo: 'Oportunidades', placeholder: 'Órgão, objeto ou título', genero: 'a', contagemRot: ['oportunidade', 'oportunidades'], selos: subAbas,
      faixa: fx([br(abertas.length), 'oportunidades abertas'], [[br(semana.length), 'encerram em 7 dias'], [prox ? (A.dias(prox.encerramento) === 0 ? 'hoje' : A.fdata(prox.encerramento).slice(0, 5)) : '—', 'próximo prazo' + (prox ? ' · ' + prox.orgao : '')], [br(QC.length), 'compradores mapeados']]),
      aviso: 'Compra pública é venda: o órgão contrata e paga pela solução. Não é fomento. Atualizado em ' + A.fdata((C.ATLAS_COMPRAS || {}).atualizado) + '.',
      itens: OP, padrao: {sit: ['aberta', 'semana']},
      grupos: [{k: 'sit', t: 'Situação', aberto: true, val: function (x) { return [sit(x)]; }, rot: {aberta: 'Aberta', semana: 'Encerra em 7 dias', encerrada: 'Encerrada'}, ordem: ['semana', 'aberta', 'encerrada']},
        {k: 'classe', t: 'Classe', aberto: true, val: function (x) { return [x.classe || '—']; }}, {k: 'esfera', t: 'Esfera', val: function (x) { return [x.esfera || '—']; }, rot: rotEsf},
        {k: 'uf', t: 'UF', val: function (x) { return [x.uf || '—']; }, ordem: 'alfa'}, {k: 'mod', t: 'Modalidade', val: function (x) { return [x.modalidade || '—']; }}],
      busca: function (x) { return [x.titulo, x.orgao, x.objeto, x.nota].join(' '); },
      ordens: [['prazo', 'Prazo mais próximo', function (a, b) { return (a.encerramento || '9999') < (b.encerramento || '9999') ? -1 : 1; }], ['orgao', 'Órgão', function (a, b) { return String(a.orgao).localeCompare(b.orgao, 'pt-BR'); }]],
      cartao: function (x) { var s = sit(x), d = x.encerramento ? A.dias(x.encerramento) : null;
        return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla">' + esc(x.orgao || '') + ' · ' + esc(rotEsf(x.esfera)) + (x.uf ? ' · ' + esc(x.uf) : '') + '</p><h3><a href="' + esc(x.link || '#') + '" target="_blank" rel="noopener">' + esc(x.titulo) + '</a></h3></div></div><p class="op-txt">' + esc(x.objeto || '') + '</p>' +
          '<div class="op-linhas">' + (x.valorEstimado || x.valor ? '<div class="op-linha"><span>Valor</span><div class="op-valor" style="font-size:14px">' + esc(typeof (x.valorEstimado || x.valor) === 'number' ? 'R$ ' + (x.valorEstimado || x.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : (x.valorEstimado || x.valor)) + '</div></div>' : '') + '<div class="op-linha"><span>Modalidade</span><div class="tags"><span class="tag">' + esc(x.modalidade || '—') + '</span>' + (x.classe ? '<span class="tag">' + esc(x.classe) + '</span>' : '') + '</div></div>' + (x.nota ? '<div class="op-linha"><span>Nota</span><div style="font-size:13px;color:var(--ink-2)">' + esc(U.primeiro(x.nota, 140)) + '</div></div>' : '') + '</div>' +
          U.detalhes(A, [['Órgão', x.orgao], ['Esfera', rotEsf(x.esfera) + (x.uf ? ' · ' + x.uf : '')], ['Objeto', x.objeto], ['Valor', (x.valorEstimado || x.valor) ? (typeof (x.valorEstimado || x.valor) === 'number' ? 'R$ ' + (x.valorEstimado || x.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : (x.valorEstimado || x.valor)) : ''], ['Modalidade', x.modalidade], ['Classe', x.classe], ['Abertura', x.abertura ? A.fdata(x.abertura) : ''], ['Prazo', x.encerramento ? A.fdata(x.encerramento) : ''], ['Nota', x.nota], ['Fonte', x.fonte], ['Conferido em', x.verificadoEm ? A.fdata(x.verificadoEm) : '']], x.link, 'Abrir no site oficial') +
          '<div class="op-base"><span class="status ' + (s === 'encerrada' ? '' : s === 'semana' ? 'urg' : 'ab') + '">' + (s === 'encerrada' ? 'Encerrada' : x.encerramento ? 'Encerra em ' + d + ' dia' + (d === 1 ? '' : 's') : 'Aberta') + '</span><span class="fonte">' + (x.abertura ? 'Abriu ' + A.fdata(x.abertura) + ' · ' : '') + (x.encerramento ? 'Prazo ' + A.fdata(x.encerramento) + ' · ' : '') + (x.verificadoEm ? 'conferido ' + A.fdata(x.verificadoEm) + ' · ' : '') + '<a href="' + esc(x.link || '#') + '" target="_blank" rel="noopener">' + esc(x.fonte || 'fonte oficial') + ' ↗</a></span></div></article>'; }
    }, q, mesma);
    if (aba === 'quem') return U.catalogo(A, box, {
      chave: 'compras/quem', titulo: 'Quem compra', placeholder: 'Nome ou sigla do órgão', genero: 'o', contagemRot: ['comprador', 'compradores'], selos: subAbas,
      faixa: fx([br(qConf.length), 'compradores com canal confirmado'], [[br(qConf.filter(function (e) { return e.listaSemLogin === 'sim'; }).length), 'lista aberta sem login'], [br(qConf.filter(function (e) { return e.publicaPncp === 'sim' || e.publicaPncp === 'parcial'; }).length), 'publicam no PNCP'], [br(QC.length - qConf.length), 'a verificar (ocultos)']]),
      aviso: br(qConf.length) + ' com canal oficial confirmado; ' + br(QC.length - qConf.length) + ' no diretório ainda a verificar (marque “A verificar” em Situação do cadastro). O cadastro de fornecedor é feito pela própria empresa no site de cada entidade. Atualizado em ' + A.fdata((C.ATLAS_COMPRADORES || {}).atualizado) + '.',
      itens: QC, padrao: {verif: ['Conferido']},
      grupos: [{k: 'tipo', t: 'Tipo de entidade', aberto: true, val: function (e) { return [e.tipo || '—']; }}, {k: 'esfera', t: 'Esfera', aberto: true, val: function (e) { return [e.esfera || '—']; }, rot: rotEsf},
        {k: 'uf', t: 'UF', val: function (e) { return [e.uf || '—']; }, ordem: 'alfa'}, {k: 'plat', t: 'Plataforma de compras', val: function (e) { return [].concat(e.plataformas || []).length ? [].concat(e.plataformas) : ['—']; }},
        {k: 'pncp', t: 'Publica no PNCP', val: function (e) { return [String(e.publicaPncp || 'não verificado')]; }}, {k: 'lista', t: 'Lista de compras sem login', val: function (e) { return [String(e.listaSemLogin || 'não verificado')]; }}, {k: 'verif', t: 'Situação do cadastro', val: function (e) { return [e.aVerificar ? 'A verificar' : 'Conferido']; }}],
      busca: function (e) { return [e.nome, e.sigla, e.tipo, e.observacao].join(' '); },
      ordens: [['nome', 'Nome (A–Z)', function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); }]],
      cartao: function (e) {
        return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla">' + esc(e.tipo || '') + ' · ' + esc(rotEsf(e.esfera)) + (e.uf ? ' · ' + esc(e.uf) : '') + '</p><h3>' + esc(e.nome) + '</h3></div></div>' +
          '<div class="op-linhas"><div class="op-linha"><span>Canal</span><div style="font-size:13px">' + (e.canalCompras ? '<a href="' + esc(e.canalCompras) + '" target="_blank" rel="noopener">' + esc(e.canalCompras.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) + ' ↗</a>' : '<span style="color:var(--ink-3)">não identificado</span>') + '</div></div>' +
          '<div class="op-linha"><span>Plataformas</span><div class="tags">' + ([].concat(e.plataformas || []).map(function (p) { return '<span class="tag">' + esc(p) + '</span>'; }).join('') || '<span style="font-size:13px;color:var(--ink-3)">—</span>') + '</div></div>' +
          '<div class="op-linha"><span>PNCP</span><div style="font-size:13px;color:var(--ink-2)">' + esc(e.publicaPncp || 'não verificado') + ' · lista sem login: ' + esc(e.listaSemLogin || 'não verificado') + '</div></div>' +
          (e.regulamentoLink ? '<div class="op-linha"><span>Regulamento</span><div style="font-size:13px"><a href="' + esc(e.regulamentoLink) + '" target="_blank" rel="noopener">' + esc(e.regulamentoNome || 'regulamento de compras') + ' ↗</a></div></div>' : '') + '</div>' +
          (e.observacao ? '<p class="op-txt" style="font-size:12.5px;color:var(--ink-3)">' + esc(e.observacao) + '</p>' : '') +
          U.detalhes(A, [['Nome', e.nome], ['Sigla', e.sigla], ['Tipo', e.tipo], ['Esfera', rotEsf(e.esfera) + (e.uf ? ' · ' + e.uf : '')], ['Observação', e.observacao], ['Plataformas', [].concat(e.plataformas || []).join(', ')], ['Publica no PNCP', e.publicaPncp], ['Lista de compras sem login', e.listaSemLogin], ['Situação do cadastro', e.aVerificar ? 'A verificar' : 'Conferido'], ['Conferido em', e.verificadoEm ? A.fdata(e.verificadoEm) : '']], e.canalCompras, 'Abrir o canal de compras') +
          '<div class="op-base"><span class="status ' + (e.aVerificar ? 'urg">A verificar' : 'ab">Conferido') + '</span>' + (e.verificadoEm ? '<span class="fonte">Conferido em ' + A.fdata(e.verificadoEm) + '</span>' : '') + '</div></article>';
      }
    }, q, mesma);
    if (aba === 'historico') return U.catalogo(A, box, {
      chave: 'compras/historico', titulo: 'Histórico de compras de inovação', placeholder: 'Órgão, objeto ou empresa vencedora', genero: 'a', contagemRot: ['compra', 'compras'], selos: subAbas,
      faixa: fx([br(HI.length), 'compras de inovação'], [[br(HI.filter(function (x) { return (x.v || []).length; }).length), 'vitórias com resultado publicado'], [br(empVenc), 'empresas vencedoras'], [br(QC.length), 'compradores mapeados']]),
      aviso: 'CPSI (LC 182/2021), encomendas tecnológicas e diálogos competitivos publicados no PNCP, com a empresa vencedora quando o resultado foi publicado. Só pessoas jurídicas aparecem. Ficam de fora compras em portais próprios (Petrobras, BNDES e outras), e os anos anteriores a 2023 são incompletos. Base de ' + A.fdata((C.COMPRAS_INOV_HIST || {}).gerado) + '.',
      itens: HI,
      grupos: [{k: 'inst', t: 'Instrumento', aberto: true, val: function (x) { return [x.i || '—']; }}, {k: 'venc', t: 'Vencedor', aberto: true, val: function (x) { return [(x.v || []).length ? 'com' : 'sem']; }, rot: {com: 'Com vencedor publicado', sem: 'Sem vencedor publicado'}, ordem: ['com', 'sem']},
        {k: 'uf', t: 'UF', val: function (x) { return [x.uf || '—']; }, ordem: 'alfa'}, {k: 'ano', t: 'Ano', val: function (x) { return [String(x.a || '—')]; }, ordem: 'alfa'}, {k: 'sit', t: 'Situação', val: function (x) { return [x.s || '—']; }}],
      busca: function (x) { return [x.o, x.obj, x.mu, (x.v || []).map(function (v) { return v.n; }).join(' ')].join(' '); },
      ordens: [['data', 'Mais recentes', function (a, b) { return (b.d || '') < (a.d || '') ? -1 : 1; }], ['orgao', 'Órgão', function (a, b) { return String(a.o).localeCompare(b.o, 'pt-BR'); }]],
      cartao: function (x) {
        var venc = (x.v || []).map(function (v) { var id = v.r && IDX.raiz[v.r]; return '<li>' + (id ? '<a href="#/dna/' + encodeURIComponent(id) + '">' + esc(v.n) + '</a>' : esc(v.n)) + (v.val ? ' · ' + esc(typeof v.val === 'number' ? 'R$ ' + br(v.val) : v.val) : '') + '</li>'; }).join('');
        return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla">' + esc(x.i || '') + ' · ' + esc(x.uf || '') + (x.mu ? ' · ' + esc(x.mu) : '') + '</p><h3>' + esc(x.o) + '</h3></div></div><p class="op-txt">' + esc(x.obj || '') + '</p>' +
          (venc ? '<div class="op-linhas"><div class="op-linha"><span>Vencedores</span><ul class="lista-pontos" style="margin:0;font-size:13px">' + venc + '</ul></div></div>' : '') +
          U.detalhes(A, [['Órgão', x.o], ['Instrumento', x.i], ['Local', (x.mu ? x.mu + ' · ' : '') + (x.uf || '')], ['Data', x.d ? A.fdata(x.d) : (x.a ? String(x.a) : '')], ['Situação', x.s], ['Objeto', x.obj], ['Vencedores', (x.v || []).map(function (v) { return v.n + (v.val ? ' (' + (typeof v.val === 'number' ? 'R$ ' + br(v.val) : v.val) + ')' : ''); }).join('; ')]], x.l, 'Ver no PNCP') +
          '<div class="op-base"><span class="status cont">' + esc(x.s || '') + '</span><span class="fonte">' + (x.d ? A.fdata(x.d) + ' · ' : '') + (x.l ? '<a href="' + esc(x.l) + '" target="_blank" rel="noopener">ver no PNCP ↗</a>' : '') + '</span></div></article>';
      }
    }, q, mesma);
    return U.catalogo(A, box, {
      chave: 'compras/radar', titulo: 'CPSI e encomendas no Radar', placeholder: 'Órgão ou tema', genero: 'a', contagemRot: ['chamada', 'chamadas'], faixa: faixa, selos: subAbas,
      itens: cpsi, padrao: {st: ['aberta', 'em-breve']},
      grupos: [{k: 'st', t: 'Situação', aberto: true, val: function (c) { return [c.status]; }, rot: {aberta: 'Aberta', 'em-breve': 'Em breve', encerrada: 'Encerrada'}, ordem: ['aberta', 'em-breve', 'encerrada']}, {k: 'ag', t: 'Comprador', val: function (c) { return [c.agenciaNome || '—']; }}, {k: 'ab', t: 'Abrangência', val: function (c) { return [c.uf || c.abrangencia]; }}],
      busca: function (c) { return [c.titulo, c.agenciaNome, c.resumo].join(' '); },
      ordens: [['prazo', 'Prazo mais próximo', function (a, b) { return (a.encerramento || '9999') < (b.encerramento || '9999') ? -1 : 1; }]],
      cartao: A.cartaoChamada
    }, q, mesma);
  };
})();
