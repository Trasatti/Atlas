/* Atlas v2 · rodada 6 — resumo executivo (TL;DR) no topo das fichas de instrumento e de chamada. */
(function () {
  'use strict';
  var T = window.AV2_TELAS, D = window.ATLAS2;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  /* Primeira oração do texto vira a manchete; o resto, o detalhe */
  function corta(t) {
    t = String(t || '').trim(); if (!t) return ['', ''];
    var m = /^(.{25,110}?)(?:;|:|\.\s|\s\()/.exec(t);
    if (m && m[1].length < t.length - 3) {
      var n = function (s, c) { return s.split(c).length - 1; };
      if (n(m[1], '(') !== n(m[1], ')')) return [t, ''];
      var ab = /\($/.test(m[0]), r = t.slice(m[0].length);
      r = ab ? '(' + r.trim() : r.replace(/^[\s;:,.]+/, '').trim();
      if (n(r, ')') > n(r, '(')) r = r.replace(/\)$/, '').trim();
      return [m[1].trim(), ab ? r : r.charAt(0).toUpperCase() + r.slice(1)];
    }
    if (t.length <= 160) return [t, ''];
    /* Sem pontuação forte: a manchete vai até um parêntese ou ", com/para/desde" (entre 40 e 170 caracteres); o detalhe continua dali, sem repetir */
    var c = /^(.{40,170}?)(?=\s\(|,\s(?:com|para|desde|sem|mediante)\s)/.exec(t);
    if (c) { var rr = t.slice(c[1].length).replace(/^,\s*/, '').trim(); return [c[1].trim(), rr]; }
    var cut = t.slice(0, 150).replace(/\s+\S*$/, '').replace(/[,;:]$/, ''); return [cut + '…', '…' + t.slice(cut.length).replace(/^[,;:]/, '').trim()];
  }
  /* Como corta(), mas nunca perde texto: se não achou fim de oração, o texto todo é a manchete */
  function cortaInt(t) { var r = corta(t), x = r[1], ab = (x.match(/\(/g) || []).length, fe = (x.match(/\)/g) || []).length; return (x === String(t || '').trim() || fe > ab) ? [String(t || '').trim(), ''] : r; }
  var ICO = {
    quem: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="6.5" r="3"/><path d="M4 17c.8-3.4 3.2-5 6-5s5.2 1.6 6 5"/></svg>',
    tema: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 2.5l6.5 3.7v7.6L10 17.5l-6.5-3.7V6.2z"/><path d="M10 10l6.5-3.8M10 10v7.5M10 10L3.5 6.2"/></svg>',
    quanto: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="5" width="15" height="10" rx="2"/><circle cx="10" cy="10" r="2.4"/></svg>',
    financia: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 10.5l3.5 3.5L16 5.5"/></svg>',
    prazo: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7"/><path d="M10 6v4.3l2.8 1.7"/></svg>',
    fora: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7"/><path d="M5.2 14.8l9.6-9.6"/></svg>',
    alerta: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 3l7.5 13h-15z"/><path d="M10 8.5v3.5M10 14.2v.3"/></svg>'
  };
  function item(cor, ico, rot, man, det, extra) {
    if (!man && !det && !extra) return '';
    return '<div class="tl-item" style="--c:' + cor + '"><span class="tl-ico">' + ICO[ico] + '</span><div><p class="tl-rot">' + esc(rot) + '</p>' + (man ? '<p class="tl-man">' + man + '</p>' : '') + (extra || '') + (det ? '<p class="tl-det">' + det + '</p>' : '') + '</div></div>';
  }
  function chips(l) { return l && l.length ? '<div class="tl-chips">' + l.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : ''; }
  function lista(l, n) { return l && l.length ? '<ul class="tl-lista">' + l.slice(0, n || 3).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  var GEN = /^(finep|bndes|embrapii|fndct|cnpq|anp|aneel|antt|credito|fiscal|setorial|subvencao|nao-reembolsavel)$/i;
  function cartao(A, o) {
    return '<section class="tldr" aria-label="Resumo executivo"><div class="tldr-cab"><div><p class="olho">Resumo executivo · o que você precisa saber</p><h2>' + esc(o.titulo) + '</h2></div><div class="tldr-selos">' + (o.selos || '') + '</div></div>' +
      '<div class="tldr-grade">' + o.itens.join('') + '</div>' +
      (o.alerta ? '<div class="tldr-alerta"><span class="tl-ico">' + ICO.alerta + '</span><div><b>Antes de começar</b><p>' + esc(o.alerta) + '</p>' + (o.maisAlertas ? '<a href="#tl-alertas" class="btn-txt" data-ir-alertas>Ver os ' + o.maisAlertas + ' alertas</a>' : '') + '</div></div>' : '') + '</section>';
  }

  /* ---------- Instrumento: ficha especial do Redata e pontes para os dados dos financiadores ---------- */
  function br(n) { return Number(n || 0).toLocaleString('pt-BR'); }
  function carregaFin(cb) {
    if (window.ATLAS2_FIN) return cb();
    var fila = window.__finFila = window.__finFila || [];
    fila.push(cb); if (fila.length > 1) return;
    var sc = document.createElement('script'); sc.src = 'assets/atlas-v2-financiadores.js?v=r91';
    sc.onload = function () { var l = window.__finFila; window.__finFila = null; l.forEach(function (f) { f(); }); };
    sc.onerror = function () { window.__finFila = null; };
    document.body.appendChild(sc);
  }
  var PONTES = {
    'lei-do-bem': {ag: 'mcti', abas: [['leidobem', 'Empresas beneficiárias da Lei do Bem', 'Lista oficial das empresas que usaram o incentivo, por ano-base, de 2014 a 2024.']], num: function (F) { var n = (F.LEIDOBEM_STATS || []).reduce(function (s, x) { return s + x.n; }, 0); return n ? [br(n) + ' registros de empresa por ano-base, de 2014 a 2024 (fonte: MCTI)'] : []; }},
    'lei-informatica': {ag: 'mcti', abas: [['leiinfo', 'Empresas habilitadas na Lei de Informática', 'Empresas habilitadas aos benefícios mediante o cumprimento do Processo Produtivo Básico (PPB).']], num: function () { return []; }},
    'lei-reciclagem': {ag: 'mma', abas: [['reciclagem', 'Propostas em captação na Lei de Incentivo à Reciclagem', 'Propostas em captação, com solicitante, município e valor solicitado (fonte: SINIR+ / MMA).']], num: function () { return []; }},
    'embrapii': {ag: 'embrapii', abas: [['unidades', 'Unidades EMBRAPII', 'As unidades credenciadas, com a competência e as linhas de atuação de cada uma.'], ['numeros', 'Unidades em números', 'Projetos, valor, empresas e pedidos de PI de cada unidade, incluindo as ex-unidades.'], ['areas', 'Áreas e tecnologias', 'Os projetos por área de aplicação e por tecnologia habilitadora.']], num: function (F) { var M = (F.EMBRAPII_METRICAS || {}).meta; return M ? [br(M.n) + ' projetos contratados · ' + br(M.emp) + ' empresas atendidas · ' + M.un_ativas + ' unidades ativas (painel de ' + M.data.split('-').reverse().join('/') + ')'] : []; }},
    'bndes-funttel': {ag: 'bndes', abas: [['funttel', 'Funttel: indicadores 2012–2022 e operações', 'Indicadores do fundo e as 113 operações com recursos do Funttel (BNDES e Finep): 100 de crédito e 13 convênios não reembolsáveis.']], num: function (F) { var n = ((F.FUNTTEL || {}).projetos || []).length; return n ? [br(n) + ' operações de crédito com recursos do Funttel'] : []; }, funttel: true},
    'finep-funttel': {ag: 'finep', abas: [['funttel', 'Funttel: indicadores 2012–2022 e operações', 'As 113 operações com recursos do Funttel (BNDES e Finep): 100 de crédito e 13 convênios não reembolsáveis.']], num: function (F) { var n = ((F.FUNTTEL || {}).projetos || []).length; return n ? [br(n) + ' operações de crédito com recursos do Funttel'] : []; }, funttel: true}
  };
  function redataHTML(R) {
    var e = esc;
    return '<section class="rd"><div class="secao-tit"><h2 class="tit-md">Situação do Redata em ' + e(R.data) + '</h2><span class="selo-t out">Conferido em ' + e(R.data) + '</span></div><p class="txt rd-lede">' + e(R.situacaoLede) + '</p>' +
      '<div class="rd-sit">' + R.situacao.map(function (x) { return '<div class="bloco rd-card' + (x.alerta ? ' alerta-rd' : '') + '"><span>' + e(x.rotulo) + '</span><b>' + e(x.valor) + '</b><p>' + e(x.nota) + '</p></div>'; }).join('') + '</div>' +
      '<div class="secao-tit" style="margin-top:34px"><h2 class="tit-md">Os cinco compromissos da habilitação</h2></div><div class="rd-comp">' + R.compromissos.map(function (c) { return '<div class="bloco rd-c' + (c.destaque ? ' dest' : '') + '"><i>' + e(c.num) + '</i><div><b>' + e(c.titulo) + '</b><p>' + e(c.texto) + '</p><small>' + e(c.art) + '</small></div></div>'; }).join('') + '</div><p class="txt rd-nota">' + e(R.compromissosNota) + '</p>' +
      '<div class="secao-tit" style="margin-top:34px"><h2 class="tit-md">Regimes parecidos com o Redata</h2></div><p class="txt rd-lede">' + e(R.comparacaoLede) + '</p>' +
      '<div class="rola-x"><table class="rd-tab"><thead><tr><th></th>' + R.comparacao.colunas.map(function (c, k) { return '<th class="' + (k ? '' : 'rd-1') + '">' + e(c) + '</th>'; }).join('') + '</tr></thead><tbody>' + R.comparacao.linhas.map(function (l) { return '<tr><th scope="row">' + e(l.rotulo) + '</th>' + l.celulas.map(function (c, k) { return '<td class="' + (k ? '' : 'rd-1') + '">' + e(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div><p class="nota-base">' + e(R.comparacaoFonte) + '</p>' +
      '<div class="secao-tit" style="margin-top:34px"><h2 class="tit-md">Raio-x: o que o regramento deixa em aberto</h2></div><div class="rd-pontos">' + R.pontos.map(function (p) { return '<div class="bloco"><b>' + e(p.titulo) + '</b><p>' + e(p.texto) + '</p><small>' + e(p.art) + '</small></div>'; }).join('') + '</div>' + (R.pontosFonte ? '<p class="nota-base">' + e(R.pontosFonte) + '</p>' : '') + '</section>';
  }
  function especiais(A, i, f) {
    var alvoLinks = f.querySelector('.links-of'), ancora = alvoLinks ? alvoLinks.closest('.bloco') : null;
    function poe(html) { var d = document.createElement('div'); d.innerHTML = html; var n = d.firstChild; if (ancora && ancora.nextSibling) ancora.parentNode.insertBefore(n, ancora.nextSibling); else f.appendChild(n); return n; }
    if (i.id === 'redata' && D.redata) { poe(redataHTML(D.redata)); }
    var P = PONTES[i.id]; if (!P) return;
    var no = poe('<section class="ponte"><div class="secao-tit"><h2 class="tit-md">Quem já usou e os números</h2></div><div class="ponte-grade">' + P.abas.map(function (a) { return '<a class="ponte-card" href="#/agentes/' + P.ag + '?aba=' + a[0] + '"><b>' + esc(a[1]) + '</b><span>' + esc(a[2]) + '</span><em>Abrir os dados →</em></a>'; }).join('') + '</div><p class="txt ponte-num" data-num></p>' + (P.funttel ? '<div data-funttel></div>' : '') + '</section>');
    carregaFin(function () {
      var F = window.ATLAS2_FIN; if (!F) return;
      var ns = P.num(F), el = no.querySelector('[data-num]'); if (el) el.textContent = ns.join(' · ');
      var ft = no.querySelector('[data-funttel]');
      if (ft && F.FUNTTEL && F.FUNTTEL.blocos) ft.innerHTML = '<div class="secao-tit" style="margin-top:26px"><h3 class="tit-md">Sobre o FUNTTEL</h3></div><div class="funttel-blocos">' + F.FUNTTEL.blocos.map(function (b) { return '<div class="bloco"><h4>' + esc(b.t) + '</h4><p class="txt" style="font-size:14px">' + esc(b.x) + '</p></div>'; }).join('') + '</div>';
    });
  }

  /* ---------- Instrumento: resumo executivo fixo no topo; o resto em abas ---------- */
  function abasInstr(A, i, f, q) {
    var tl = f.querySelector('section.tldr'), rod = f.querySelector('.ficha-rodape'); if (!tl) return;
    var G = {como: [], chamadas: [], fontes: [], rel: []}, esp = [], cur = 'como', n = tl.nextSibling, nos = [];
    while (n && n !== rod) { nos.push(n); n = n.nextSibling; }
    nos.forEach(function (no) {
      if (no.nodeType !== 1) return;
      var h = (no.querySelector && no.querySelector('h2,h3,h4')) ? no.querySelector('h2,h3,h4').innerText : '';
      if (no.classList.contains('secao-tit')) { cur = /mesma fam/i.test(h) ? 'rel' : /chamada/i.test(h) ? 'chamadas' : cur; G[cur].push(no); return; }
      if (no.tagName === 'SECTION') { esp.push([no.classList.contains('rd') ? 'situacao' : no.classList.contains('ponte') ? 'numeros' : 'extra' + esp.length, no.classList.contains('rd') ? 'Situação e regras' : no.classList.contains('ponte') ? 'Uso e números' : (h || 'Mais'), [no]]); return; }
      if (/fontes oficiais/i.test(h) && cur === 'como') { G.fontes.push(no); return; }
      G[cur].push(no);
    });
    var nCh = 0; G.chamadas.forEach(function (x) { nCh += x.querySelectorAll ? x.querySelectorAll('.op').length : 0; });
    var abas = [['resumo', 'Resumo executivo', [tl]], ['como', 'Como funciona', G.como]].concat(esp).concat([['chamadas', 'Chamadas ativas', G.chamadas, nCh], ['fontes', 'Fontes oficiais', G.fontes], ['rel', 'Relacionados', G.rel]]).filter(function (a) { return a[2].length; });
    if (abas.length < 2) return;
    var nav = document.createElement('nav'); nav.className = 'fin-abas ins-abas'; nav.setAttribute('aria-label', 'Seções do instrumento');
    nav.innerHTML = abas.map(function (a) { return '<a href="#/instrumentos/' + encodeURIComponent(i.id) + '?aba=' + a[0] + '" data-ia="' + a[0] + '">' + A.esc(a[1]) + (a[3] ? '<em>' + a[3] + '</em>' : '') + '</a>'; }).join('');
    var paineis = {}, ref = rod || null;
    tl.parentNode.insertBefore(nav, tl);
    abas.forEach(function (a) { var d = document.createElement('div'); d.className = 'ins-painel'; d.setAttribute('data-painel', a[0]); a[2].forEach(function (x) { d.appendChild(x); }); f.insertBefore(d, ref); paineis[a[0]] = d; });
    function ativa(k, rolar) {
      if (!paineis[k]) k = abas[0][0];
      Object.keys(paineis).forEach(function (x) { paineis[x].hidden = x !== k; });
      [].forEach.call(nav.querySelectorAll('[data-ia]'), function (x) { var on = x.getAttribute('data-ia') === k; x.classList.toggle('ativa', on); if (on) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
      if (rolar && nav.getBoundingClientRect().top < 0) window.scrollTo({top: nav.getBoundingClientRect().top + window.scrollY - 80});
    }
    nav.addEventListener('click', function (e) { var a = e.target.closest('[data-ia]'); if (!a) return; e.preventDefault(); var k = a.getAttribute('data-ia'); ativa(k, true); try { history.replaceState(null, '', '#/instrumentos/' + encodeURIComponent(i.id) + (k === abas[0][0] ? '' : '?aba=' + k)); } catch (er) {} });
    f._ativa = function (k) { ativa(k, false); };
    var m = /(?:^|&)aba=([^&]+)/.exec(q || ''); ativa(m ? decodeURIComponent(m[1]) : abas[0][0], false);
  }

  /* ---------- Instrumento ---------- */
  var insPrev = T.instrumentos;
  T.instrumentos = function (A, sub, q, box, mesma) {
    insPrev.apply(this, arguments);
    if (!sub) return;
    var i = D.instrumentos.filter(function (x) { return x.id === sub; })[0], f = box.querySelector('.ficha'); if (!i || !f) return;
    var tres = f.querySelector('.ficha-tres'), cab = f.querySelector('.ficha-cab');
    var q1 = corta(i.quemPode), t1 = corta(i.ticket), m1 = cortaInt(i.modalidade), p1 = corta(i.prazo), n1 = corta(i.naoSeAplica);
    var temas = (i.dominios || []).map(function (d) { return A.dom(d); });
    var tags = (i.tags || []).filter(function (t) { return !GEN.test(t); }).map(function (t) { return t.replace(/-/g, ' '); }).slice(0, 6);
    var nCh = A.ABERTAS.filter(function (c) { return c.instrumento === i.id; }).length;
    var html = cartao(A, {
      titulo: i.sigla && i.sigla !== i.nome ? i.sigla : i.nome,
      selos: A.natTag(i.nat) + '<span class="status ' + (nCh ? 'ab' : 'cont') + '">' + (nCh ? nCh + ' chamada' + (nCh > 1 ? 's' : '') + ' aberta' + (nCh > 1 ? 's' : '') : 'Sem chamada aberta') + '</span>',
      itens: [
        item('#2563EB', 'quem', 'Quem pode participar', esc(q1[0]), esc(q1[1]), chips(i.publicos)),
        item('#7C3AED', 'tema', 'Temas e foco', '', tags.length ? 'Palavras-chave: ' + esc(tags.join(', ')) : '', chips(temas)),
        item('#0E7A4B', 'quanto', 'Quanto', esc(t1[0]), esc(t1[1])),
        item('#0891B2', 'financia', 'O que financia e como', esc(m1[0]), '', (m1[1] ? '<p class="tl-det">' + esc(m1[1]) + '</p>' : '') + lista(i.beneficios, 3)),
        item('#D97706', 'prazo', 'Prazo e regra', esc(p1[0]), (p1[1] ? esc(p1[1]) + '<br>' : '') + (i.base ? '<span class="tl-base">' + esc(i.base) + '</span>' : '')),
        item('#B42318', 'fora', 'Fica de fora', esc(n1[0]), esc(n1[1]))
      ],
      alerta: (i.pegadinhas || [])[0], maisAlertas: (i.pegadinhas || []).length > 1 ? i.pegadinhas.length : 0
    });
    var div = document.createElement('div'); div.innerHTML = html;
    if (tres) tres.parentNode.replaceChild(div.firstChild, tres); else cab.parentNode.insertBefore(div.firstChild, cab.nextSibling);
    var al = [].slice.call(f.querySelectorAll('.bloco.alerta')); if (al[0]) al[0].id = 'tl-alertas';
    especiais(A, i, f);
    abasInstr(A, i, f, q);
    f.addEventListener('click', function (e) { if (e.target.closest('[data-ir-alertas]')) { e.preventDefault(); var a = f.querySelector('#tl-alertas'), pa = a && a.closest('.ins-painel[data-painel]'); if (f._ativa) f._ativa(pa ? pa.getAttribute('data-painel') : 'como'); if (a) window.scrollTo({top: a.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth'}); } });
  };

  /* ---------- Chamada ---------- */
  window.AV2_tldrChamada = function (A, c, box, q) {
    var tres = box.querySelector('.ficha-tres'), cab = box.querySelector('.ficha-cab'); if (!tres || !cab) return;
    var K = c.cond || {}, st = A.estado(c), d = A.dias(c.encerramento);
    var pdf = c.edital && /\.pdf($|\?|#)/i.test(c.edital);
    /* 1. Cabeçalho em duas colunas: à esquerda nome, agência e instrumento; à direita prazo e valor total */
    var h1 = cab.querySelector('h1'); if (h1) { h1.classList.add('tit-cham'); h1.title = c.titulo; }
    var vt = c.valorTotal ? A.mi(c.valorTotal) : (K.valor_total_chamada || '');
    var insC = c.instrumento ? D.instrumentos.filter(function (i) { return i.id === c.instrumento; })[0] : null;
    var esq = document.createElement('div'); esq.className = 'cab-esq';
    while (cab.firstChild) esq.appendChild(cab.firstChild);
    var ag = esq.querySelector('p.ag');
    if (ag) ag.innerHTML = '<span class="cab-lbl">Agência</span> ' + esc(c.agenciaNome || '') + (insC ? '<br><span class="cab-lbl">Instrumento</span> <a href="#/instrumentos/' + encodeURIComponent(insC.id) + '">' + esc(insC.sigla || insC.nome) + '</a>' : '') + '<br><span class="cab-nat">' + A.natTag(c.nat) + '</span>';
    var dir = document.createElement('div'); dir.className = 'cab-dir';
    dir.innerHTML = '<div class="cab-fato"><span>' + (c.status === 'em-breve' ? 'Abre em' : 'Prazo de submissão') + '</span><b>' + esc(c.status === 'em-breve' ? A.fdata(c.abertura) : c.encerramento ? A.fdata(c.encerramento) : 'Fluxo contínuo') + '</b>' +
      (c.status === 'aberta' && d !== null ? '<small class="' + (d <= 15 ? 'urg' : '') + '">' + (d <= 0 ? 'fecha hoje' : 'faltam ' + d + ' dias') + '</small>' : '<small>' + esc(st.rot) + '</small>') + '</div>' +
      '<div class="cab-fato"><span>Valor total da chamada</span><b>' + esc(vt || 'Ver edital') + '</b>' + (K.valor_max_projeto && K.valor_max_projeto.length <= 40 ? '<small>por projeto: ' + esc(K.valor_max_projeto) + '</small>' : '') + '</div>' +
      '<div class="cab-fato cab-onde"><span>Onde vale</span><b>' + esc(c.abrangencia === 'nacional' ? 'Nacional' : c.abrangencia === 'estadual' ? (A.D.ufNomes[c.uf] || c.regiao || 'Estadual') : (c.regiao || 'Regional')) + '</b><small>' + esc(c.abrangencia === 'nacional' ? 'vale em todo o país' : c.abrangencia === 'estadual' ? 'chamada estadual' : c.abrangencia === 'internacional' ? 'internacional' : 'chamada regional') + '</small></div>';
    cab.classList.add('cab-cham'); cab.appendChild(esq); cab.appendChild(dir);
    /* 2. Resumo executivo sem repetir valor e prazo */
    var temas = (c.dominios || []).map(function (x) { return A.dom(x); });
    var linhas = (K.linhas_tematicas && K.linhas_tematicas.length) ? K.linhas_tematicas : (c.linhas || []);
    var q1 = corta(K.quem_pode || c.publico);
    function nrm(x) { return String(x || '').toLowerCase().replace(/[^a-z0-9à-ú]+/g, ' ').trim(); }
    var pubOrig = c.publico && K.quem_pode && nrm(c.publico) !== nrm(K.quem_pode) && nrm(K.quem_pode).indexOf(nrm(c.publico)) < 0 && nrm(c.publico).indexOf(nrm(K.quem_pode)) < 0 ? c.publico : '';
    var valProj = [K.valor_min_projeto ? 'Mínimo: ' + K.valor_min_projeto : '', K.valor_max_projeto ? 'Máximo: ' + K.valor_max_projeto : ''].filter(Boolean).join(' · ');
    var exec = [K.prazo_execucao ? 'Execução: ' + K.prazo_execucao : '', K.trl ? 'TRL ' + K.trl : ''].filter(Boolean);
    var prox = (c.cronograma || []).map(function (e) { var m = /(\d{4}-\d{2}-\d{2})/.exec(e.data || ''); return m ? {d: m[1], t: e.etapa} : null; }).filter(function (e) { return e && A.dias(e.d) >= 0; })[0];
    var semLev = !c.cond;
    var html = '<section class="tldr" aria-label="Resumo executivo"><div class="tldr-cab"><div><p class="olho">Resumo executivo · o que você precisa saber</p><h2>Antes de escrever a proposta</h2></div><div class="tldr-selos"><span class="status ' + st.cls + '">' + esc(st.rot) + '</span></div></div><div class="tldr-grade">' +
      item('#2563EB', 'quem', 'Quem pode participar', esc(q1[0]), esc(q1[1]) + (pubOrig ? (q1[1] ? '<br>' : '') + 'Como o Atlas descreve: ' + esc(pubOrig) : '')) +
      item('#7C3AED', 'tema', linhas.length ? 'Linhas temáticas e condições' : 'Temas e foco', '', '', linhas.length ? lista(linhas, 8) : chips(temas)) +
      item('#0891B2', 'financia', 'O que se pode pagar', '', (K.rubricas_financiaveis || []).length ? '' : (semLev ? 'Rubricas ainda não levantadas do edital.' : 'O edital não detalha as rubricas.'), lista(K.rubricas_financiaveis, 7)) +
      item('#0E7A4B', 'quanto', 'Valor por projeto e contrapartida', esc(valProj || corta(c.valor)[0] || ''), [K.contrapartida ? 'Contrapartida: ' + K.contrapartida : '', c.valor ? (valProj ? 'Como o edital descreve: ' + c.valor : corta(c.valor)[1]) : ''].filter(Boolean).map(esc).join('<br>')) +
      item('#D97706', 'prazo', 'Execução e próximas etapas', esc(exec.join(' · ')), prox ? 'Próxima etapa: <b>' + esc(prox.t) + '</b> em ' + esc(A.fdata(prox.d)) : (c.abertura ? 'Abriu em ' + esc(A.fdata(c.abertura)) : '')) +
      ((K.rubricas_vedadas || []).length ? item('#B42318', 'fora', 'Não se paga', '', '', lista(K.rubricas_vedadas, 6)) : item('#64748b', 'fora', 'Quem opera', esc(c.agenciaNome || ''), esc(c.categoria || ''))) +
      '</div>' + (K.observacoes ? '<div class="tldr-alerta"><span class="tl-ico">' + ICO.alerta + '</span><div><b>Regras que pesam</b><p>' + esc(K.observacoes) + '</p></div></div>' : '') +
      (c.cond ? '<p class="tldr-fonte">Levantado do edital oficial em ' + esc(A.fdata(K.lido_em || '')) + (K.fonte_lida && K.fonte_lida[0] ? ' · <a href="' + esc((String(K.fonte_lida[0]).match(/https?:\/\/\S+/) || [""])[0]) + '" target="_blank" rel="noopener">fonte lida ↗</a>' : '') + '. Confira no edital antes de submeter.</p>' : '') + '</section>';
    var div = document.createElement('div'); div.innerHTML = html;
    tres.parentNode.replaceChild(div.firstChild, tres);
    /* 3. Objetivo e regras: o objetivo, as regras completas do edital e o contexto (instrumento e palavras-chave); o cronograma vira aba própria */
    var duas = box.querySelector('.ficha-duas'), blObj = duas ? duas.querySelector('.bloco') : null;
    var insL = c.instrumento ? D.instrumentos.filter(function (i) { return i.id === c.instrumento; })[0] : null;
    var crono = (c.cronograma || []).filter(function (e) { return e && e.etapa; });
    if (!crono.length) crono = [{etapa: 'Abertura', data: c.abertura}, {etapa: 'Encerramento', data: c.encerramento}].filter(function (e) { return e.data; });
    function ul(l) { return '<ul class="tl-lista">' + l.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
    function reg(rot, v) { return v && (!v.length || v.length) ? '<div class="reg-l"><span>' + esc(rot) + '</span><div>' + (Array.isArray(v) ? ul(v) : '<p>' + esc(v) + '</p>') + '</div></div>' : ''; }
    var regras = [
      reg('Quem pode participar', K.quem_pode || ''),
      reg('Linhas temáticas', K.linhas_tematicas && K.linhas_tematicas.length ? K.linhas_tematicas : ''),
      reg('Valor mínimo por projeto', K.valor_min_projeto || ''), reg('Valor máximo por projeto', K.valor_max_projeto || ''),
      reg('Contrapartida', K.contrapartida || ''), reg('Prazo de execução', K.prazo_execucao || ''), reg('TRL', K.trl ? String(K.trl) : ''),
      reg('O que se pode pagar', K.rubricas_financiaveis && K.rubricas_financiaveis.length ? K.rubricas_financiaveis : ''),
      reg('O que não se paga', K.rubricas_vedadas && K.rubricas_vedadas.length ? K.rubricas_vedadas : ''),
      reg('Observações do edital', K.observacoes || '')
    ].join('');
    var pObj = document.createElement('div');
    if (blObj) { blObj.classList.add('objetivo-lead'); pObj.appendChild(blObj); }
    if (regras) { var br2 = document.createElement('div'); br2.className = 'bloco regras-ed'; br2.innerHTML = '<h4>Regras do edital</h4>' + regras + (c.cond ? '<p class="tldr-fonte" style="padding:12px 0 0;border:0">Levantado do edital oficial. Confira no edital antes de submeter.</p>' : ''); pObj.appendChild(br2); }
    if (insL || (c.tags || []).length) {
      var bc = document.createElement('div'); bc.className = 'bloco'; bc.innerHTML = '<h4>Contexto</h4>' +
        (insL ? '<a class="ins-card" href="#/instrumentos/' + encodeURIComponent(insL.id) + '"><span>Instrumento ligado</span><b>' + esc(insL.sigla || insL.nome) + '</b><small>' + esc(insL.tipo || '') + ' · ver a ficha →</small></a>' : '') +
        ((c.tags || []).length ? '<div class="tl-chips" style="--c:#7C3AED;margin-top:14px">' + c.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '');
      pObj.appendChild(bc);
    }
    var pCro = null;
    if (crono.length) {
      pCro = document.createElement('div'); pCro.className = 'bloco';
      pCro.innerHTML = '<h4>Cronograma da chamada</h4><ol class="crono">' + crono.map(function (e) { var dd = /(\d{4}-\d{2}-\d{2})/.exec(e.data || ''); var passou = dd && A.dias(dd[1]) < 0; return '<li class="' + (passou ? 'passou' : '') + '"><b>' + esc(String(e.data || '').replace(/(\d{4})-(\d{2})-(\d{2})/g, '$3/$2/$1')) + '</b><span>' + esc(e.etapa) + '</span></li>'; }).join('') + '</ol>';
    }
    if (duas) duas.remove();
    /* 4. Acessar o edital: página e PDF separados, mais os documentos de apoio */
    var pdfs = [].slice.call(box.querySelectorAll('.ficha-pdf'));
    var acc = document.createElement('section'); acc.className = 'acesso-edital';
    var docs = (c.docs || []);
    acc.innerHTML = '<div class="secao-tit"><h2 class="tit-md">Acessar o edital</h2><span class="contagem">Nem todo edital tem PDF: a página oficial é sempre a referência</span></div><div class="acesso-grade">' +
      (c.link ? '<a class="acesso-card" href="' + esc(c.link) + '" target="_blank" rel="noopener"><i>WEB</i><div><b>Página oficial do edital</b><small>' + esc(c.link.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) + '</small></div><span>↗</span></a>' : '') +
      (c.edital ? '<a class="acesso-card" href="' + esc(c.edital) + '" target="_blank" rel="noopener"><i class="' + (pdf ? 'pdf' : '') + '">' + (pdf ? 'PDF' : 'DOC') + '</i><div><b>' + esc(c.editalRotulo || (pdf ? 'Edital em PDF' : 'Edital')) + '</b><small>' + esc(c.edital.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) + '</small></div><span>↗</span></a>' : '') +
      docs.map(function (k) { var p = /\.pdf($|\?|#)/i.test(k.url); return '<a class="acesso-card" href="' + esc(k.url) + '" target="_blank" rel="noopener"><i class="' + (p ? 'pdf' : '') + '">' + (p ? 'PDF' : 'WEB') + '</i><div><b>' + esc(k.label) + '</b><small>' + esc(k.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) + '</small></div><span>↗</span></a>'; }).join('') + '</div>';
    if (pdfs.length) { pdfs[0].parentNode.insertBefore(acc, pdfs[0]); pdfs.forEach(function (p) { p.remove(); }); }
    else { var rel = box.querySelector('.rel'); if (rel) rel.parentNode.insertBefore(acc, rel); else box.appendChild(acc); }
    /* 5. Abas: Resumo executivo | Objetivo e regras | Cronograma | Acessar o edital | Relacionadas */
    var tldrEl = box.querySelector('section.tldr'), rels = [].slice.call(box.querySelectorAll('section.rel'));
    var nRel = rels.reduce(function (n, r) { return n + r.querySelectorAll('.op').length; }, 0);
    var nDoc = acc.querySelectorAll('.acesso-card').length;
    var pecas = [['resumo', 'Resumo executivo', [tldrEl]], ['objetivo', 'Objetivo e regras', [pObj]]];
    if (pCro) pecas.push(['cronograma', 'Cronograma', [pCro], crono.length]);
    if (nDoc) pecas.push(['edital', 'Acessar o edital', [acc], nDoc]);
    if (rels.length) pecas.push(['rel', 'Relacionadas', rels, nRel]);
    pecas = pecas.filter(function (x) { return x[2].every(Boolean); });
    if (pecas.length < 2 || !tldrEl) return;
    var base = '#/radar/' + encodeURIComponent(c.id);
    var nav = document.createElement('nav'); nav.className = 'fin-abas ins-abas cham-abas'; nav.setAttribute('aria-label', 'Seções da chamada');
    nav.innerHTML = pecas.map(function (a) { return '<a href="' + base + '?aba=' + a[0] + '" data-ca="' + a[0] + '">' + esc(a[1]) + (a[3] ? '<em>' + a[3] + '</em>' : '') + '</a>'; }).join('');
    tldrEl.parentNode.insertBefore(nav, tldrEl);
    var paineis = {};
    pecas.forEach(function (a) { var d = document.createElement('div'); d.className = 'ins-painel cham-painel'; d.setAttribute('data-painel', a[0]); nav.parentNode.insertBefore(d, null); a[2].forEach(function (x) { d.appendChild(x); }); paineis[a[0]] = d; });
    function ativa(k, rolar) {
      if (!paineis[k]) k = pecas[0][0];
      Object.keys(paineis).forEach(function (x) { paineis[x].hidden = x !== k; });
      [].forEach.call(nav.querySelectorAll('[data-ca]'), function (x) { var on = x.getAttribute('data-ca') === k; x.classList.toggle('ativa', on); if (on) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
      if (rolar && nav.getBoundingClientRect().top < 0) window.scrollTo({top: nav.getBoundingClientRect().top + window.scrollY - 80});
    }
    nav.addEventListener('click', function (e) { var a = e.target.closest('[data-ca]'); if (!a) return; e.preventDefault(); var k = a.getAttribute('data-ca'); ativa(k, true); try { history.replaceState(null, '', base + (k === pecas[0][0] ? '' : '?aba=' + k)); } catch (er) {} });
    var m = /(?:^|&)aba=([^&]+)/.exec(q || ''); ativa(m ? decodeURIComponent(m[1]) : pecas[0][0], false);
  };
})();
