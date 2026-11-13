/* Atlas da Inovação · protótipo v2 — Novidades do Atlas (o que mudou, mês a mês) e faixa de novidades na Visão geral. */
(function () {
  var T = window.AV2_TELAS = window.AV2_TELAS || {};
  var U = window.AV2_UTIL;
  var AREAS = {radar: 'Chamadas e editais', ecossistema: 'Inovação aberta', compras: 'Compras públicas', internacional: 'Internacional', agenda: 'Agenda',
    instrumentos: 'Instrumentos', agentes: 'Financiadores', icts: 'ICTs', mapa: 'ICTs', dna: 'DNA da Inovação', pi: 'PI', simulador: 'Montar o projeto',
    trl: 'Montar o projeto', guia: 'Montar o projeto', glossario: 'Montar o projeto', estados: 'Brasil por estado'};
  function area(link) { var m = /^#\/([a-z]+)/.exec(link || ''); return (m && AREAS[m[1]]) || 'Atlas'; }

  /* Todos os itens, do mais recente ao mais antigo, com o mês de origem */
  function itens(A) {
    var N = A.D.novidades || {}, out = [];
    [{mes: N.mes, itens: N.itens || []}].concat(N.historico || []).forEach(function (g) {
      (g.itens || []).forEach(function (x) { out.push({data: x.data, titulo: x.titulo, texto: x.texto || '', link: x.link || '', mes: g.mes, area: area(x.link)}); });
    });
    return out.sort(function (a, b) { return a.data < b.data ? 1 : a.data > b.data ? -1 : 0; });
  }
  function dm(d) { var p = String(d || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] : d; }
  function cartao(A, x) {
    return '<article class="nov-card"><div class="nov-meta"><time datetime="' + A.esc(x.data) + '">' + A.esc(A.fdata(x.data)) + '</time><span class="nov-area">' + A.esc(x.area) + '</span></div>' +
      '<h3>' + A.esc(x.titulo) + '</h3>' + (x.texto ? '<p>' + A.esc(x.texto) + '</p>' : '') +
      (x.link ? '<a class="btn-txt" href="' + A.esc(x.link) + '">Abrir ' + A.esc(x.area.toLowerCase()) + ' →</a>' : '') + '</article>';
  }

  /* Faixa curta na Visão geral: as 3 últimas e o caminho para todas */
  window.AV2_novidadesHub = function (A, el) {
    var l = itens(A); if (!el || !l.length) return;
    var N = A.D.novidades || {}, nMes = (N.itens || []).length;
    el.innerHTML = '<div class="wrap"><div class="nov-hub"><div class="nov-hub-cab" data-blur><p class="olho">Novidades do Atlas</p><h2>O que mudou <em>no Atlas</em></h2>' +
      '<p>' + nMes + ' atualizações em ' + A.esc(N.mes || '') + '. Última em ' + A.esc(A.fdata(l[0].data)) + '.</p><a class="btn-azul peq" href="#/novidades">Ver todas as novidades</a></div>' +
      '<ol class="nov-hub-lista">' + l.slice(0, 4).map(function (x) {
        return '<li data-blur><a href="' + A.esc(x.link || '#/novidades') + '"><span class="nov-d">' + dm(x.data) + '</span><span class="nov-t"><b>' + A.esc(x.titulo) + '</b><small>' + A.esc(x.area) + '</small></span><span class="seta" aria-hidden="true">→</span></a></li>';
      }).join('') + '</ol></div></div>';
  };

  /* Página completa: linha do tempo por mês, filtro por área e busca */
  T.novidades = function (A, sub, q, box) {
    var l = itens(A), N = A.D.novidades || {};
    var areas = {}; l.forEach(function (x) { areas[x.area] = (areas[x.area] || 0) + 1; });
    var st = {area: '', q: ''};
    box.innerHTML = U.faixa(A, {olho: 'Novidades do Atlas', tit: 'O que mudou<br><em>no Atlas</em>',
      txt: 'Cada chamada que entra no Radar, cada base atualizada e cada tela nova, com data e link para conferir. Registro mês a mês.',
      num: [String((N.itens || []).length), 'novidades em ' + (N.mes || 'este mês')], quebra: [[String(l.length), 'no histórico'], [String(Object.keys(areas).length), 'áreas do Atlas']]}) +
      '<div class="wrap" style="padding-bottom:110px"><div class="nov-filtros"><label class="sr" for="nov-q">Buscar nas novidades</label><input id="nov-q" type="search" placeholder="Buscar nas novidades: FINEP, ANEEL, Radar…" autocomplete="off">' +
      '<div class="sub-abas" role="group" aria-label="Filtrar por área"><button type="button" class="chip" data-a="" aria-pressed="true">Todas (' + l.length + ')</button>' +
      Object.keys(areas).sort(function (a, b) { return areas[b] - areas[a]; }).map(function (a) { return '<button type="button" class="chip" data-a="' + A.esc(a) + '" aria-pressed="false">' + A.esc(a) + ' (' + areas[a] + ')</button>'; }).join('') + '</div></div>' +
      '<div data-nov></div></div>';
    U.ativaCampos(A, box);
    var alvo = box.querySelector('[data-nov]');
    function pinta() {
      var t = st.q.toLowerCase(), f = l.filter(function (x) { return (!st.area || x.area === st.area) && (!t || (x.titulo + ' ' + x.texto).toLowerCase().indexOf(t) >= 0); });
      var meses = [], por = {};
      f.forEach(function (x) { if (!por[x.mes]) { por[x.mes] = []; meses.push(x.mes); } por[x.mes].push(x); });
      alvo.innerHTML = f.length ? meses.map(function (m) {
        return '<section class="nov-mes"><h2 class="tit-md">' + A.esc(m.charAt(0).toUpperCase() + m.slice(1)) + ' <small>' + por[m].length + '</small></h2><div class="nov-grade">' + por[m].map(function (x) { return cartao(A, x); }).join('') + '</div></section>';
      }).join('') : '<div class="vazio"><p>Nenhuma novidade com esse filtro.</p></div>';
    }
    box.querySelector('#nov-q').addEventListener('input', function (e) { st.q = e.target.value.trim(); pinta(); });
    box.querySelectorAll('[data-a]').forEach(function (b) { b.addEventListener('click', function () { st.area = b.getAttribute('data-a'); box.querySelectorAll('[data-a]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); }); pinta(); }); });
    pinta();
  };

  function abasICT(A, ict, f, q) {
    var cab = f.querySelector('.ficha-cab'); if (!cab || f.querySelector('.ict-abas')) return;
    var ABAS = [['resumo', 'Resumo'], ['projetos', 'Projetos'], ['pi', 'Propriedade intelectual'], ['embrapii', 'EMBRAPII em números']];
    function tipo(no) {
      var h = ((no.querySelector && no.querySelector('h2,h3,h4')) || {}).textContent || '';
      if (/embrapii em números|repartição dos aportes/i.test(h)) return 'embrapii';
      if (/propriedade intelectual/i.test(h)) return 'pi';
      if (/projetos/i.test(h)) return 'projetos';
      return 'resumo';
    }
    var nav = document.createElement('nav'); nav.className = 'fin-abas ict-abas'; nav.setAttribute('aria-label', 'Seções da ICT');
    var paineis = {}, rod = f.querySelector('.ficha-rodape');
    ABAS.forEach(function (a) { var d = document.createElement('div'); d.className = 'ins-painel'; d.setAttribute('data-painel', a[0]); paineis[a[0]] = d; });
    var nos = []; for (var n = cab.nextSibling; n; n = n.nextSibling) if (n !== rod && n.nodeType === 1) nos.push(n);
    nos.forEach(function (no) { paineis[tipo(no)].appendChild(no); });
    cab.parentNode.insertBefore(nav, cab.nextSibling);
    var ant = nav; ABAS.forEach(function (a) { f.insertBefore(paineis[a[0]], rod || null); });
    var atual = 'resumo';
    function desenhaNav() {
      nav.innerHTML = ABAS.filter(function (a) { return paineis[a[0]].children.length; }).map(function (a) { return '<a href="#/icts/' + encodeURIComponent(ict.id) + '?aba=' + a[0] + '" data-ia="' + a[0] + '" class="' + (a[0] === atual ? 'ativa' : '') + '">' + a[1] + '</a>'; }).join('');
      nav.hidden = nav.children.length < 2;
    }
    function ativa(k, rolar) {
      if (!paineis[k] || !paineis[k].children.length) k = 'resumo'; atual = k;
      Object.keys(paineis).forEach(function (x) { paineis[x].hidden = x !== k; }); desenhaNav();
      if (rolar && nav.getBoundingClientRect().top < 0) window.scrollTo({top: nav.getBoundingClientRect().top + window.scrollY - 80});
    }
    nav.addEventListener('click', function (e) { var a = e.target.closest('[data-ia]'); if (!a) return; e.preventDefault(); var k = a.getAttribute('data-ia'); ativa(k, true); try { history.replaceState(null, '', '#/icts/' + encodeURIComponent(ict.id) + (k === 'resumo' ? '' : '?aba=' + k)); } catch (er) {} });
    /* blocos que chegam depois (carga sob demanda) entram na aba certa */
    if (window.MutationObserver) new MutationObserver(function (ms) { var mudou = false; ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (no) { if (no.nodeType === 1 && no.parentNode === f && no !== nav && !no.hasAttribute('data-painel') && !no.classList.contains('ficha-rodape') && !no.classList.contains('ficha-acoes')) { paineis[tipo(no)].appendChild(no); mudou = true; } }); }); if (mudou) ativa(atual, false); }).observe(f, {childList: true});
    var m = /(?:^|&)aba=([^&]+)/.exec(q || ''); ativa(m ? decodeURIComponent(m[1]) : 'resumo', false);
  }

  /* Ficha de ICT padronizada: identificação e contato à direita do cabeçalho; áreas de atuação no lugar do bloco "Identificação" */
  var ictPrev = T.icts;
  T.icts = function (A, sub, q, box, mesma) {
    ictPrev.apply(this, arguments);
    if (!sub) return;
    var f = box.querySelector('.ficha'), cab = f && f.querySelector('.ficha-cab'), tres = f && f.querySelector('.ficha-tres');
    var ict = A.D.icts.filter(function (x) { return x.id === sub; })[0];
    if (!f || !cab || !tres || !ict || cab.classList.contains('ict-cab')) return;
    var ident = [].filter.call(tres.children, function (b) { return /identifica/i.test((b.querySelector('h4') || {}).textContent || ''); })[0];
    var cred = [].filter.call(tres.children, function (b) { return /credenciamento/i.test((b.querySelector('h4') || {}).textContent || ''); })[0];
    if (!ident) return;
    /* coluna direita: dados da identificação + credenciamento resumido + site */
    var dir = document.createElement('div'); dir.className = 'ict-cab-dir';
    var dados = [].slice.call(ident.querySelectorAll('.dado')), site = ident.querySelector('a.btn-azul');
    var credTxt = cred ? [].map.call(cred.querySelectorAll('.dado b, .dado'), function (x) { return x.textContent; }) : [];
    var fatos = document.createElement('div'); fatos.className = 'ict-fatos';
    dados.forEach(function (d) { fatos.appendChild(d); });
    var cr = (ict.credenciamentos || []).filter(Boolean);
    if (cr.length) { var dc = document.createElement('div'); dc.className = 'dado'; dc.innerHTML = '<span>Credenciamento</span><b>' + cr.map(function (c) { return A.esc(String(c).replace(/^embrapii$/i, 'EMBRAPII')); }).join(' · ') + (ict.embrapiiCod ? ' <small>código ' + A.esc(String(ict.embrapiiCod)) + '</small>' : '') + '</b>'; fatos.appendChild(dc); }
    if (site) { site.style.marginTop = '0'; site.classList.add('ict-site'); }
    var esq = document.createElement('div'); esq.className = 'cab-esq'; while (cab.firstChild) esq.appendChild(cab.firstChild);
    esq.appendChild(fatos); if (site) esq.appendChild(site);
    cab.classList.add('ict-cab'); cab.appendChild(esq); cab.appendChild(dir);
    /* bloco "Áreas de atuação" no lugar da identificação */
    var duas = [].slice.call(f.querySelectorAll('.ficha-duas')), areasBloco = null;
    duas.forEach(function (d) { [].forEach.call(d.children, function (b) { if (/^\s*áreas\s*$/i.test((b.querySelector('h4') || {}).textContent || '')) areasBloco = b; }); });
    var chips = function (l) { return '<div class="tags">' + l.map(function (t) { return '<span class="tag">' + A.esc(t) + '</span>'; }).join('') + '</div>'; };
    var html = ict.areas && ict.areas.length ? chips(ict.areas) : ict.area ? '<p class="txt">' + A.esc(ict.area) + '</p>' : ict.linhasPesquisa && ict.linhasPesquisa.length ? chips(ict.linhasPesquisa.slice(0, 6)) : (ict.dominios || []).length ? chips(ict.dominios.map(function (d) { return A.dom(d); })) : '<p class="txt">Não informado.</p>';
    var nb = document.createElement('div'); nb.className = 'bloco'; nb.innerHTML = '<h4>Áreas de atuação</h4>' + html + (ict.domPreliminar ? '<p class="aviso-txt">Domínios classificados de forma preliminar.</p>' : '');
    tres.replaceChild(nb, ident);
    if (cred) tres.removeChild(cred);
    /* mapinha de localização vai para o cartão do cabeçalho; áreas e linhas ocupam a largura toda */
    var mapa = tres.querySelector('.ficha-mapa');
    if (mapa) { var mm = document.createElement('div'); mm.className = 'ict-cab-mapa'; [].slice.call(mapa.childNodes).forEach(function (n) { if (n.tagName !== 'H4') mm.appendChild(n); }); dir.appendChild(mm); tres.removeChild(mapa); }
    nb.classList.add('largo'); tres.classList.add('ict-uma');
    var lpBloco = null; duas.forEach(function (d) { [].forEach.call(d.children, function (b) { if (/linhas de pesquisa/i.test((b.querySelector('h4') || {}).textContent || '')) lpBloco = b; }); });
    if (lpBloco) {
      var sub2 = document.createElement('div'); sub2.className = 'ict-lp'; sub2.innerHTML = '<h5>Linhas de pesquisa</h5>';
      [].slice.call(lpBloco.childNodes).forEach(function (n) { if (!(n.tagName === 'H4')) sub2.appendChild(n); });
      nb.appendChild(sub2);
      var pl = lpBloco.parentNode; pl.removeChild(lpBloco);
      if (!pl.children.length) pl.parentNode.removeChild(pl); else if (pl.children.length === 1 && pl.classList.contains('ficha-duas')) { pl.classList.remove('ficha-duas'); pl.firstElementChild.classList.add('largo'); }
    }
    if (areasBloco && areasBloco.parentNode) { var pai = areasBloco.parentNode; pai.removeChild(areasBloco); if (!pai.children.length && pai.parentNode) pai.parentNode.removeChild(pai); else if (pai.children.length === 1) { pai.classList.remove('ficha-duas'); pai.firstElementChild.classList.add('largo'); } }
    abasICT(A, ict, f, q);
  };

  /* Tabelas: colunas curtas (base, ano, valor, status) centralizadas e sem quebra; colunas de texto longo à esquerda */
  function alinhaTabela(t) {
    var corpo = t.tBodies[0]; if (!corpo || !corpo.rows.length) return;
    var rows = [].slice.call(corpo.rows, 0, 80), nc = 0;
    rows.forEach(function (r) { if (r.cells.length > nc) nc = r.cells.length; });
    rows = rows.filter(function (r) { return r.cells.length === nc; }); if (!rows.length) return;
    var cab = t.tHead && t.tHead.rows[t.tHead.rows.length - 1];
    for (var c = 0; c < nc; c++) {
      var soma = 0, mx = 0;
      rows.forEach(function (r) { var n = (r.cells[c].textContent || '').trim().length; soma += n; if (n > mx) mx = n; });
      var med = soma / rows.length, cls = med > 24 ? 'al-esq' : 'al-cen', curto = mx <= 18;
      rows.forEach(function (r) { var td = r.cells[c]; td.classList.remove('al-esq', 'al-cen'); td.classList.add(cls); td.classList.toggle('sem-quebra', curto); });
      if (cab && cab.cells.length === nc) { cab.cells[c].classList.remove('al-esq', 'al-cen'); cab.cells[c].classList.add(cls); cab.cells[c].classList.toggle('sem-quebra', curto); }
    }
  }
  var tAlinha = null;
  function alinhaTodas() { tAlinha = null; [].forEach.call(document.querySelectorAll('[data-view]:not([hidden]) table'), alinhaTabela); }
  if (window.MutationObserver) new MutationObserver(function () { if (!tAlinha) tAlinha = setTimeout(alinhaTodas, 120); }).observe(document.body, {childList: true, subtree: true});
})();
