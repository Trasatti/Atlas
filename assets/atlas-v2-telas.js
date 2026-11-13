/* Atlas v2 · rodada 2 — Instrumentos, Agentes, ICTs (diretório e ficha), Inovação aberta, Agenda, Compras, Guia e Dicionário.
   Cada tela é uma função (A, sub, q, box, mesma): A traz os dados e utilidades do atlas-v2.js. */
window.AV2_TELAS = {};
(function () {
  'use strict';
  var T = window.AV2_TELAS, D0 = window.ATLAS2;
  var mg = document.getElementById('m-glos'); if (mg) mg.textContent = (D0.dicionario && D0.dicionario.length) || D0.glossario.length;
  var ma = document.getElementById('m-ag'); if (ma) ma.textContent = D0.agencias.length;

  function sel(box, s) { return box.querySelector(s); }
  function cont(lista, f) { var c = {}; lista.forEach(function (x) { [].concat(f(x)).forEach(function (v) { if (v != null && v !== '') c[v] = (c[v] || 0) + 1; }); }); return c; }
  function primeiro(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s; }

  /* Todo link para fora do Atlas abre em nova aba (vale para qualquer cartão, lista ou ficha) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || a.hasAttribute('download')) return;
    var h = a.getAttribute('href') || '';
    if (/^https?:\/\//i.test(h) && a.host !== location.host) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
  }, true);

  /* Painel "Detalhes" expansível dentro do cartão: tudo o que o dado tem, sem sair da lista.
     linhas: [[rótulo, texto]] ou [[rótulo, html, true]]; link: url oficial (abre em nova aba) */
  function detalhes(A, linhas, link, rotLink) {
    var esc = A.esc, l = linhas.filter(function (x) { return x && x[1] != null && x[1] !== '' && !(Array.isArray(x[1]) && !x[1].length); });
    if (!l.length && !link) return '';
    return '<details class="op-det"><summary><span>Detalhes</span></summary><div class="op-det-corpo"><dl>' + l.map(function (x) {
      return '<div><dt>' + esc(x[0]) + '</dt><dd>' + (x[2] ? x[1] : esc(x[1])) + '</dd></div>';
    }).join('') + '</dl>' + (link ? '<a class="btn-azul peq" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(rotLink || 'Abrir no site oficial') + ' ↗</a>' : '') + '</div></details>';
  }

  /* ---------- Faixa marinho (padrão Ártica) ---------- */
  function faixa(A, o) {
    var esc = A.esc;
    var num = o.num ? '<div class="faixa-num"><b>' + esc(o.num[0]) + '</b><span>' + esc(o.num[1]) + '</span>' +
      (o.quebra ? '<div class="faixa-quebra">' + o.quebra.map(function (q) { return '<div><b>' + esc(q[0]) + '</b><span>' + esc(q[1]) + '</span></div>'; }).join('') + '</div>' : '') + '</div>' : '';
    return '<section class="faixa-pag"><canvas class="campo" data-novo-campo aria-hidden="true"></canvas><div class="wrap"><div class="faixa-grade"><div>' +
      '<p class="olho">' + esc(o.olho) + '</p><h1 class="faixa-tit">' + o.tit + '</h1>' + (o.txt ? '<p class="faixa-txt">' + o.txt + '</p>' : '') + (o.dir ? num : '') + '</div>' +
      '<div class="faixa-mapa' + (o.dir ? '' : ' faixa-nums-dir') + '">' + (o.dir || num) + '</div></div>' + (o.abas || '') + (o.extra || '<div style="height:8px"></div>') + '</div></section>';
  }
  function ativaCampos(A, box) { box.querySelectorAll('canvas[data-novo-campo]').forEach(function (cv) { cv.removeAttribute('data-novo-campo'); A.campo(cv); }); }
  function barrasFaixa(A, titulo, pares, link) {
    var mx = Math.max.apply(null, pares.map(function (p) { return p[1]; })) || 1;
    return '<div class="faixa-barras"><h4>' + A.esc(titulo) + '</h4>' + pares.map(function (p) {
      var tag = link ? 'a href="' + link(p) + '"' : 'div class="fb"';
      return '<' + tag + '><span>' + A.esc(p[0]) + '</span><i style="width:' + (p[1] / mx * 100).toFixed(0) + '%"></i><b>' + p[1] + '</b></' + (link ? 'a' : 'div') + '>';
    }).join('') + '</div>';
  }
  /* Pontos em ilha/beira d'água que, na escala do mapa pequeno, caem na água: desenha um pouco para dentro (só no desenho) */
  var AJUSTE = {'-22.86,-43.22': [-22.9, -43.32], '-32.04,-52.1': [-32.04, -52.2]};
  function xy(lat, lng) { var aj = AJUSTE[lat + ',' + lng]; if (aj) { lat = aj[0]; lng = aj[1]; } var e = 1000 / (45.6 * Math.cos(15 * Math.PI / 180)); return [(lng + 74.2) * 1000 / 45.6, (5.4 - lat) * e]; }
  function mapaPontos(A, lista, ufSel) {
    var s = A.svgBrasil('', false);
    if (ufSel) s = s.replace('data-uf="' + ufSel + '"', 'data-uf="' + ufSel + '" style="fill:rgba(158,193,242,.35)"');
    var pts = lista.filter(function (t) { return t.lat != null; }).map(function (t) { var p = xy(t.lat, t.lng); return '<circle cx="' + p[0].toFixed(0) + '" cy="' + p[1].toFixed(0) + '" r="' + (lista.length > 50 ? 6 : 12) + '" fill="' + A.corCat(t.categoria) + '" opacity=".8" stroke="#0F2238" stroke-width="1.5"/>'; }).join('');
    return s.replace('</svg>', pts + '</svg>').replace('<svg ', '<svg style="--uf-x:1" class="mapa-pontos" ');
  }

  /* ---------- Catálogo genérico: filtros à esquerda + cartões (padrão ABGI) ---------- */
  function catalogo(A, box, cfg, q, mesma) {
    var esc = A.esc, est = {q: '', ordem: cfg.ordens[0][0]};
    cfg.grupos.forEach(function (g) { est[g.k] = (cfg.padrao && cfg.padrao[g.k]) ? cfg.padrao[g.k].slice() : []; });
    if (q) q.split('&').forEach(function (par) {
      var kv = par.split('='), k = kv[0], v = decodeURIComponent(kv[1] || '');
      if (k === 'q') est.q = v; else if (k === 'ordem') est.ordem = v; else if (Array.isArray(est[k])) est[k] = v ? v.split(',') : [];
    });
    if (!mesma || !sel(box, '#cat-lista')) {
      box.innerHTML = faixa(A, cfg.faixa) +
        '<div class="wrap" id="cat-corpo"><div class="barra"><div class="barra-esq"><h2>' + esc(cfg.titulo) + '</h2>' + (cfg.selos || '') + '</div>' +
        '<div class="busca"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><label class="sr" for="cat-q">Pesquisar</label><input id="cat-q" type="search" placeholder="' + esc(cfg.placeholder) + '" autocomplete="off"></div></div>' +
        '<div class="sub-barra"><p class="contagem" id="cat-cont" aria-live="polite"></p><div class="barra-esq">' +
        '<button type="button" class="btn-linha peq btn-filtros" id="cat-bf" aria-expanded="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 4h12M4.5 8h7M7 12h2"/></svg>Filtros</button>' +
        '<label class="ordem">Ordenar <select id="cat-ordem">' + cfg.ordens.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + '</option>'; }).join('') + '</select></label>' +
        '<button type="button" class="copiar" id="cat-copiar"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.5 2.5 0 0 1 3.5 3.5L10.5 8M9 11.5l-1.2 1.2a2.5 2.5 0 0 1-3.5-3.5L5.5 8"/></svg><span>Copiar link desta busca</span></button></div></div>' +
        '<div class="lista-lay"><aside class="filtros-col" aria-label="Filtros"><h3>Filtros <button type="button" class="btn-txt" id="cat-limpar">Limpar</button></h3>' + (cfg.aviso ? '<p class="f-aviso">' + cfg.aviso + '</p>' : '') + '<div id="cat-grupos"></div></aside>' +
        '<div><div class="grade" id="cat-lista"></div></div></div></div>';
      ativaCampos(A, box);
      if (!A.largo()) { sel(box, '#cat-corpo').classList.add('sem-filtros'); sel(box, '#cat-bf').setAttribute('aria-expanded', 'false'); }
    }
    function passa(x, exceto) {
      if (est.q) { var alvo = A.sem(cfg.busca(x)); if (A.sem(est.q).split(/\s+/).some(function (p) { return alvo.indexOf(p) < 0; })) return false; }
      for (var i = 0; i < cfg.grupos.length; i++) { var g = cfg.grupos[i], s = est[g.k]; if (g.k === exceto || !s.length) continue; if (!g.val(x).some(function (v) { return s.indexOf(v) >= 0; })) return false; }
      return true;
    }
    function rot(g, k) { return typeof g.rot === 'function' ? g.rot(k) : (g.rot && g.rot[k]) || k; }
    function query() {
      var p = []; if (est.q) p.push('q=' + encodeURIComponent(est.q)); if (est.ordem !== cfg.ordens[0][0]) p.push('ordem=' + est.ordem);
      cfg.grupos.forEach(function (g) { var pad = (cfg.padrao && cfg.padrao[g.k]) || []; if (est[g.k].join(',') !== pad.join(',')) p.push(g.k + '=' + encodeURIComponent(est[g.k].join(','))); });
      return p.length ? '?' + p.join('&') : '';
    }
    function desenha() {
      var h = '#/' + cfg.chave + query(); if (location.hash !== h) history.replaceState(null, '', h);
      sel(box, '#cat-q').value = est.q; sel(box, '#cat-ordem').value = est.ordem;
      sel(box, '#cat-grupos').innerHTML = cfg.grupos.map(function (g) {
        var base = cfg.itens.filter(function (x) { return passa(x, g.k); }), c = cont(base, g.val);
        var ks = Object.keys(c).concat(est[g.k].filter(function (k) { return !(k in c); }));
        if (Array.isArray(g.ordem)) ks = g.ordem.filter(function (k) { return ks.indexOf(k) >= 0; });
        else if (g.ordem === 'alfa') ks.sort(function (a, b) { return String(rot(g, a)).localeCompare(rot(g, b), 'pt-BR'); });
        else ks.sort(function (a, b) { return (c[b] || 0) - (c[a] || 0) || String(rot(g, a)).localeCompare(rot(g, b), 'pt-BR'); });
        var n = est[g.k].length;
        return '<details class="f-grupo"' + (g.aberto || n ? ' open' : '') + '><summary>' + esc(g.t) + (n ? '<em>' + n + ' marcado' + (n > 1 ? 's' : '') + '</em>' : '') + '</summary><div class="f-opcoes">' +
          ks.map(function (k) { return '<label><input type="checkbox" data-g="' + g.k + '" value="' + esc(k) + '"' + (est[g.k].indexOf(k) >= 0 ? ' checked' : '') + '><span>' + (g.ponto ? '<i class="ponto-cat" style="background:' + g.ponto(k) + '"></i>' : '') + esc(rot(g, k)) + '</span><span>' + (c[k] || 0) + '</span></label>'; }).join('') + '</div></details>';
      }).join('');
      var l = cfg.itens.filter(function (x) { return passa(x); });
      var ord = cfg.ordens.filter(function (o) { return o[0] === est.ordem; })[0] || cfg.ordens[0]; l.sort(ord[2]);
      var ativos = [];
      cfg.grupos.forEach(function (g) { var pad = (cfg.padrao && cfg.padrao[g.k]) || []; est[g.k].forEach(function (v) { if (pad.indexOf(v) < 0) ativos.push('<button type="button" class="chip x" data-rm="' + g.k + '|' + esc(v) + '">' + esc(rot(g, v)) + '</button>'); }); });
      sel(box, '#cat-cont').innerHTML = 'Encontrad' + cfg.genero + 's <b>' + l.length + '</b> ' + (l.length === 1 ? cfg.contagemRot[0] : cfg.contagemRot[1]) + (ativos.length ? ' &nbsp;' + ativos.join(' ') : '');
      var lista = sel(box, '#cat-lista'), lim = box._limite || 40;
      lista.innerHTML = l.length ? l.slice(0, lim).map(cfg.cartao).join('') + (l.length > lim ? '<div class="vazio" style="padding:20px 0"><button type="button" class="btn-linha" id="cat-mais">Mostrar mais ' + Math.min(40, l.length - lim) + ' de ' + (l.length - lim) + '</button></div>' : '') : '<div class="vazio"><p>' + esc(cfg.vazio || 'Nada com esses filtros.') + '</p><button type="button" class="btn-linha peq" data-limpar>Limpar filtros</button></div>';
      lista.querySelectorAll('.op').forEach(function (el, k) { el.style.transitionDelay = Math.min(k, 6) * 40 + 'ms'; });
      A.observar('.op.entra', lista);
    }
    var tq;
    box.oninput = function (e) { if (e.target.id === 'cat-q') { var v = e.target.value; clearTimeout(tq); tq = setTimeout(function () { est.q = v.trim(); box._limite = 40; desenha(); }, 180); } };
    box.onchange = function (e) {
      var i = e.target;
      if (i.id === 'cat-ordem') { est.ordem = i.value; desenha(); return; }
      if (!i.matches('input[data-g]')) return; var g = i.getAttribute('data-g'), k = est[g].indexOf(i.value);
      if (i.checked && k < 0) est[g].push(i.value); if (!i.checked && k >= 0) est[g].splice(k, 1); box._limite = 40; desenha();
    };
    box.onclick = function (e) {
      var t = e.target;
      if (t.closest('#cat-limpar') || t.closest('[data-limpar]')) { cfg.grupos.forEach(function (g) { est[g.k] = (cfg.padrao && cfg.padrao[g.k]) ? cfg.padrao[g.k].slice() : []; }); est.q = ''; desenha(); return; }
      if (t.closest('#cat-mais')) { box._limite = (box._limite || 40) + 40; desenha(); return; }
      var rm = t.closest('[data-rm]'); if (rm) { var p = rm.getAttribute('data-rm').split('|'), k = est[p[0]].indexOf(p[1]); if (k >= 0) est[p[0]].splice(k, 1); desenha(); return; }
      var bf = t.closest('#cat-bf'); if (bf) { var on = sel(box, '#cat-corpo').classList.toggle('sem-filtros'); bf.setAttribute('aria-expanded', String(!on)); return; }
      var cp = t.closest('#cat-copiar'); if (cp) { var url = location.href; var ok = function () { cp.querySelector('span').textContent = 'Link copiado ✓'; setTimeout(function () { cp.querySelector('span').textContent = 'Copiar link desta busca'; }, 1800); }; if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, ok); else ok(); return; }
      var fb = t.closest('[data-filtro]'); if (fb) { var f = fb.getAttribute('data-filtro').split('|'); est[f[0]] = [f[1]]; desenha(); var y = sel(box, '#cat-corpo').getBoundingClientRect().top + window.scrollY - 10; window.scrollTo({top: y, behavior: A.MOVER ? 'smooth' : 'auto'}); return; }
      if (cfg.clique) cfg.clique(e, est, desenha);
    };
    box._limite = 40;
    desenha();
  }

  /* ---------- Fichas: helpers ---------- */
  function cabecalho(A, o) {
    var esc = A.esc;
    return '<div class="ficha-acoes"><p class="migalha">' + o.migalha + '</p><div class="barra-esq">' + (o.fav ? '<button type="button" class="btn-linha peq btn-fav" data-id="' + esc(o.fav) + '" aria-pressed="' + A.favorito(o.fav) + '">' + A.ICO.est + '<span class="rot-fav">' + (A.favorito(o.fav) ? 'Favorito ✓' : 'Favorito') + '</span></button>' : '') +
      '<a class="btn-azul peq" href="' + o.voltar + '">← ' + esc(o.voltarRot) + '</a></div></div>' +
      '<div class="bloco ficha-cab"><p class="olho">' + esc(o.olho) + '</p><h1>' + esc(o.tit) + '</h1>' + (o.sub ? '<p class="ag">' + o.sub + '</p>' : '') + (o.tags ? '<div class="tags">' + o.tags + '</div>' : '') + '</div>';
  }
  function lista(A, itens, cls) { return itens && itens.length ? '<ul class="' + (cls || 'lista-pontos') + '">' + itens.map(function (x) { return '<li>' + A.esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="txt">Não informado.</p>'; }

  /* ================= INSTRUMENTOS ================= */
  var FAMILIAS = [['credito', 'Crédito', /crédito|blended|cofinanciamento/i], ['naoreemb', 'Não reembolsável', /subvenção|não-reembolsável|bolsas|orçamentári/i], ['fiscal', 'Incentivo fiscal', /incentivo fiscal/i], ['obrigacao', 'Obrigação regulatória', /obrigação regulatória/i], ['programa', 'Programas e compras públicas', /programa|poder de compra|apoio a mpe|fomento estadual/i], ['marco', 'Marco legal e PI', /marco|proteção/i]];
  function familia(i) { for (var k = 0; k < FAMILIAS.length; k++) if (FAMILIAS[k][2].test(i.tipo || '')) return FAMILIAS[k][0]; return 'programa'; }
  var ROT_FAM = {}; FAMILIAS.forEach(function (f) { ROT_FAM[f[0]] = f[1]; });
  var ROT_AB = {federal: 'Federal', regional: 'Regional', estadual: 'Estadual'};
  function chamadasDo(A, id) { return A.ABERTAS.filter(function (c) { return c.instrumento === id; }); }
  function todasDo(A, id) { return A.D.chamadas.filter(function (c) { return c.instrumento === id; }); }

  /* ---------- Comparador de instrumentos (até 3 lado a lado; a escolha fica neste navegador) ---------- */
  var CMP = [], AA = null;
  try { CMP = JSON.parse(localStorage.getItem('atlas-comparar') || '[]').filter(function (id) { return D0.instrumentos.some(function (i) { return i.id === id; }); }).slice(0, 3); } catch (e) { CMP = []; }
  function salvaCmp() { try { localStorage.setItem('atlas-comparar', JSON.stringify(CMP)); } catch (e) {} }
  function cmpBtn(id) { var on = CMP.indexOf(id) >= 0; return '<button type="button" class="btn-cmp" data-cmp="' + id + '" aria-pressed="' + on + '">' + (on ? '✓ Na comparação' : '+ Comparar') + '</button>'; }
  var cmpAberto = false, cmpAviso = '';
  function gaveta() {
    var g = document.getElementById('cmp-gaveta');
    if (!g) { g = document.createElement('aside'); g.id = 'cmp-gaveta'; g.className = 'cmp-gaveta'; g.setAttribute('aria-label', 'Comparador de instrumentos'); document.body.appendChild(g); }
    var visivel = CMP.length > 0 && /^#\/instrumentos/.test(location.hash || '') && AA;
    g.hidden = !visivel; document.documentElement.classList.toggle('tem-cmp', !!visivel);
    if (!visivel) return;
    var A = AA, esc = A.esc, L = CMP.map(function (id) { return A.D.instrumentos.filter(function (i) { return i.id === id; })[0]; }).filter(Boolean);
    var lin = [
      ['Natureza do recurso', function (i) { return A.natTag(i.nat); }],
      ['Modalidade', function (i) { return esc(i.modalidade || '—'); }],
      ['Mecânica (benefícios)', function (i) { return (i.beneficios || []).length ? '<ul>' + i.beneficios.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '—'; }],
      ['Valor ou ticket', function (i) { return esc(i.ticket || '—'); }],
      ['Janela (prazo)', function (i) { return esc(i.prazo || '—'); }],
      ['Quem pode', function (i) { return esc(i.quemPode || '—'); }],
      ['Não se aplica a', function (i) { return esc(i.naoSeAplica || '—'); }],
      ['Base legal', function (i) { return esc(i.base || '—'); }]
    ];
    g.innerHTML = (cmpAberto ? '<div class="cmp-painel"><div class="cmp-painel-topo"><b>Comparação lado a lado</b><button type="button" class="btn-txt" data-cmp-fechar>Fechar ×</button></div><div class="rola-x"><table class="cmp-tab"><thead><tr><th></th>' + L.map(function (i) { return '<th><a href="#/instrumentos/' + encodeURIComponent(i.id) + '">' + esc(i.sigla || i.nome) + '</a><small>' + esc(i.agenciaNome || '') + '</small></th>'; }).join('') + '</tr></thead><tbody>' +
        lin.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th>' + L.map(function (i) { return '<td>' + r[1](i) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></div>' : '') +
      '<div class="cmp-barra"><span class="cmp-tit">Comparar <em>' + L.length + '/3</em></span><div class="cmp-chips">' + L.map(function (i) { return '<span class="cmp-chip">' + esc(i.sigla || i.nome) + '<button type="button" data-cmp-rm="' + esc(i.id) + '" aria-label="Tirar ' + esc(i.sigla || i.nome) + ' da comparação">×</button></span>'; }).join('') + '</div>' +
      (cmpAviso ? '<span class="cmp-aviso">' + esc(cmpAviso) + '</span>' : '') +
      '<div class="cmp-acoes"><button type="button" class="btn-azul peq" data-cmp-abrir' + (L.length < 2 ? ' disabled title="Escolha pelo menos 2 instrumentos"' : '') + '>' + (cmpAberto ? 'Esconder' : 'Ver lado a lado') + '</button><button type="button" class="btn-linha peq" data-cmp-limpar>Limpar</button></div></div>';
  }
  function marcaCmp() { document.querySelectorAll('[data-cmp]').forEach(function (b) { var on = CMP.indexOf(b.getAttribute('data-cmp')) >= 0; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '✓ Na comparação' : '+ Comparar'; }); gaveta(); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-cmp],[data-cmp-rm],[data-cmp-abrir],[data-cmp-limpar],[data-cmp-fechar]'); if (!t) return;
    e.preventDefault(); cmpAviso = '';
    if (t.hasAttribute('data-cmp')) {
      var id = t.getAttribute('data-cmp'), k = CMP.indexOf(id);
      if (k >= 0) CMP.splice(k, 1); else if (CMP.length >= 3) cmpAviso = 'O máximo são 3. Tire um para incluir outro.'; else CMP.push(id);
      if (CMP.length < 2) cmpAberto = false;
    } else if (t.hasAttribute('data-cmp-rm')) { var j = CMP.indexOf(t.getAttribute('data-cmp-rm')); if (j >= 0) CMP.splice(j, 1); if (CMP.length < 2) cmpAberto = false; }
    else if (t.hasAttribute('data-cmp-abrir')) { if (CMP.length >= 2) cmpAberto = !cmpAberto; }
    else if (t.hasAttribute('data-cmp-fechar')) cmpAberto = false;
    else { CMP = []; cmpAberto = false; }
    salvaCmp(); marcaCmp();
  });
  window.addEventListener('hashchange', gaveta);
  function cartaoInstr(A) {
    var esc = A.esc;
    return function (i) {
      var n = chamadasDo(A, i.id).length, lk = (i.links || [])[0]; AA = A;
      return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla">' + esc(i.sigla || '') + '</p><h3><a href="#/instrumentos/' + encodeURIComponent(i.id) + '">' + esc(i.nome) + '</a></h3><p class="op-inst">' + esc(i.agenciaNome || '') + ' · ' + esc(i.tipo || '') + '</p></div>' +
        '<button type="button" class="estrela" data-id="' + esc(i.id) + '" aria-pressed="' + A.favorito(i.id) + '" aria-label="Favorito">' + A.ICO.est + '</button></div>' +
        '<p class="op-txt">' + esc(i.resumo || '') + '</p>' +
        '<div class="op-linhas"><div class="op-linha"><span>Recurso</span><div class="tags">' + A.natTag(i.nat) + '</div></div><div class="op-linha"><span>Quanto</span><div style="font-size:13px;color:var(--ink-2)">' + esc(primeiro(i.ticket, 110)) + '</div></div>' + (i.modalidade ? '<div class="op-linha"><span>Modalidade</span><div class="op-pub">' + esc(i.modalidade) + '</div></div>' : '') +
        '<div class="op-linha"><span>Domínios</span><div class="tags">' + (i.dominios || []).slice(0, 3).map(function (d) { return '<span class="tag">' + esc(A.dom(d)) + '</span>'; }).join('') + ((i.dominios || []).length > 3 ? '<span class="tag mais">+' + (i.dominios.length - 3) + '</span>' : '') + '</div></div></div>' +
        '<div class="op-base"><span class="status ' + (n ? 'ab' : 'cont') + '">' + (n ? n + ' chamada' + (n > 1 ? 's' : '') + ' aberta' + (n > 1 ? 's' : '') : ROT_AB[i.abrangencia] || 'Federal') + '</span>' +
        '<span class="fonte">' + cmpBtn(i.id) + (lk ? ' <a href="' + esc(lk.url) + '" target="_blank" rel="noopener">fonte oficial ↗</a>' : '') + '</span></div></article>';
    };
  }
  T.instrumentos = function (A, sub, q, box, mesma) {
    var D = A.D, esc = A.esc; AA = A;
    if (sub) { fichaInstr(A, sub, box); marcaCmp(); return; }
    var fam = cont(D.instrumentos, familia), natN = cont(D.instrumentos, function (i) { return i.nat; }), porAg = cont(D.instrumentos, function (i) { return i.agenciaNome; });
    var top = Object.keys(porAg).sort(function (a, b) { return porAg[b] - porAg[a]; }).slice(0, 7).map(function (k) { return [k, porAg[k]]; });
    var comCham = D.instrumentos.filter(function (i) { return chamadasDo(A, i.id).length; }).length;
    catalogo(A, box, {
      chave: 'instrumentos', titulo: 'Catálogo', placeholder: 'Pesquisar por nome, sigla, lei ou tema', genero: 'o', contagemRot: ['instrumento', 'instrumentos'],
      faixa: {olho: 'Instrumentos de fomento · ' + D.instrumentos.length + ' fichas', tit: 'Leis, programas e incentivos<br><em>em um só catálogo</em>', txt: 'Cada ficha diz <b>quem pode, quanto, como acessar e onde costuma dar errado</b>, com a base legal e o link oficial.',
        num: [String(D.instrumentos.length), 'instrumentos mapeados'], quebra: [[String(natN.reembolsavel || 0), 'reembolsáveis (crédito)'], [String(natN['nao-reembolsavel'] || 0), 'não reembolsáveis'], [String(natN.fiscal || 0), 'incentivos fiscais']],
        dir: barrasFaixa(A, 'Agências com mais instrumentos', top, function (p) { return '#/instrumentos?ag=' + encodeURIComponent(p[0]); })},
      aviso: comCham + ' instrumentos têm chamada aberta agora no Radar.',
      itens: D.instrumentos,
      grupos: [
        {k: 'fam', t: 'Família', aberto: true, val: function (i) { return [familia(i)]; }, rot: ROT_FAM, ordem: FAMILIAS.map(function (f) { return f[0]; })},
        {k: 'nat', t: 'Natureza do recurso', aberto: true, val: function (i) { return [i.nat || 'a-confirmar']; }, rot: A.NAT_ROT},
        {k: 'ab', t: 'Abrangência', aberto: true, val: function (i) { return [i.abrangencia || 'federal']; }, rot: ROT_AB, ordem: ['federal', 'regional', 'estadual']},
        {k: 'dom', t: 'Domínio tecnológico', aberto: true, val: function (i) { return i.dominios || []; }, rot: function (k) { return A.dom(k); }},
        {k: 'ag', t: 'Agência', val: function (i) { return [i.agenciaNome || '—']; }},
        {k: 'tipo', t: 'Categoria do Atlas', val: function (i) { return [i.tipo || '—']; }},
        {k: 'aberta', t: 'Chamada aberta', val: function (i) { return [chamadasDo(A, i.id).length ? 'sim' : 'nao']; }, rot: {sim: 'Com chamada aberta agora', nao: 'Sem chamada aberta'}, ordem: ['sim', 'nao']}
      ],
      busca: function (i) { return [i.nome, i.sigla, i.resumo, i.base, (i.tags || []).join(' '), i.agenciaNome, i.tipo].join(' '); },
      ordens: [['nome', 'Nome (A–Z)', function (a, b) { return (a.sigla || a.nome).localeCompare(b.sigla || b.nome, 'pt-BR'); }], ['cham', 'Com chamadas abertas primeiro', function (a, b) { return chamadasDo(A, b.id).length - chamadasDo(A, a.id).length; }], ['ag', 'Agência', function (a, b) { return String(a.agenciaNome).localeCompare(b.agenciaNome, 'pt-BR'); }]],
      cartao: cartaoInstr(A), vazio: 'Nenhum instrumento com esses filtros.'
    }, q, mesma); marcaCmp();
  };
  function fichaInstr(A, id, box) {
    var D = A.D, esc = A.esc, i = D.instrumentos.filter(function (x) { return x.id === id; })[0];
    if (!i) { box.innerHTML = '<div class="wrap ficha"><div class="bloco ficha-cab"><h1>Instrumento não encontrado</h1><p class="ag"><a href="#/instrumentos">Voltar ao catálogo</a></p></div></div>'; return; }
    var chs = chamadasDo(A, i.id), tds = todasDo(A, i.id), outras = tds.filter(function (c) { return c.status !== 'aberta'; }), rel = D.instrumentos.filter(function (x) { return x.id !== i.id && familia(x) === familia(i); }).slice(0, 3);
    var ag = D.agencias.filter(function (a) { return a.id === i.agencia; })[0];
    box.innerHTML = '<div class="wrap ficha">' + cabecalho(A, {
      migalha: '<a href="#/instrumentos">Instrumentos</a> / ' + esc(ROT_FAM[familia(i)]), fav: i.id, voltar: '#/instrumentos', voltarRot: 'Voltar ao catálogo',
      olho: 'Instrumento · ' + (i.tipo || ''), tit: (i.sigla && i.sigla !== i.nome ? i.sigla + ' · ' : '') + i.nome,
      sub: ag ? '<a href="#/agentes/' + encodeURIComponent(ag.id) + '" class="btn-txt" style="font-size:14.5px">' + esc(ag.nome) + '</a> · ' + esc(ROT_AB[i.abrangencia] || 'Federal') : esc(i.agenciaNome || ''),
      tags: (i.dominios || []).map(function (d) { return '<span class="tag">' + A.ICO.dom + esc(A.dom(d)) + '</span>'; }).join('')
    }) +
    '<div class="ficha-tres">' +
      '<div class="bloco"><h4>Quem pode</h4><p class="txt" style="font-size:14px">' + esc(i.quemPode || '') + '</p>' + (i.publicos ? '<div class="tags" style="margin-top:12px">' + i.publicos.map(function (p) { return '<span class="tag" style="white-space:normal;line-height:1.35">' + A.ICO.pub + esc(p) + '</span>'; }).join('') + '</div>' : '') + '</div>' +
      '<div class="bloco"><h4>Quanto e como</h4><div class="dado"><span>Natureza do recurso</span><b>' + A.natTag(i.nat) + '</b></div><div class="dado"><span>Valor ou benefício</span><b style="font-weight:400;font-size:14px;line-height:1.55">' + esc(i.ticket || '—') + '</b></div><div class="dado"><span>Modalidade</span><b style="font-weight:400;font-size:14px;line-height:1.55">' + esc(i.modalidade || '—') + '</b></div></div>' +
      '<div class="bloco"><h4>Prazo e base legal</h4><div class="dado"><span>Prazo</span><b style="font-weight:400;font-size:14px;line-height:1.55">' + esc(i.prazo || '—') + '</b></div><div class="dado"><span>Base legal</span><b style="font-weight:400;font-size:14px;line-height:1.55">' + esc(i.base || '—') + '</b></div>' +
        '<div class="dado"><span>Situação no Radar</span><b><span class="status ' + (chs.length ? 'ab' : 'cont') + '">' + (chs.length ? chs.length + ' chamada' + (chs.length > 1 ? 's' : '') + ' aberta' + (chs.length > 1 ? 's' : '') : 'Sem chamada aberta') + '</span></b></div></div>' +
    '</div>' +
    '<div class="bloco largo"><h4>O que é</h4><p class="txt">' + esc(i.resumo || '') + '</p></div>' +
    '<div class="ficha-duas"><div class="bloco"><h4>Benefícios</h4>' + lista(A, i.beneficios) + '</div><div class="bloco"><h4>Quando não se aplica</h4><p class="txt">' + esc(i.naoSeAplica || 'Não informado.') + '</p></div></div>' +
    (i.comoAcessar && i.comoAcessar.length ? '<div class="bloco largo"><h4>Como acessar, passo a passo</h4>' + lista(A, i.comoAcessar, 'passos') + '</div>' : '') +
    (i.pegadinhas && i.pegadinhas.length ? '<div class="bloco largo alerta"><h4>Atenção: onde costuma dar errado</h4>' + lista(A, i.pegadinhas) + '</div>' : '') +
    (i.links && i.links.length ? '<div class="bloco largo"><h4>Fontes oficiais</h4><ul class="links-of">' + i.links.map(function (l) { return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '<span>' + esc(l.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) + ' ↗</span></a></li>'; }).join('') + '</ul></div>' : '') +
    '<div class="secao-tit"><h2 class="tit-md">Chamadas deste instrumento</h2><a class="btn-txt" href="#/radar">Ver o Radar</a></div>' +
    (chs.length ? '<div class="grade">' + chs.map(A.cartaoChamada).join('') + '</div>' : '<p class="txt">Nenhuma chamada aberta agora' + (tds.length ? '.' : ' e nenhuma registrada no Radar para este instrumento.') + '</p>') +
    (outras.length ? '<details class="cham-hist"' + (chs.length ? '' : ' open') + '><summary>Edições anteriores e próximas <em>' + outras.length + '</em></summary><div class="linhas-l">' + outras.slice().sort(function (a, b) { var pa = a.status === 'em-breve' ? 0 : 1, pb = b.status === 'em-breve' ? 0 : 1; return (pa - pb) || ((b.encerramento || '') < (a.encerramento || '') ? -1 : 1); }).map(function (c) { var st = A.estado(c); return '<a class="linha-l" href="#/radar/' + encodeURIComponent(c.id) + '"><b>' + esc(c.titulo) + '</b><small>' + esc(c.agenciaNome || '') + (c.encerramento ? ' · ' + (c.status === 'encerrada' ? 'encerrou em ' : 'encerra em ') + A.fdata(c.encerramento) : '') + (A.valorCurto(c) ? ' · ' + A.valorCurto(c) : '') + '</small><span class="status ' + st.cls + '">' + esc(c.status === 'em-breve' ? 'Em breve' : 'Encerrada') + '</span></a>'; }).join('') + '</div></details>' : '') +
    (rel.length ? '<div class="secao-tit"><h2 class="tit-md">Da mesma família: ' + esc(ROT_FAM[familia(i)]) + '</h2><a class="btn-txt" href="#/instrumentos?fam=' + familia(i) + '">Ver todos</a></div><div class="grade tres">' + rel.map(cartaoInstr(A)).join('') + '</div>' : '') +
    '<div class="ficha-rodape"><a href="#/instrumentos" class="btn-linha">← Catálogo</a><a href="#/simulador" class="btn-azul">Simular aplicabilidade <span class="seta" aria-hidden="true">→</span></a></div></div>';
    var barra = box.querySelector('.ficha-acoes .barra-esq'); if (barra) barra.insertAdjacentHTML('afterbegin', cmpBtn(i.id));
    A.observar('.op.entra', box);
  }

  /* ================= AGENTES ================= */
  function numsAgente(A, ag) {
    var D = A.D;
    return {ins: D.instrumentos.filter(function (i) { return i.agencia === ag.id; }), ab: A.ABERTAS.filter(function (c) { return c.agencia === ag.id; }), todas: D.chamadas.filter(function (c) { return c.agencia === ag.id; })};
  }
  T.agentes = function (A, sub, q, box, mesma) {
    var D = A.D, esc = A.esc;
    if (sub) return fichaAgente(A, sub, box);
    var porTipo = cont(D.agencias, function (a) { return a.tipo; });
    var rank = D.agencias.map(function (a) { return [a.nome, numsAgente(A, a).ab.length]; }).filter(function (p) { return p[1]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 7);
    catalogo(A, box, {
      chave: 'agentes', titulo: 'Financiadores', placeholder: 'Pesquisar agência, banco, fundação, ministério…', genero: 'o', contagemRot: ['financiador', 'financiadores'],
      faixa: {olho: 'Financiadores · ' + D.agencias.length + ' no Atlas', tit: 'Quem financia<br><em>a inovação</em>', txt: 'Agências federais, bancos de desenvolvimento, reguladoras, ministérios e fundações estaduais: <b>o que cada um opera e o que está aberto agora</b>.',
        num: [String(D.agencias.length), 'financiadores'], quebra: [[String(D.agencias.filter(function (a) { return /federal|minist|autarquia|funda/i.test(a.tipo) && !/estadua/i.test(a.tipo); }).length), 'governo federal'], [String(D.agencias.filter(function (a) { return /banco/i.test(a.tipo); }).length), 'bancos'], [String(D.agencias.filter(function (a) { return /regulad/i.test(a.tipo); }).length), 'reguladoras']],
        dir: barrasFaixa(A, 'Mais chamadas abertas agora', rank)},
      itens: D.agencias,
      grupos: [{k: 'tipo', t: 'Tipo', aberto: true, val: function (a) { return [a.tipo]; }}, {k: 'vinc', t: 'Vínculo', val: function (a) { return [a.vinculo]; }},
        {k: 'ab', t: 'Chamada aberta', aberto: true, val: function (a) { return [numsAgente(A, a).ab.length ? 'sim' : 'nao']; }, rot: {sim: 'Com chamada aberta agora', nao: 'Sem chamada aberta'}, ordem: ['sim', 'nao']}],
      busca: function (a) { return [a.nome, a.tipo, a.vinculo, a.id].join(' '); },
      ordens: [['ab', 'Mais chamadas abertas', function (a, b) { return numsAgente(A, b).ab.length - numsAgente(A, a).ab.length || numsAgente(A, b).ins.length - numsAgente(A, a).ins.length; }], ['ins', 'Mais instrumentos', function (a, b) { return numsAgente(A, b).ins.length - numsAgente(A, a).ins.length; }], ['nome', 'Nome (A–Z)', function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); }]],
      cartao: function (a) {
        var n = numsAgente(A, a);
        return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla">' + esc(a.tipo) + '</p><h3><a href="#/agentes/' + encodeURIComponent(a.id) + '">' + esc(a.nome) + '</a></h3><p class="op-inst">Vínculo: ' + esc(a.vinculo) + '</p></div></div>' +
          '<div class="op-nums"><div><span>Chamadas abertas</span><b class="azul">' + n.ab.length + '</b></div><div><span>Instrumentos</span><b>' + n.ins.length + '</b></div><div><span>No histórico do Radar</span><b>' + n.todas.length + '</b></div></div>' +
          '<div class="op-base"><span class="fonte">' + (n.ab[0] ? 'Próximo prazo: ' + (n.ab.filter(function (c) { return c.encerramento; }).sort(function (x, y) { return x.encerramento < y.encerramento ? -1 : 1; })[0] || {}).encerramento.split('-').reverse().join('/') : 'Sem chamada aberta') + '</span><a class="btn-txt" style="position:relative;z-index:2;font-size:13px" href="#/agentes/' + encodeURIComponent(a.id) + '">Ver perfil</a></div></article>';
      }
    }, q, mesma);
  };
  function fichaAgente(A, id, box) {
    var D = A.D, esc = A.esc, a = D.agencias.filter(function (x) { return x.id === id; })[0];
    if (!a) { box.innerHTML = '<div class="wrap ficha"><div class="bloco ficha-cab"><h1>Financiador não encontrado</h1></div></div>'; return; }
    var n = numsAgente(A, a), enc = n.todas.filter(function (c) { return c.status === 'encerrada'; }).sort(function (x, y) { return (y.encerramento || '') < (x.encerramento || '') ? -1 : 1; });
    var vol = n.ab.reduce(function (s, c) { return s + (c.valorTotal || 0); }, 0);
    box.innerHTML = '<div class="wrap ficha">' + cabecalho(A, {migalha: '<a href="#/agentes">Financiadores</a> / ' + esc(a.tipo), voltar: '#/agentes', voltarRot: 'Voltar aos financiadores', olho: 'Financiador · ' + a.tipo, tit: a.nome, sub: 'Vínculo: ' + esc(a.vinculo)}) +
      '<div class="ficha-tres"><div class="bloco"><h4>Chamadas abertas</h4><div class="dado"><b class="grande">' + n.ab.length + '</b></div>' + (vol ? '<div class="dado"><span>Somando</span><b>' + A.mi(vol) + '</b></div>' : '') + '</div>' +
      '<div class="bloco"><h4>Instrumentos operados</h4><div class="dado"><b class="grande">' + n.ins.length + '</b></div></div>' +
      '<div class="bloco"><h4>No histórico do Radar</h4><div class="dado"><b class="grande">' + n.todas.length + '</b></div><div class="dado"><span>Encerradas</span><b>' + enc.length + '</b></div></div></div>' +
      (n.ab.length ? '<div class="secao-tit"><h2 class="tit-md">Chamadas abertas</h2><a class="btn-txt" href="#/radar?ag=' + encodeURIComponent(n.ab[0].agenciaNome) + '">Filtrar no Radar</a></div><div class="grade">' + n.ab.map(A.cartaoChamada).join('') + '</div>' : '') +
      (n.ins.length ? '<div class="secao-tit"><h2 class="tit-md">Instrumentos que opera</h2></div><div class="grade tres">' + n.ins.map(cartaoInstr(A)).join('') + '</div>' : '') +
      (enc.length ? '<div class="secao-tit"><h2 class="tit-md">Chamadas encerradas recentes</h2></div><div class="bloco"><div class="linhas-l" style="margin-top:0">' + enc.slice(0, 8).map(function (c) { return '<a class="linha-l" href="#/radar/' + encodeURIComponent(c.id) + '"><b>' + esc(c.titulo) + '</b><small>Encerrou em ' + A.fdata(c.encerramento) + (A.valorCurto(c) ? ' · ' + A.valorCurto(c) : '') + '</small><span class="status">Encerrada</span></a>'; }).join('') + '</div></div>' : '') +
      '</div>';
    A.observar('.op.entra', box);
  }

  /* ================= DIRETÓRIO DE ICTs ================= */
  T.icts = function (A, sub, q, box, mesma) {
    var D = A.D, esc = A.esc;
    if (sub) return fichaICT(A, sub, box);
    var cats = cont(D.icts, function (t) { return t.categoria; }), top = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; });
    /* Unidades EMBRAPII = as 96 do painel: 87 na categoria 'Unidade EMBRAPII' + 9 Institutos SENAI de Inovação credenciados (flag unidadeEmbrapii) */
    var nEmb = D.icts.filter(function (t) { return t.unidadeEmbrapii; }).length;
    catalogo(A, box, {
      chave: 'icts', titulo: 'Diretório', placeholder: 'Nome, sigla, cidade ou linha de pesquisa', genero: 'a', contagemRot: ['ICT', 'ICTs'],
      faixa: {olho: 'Instituições de ciência e tecnologia', tit: 'Parceiros de pesquisa<br><em>em todo o país</em>', txt: 'Universidades, institutos, INCTs, <b>Unidades EMBRAPII e Institutos SENAI</b>, com domínios, credenciamentos e linhas de pesquisa.',
        num: [String(D.icts.length), 'ICTs no Atlas'], quebra: top.slice(0, 3).map(function (k) { return [String(k === 'Unidade EMBRAPII' ? nEmb : cats[k]), k.replace('Arranjo de Pesquisa & Inovação', 'arranjos de P&I').replace('Instituto de Pesquisa', 'institutos de pesquisa').replace('Unidade EMBRAPII', 'Unidades EMBRAPII')]; }),
        dir: mapaPontos(A, D.icts) + '<p class="faixa-nota"><a href="#/mapa" style="color:#fff">Abrir o Mapa de ICTs interativo →</a></p>'},
      itens: D.icts,
      grupos: [
        {k: 'cat', t: 'Tipo de instituição', aberto: true, val: function (t) { return [t.categoria].concat(t.unidadeEmbrapii && t.categoria !== 'Unidade EMBRAPII' ? ['Unidade EMBRAPII'] : []); }, ponto: A.corCat, ordem: ['Unidade EMBRAPII', 'Instituto SENAI de Inovação', 'Centro EMBRAPII', 'Instituto de Pesquisa', 'Centro de Inovação', 'Centro de Tecnologia', 'Arranjo de Pesquisa & Inovação', 'INCT']},
        {k: 'reg', t: 'Região', aberto: true, val: function (t) { return [t.regiao]; }, ordem: ['Sudeste', 'Sul', 'Nordeste', 'Norte', 'Centro-Oeste']},
        {k: 'uf', t: 'Estado', val: function (t) { return [t.uf]; }, rot: function (k) { return D.ufNomes[k] || k; }, ordem: 'alfa'},
        {k: 'dom', t: 'Domínio tecnológico', val: function (t) { return t.dominios || []; }, rot: function (k) { return A.dom(k); }},
        {k: 'cred', t: 'Credenciamento', val: function (t) { return t.credenciamentos || []; }},
        {k: 'area', t: 'Área do conhecimento', val: function (t) { return t.area ? [t.area.split(' · ')[0]] : []; }}
      ],
      busca: function (t) { return [t.nome, t.longo, t.cidade, t.uf, (t.linhasPesquisa || []).join(' '), (t.areas || []).join(' '), t.area].join(' '); },
      ordens: [['prio', 'Unidades EMBRAPII e ISIs primeiro', function (a, b) { var P = ['Unidade EMBRAPII', 'Instituto SENAI de Inovação', 'Centro EMBRAPII', 'Instituto de Pesquisa', 'Centro de Inovação', 'Centro de Tecnologia', 'Arranjo de Pesquisa & Inovação', 'INCT'], pa = a.unidadeEmbrapii ? 0 : P.indexOf(a.categoria), pb = b.unidadeEmbrapii ? 0 : P.indexOf(b.categoria); pa = pa < 0 ? 99 : pa; pb = pb < 0 ? 99 : pb; return pa - pb || a.nome.localeCompare(b.nome, 'pt-BR'); }], ['nome', 'Nome (A–Z)', function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); }], ['uf', 'Estado', function (a, b) { return a.uf.localeCompare(b.uf) || a.nome.localeCompare(b.nome, 'pt-BR'); }], ['dest', 'Destaques primeiro', function (a, b) { return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0) || a.nome.localeCompare(b.nome, 'pt-BR'); }]],
      cartao: function (t) {
        return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla"><i class="ponto-cat" style="background:' + A.corCat(t.categoria) + '"></i>' + esc(t.categoria) + '</p><h3><a href="#/icts/' + encodeURIComponent(t.id) + '">' + esc(t.nome) + '</a></h3>' + (t.longo && t.longo !== t.nome ? '<p class="op-inst">' + esc(t.longo) + '</p>' : '') + '</div></div>' +
          '<div class="op-linhas"><div class="op-linha"><span>Onde</span><div class="tags"><span class="tag">' + A.ICO.geo + esc((t.cidade ? t.cidade + ', ' : '') + t.uf) + '</span></div></div>' +
          ((t.dominios || []).length ? '<div class="op-linha"><span>Domínios</span><div class="tags">' + t.dominios.slice(0, 5).map(function (d) { return '<span class="tag">' + esc(A.dom(d)) + '</span>'; }).join('') + (t.dominios.length > 5 ? '<span class="tag mais">+' + (t.dominios.length - 5) + '</span>' : '') + '</div></div>' : '') +
          ((t.credenciamentos || []).length ? '<div class="op-linha"><span>Credenciada</span><div class="tags">' + t.credenciamentos.map(function (c) { return '<span class="tag" style="border-color:var(--azul-borda);color:var(--azul-txt)">' + esc(c) + '</span>'; }).join('') + '</div></div>' : '') + '</div>' +
          '<div class="op-base"><a class="btn-txt" style="position:relative;z-index:2;font-size:13px" href="#/mapa?uf=' + t.uf + '&ict=' + encodeURIComponent(t.id) + '">Ver no mapa</a>' + (t.site ? '<span class="fonte"><a href="' + esc(t.site) + '" target="_blank" rel="noopener">site oficial ↗</a></span>' : '') + '</div></article>';
      }
    }, q, mesma);
  };
  function fichaICT(A, id, box) {
    var D = A.D, esc = A.esc, t = D.icts.filter(function (x) { return x.id === id; })[0];
    if (!t) { box.innerHTML = '<div class="wrap ficha"><div class="bloco ficha-cab"><h1>ICT não encontrada</h1></div></div>'; return; }
    var mesmaCidade = D.icts.filter(function (x) { return x.id !== t.id && x.cidade === t.cidade && x.uf === t.uf; });
    var abUF = A.ABERTAS.filter(function (c) { return (c.ufs || []).indexOf(t.uf) >= 0; }).length;
    var mapa = A.svgBrasil('', false).replace('class="uf " data-uf="' + t.uf + '"', 'class="uf sel" data-uf="' + t.uf + '"');
    if (t.lat != null) { var p = xy(t.lat, t.lng); mapa = mapa.replace('</svg>', '<circle cx="' + p[0].toFixed(0) + '" cy="' + p[1].toFixed(0) + '" r="16"/></svg>'); }
    box.innerHTML = '<div class="wrap ficha">' + cabecalho(A, {migalha: '<a href="#/icts">ICTs</a> / ' + esc(D.ufNomes[t.uf] || t.uf), fav: t.id, voltar: '#/icts', voltarRot: 'Voltar ao diretório',
      olho: t.categoria + (t.tipo && t.tipo !== t.categoria ? ' · ' + t.tipo : ''), tit: t.nome, sub: esc(t.longo && t.longo !== t.nome ? t.longo + ' · ' : '') + esc((t.cidade ? t.cidade + ', ' : '') + (D.ufNomes[t.uf] || t.uf)),
      tags: (t.dominios || []).map(function (d) { return '<span class="tag">' + A.ICO.dom + esc(A.dom(d)) + '</span>'; }).join('')}) +
      (t.nota ? '<div class="ict-nota" role="note"><b>Atenção</b><p>' + esc(t.nota) + '</p></div>' : '') +
      '<div class="ficha-tres">' +
        '<div class="bloco"><h4>Identificação</h4><div class="dado"><span>Tipo</span><b>' + esc(t.categoria) + '</b></div><div class="dado"><span>Região</span><b>' + esc(t.regiao) + '</b></div>' + (t.site ? '<a class="btn-azul peq" style="margin-top:16px" href="' + esc(t.site) + '" target="_blank" rel="noopener">Site oficial ↗</a>' : '') + '</div>' +
        '<div class="bloco"><h4>Credenciamentos</h4>' + ((t.credenciamentos || []).length ? '<div class="tags" style="margin-top:12px">' + t.credenciamentos.map(function (c) { return '<span class="tag" style="border-color:var(--azul-borda);color:var(--azul-txt);font-size:13.5px">' + esc(c) + '</span>'; }).join('') + '</div>' : '<p class="txt">Nenhum credenciamento registrado no Atlas.</p>') +
          (t.unidadeEmbrapii ? '<div class="dado"><span>Unidade EMBRAPII</span><b>Sim' + (t.embrapiiCod ? ' · código ' + esc(t.embrapiiCod) : '') + '</b></div>' : '') + (t.area ? '<div class="dado"><span>Área de competência</span><b style="font-weight:400;font-size:14px">' + esc(t.area) + '</b></div>' : '') + '</div>' +
        '<div class="bloco ficha-mapa"><h4>Localização</h4>' + mapa + '<a class="btn-linha peq" style="margin-top:12px" href="#/mapa?uf=' + t.uf + '&ict=' + encodeURIComponent(t.id) + '">Ver no mapa de ICTs</a></div>' +
      '</div>' +
      ((t.linhasPesquisa || []).length || (t.areas || []).length ? '<div class="ficha-duas">' + ((t.linhasPesquisa || []).length ? '<div class="bloco"><h4>Linhas de pesquisa</h4>' + lista(A, t.linhasPesquisa) + '</div>' : '') + ((t.areas || []).length ? '<div class="bloco"><h4>Áreas</h4>' + lista(A, t.areas) + '</div>' : '') + '</div>' : '') +
      ((t.projetos || []).length ? '<div class="bloco largo"><h4>Projetos com empresas</h4><table class="tabela"><thead><tr><th>Projeto</th><th>Parceiro</th><th>Ano</th></tr></thead><tbody>' + t.projetos.map(function (p) { return '<tr><td>' + esc(p.nome) + '</td><td>' + esc(p.empresa || '') + '</td><td>' + esc(p.ano || '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '') +
      '<div class="ficha-duas"><div class="bloco"><h4>Oportunidades em ' + esc(D.ufNomes[t.uf]) + '</h4><p class="txt">' + abUF + ' chamada' + (abUF === 1 ? '' : 's') + ' estadual ou regional aberta' + (abUF === 1 ? '' : 's') + ', além das nacionais.</p><a class="btn-linha peq" style="margin-top:14px" href="#/estados/' + t.uf + '">Ver tudo o que vale em ' + esc(t.uf) + ' →</a></div>' +
      '<div class="bloco"><h4>Outras ICTs em ' + esc(t.cidade || t.uf) + '</h4>' + (mesmaCidade.length ? '<div class="linhas-l">' + mesmaCidade.slice(0, 6).map(function (x) { return '<a class="linha-l" href="#/icts/' + encodeURIComponent(x.id) + '"><b>' + esc(x.nome) + '</b><small>' + esc(x.categoria) + '</small></a>'; }).join('') + '</div>' + (mesmaCidade.length > 6 ? '<a class="btn-txt" href="#/icts?q=' + encodeURIComponent(t.cidade) + '">Ver as ' + mesmaCidade.length + '</a>' : '') : '<p class="txt">Nenhuma outra na mesma cidade.</p>') + '</div></div>' +
      '</div>';
  }

  /* ================= INOVAÇÃO ABERTA E ECOSSISTEMA ================= */
  var ROT_ECO = {'pdi-aneel': 'P&D&I ANEEL (portais de empresas)', desafio: 'Desafio de inovação aberta', premio: 'Prêmio', aceleracao: 'Aceleração', outros: 'Outros programas', edital: 'Edital', investimento: 'Investimento', incubacao: 'Incubação', concurso: 'Concurso', mentoria: 'Mentoria', 'pre-aceleracao': 'Pré-aceleração'};
  function sitEco(A, e) { if (e.prazoTipo === 'data' && e.encerramento && A.dias(e.encerramento) < 0) return 'encerrado'; if (e.abertura && A.dias(e.abertura) > 0) return 'embreve'; return e.prazoTipo === 'data' && e.encerramento ? 'aberto' : 'continuo'; }
  T.ecossistema = function (A, sub, q, box, mesma) {
    var D = A.D, esc = A.esc, eco = D.ecossistema;
    var porTipo = cont(eco, function (e) { return e.tipo; }), abertas = eco.filter(function (e) { var s = sitEco(A, e); return s === 'aberto' || s === 'continuo'; }), comRec = abertas.filter(function (e) { return e.aporte === 'sim'; }).length, verif = eco.filter(function (e) { return e.verificadoEm; }), ultVer = verif.reduce(function (m, e) { return e.verificadoEm > m ? e.verificadoEm : m; }, ''), urg15 = abertas.filter(function (e) { var d = e.prazoTipo === 'data' && e.encerramento ? A.dias(e.encerramento) : null; return d !== null && d >= 0 && d <= 15; }).length;
    catalogo(A, box, {
      chave: 'ecossistema', titulo: 'Programas e desafios', placeholder: 'Empresa, programa, tema…', genero: 'o', contagemRot: ['programa', 'programas'],
      faixa: {abas: abasDinheiro('ecossistema'), olho: 'Inovação aberta e ecossistema · última verificação em ' + A.fdata(ultVer), tit: 'Desafios, prêmios e<br><em>programas de empresas</em>', txt: 'Desafios de inovação aberta, aceleração, prêmios e as <b>portas de P&amp;D&amp;I das empresas do setor elétrico</b>, cada um com o link de quem promove.',
        num: [String(abertas.length), 'abertas agora, de ' + eco.length + ' no acervo'], quebra: [[String(comRec), 'abertas com recurso'], [String(verif.length), 'verificadas na fonte'], [String(urg15), 'encerram em 15 dias']],
        dir: barrasFaixa(A, 'Por tipo', Object.keys(porTipo).sort(function (a, b) { return porTipo[b] - porTipo[a]; }).slice(0, 7).map(function (k) { return [ROT_ECO[k] || k, porTipo[k]]; }))},
      itens: eco, padrao: {sit: ['aberto', 'continuo']}, aviso: 'Última verificação em ' + A.fdata(ultVer) + '. Abertas: com inscrição aberta ou fluxo contínuo.',
      grupos: [
        {k: 'sit', t: 'Situação', aberto: true, val: function (e) { return [sitEco(A, e)]; }, rot: {aberto: 'Inscrição aberta', continuo: 'Contínuo ou sem prazo', embreve: 'Em breve', encerrado: 'Encerrado'}, ordem: ['aberto', 'continuo', 'embreve', 'encerrado']},
        {k: 'tipo', t: 'Tipo', aberto: true, val: function (e) { return [e.tipo]; }, rot: ROT_ECO},
        {k: 'nat', t: 'Natureza do recurso', val: function (e) { return [e.nat || 'a-confirmar']; }, rot: A.NAT_ROT},
        {k: 'aporte', t: 'Aporte financeiro', val: function (e) { return [e.aporte || '—']; }, rot: {sim: 'Com aporte', nao: 'Sem aporte', 'nao-informado': 'Não informado', 'empresa-paga': 'A empresa paga para participar', indefinido: 'Não informado', '—': 'Não informado'}},
        {k: 'ab', t: 'Abrangência', val: function (e) { return [e.abrangencia ? (D.ufNomes[e.abrangencia] ? 'UF' : e.abrangencia) : 'Não informada']; }, rot: {UF: 'Estadual'}},
        {k: 'dom', t: 'Domínio tecnológico', val: function (e) { return e.dominios || []; }, rot: function (k) { return A.dom(k); }}
      ],
      busca: function (e) { return [e.nome, e.promotor, e.resumo, e.publico, e.valor, e.nota].join(' '); },
      ordens: [['prazo', 'Prazo mais próximo', function (a, b) { return (a.encerramento && A.dias(a.encerramento) >= 0 ? a.encerramento : '9999') < (b.encerramento && A.dias(b.encerramento) >= 0 ? b.encerramento : '9999') ? -1 : 1; }], ['verif', 'Verificadas primeiro', function (a, b) { return (b.verificadoEm || '').localeCompare(a.verificadoEm || '') || a.nome.localeCompare(b.nome, 'pt-BR'); }], ['nome', 'Nome (A–Z)', function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); }]],
      cartao: function (e) {
        var s = sitEco(A, e), d = e.encerramento ? A.dias(e.encerramento) : null;
        var st = s === 'embreve' ? ['cont', 'Abre em ' + A.fdata(e.abertura)] : s === 'encerrado' ? ['', 'Encerrado'] : s === 'continuo' ? ['cont', 'Contínuo'] : d <= 15 ? ['urg', 'Fecha em ' + d + ' dia' + (d === 1 ? '' : 's')] : ['ab', 'Aberto até ' + A.fdata(e.encerramento).slice(0, 5)];
        return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla">' + esc(ROT_ECO[e.tipo] || e.tipo) + '</p><h3><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.nome) + '</a></h3><p class="op-inst">' + esc(e.promotor || '') + '</p></div></div>' +
          '<p class="op-txt">' + esc(e.resumo || '') + '</p>' +
          '<div class="op-linhas"><div class="op-linha"><span>Recurso</span><div class="tags">' + A.natTag(e.nat) + '</div></div>' + (e.valor ? '<div class="op-linha"><span>Aporte</span><div style="font-size:13px;color:var(--ink-2)">' + esc(primeiro(e.valor, 100)) + '</div></div>' : '') + (e.publico ? '<div class="op-linha"><span>Para quem</span><div style="font-size:13px;color:var(--ink-2)">' + esc(primeiro(e.publico, 100)) + '</div></div>' : '') + (e.dominios && e.dominios.length ? '<div class="op-linha"><span>Domínios</span><div class="tags">' + e.dominios.slice(0, 4).map(function (k) { return '<span class="tag">' + esc(A.dom(k)) + '</span>'; }).join('') + '</div></div>' : '') + '</div>' +
          (e.nota ? '<p class="op-nota">' + esc(e.nota) + '</p>' : '') +
          detalhes(A, [['Tipo', ROT_ECO[e.tipo] || e.tipo], ['Promotor', e.promotor], ['Resumo', e.resumo], ['Para quem', e.publico], ['Aporte ou valor', e.valor], ['Recurso', A.natTag(e.nat), true],
            ['Abrangência', e.abrangencia ? (D.ufNomes[e.abrangencia] || e.abrangencia) : ''], ['Estados', (e.ufs || []).join(', ')], ['Domínios', (e.dominios || []).map(function (k) { return A.dom(k); }).join(', ')],
            ['Abertura', e.abertura ? A.fdata(e.abertura) : ''], ['Encerramento', e.encerramento ? A.fdata(e.encerramento) : (e.prazoTipo === 'fluxo-continuo' ? 'Fluxo contínuo' : e.prazoTipo === 'indefinido' ? 'Sem prazo definido na fonte' : '')], ['Conferido em', e.verificadoEm ? A.fdata(e.verificadoEm) : '']], e.url) +
          '<div class="op-base"><span class="status ' + st[0] + '">' + st[1] + '</span><span class="fonte">' + (e.verificadoEm ? 'Conferido em ' + A.fdata(e.verificadoEm) + ' · ' : '') + '<a href="' + esc(e.url) + '" target="_blank" rel="noopener">fonte oficial ↗</a></span></div></article>';
      }
    }, q, mesma);
  };

  /* ================= COMPRAS PÚBLICAS DE INOVAÇÃO ================= */
  T.compras = function (A, sub, q, box) {
    var D = A.D, esc = A.esc;
    var l = D.chamadas.filter(function (c) { return /compra|cpsi|encomenda/i.test([c.categoria, c.titulo, (c.tags || []).join(' ')].join(' ')); });
    var ab = l.filter(function (c) { return c.status !== 'encerrada'; }).sort(function (a, b) { return (a.encerramento || '9999') < (b.encerramento || '9999') ? -1 : 1; }), enc = l.filter(function (c) { return c.status === 'encerrada'; });
    var compradores = cont(l, function (c) { return c.agenciaNome; });
    box.innerHTML = faixa(A, {olho: 'Compras públicas de inovação', tit: 'O Estado como<br><em>primeiro cliente</em>', txt: 'Licitações especiais e <b>Contratos Públicos para Solução Inovadora (CPSI)</b> de prefeituras, estatais e consórcios, com prazo e valor.',
      num: [String(ab.length), 'compras abertas agora'], quebra: [[String(l.length), 'no histórico do Radar'], [String(Object.keys(compradores).length), 'compradores'], [String(enc.length), 'encerradas']],
      dir: barrasFaixa(A, 'Quem mais compra', Object.keys(compradores).sort(function (a, b) { return compradores[b] - compradores[a]; }).slice(0, 7).map(function (k) { return [k.split(',')[0], compradores[k]]; }))}) +
      '<div class="wrap" style="padding-bottom:110px"><div class="tres-cols">' +
        '<div class="bloco"><p class="olho">Licitação especial</p><h3>Seleção por proposta de solução</h3><p>A administração descreve o problema, não a solução, e escolhe entre as propostas recebidas (Lei Complementar 182/2021, arts. 12 a 15).</p></div>' +
        '<div class="bloco"><p class="olho">CPSI</p><h3>Contrato para testar a solução</h3><p>O contrato tem vigência limitada e teto de valor fixado na lei, para testar a solução antes de uma compra em escala.</p></div>' +
        '<div class="bloco"><p class="olho">Depois do teste</p><h3>Fornecimento</h3><p>Se a solução funcionar, a lei permite contratar o fornecimento em escala com o mesmo fornecedor, nas condições do CPSI. Confirme sempre no edital.</p></div>' +
      '</div>' +
      '<div class="secao-tit"><h2 class="tit-md">Abertas e em breve</h2><a class="btn-txt" href="#/radar?cat=' + encodeURIComponent('Compra pública de inovação (CPSI)') + '">Ver no Radar com filtros</a></div>' +
      (ab.length ? '<div class="grade">' + ab.map(A.cartaoChamada).join('') + '</div>' : '<p class="txt">Nenhuma compra aberta agora.</p>') +
      (enc.length ? '<div class="secao-tit"><h2 class="tit-md">Encerradas</h2></div><div class="bloco"><div class="linhas-l" style="margin-top:0">' + enc.map(function (c) { return '<a class="linha-l" href="#/radar/' + encodeURIComponent(c.id) + '"><b>' + esc(c.titulo) + '</b><small>' + esc(c.agenciaNome) + ' · encerrou em ' + A.fdata(c.encerramento) + (A.valorCurto(c) ? ' · ' + A.valorCurto(c) : '') + '</small><span class="status">Encerrada</span></a>'; }).join('') + '</div></div>' : '') +
      '</div>';
    ativaCampos(A, box); A.observar('.op.entra', box);
  };

  /* ================= AGENDA ================= */
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  function eventos(A) {
    var ev = [];
    A.D.chamadas.forEach(function (c) { if (c.status !== 'encerrada' && c.encerramento) ev.push({d: c.encerramento, t: c.titulo, ag: c.agenciaNome, href: '#/radar/' + encodeURIComponent(c.id), cls: A.breve(c) ? 'urg' : '', fav: A.favorito(c.id), id: c.id, link: c.link}); });
    A.D.ecossistema.forEach(function (e) { if (e.encerramento && A.dias(e.encerramento) >= 0) ev.push({d: e.encerramento, t: e.nome, ag: e.promotor, href: e.url, ext: true, cls: 'eco', fav: false, id: e.id, link: e.url}); });
    return ev.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  }
  T.agenda = function (A, sub, q, box) {
    var D = A.D, esc = A.esc, ev = eventos(A);
    var m = /(?:^|&)mes=(\d{4})-(\d{2})/.exec(q || ''), ano = m ? +m[1] : A.HOJE.getFullYear(), mes = m ? +m[2] - 1 : A.HOJE.getMonth();
    var favs = ev.filter(function (e) { return e.fav; });
    var prox = ev.filter(function (e) { var d = A.dias(e.d); return d >= 0 && d <= 30; });
    function cal() {
      var ini = new Date(ano, mes, 1), dow = (ini.getDay() + 6) % 7, s = '';
      ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].forEach(function (d) { s += '<div class="cal-dow">' + d + '</div>'; });
      for (var k = 0; k < 42; k++) {
        var dt = new Date(ano, mes, 1 - dow + k), iso = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
        var doDia = ev.filter(function (e) { return e.d === iso; }), hoje = iso === D.hoje;
        s += '<div class="cal-dia' + (dt.getMonth() !== mes ? ' fora-mes' : '') + (hoje ? ' hoje' : '') + '"><span>' + dt.getDate() + '</span>' +
          doDia.slice(0, 3).map(function (e) { return '<a class="cal-ev ' + e.cls + (e.fav ? ' fav' : '') + '" href="' + esc(e.href) + '"' + (e.ext ? ' target="_blank" rel="noopener"' : '') + ' title="' + esc(e.t + ' · ' + (e.ag || '')) + '">' + esc(e.t) + '</a>'; }).join('') +
          (doDia.length > 3 ? '<span class="cal-mais">+' + (doDia.length - 3) + ' prazo' + (doDia.length - 3 > 1 ? 's' : '') + '</span>' : '') + '</div>';
        if (k === 34 && new Date(ano, mes, 1 - dow + 35).getMonth() !== mes) break;
      }
      return s;
    }
    function linha(e) { var d = A.dias(e.d); return '<a class="linha-l" href="' + esc(e.href) + '"' + (e.ext ? ' target="_blank" rel="noopener"' : '') + '><b>' + esc(e.t) + '</b><small>' + esc(e.ag || '') + ' · ' + A.fdata(e.d) + '</small><span class="status ' + (e.cls === 'eco' ? 'ab' : d <= 15 ? 'urg' : 'ab') + '">' + (d === 0 ? 'Hoje' : d + ' dia' + (d === 1 ? '' : 's')) + '</span></a>'; }
    var pm = new Date(ano, mes - 1, 1), nm = new Date(ano, mes + 1, 1);
    function mesQ(d) { return '#/agenda?mes=' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
    box.innerHTML = faixa(A, {olho: 'Agenda de prazos', tit: 'Os prazos do mês<br><em>num só calendário</em>', txt: 'Encerramento das chamadas do Radar e dos programas de inovação aberta. <b>Marque a estrela</b> numa chamada para ela aparecer em destaque e entrar no arquivo de calendário.',
      num: [String(prox.length), 'prazos nos próximos 30 dias'], quebra: [[String(ev.filter(function (e) { return e.cls === 'urg'; }).length), 'fecham em 15 dias'], [String(favs.length), 'nos seus favoritos'], [String(ev.length), 'prazos futuros']]}) +
      '<div class="wrap agenda-lay"><div class="bloco"><div class="cal-topo"><h3>' + MESES[mes].charAt(0).toUpperCase() + MESES[mes].slice(1) + ' de ' + ano + '</h3><div class="cal-nav"><a class="btn-linha peq" href="' + mesQ(pm) + '" aria-label="Mês anterior">←</a><a class="btn-linha peq" href="#/agenda">Hoje</a><a class="btn-linha peq" href="' + mesQ(nm) + '" aria-label="Próximo mês">→</a></div></div>' +
        '<div class="cal">' + cal() + '</div><div class="cal-leg"><span><i style="background:var(--verm-bg);box-shadow:inset 0 0 0 1px var(--verm)"></i>Fecha em até 15 dias</span><span><i style="background:var(--azul-suave)"></i>Chamada</span><span><i style="background:var(--verde-bg)"></i>Inovação aberta</span><span><i style="background:var(--sup);box-shadow:inset 3px 0 0 #E3A008"></i>Favorito</span></div></div>' +
        '<div style="display:grid;gap:18px"><div class="bloco"><h4 class="olho">Seus favoritos</h4>' + (favs.length ? '<div class="linhas-l">' + favs.map(linha).join('') + '</div>' : '<p class="txt" style="font-size:14px">Nenhuma chamada marcada. Use a estrela nos cartões do Radar.</p>') +
          '<button type="button" class="btn-azul peq" id="ag-ics" style="margin-top:16px">Baixar arquivo de calendário (.ics)</button><p style="margin-top:8px;font-size:12.5px;color:var(--ink-3)">' + (favs.length ? 'Leva os ' + favs.length + ' favoritos.' : 'Sem favoritos, leva os prazos dos próximos 30 dias.') + ' Abre no Google Agenda, Outlook ou Apple.</p></div>' +
        '<div class="bloco"><h4 class="olho">Próximos 30 dias</h4>' + (prox.length ? '<div class="linhas-l">' + prox.slice(0, 12).map(linha).join('') + '</div>' : '<p class="txt">Nada nos próximos 30 dias.</p>') + '</div></div></div>';
    ativaCampos(A, box);
    box.onclick = function (e) {
      if (!e.target.closest('#ag-ics')) return;
      var lista = favs.length ? favs : prox, L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Atlas da Inovacao//Prototipo v2//PT', 'CALSCALE:GREGORIAN'];
      function txt(s) { return String(s || '').replace(/[\\;,]/g, function (c) { return '\\' + c; }).replace(/\n/g, ' '); }
      lista.forEach(function (x) {
        var d = x.d.replace(/-/g, ''), d2 = new Date(x.d + 'T12:00:00'); d2.setDate(d2.getDate() + 1);
        L.push('BEGIN:VEVENT', 'UID:' + x.id + '@atlas-inovacao', 'DTSTAMP:' + D.hoje.replace(/-/g, '') + 'T000000Z', 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + d2.toISOString().slice(0, 10).replace(/-/g, ''), 'SUMMARY:' + txt('Prazo: ' + x.t), 'DESCRIPTION:' + txt((x.ag || '') + (x.link ? ' · ' + x.link : '')), 'END:VEVENT');
      });
      L.push('END:VCALENDAR');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([L.join('\r\n')], {type: 'text/calendar'})); a.download = 'atlas-prazos.ics'; document.body.appendChild(a); a.click(); a.remove();
    };
  };

  /* ================= GUIA DO BOM PROJETO (abas de capítulos) ================= */
  /* Uma aba por capítulo: trocar de capítulo só troca o painel (sem redesenhar a página, sem rolar para o topo).
     O capítulo vai no endereço (#/guia/<capitulo>) por history.replaceState; ?aba=<capitulo> também é aceito. */
  T.guia = function (A, sub, q, box, mesma) {
    var D = A.D, esc = A.esc, G = D.guia, feitos = {};
    try { feitos = JSON.parse(localStorage.getItem('atlas-guia') || '{}'); } catch (e) {}
    function pct(g) { var n = (g.checklist || []).length, f = (g.checklist || []).filter(function (x, k) { return feitos[g.id + ':' + k]; }).length; return n ? Math.round(f / n * 100) : 0; }
    function feitosDe(g) { return (g.checklist || []).filter(function (x, k) { return feitos[g.id + ':' + k]; }).length; }
    function idx(id) { for (var i = 0; i < G.length; i++) if (G[i].id === id) return i; return -1; }
    function nome(g) { return String(g.titulo).replace(/^\d+\.\s*/, ''); }
    function num(g) { var m = /^(\d+)\./.exec(g.titulo); return m ? m[1] : String(idx(g.id) + 1); }
    var pedido = sub || ((/(?:^|&)aba=([^&]*)/.exec(q || '') || [])[1] || '');
    var atual = idx(decodeURIComponent(pedido)) >= 0 ? idx(decodeURIComponent(pedido)) : 0;
    function painel(i) {
      var g = G[i], ant = G[i - 1], prox = G[i + 1];
      return '<header class="gc-cab"><span class="gc-num">' + esc(num(g)) + '</span><div><p class="olho">Capítulo ' + esc(num(g)) + ' de ' + G.length + '</p><h2>' + esc(nome(g)) + '</h2></div></header>' +
        (g.resumo ? '<p class="gc-resumo">' + esc(g.resumo) + '</p>' : '') +
        '<div class="gc-duas"><section><h4>Pontos críticos</h4>' + ((g.pontos || []).length ? '<ol class="gc-pontos">' + g.pontos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>' : '<p class="txt">Não informado.</p>') + '</section>' +
        '<section><h4>Checklist <span class="gc-prog" data-gc-prog>' + feitosDe(g) + '/' + (g.checklist || []).length + '</span></h4><div class="check">' +
        (g.checklist || []).map(function (c, k) { var key = g.id + ':' + k; return '<label><input type="checkbox" data-chk="' + key + '"' + (feitos[key] ? ' checked' : '') + '><span>' + esc(c) + '</span></label>'; }).join('') + '</div><div class="progresso"><i data-gc-bar style="width:' + pct(g) + '%"></i></div></section></div>' +
        '<div class="gc-nav">' + (ant ? '<button type="button" class="btn-linha" data-gc="' + esc(ant.id) + '">← ' + esc(nome(ant)) + '</button>' : '<span></span>') + (prox ? '<button type="button" class="btn-azul" data-gc="' + esc(prox.id) + '">' + esc(nome(prox)) + ' →</button>' : '<span></span>') + '</div>';
    }
    function marcas() {
      G.forEach(function (g) { var p = pct(g), e = box.querySelector('[data-pct="' + g.id + '"]'); if (e) e.textContent = p ? p + '%' : ''; });
      var g = G[atual], b = box.querySelector('[data-gc-bar]'), r = box.querySelector('[data-gc-prog]');
      if (b) b.style.width = pct(g) + '%'; if (r) r.textContent = feitosDe(g) + '/' + (g.checklist || []).length;
    }
    function ativa(i, rolar) {
      if (i < 0 || i >= G.length) return; atual = i;
      var p = box.querySelector('#guia-painel'); p.innerHTML = painel(i); p.setAttribute('aria-labelledby', 'gt-' + G[i].id);
      box.querySelectorAll('[data-cap]').forEach(function (a) { var on = a.getAttribute('data-cap') === G[i].id; a.classList.toggle('ativo', on); a.setAttribute('aria-selected', String(on)); a.tabIndex = on ? 0 : -1; if (on && !rolar && a.scrollIntoView && box.querySelector('.guia-indice').scrollWidth > box.querySelector('.guia-indice').clientWidth) { try { a.scrollIntoView({block: 'nearest', inline: 'center'}); } catch (x) {} } });
      try { history.replaceState(null, '', '#/guia/' + G[i].id); } catch (x) {}
      marcas();
      /* só rola quando o usuário veio do fim do capítulo (Anterior/Próximo): leva a barra de abas de volta à vista, sem animação */
      if (rolar) { var n = box.querySelector('.guia-indice'), t = n.getBoundingClientRect().top; if (t < 60 || t > window.innerHeight * .6) window.scrollTo({top: Math.max(0, t + window.scrollY - 84), behavior: 'auto'}); }
    }
    if (!mesma || !box.querySelector('#guia-painel')) {
      box.innerHTML = faixa(A, {olho: 'Guia do Bom Projeto · ' + G.length + ' capítulos', tit: 'Do enquadramento<br><em>à prestação de contas</em>', txt: 'Pontos críticos e <b>checklists que você marca à medida que avança</b>. O progresso fica guardado neste navegador.',
        num: [String(G.length), 'capítulos'], quebra: [[String(G.reduce(function (s, g) { return s + (g.pontos || []).length; }, 0)), 'pontos críticos'], [String(G.reduce(function (s, g) { return s + (g.checklist || []).length; }, 0)), 'itens de checklist'], ['<1h', 'de leitura']]}) +
        '<div class="wrap guia-lay"><nav class="guia-indice" role="tablist" aria-label="Capítulos do Guia"><h4>Capítulos</h4>' + G.map(function (g) {
          return '<a href="#/guia/' + esc(g.id) + '" role="tab" id="gt-' + esc(g.id) + '" data-cap="' + esc(g.id) + '" aria-controls="guia-painel"><b>' + esc(num(g)) + '</b><span>' + esc(nome(g)) + '</span><em data-pct="' + esc(g.id) + '"></em></a>';
        }).join('') + '</nav><div class="bloco guia-painel" id="guia-painel" role="tabpanel"></div></div>';
      ativaCampos(A, box);
      ativa(atual, false);
    } else ativa(atual, false);
    box.onclick = function (e) {
      var a = e.target.closest('a[data-cap]'), b = e.target.closest('button[data-gc]');
      if (a) { e.preventDefault(); var i = idx(a.getAttribute('data-cap')); if (i !== atual) ativa(i, false); return; }
      if (b) { ativa(idx(b.getAttribute('data-gc')), true); }
    };
    box.onkeydown = function (e) {
      var a = e.target.closest && e.target.closest('a[data-cap]'); if (!a) return;
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); var i = Math.max(0, Math.min(G.length - 1, idx(a.getAttribute('data-cap')) + d)); ativa(i, false); var n = box.querySelector('[data-cap="' + G[i].id + '"]'); if (n) n.focus();
    };
    box.onchange = function (e) { var k = e.target.getAttribute && e.target.getAttribute('data-chk'); if (!k) return; if (e.target.checked) feitos[k] = 1; else delete feitos[k]; try { localStorage.setItem('atlas-guia', JSON.stringify(feitos)); } catch (x) {} marcas(); };
    box.oninput = null;
  };

  /* ================= DICIONÁRIO ================= */
  T.glossario = function (A, sub, q, box) {
    var D = A.D, esc = A.esc, V = (D.dicionario && D.dicionario.length ? D.dicionario.map(function (v) { return {termo: v.termo, expansao: v.sigla, def: v.def, onde: v.ondeUsa, cat: v.categoria}; }) : D.glossario).slice().sort(function (a, b) { return a.termo.localeCompare(b.termo, 'pt-BR'); });
    var letra = '', termo = '', cat = '';
    var CATS = [['instrumentos', 'Instrumentos'], ['incentivos-fiscais', 'Incentivos fiscais'], ['marco-legal', 'Marco legal'], ['agencias', 'Agências'], ['pi', 'Propriedade intelectual'], ['maturidade', 'Maturidade tecnológica'], ['gestao', 'Gestão de projetos'], ['ecossistema', 'Ecossistema']], ROT_CAT = {};
    CATS.forEach(function (c) { ROT_CAT[c[0]] = c[1]; });
    var temCat = V.some(function (v) { return v.cat; });
    var tem = {}; V.forEach(function (v) { tem[A.sem(v.termo).charAt(0).toUpperCase()] = 1; });
    box.innerHTML = faixa(A, {olho: 'Dicionário da Inovação', tit: 'Os termos do fomento<br><em>sem juridiquês</em>', txt: 'Siglas e conceitos que aparecem em editais e leis: <b>o termo, o significado e onde se usa</b>.', num: [String(V.length), 'verbetes']}) +
      '<div class="wrap"><div class="barra"><div class="barra-esq"><h2>Verbetes</h2></div><div class="busca"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><label class="sr" for="gl-q">Buscar termo</label><input id="gl-q" type="search" placeholder="Busque um termo: TRL, glosa, NIT…" autocomplete="off"></div></div>' +
      '' + (temCat ? '<div class="tags dic-cats" id="gl-cats" role="group" aria-label="Filtrar por categoria"></div>' : '') + '<div class="letras" id="gl-letras">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (l) { return '<button type="button" data-l="' + l + '"' + (tem[l] ? '' : ' disabled') + ' aria-pressed="false">' + l + '</button>'; }).join('') + '</div><p class="contagem" id="gl-cont" style="margin-top:14px"></p><div class="verbetes" id="gl-lista"></div></div>';
    ativaCampos(A, box);
    function realce(s) { if (!termo) return esc(s); var i = A.sem(s).indexOf(A.sem(termo)); return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + termo.length)) + '</mark>' + esc(s.slice(i + termo.length)); }
    function desenha() {
      var base = V.filter(function (v) { return (!letra || A.sem(v.termo).charAt(0).toUpperCase() === letra) && (!termo || A.sem([v.termo, v.expansao, v.def, v.onde].join(' ')).indexOf(A.sem(termo)) >= 0); });
      var l = base.filter(function (v) { return !cat || v.cat === cat; });
      var nc = {}; base.forEach(function (v) { if (v.cat) nc[v.cat] = (nc[v.cat] || 0) + 1; });
      var chipsC = box.querySelector('#gl-cats');
      if (chipsC) chipsC.innerHTML = '<button type="button" class="chip" data-cat="" aria-pressed="' + (!cat) + '">Todas · ' + base.length + '</button>' + CATS.filter(function (c) { return nc[c[0]] || cat === c[0]; }).map(function (c) { return '<button type="button" class="chip" data-cat="' + c[0] + '" aria-pressed="' + (cat === c[0]) + '">' + esc(c[1]) + ' · ' + (nc[c[0]] || 0) + '</button>'; }).join('');
      box.querySelector('#gl-cont').innerHTML = '<b>' + l.length + '</b> verbete' + (l.length === 1 ? '' : 's') + (letra ? ' com a letra ' + letra : '') + (cat ? ' em ' + esc(ROT_CAT[cat] || cat) : '');
      box.querySelector('#gl-lista').innerHTML = l.map(function (v) { return '<article class="bloco verbete"><h3>' + realce(v.termo) + (v.expansao ? '<small>' + realce(v.expansao) + '</small>' : '') + '</h3>' + (v.cat ? '<span class="cat-tag">' + esc(ROT_CAT[v.cat] || v.cat) + '</span>' : '') + '<p>' + realce(v.def || '') + '</p>' + (v.onde ? '<p style="font-size:13px;color:var(--ink-3)"><b style="font-weight:500">Onde se usa:</b> ' + realce(v.onde) + '</p>' : '') + '</article>'; }).join('') || '<p class="txt">Nenhum verbete encontrado.</p>';
      box.querySelectorAll('#gl-letras button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-l') === letra)); });
    }
    box.oninput = function (e) { if (e.target.id === 'gl-q') { termo = e.target.value.trim(); letra = ''; desenha(); } };
    box.onclick = function (e) { var c = e.target.closest('[data-cat]'); if (c) { cat = c.getAttribute('data-cat'); desenha(); return; } var b = e.target.closest('[data-l]'); if (!b) return; letra = letra === b.getAttribute('data-l') ? '' : b.getAttribute('data-l'); desenha(); };
    box.onchange = null;
    if (q && /(?:^|&)q=/.test(q)) { termo = decodeURIComponent(/(?:^|&)q=([^&]*)/.exec(q)[1]); box.querySelector('#gl-q').value = termo; }
    desenha();
  };
  function abasDinheiro(ativa) {
    return '<nav class="abas" aria-label="Onde está o dinheiro agora">' + [['radar', 'Chamadas e editais'], ['ecossistema', 'Inovação aberta'], ['compras', 'Compras públicas'], ['internacional', 'Internacional'], ['agenda', 'Agenda de inovação']].map(function (a) { return '<a href="#/' + a[0] + '" class="' + (a[0] === ativa ? 'ativa' : '') + '"' + (a[0] === ativa ? ' aria-current="page"' : '') + '>' + a[1] + '</a>'; }).join('') + '</nav>';
  }
  window.AV2_UTIL = {abasDinheiro: abasDinheiro, catalogo: catalogo, faixa: faixa, ativaCampos: ativaCampos, barrasFaixa: barrasFaixa, cabecalho: cabecalho, lista: lista, cont: cont, primeiro: primeiro, detalhes: detalhes};
})();
