/* Atlas v2 · rodada 5 — página do financiador em abas, com os dados específicos que o Atlas publicado tem para cada um. */
(function () {
  'use strict';
  var T = window.AV2_TELAS, D = window.ATLAS2, IDX = window.ATLAS2_IDX || {dna: [], raiz: {}};
  var V = '?v=r91';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function sem(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function br(n, c) { return Number(n || 0).toLocaleString('pt-BR', {minimumFractionDigits: c || 0, maximumFractionDigits: c || 0}); }
  function reais(v) { if (!v) return '—'; v = +v; return v >= 1e9 ? 'R$ ' + br(v / 1e9, 2) + ' bi' : v >= 1e6 ? 'R$ ' + br(v / 1e6, 1) + ' mi' : v >= 1e3 ? 'R$ ' + br(v / 1e3, 0) + ' mil' : 'R$ ' + br(v); }
  /* valor com 2 casas em milhões (valor médio, como no Atlas) */
  function reais2(v) { if (v == null) return 'n/d'; v = +v; return v >= 1e6 && v < 1e9 ? 'R$ ' + br(v / 1e6, 2) + ' mi' : reais(v); }
  function nProj(n, un) { return br(n) + ' ' + (un || 'projeto') + (n === 1 ? '' : 's'); }
  function carrega(src, teste, feito) { if (teste()) return feito(); var s = document.createElement('script'); s.src = src + V; s.onload = feito; s.onerror = function () { feito(true); }; document.body.appendChild(s); }
  function linhas(cols, rows) { return rows.map(function (r) { if (!Array.isArray(r)) return r; var o = {}; cols.forEach(function (c, i) { o[c] = r[i]; }); return o; }); }
  function dnaPorNome(n) { var k = sem(n).replace(/\b(s\.?a\.?|ltda|eireli|me|epp)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); if (!k) return null; if (!dnaPorNome.m) { dnaPorNome.m = {}; IDX.dna.forEach(function (e) { dnaPorNome.m[sem(e[1]).replace(/[^a-z0-9]+/g, ' ').trim()] = e[0]; }); } return dnaPorNome.m[k] || null; }
  function linkEmp(nome, id) { id = id || dnaPorNome(nome); return id ? '<a href="#/dna/' + encodeURIComponent(id) + '">' + esc(nome) + '</a>' : esc(nome); }

  function dataBr(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || '')); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(d || ''); }
  function ictDeCod(cod) { if (!ictDeCod.m) { ictDeCod.m = {}; (D.icts || []).forEach(function (t) { [t.embrapiiCod, t.embrapiiCodAnt].forEach(function (c) { if (c != null) ictDeCod.m[String(c)] = t.id; }); }); } return ictDeCod.m[String(cod)] || null; }
  /* nome da unidade no cadastro de ICT (como no Atlas); o nome do painel só de reserva */
  function nomeUni(cod, nm) { var id = ictDeCod(cod), t = id && (D.icts || []).filter(function (i) { return i.id === id; })[0]; return t && t.nome ? t.nome : (nm || String(cod)); }
  function linkUni(nome, cod) { var id = ictDeCod(cod); return id ? '<a href="#/icts/' + encodeURIComponent(id) + '">' + esc(nome) + '</a>' : esc(nome); }
  function nomeDna(id) { if (!nomeDna.m) { nomeDna.m = {}; IDX.dna.forEach(function (e) { nomeDna.m[e[0]] = e[1]; }); } return nomeDna.m[id]; }
  /* texto longo recolhido, com "ver tudo" que expande no próprio lugar */
  function detalhe(txt, n) { txt = String(txt || ''); if (txt.length <= (n || 160)) return esc(txt); var c = txt.slice(0, n || 160).replace(/\s+\S*$/, ''); return '<details class="fin-desc"><summary><span class="rs">' + esc(c) + '…</span><em>ver tudo</em></summary><p>' + esc(txt) + '</p></details>'; }
  function chipSt(st) { return st ? '<span class="fin-st st-' + sem(st).replace(/[^a-z]+/g, '-') + '">' + esc(st) + '</span>' : ''; }
  function linhaB(rot, n, mx, txt, tit) { return '<div' + (tit ? ' title="' + esc(tit) + '"' : '') + '><span title="' + esc(rot) + '">' + esc(rot) + '</span><i style="width:' + Math.max(1, (n || 0) / (mx || 1) * 100).toFixed(1) + '%"></i><b>' + txt + '</b></div>'; }

  /* ---------- Gráficos ---------- */
  function barras(pares, fmt, filtroAttr) {
    var mx = Math.max.apply(null, pares.map(function (p) { return p[1] || 0; }).concat([1]));
    return '<div class="barras-h' + (pares.some(function (p) { return p[3]; }) ? ' com-n' : '') + '">' + pares.map(function (p) {
      var tag = filtroAttr ? 'button type="button" ' + filtroAttr + '="' + esc(p[2] != null ? p[2] : p[0]) + '"' : 'div';
      return '<' + tag + '><span title="' + esc(p[0]) + '">' + esc(p[0]) + '</span><i style="width:' + Math.max(1, (p[1] || 0) / mx * 100).toFixed(1) + '%"></i><b>' + (p[4] != null ? esc(p[4]) : fmt ? fmt(p[1]) : br(p[1])) + (p[3] ? ' <small>· ' + esc(p[3]) + '</small>' : '') + '</b></' + (filtroAttr ? 'button' : 'div') + '>';
    }).join('') + '</div>';
  }
  function colunas(obj, fmt, filtroAttr, rotulos) {
    var anos = Object.keys(obj).filter(function (a) { return +a > 1990; }).sort();
    if (!anos.length) return '<p class="txt">Sem série.</p>';
    var W = 1000, H = 230, x0 = 60, y0 = 196, w = (W - x0 - 10) / anos.length, mx = Math.max.apply(null, anos.map(function (a) { return obj[a]; }));
    var s = '<div class="serie"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Série por ano">';
    [0, .5, 1].forEach(function (f) { var y = y0 - f * (y0 - 14); s += '<line class="eixo" x1="' + x0 + '" x2="' + (W - 10) + '" y1="' + y + '" y2="' + y + '"' + (f ? ' stroke-dasharray="3 4"' : '') + '/><text x="' + (x0 - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + (!f ? '0' : fmt ? fmt(mx * f) : br(Math.round(mx * f))) + '</text>'; });
    anos.forEach(function (a, i) {
      var h = obj[a] / mx * (y0 - 14), x = x0 + i * w;
      s += '<rect class="b"' + (filtroAttr ? ' style="cursor:pointer" ' + filtroAttr + '="' + a + '"' : '') + ' x="' + (x + w * .14).toFixed(1) + '" y="' + (y0 - h).toFixed(1) + '" width="' + (w * .72).toFixed(1) + '" height="' + Math.max(h, 1).toFixed(1) + '" rx="2"><title>' + a + ': ' + (fmt ? fmt(obj[a]) : br(obj[a])) + '</title></rect>';
      if (rotulos) s += '<text class="vc" x="' + (x + w / 2).toFixed(1) + '" y="' + (y0 - h - 5).toFixed(1) + '" text-anchor="middle">' + (fmt ? fmt(obj[a]) : br(obj[a])) + '</text>';
      if (anos.length <= 14 || i % Math.ceil(anos.length / 12) === 0 || i === anos.length - 1) s += '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y0 + 18) + '" text-anchor="middle">' + a + '</text>';
    });
    return s + '</svg></div>';
  }
  function soma(rows, chave, val) { var o = {}; rows.forEach(function (r) { var k = chave(r); if (k == null || k === '') return; [].concat(k).forEach(function (kk) { o[kk] = (o[kk] || 0) + (val ? (+val(r) || 0) : 1); }); }); return o; }
  function top(o, n) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).slice(0, n || 10).map(function (k) { return [k, o[k]]; }); }
  /* pares [rótulo, valor, filtro, 'n projetos'] ordenados por valor: a contagem de cada categoria ao lado do valor */
  function comN(rows, chave, val, n, un) { var v = soma(rows, chave, val), c = soma(rows, chave); return top(v, n).map(function (p) { return [p[0], p[1], p[0], nProj(c[p[0]] || 0, un)]; }); }
  /* lista [{k, n, v}] em barras com "R$ x · n operações" ao lado, medida à escolha e corte com "ver todos (N)" */
  function distVN(lista, med, lim, todos, attr, id) {
    var l = lista.slice().sort(function (a, b) { return b[med] - a[med] || String(a.k).localeCompare(String(b.k), 'pt-BR'); }), vis = lim && !todos ? l.slice(0, lim) : l;
    return barras(vis.map(function (r) { return [r.k, r[med], r.k, br(r.n) + (r.n === 1 ? ' operação' : ' operações'), r.v > 0 ? reais(r.v) : 'R$ 0']; }), null, attr) +
      (lim && l.length > lim ? '<button type="button" class="btn-txt fin-vt" data-vt="' + id + '">' + (todos ? 'mostrar menos' : 'ver todos (' + l.length + ')') + '</button>' : '');
  }
  function kpis(l) { return '<div class="kpis">' + l.map(function (k) { return '<div><span>' + esc(k[0]) + '</span><b>' + k[1] + '</b>' + (k[2] ? '<small>' + esc(k[2]) + '</small>' : '') + '</div>'; }).join('') + '</div>'; }

  /* ---------- Padrão das abas de dados: KPIs, "Sobre esta base" recolhido, gráficos e explorador ---------- */
  function blocoG(t, html, nota) { return '<div class="bloco"><h4 class="olho">' + t + '</h4>' + html + (nota ? '<p class="nota-base">' + nota + '</p>' : '') + '</div>'; }
  function gradeG(l) { return '<div class="grade-graf fin-graf">' + l.join('') + '</div>'; }
  function seguro(f) { try { return f(); } catch (e) { if (window.console) console.error(e); return '<p class="txt">Gráfico indisponível.</p>'; } }
  /* clique numa barra ou coluna com data-gfN filtra o filtro N da tabela */
  function filtroClique(raiz, tx) {
    raiz.addEventListener('click', function (e) {
      for (var n = e.target; n && n !== raiz && !tx.contains(n); n = n.parentNode) {
        if (!n.attributes) continue;
        for (var i = 0; i < n.attributes.length; i++) { var m = /^data-gf(\d+)$/.exec(n.attributes[i].name); if (m) { tx._filtro(+m[1], n.attributes[i].value); return; } }
      }
    });
  }
  function pagina(el, o) {
    var temTab = !!(o.cfg || o.antesTab);
    el.innerHTML = '<div class="fin-dados">' + (o.aviso ? '<div class="fin-aviso">' + o.aviso + '</div>' : '') + (o.kpis && o.kpis.length ? kpis(o.kpis) : '') +
      (o.sobre || o.nota ? '<details class="fin-base"><summary>Sobre esta base</summary><div class="fin-base-corpo">' + (o.sobre || '') + (o.nota ? '<p class="nota-base">' + o.nota + '</p>' : '') + '</div></details>' : '') +
      (o.graficos ? '<section class="fin-sec"><div class="fin-sec-cab"><h3>' + esc(o.titGraf || 'Gráficos') + '</h3>' + (o.cabGraf || '') + '</div><div data-fg>' + o.graficos + '</div></section>' : '') +
      (temTab && o.titulo ? '<section class="fin-sec"><div class="fin-sec-cab"><h3>' + esc(o.titulo) + '</h3></div><div class="bloco fin-tab">' + (o.antesTab || '') + (o.cfg ? '<div data-fx></div>' : '') + '</div></section>' : '') + (o.depois || '') + '</div>';
    var tx = el.querySelector('[data-fx]');
    if (tx && o.cfg) { o.cfg.nota = ''; tabela(tx, o.cfg); filtroClique(el, tx); }
    return {tx: tx, fg: el.querySelector('[data-fg]')};
  }

  /* ---------- Tabela de dados: busca, filtros, ordenação, 25 por página, soma filtrada ---------- */
  function tabela(el, cfg) {
    var st = {q: '', f: {}, ord: cfg.ord != null ? cfg.ord : -1, desc: cfg.desc !== false, pag: 0}, P = 25, uid = (tabela.n = (tabela.n || 0) + 1);
    var opts = (cfg.filtros || []).map(function (f) { var c = soma(cfg.rows, f.v); var ks = Object.keys(c); if (f.ordem === 'num') ks.sort(function (a, b) { return b - a; }); else if (f.ordem === 'alfa') ks.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); }); else ks.sort(function (a, b) { return c[b] - c[a]; }); return ks.map(function (k) { return [k, c[k]]; }); });
    el.innerHTML = (cfg.antes || '') + '<div class="tg-barra"><div class="busca"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><input type="search" data-tq placeholder="' + esc(cfg.ph || 'Buscar') + '" autocomplete="off"></div><button type="button" class="btn-txt" data-tl>Limpar filtros</button></div>' + ((cfg.filtros || []).length ? '<div class="tg-filtros" style="--n:' + (cfg.filtros.length <= 5 ? cfg.filtros.length : 4) + '">' : '') +
      (cfg.filtros || []).map(function (f, i) { if (f.lista) return '<input class="f-sel" type="search" list="dl-' + uid + '-' + i + '" data-tf="' + i + '" placeholder="' + esc(f.t) + ': todas (digite)" aria-label="' + esc(f.t) + '" autocomplete="off"><datalist id="dl-' + uid + '-' + i + '">' + opts[i].map(function (o) { return '<option value="' + esc(o[0]) + '">' + br(o[1]) + '</option>'; }).join('') + '</datalist>'; return '<select class="f-sel" data-tf="' + i + '" aria-label="' + esc(f.t) + '"><option value="">' + esc(f.t) + ': todos</option>' + opts[i].map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(f.rot ? f.rot(o[0]) : o[0]) + ' (' + br(o[1]) + ')</option>'; }).join('') + '</select>'; }).join('') + ((cfg.filtros || []).length ? '</div>' : '') +
      '</div><div data-tc></div>' + (cfg.nota ? '<p class="nota-base">' + cfg.nota + '</p>' : '');
    function filtra() {
      var qs = sem(st.q).trim().split(/\s+/).filter(Boolean);
      return cfg.rows.filter(function (r) {
        for (var i in st.f) { if (st.f[i] === '') continue; var v = cfg.filtros[i].v(r); if (cfg.filtros[i].lista) { var tl = sem(st.f[i]).trim(); if (![].concat(v).some(function (x) { return sem(x).indexOf(tl) >= 0; })) return false; } else if ([].concat(v).map(String).indexOf(st.f[i]) < 0) return false; }
        if (qs.length) { var k = sem(cfg.busca(r)); if (!qs.every(function (t) { return k.indexOf(t) >= 0; })) return false; }
        return true;
      });
    }
    function desenha() {
      var l = filtra();
      if (st.ord >= 0) { var c = cfg.cols[st.ord], s = c.s || c.v; l.sort(function (a, b) { var x = s(a), y = s(b); if (x == null || x === '') return 1; if (y == null || y === '') return -1; var r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'pt-BR'); return st.desc ? -r : r; }); }
      var pags = Math.max(1, Math.ceil(l.length / P)); if (st.pag >= pags) st.pag = pags - 1;
      var tot = cfg.soma ? l.reduce(function (s, r) { return s + (+cfg.soma(r) || 0); }, 0) : 0, tot2 = cfg.soma2 ? l.reduce(function (s, r) { return s + (+cfg.soma2(r) || 0); }, 0) : 0;
      el.querySelector('[data-tc]').innerHTML = '<div class="tg-info"><span><b>' + br(l.length) + '</b> de ' + br(cfg.rows.length) + ' ' + esc(cfg.rot || 'registros') + '</span>' + (cfg.soma ? '<span>' + esc(cfg.somaRot || 'Soma filtrada') + ': <b>' + reais(tot) + '</b></span>' : '') + (cfg.soma2 ? '<span>' + esc(cfg.soma2Rot || 'Soma 2') + ': <b>' + reais(tot2) + '</b></span>' : '') + (cfg.info ? '<span>' + cfg.info(l) + '</span>' : '') + '</div>' +
        (l.length ? '<div class="tab-rola"><table class="tabela"><thead><tr>' + cfg.cols.map(function (c, i) { return '<th class="ord' + (c.num ? ' num' : '') + (st.ord === i ? ' on' : '') + '" data-to="' + i + '">' + esc(c.t) + (st.ord === i ? (st.desc ? ' ↓' : ' ↑') : '') + '</th>'; }).join('') + '</tr></thead><tbody>' +
          l.slice(st.pag * P, st.pag * P + P).map(function (r) { return '<tr>' + cfg.cols.map(function (c) { return '<td' + (c.num ? ' class="num"' : '') + '>' + (c.h ? c.h(r) : esc(c.v(r))) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
          (pags > 1 ? '<div class="tg-pag"><button type="button" class="btn-linha peq" data-tp="-1"' + (st.pag ? '' : ' disabled') + '>← Anterior</button><span>Página ' + (st.pag + 1) + ' de ' + br(pags) + '</span><button type="button" class="btn-linha peq" data-tp="1"' + (st.pag < pags - 1 ? '' : ' disabled') + '>Próxima →</button></div>' : '') : '<p class="txt">Nada com esses filtros.</p>');
    }
    var tq;
    el.addEventListener('input', function (e) { if (e.target.hasAttribute('data-tq')) { var v = e.target.value; clearTimeout(tq); tq = setTimeout(function () { st.q = v; st.pag = 0; desenha(); }, 200); } else if (e.target.tagName === 'INPUT' && e.target.hasAttribute('data-tf')) { var i = e.target.getAttribute('data-tf'), v2 = e.target.value; clearTimeout(tq); tq = setTimeout(function () { st.f[i] = v2; st.pag = 0; desenha(); }, 250); } });
    el.addEventListener('change', function (e) { var i = e.target.getAttribute('data-tf'); if (i != null) { st.f[i] = e.target.value; st.pag = 0; desenha(); } });
    el.addEventListener('click', function (e) {
      var o = e.target.closest('[data-to]'); if (o) { var i = +o.getAttribute('data-to'); if (st.ord === i) st.desc = !st.desc; else { st.ord = i; st.desc = !!cfg.cols[i].num; } desenha(); return; }
      var p = e.target.closest('[data-tp]'); if (p) { st.pag += +p.getAttribute('data-tp'); desenha(); el.scrollIntoView({behavior: 'smooth', block: 'start'}); return; }
      if (e.target.closest('[data-tl]')) { st.q = ''; st.f = {}; st.pag = 0; el.querySelectorAll('[data-tf]').forEach(function (s) { s.value = ''; }); el.querySelector('[data-tq]').value = ''; desenha(); }
    });
    el._filtro = function (i, v, quieto) { st.f[i] = String(v); st.pag = 0; var s = el.querySelector('[data-tf="' + i + '"]'); if (s) s.value = String(v); desenha(); if (!quieto) el.scrollIntoView({behavior: 'smooth', block: 'start'}); };
    desenha();
  }

  /* ---------- Página do financiador ---------- */
  var ROT = {sobre: 'Sobre', instrumentos: 'Instrumentos', chamadas: 'Chamadas', analise: 'Análise', unidades: 'Unidades', numeros: 'Unidades em números', areas: 'Áreas e tecnologias', projetos: 'Projetos', operacoes: 'Operações de inovação', indiretas: 'Operações indiretas', funttel: 'Funttel', obrigacao: 'Obrigação de PD&I', empresas: 'Empresas do setor', grupos: 'P&D&I por grupo', fndct: 'FNDCT', leidobem: 'Lei do Bem', leiinfo: 'Lei de Informática', reciclagem: 'Lei da Reciclagem', pi: 'Propriedade intelectual'};
  var ESPEC = {
    embrapii: ['unidades', 'numeros', 'areas', 'projetos', 'analise'], bndes: ['operacoes', 'indiretas', 'funttel', 'analise'], finep: ['projetos', 'funttel', 'analise'], anp: ['projetos', 'obrigacao', 'analise'],
    aneel: ['projetos', 'empresas', 'grupos', 'analise'], antt: ['projetos', 'analise'], mcti: ['fndct', 'leidobem', 'leiinfo', 'analise'], inpi: ['pi'], mma: ['reciclagem']
  };
  var COM_TABELAS = {finep: 1, embrapii: 1, anp: 1, aneel: 1, antt: 1, mcti: 1, mma: 1};
  var prev = T.agentes, obsLista = null;
  function heroNosCartoes(box) {
    var H = ((window.ATLAS2_FIN || {}).PERFIS || {}).perfis || {};
    box.querySelectorAll('article.op').forEach(function (c) {
      if (c.querySelector('.fin-hero-cartao')) return;
      var a = c.querySelector('h3 a'), m = a && /#\/agentes\/([^?]+)/.exec(a.getAttribute('href') || ''), h = m && H[decodeURIComponent(m[1])];
      if (!h || !h.hero) return;
      var p = document.createElement('p'); p.className = 'fin-hero-cartao'; p.textContent = h.hero;
      var ref = c.querySelector('.op-nums'); if (ref) ref.parentNode.insertBefore(p, ref); else c.appendChild(p);
    });
  }
  T.agentes = function (A, sub, q, box, mesma) {
    if (obsLista) { obsLista.disconnect(); obsLista = null; }
    if (!sub) {
      var r0 = prev.apply(this, arguments);
      carrega('assets/atlas-v2-financiadores.js', function () { return !!window.ATLAS2_FIN; }, function () {
        if (!window.ATLAS2_FIN || (location.hash || '').indexOf('#/agentes') !== 0) return;
        heroNosCartoes(box);
        if (window.MutationObserver) { obsLista = new MutationObserver(function () { if ((location.hash || '').indexOf('#/agentes') !== 0 || /#\/agentes\/[^?]/.test(location.hash)) { obsLista.disconnect(); return; } heroNosCartoes(box); }); obsLista.observe(box, {childList: true, subtree: true}); }
      });
      return r0;
    }
    var ag = D.agencias.filter(function (a) { return a.id === sub; })[0];
    if (!ag) return prev.apply(this, arguments);
    var aba = ((/(?:^|&)aba=([a-z]+)/.exec(q || '') || [])[1]) || 'sobre';
    box.onclick = null; box.onchange = null; box.oninput = null;
    box.innerHTML = '<div class="wrap ficha"><div class="carregando"><i></i><span>Carregando os dados do financiador…</span></div></div>';
    carrega('assets/atlas-v2-financiadores.js', function () { return !!window.ATLAS2_FIN; }, function () {
      if (COM_TABELAS[sub]) carrega('assets/atlas-v2-fin-' + sub + '.js', function () { return !!(window.ATLAS2_FINT && window.ATLAS2_FINT[sub]); }, monta); else monta();
    });
    function monta() {
      if ((location.hash || '').indexOf('#/agentes/' + sub) !== 0) return;
      var F = window.ATLAS2_FIN, TB = (window.ATLAS2_FINT || {})[sub] || {}, P = (F.PERFIS.perfis || {})[sub] || {}, MOD = (F.PERFIS.modalidades || {})[sub] || [];
      var ins = D.instrumentos.filter(function (i) { return i.agencia === sub; }), chA = A.ABERTAS.filter(function (c) { return c.agencia === sub; }), chT = D.chamadas.filter(function (c) { return c.agencia === sub; });
      var abas = ['sobre', 'instrumentos', 'chamadas'].concat(ESPEC[sub] || []);
      if (abas.indexOf(aba) < 0) aba = 'sobre';
      var cont = {instrumentos: ins.length, chamadas: chT.length, unidades: (F.EMBRAPII_UNIDADES || []).length, projetos: sub === 'embrapii' ? 4555 : (TB[sub.toUpperCase() + '_PROJETOS'] || []).length, operacoes: F.BNDES_INOVACAO ? F.BNDES_INOVACAO.e.reduce(function (s, e) { return s + e[2]; }, 0) : 0, empresas: (TB.ANEEL_EMPRESAS || []).length, fndct: (TB.FNDCT_PROJETOS || []).length, leidobem: (TB.LEIDOBEM_EMPRESAS || []).length, leiinfo: (TB.LEIINFO_EMPRESAS || []).length, reciclagem: (TB.LEIRECICLAGEM_PROJETOS || []).length, funttel: F.FUNTTEL ? F.FUNTTEL.projetos.length : 0, indiretas: F.BNDES_INDIRETAS ? F.BNDES_INDIRETAS.n : 0};
      box.innerHTML = '<div class="wrap ficha"><div class="ficha-acoes"><p class="migalha"><a href="#/agentes">Financiadores</a> / ' + esc(ag.nome) + '</p><a class="btn-azul peq" href="#/agentes">← Todos os financiadores</a></div>' +
        '<div class="bloco fin-cab"><div><p class="olho">' + esc(ag.tipo) + ' · ' + esc(ag.vinculo) + '</p><h1>' + esc(ag.nome) + '</h1>' + (P.hero ? '<p class="fin-hero">' + esc(P.hero) + '</p>' : '') +
          (P.sobre ? '<p class="sobre fin-sobre">' + esc(P.sobre) + '</p>' : '') +
          '<div class="fin-nums">' + [['Instrumentos', ins.length, 'instrumentos'], ['Chamadas abertas', chA.length, 'chamadas'], ['No histórico do Radar', chT.length, 'chamadas'], [{finep: 'Projetos FINEP', embrapii: 'Projetos EMBRAPII', anp: 'Projetos ANP', aneel: 'Projetos ANEEL', antt: 'Projetos ANTT', bndes: 'Operações de inovação', mcti: 'Projetos FNDCT', mma: 'Projetos da Lei da Reciclagem'}[sub], {finep: cont.projetos, embrapii: cont.projetos, anp: cont.projetos, aneel: cont.projetos, antt: cont.projetos, bndes: cont.operacoes, mcti: cont.fndct, mma: cont.reciclagem}[sub], {bndes: 'operacoes', mcti: 'fndct', mma: 'reciclagem'}[sub] || 'projetos']].filter(function (k) { return k[0]; }).map(function (k) { return '<a href="#/agentes/' + sub + '?aba=' + k[2] + '"><b>' + br(k[1]) + '</b><span>' + k[0] + '</span></a>'; }).join('') + '</div>' +
          (MOD.length ? '<p class="fin-mods"><span>Modalidades:</span> ' + MOD.slice(0, 6).map(function (m) { return '<a href="#/agentes/' + sub + '?aba=sobre" class="tag">' + esc(m.nome) + '</a>'; }).join(' ') + (MOD.length > 6 ? ' <span class="tag mais">+' + (MOD.length - 6) + '</span>' : '') + '</p>' : '') + '</div>' +
          '<div class="fin-fatos">' + (P.criada ? '<div><span>Criada em</span><b>' + esc(P.criada) + '</b></div>' : '') + (P.natureza ? '<div><span>Natureza</span><b>' + esc(P.natureza) + '</b></div>' : '') + (P.cobertura ? '<div><span>Cobertura</span><b>' + esc(P.cobertura) + '</b></div>' : '') + (P.site ? '<a class="btn-linha peq" href="' + esc(P.site) + '" target="_blank" rel="noopener">Site oficial ↗</a>' : '') + '</div></div>' +
        '<nav class="fin-abas" aria-label="Seções do financiador">' + abas.map(function (a) { return '<a href="#/agentes/' + sub + '?aba=' + a + '" class="' + (a === aba ? 'ativa' : '') + '">' + ROT[a] + (cont[a] ? '<em>' + br(cont[a]) + '</em>' : '') + '</a>'; }).join('') + '</nav>' +
        '<div class="fin-corpo" id="fin-corpo"></div></div>';
      var el = box.querySelector('#fin-corpo');
      var fn = ABAS[aba] || ABAS.sobre;
      try { fn(A, el, {ag: ag, P: P, MOD: MOD, F: F, TB: TB, ins: ins, chA: chA, chT: chT, sub: sub, q: q || '', cont: cont, abas: abas}); } catch (err) { if (window.console) console.error(err); el.innerHTML = '<div class="bloco"><p class="txt" style="margin-top:0">Não foi possível montar esta aba. Recarregue a página.</p></div>'; }
      A.observar('.op.entra', el);
      if (mesma) { var nav = box.querySelector('.fin-abas'); if (nav && window.scrollY > nav.offsetTop) window.scrollTo(0, nav.getBoundingClientRect().top + window.scrollY - 70); }
    }
  };

  var ABAS = {};
  /* ---------- Sobre: perfil, instrumentos por natureza do recurso, modalidades e atalhos para os dados ---------- */
  var DESC_ABA = {
    instrumentos: 'Programas, linhas e editais que o agente opera', chamadas: 'Histórico do Radar: abertas, em breve e encerradas', analise: 'Gráficos do que o agente mais apoia',
    unidades: 'Unidades credenciadas, com filtros por domínio, UF e tipo', numeros: 'Projetos, valores e pedidos de PI de cada unidade', areas: 'Áreas de aplicação e tecnologias, com os projetos de cada uma',
    projetos: 'Lista completa, com busca e filtros', operacoes: 'Operações contratadas em inovação, por empresa', indiretas: 'Agregados das operações indiretas automáticas',
    funttel: 'Indicadores e operações com recursos do Funttel', obrigacao: 'Obrigação de PD&I por ano, grupo econômico e campo', empresas: 'Agentes do setor elétrico cadastrados',
    grupos: 'Grupos econômicos, projetos e portas de entrada', fndct: 'Maiores projetos do fundo, com agência e fundo', leidobem: 'Empresas beneficiárias, por ano-base', leiinfo: 'Empresas habilitadas',
    reciclagem: 'Propostas em captação, com valor e município', pi: 'Totais das bases do INPI e painel completo'
  };
  var RAB = 'ESCOPO|ARRANJO|TRL|MATURIDADE|CONTRAPARTIDAS?|DURAÇÃO|RECURSOS|SUBMISSÃO|INSCRIÇÕES|CRONOGRAMA|VEDADOS|LIMITES|PROPONENTES|CONTRATAÇÃO';
  /* descrições com rótulos (ESCOPO: ... ARRANJO: ...) viram texto de abertura e uma lista de regras */
  function divideRegras(desc) {
    desc = String(desc || '');
    var re = new RegExp('(?:^|\\s)(' + RAB + '):\\s', 'g'), idx = [], m;
    while ((m = re.exec(desc))) idx.push({r: m[1], ini: m.index + (/^\s/.test(m[0]) ? 1 : 0), fim: re.lastIndex});
    if (!idx.length) return {lead: desc, regras: []};
    var lead = desc.slice(0, idx[0].ini).trim(), regras = idx.map(function (p, i) { return [p.r.charAt(0) + p.r.slice(1).toLowerCase(), desc.slice(p.fim, i + 1 < idx.length ? idx[i + 1].ini : desc.length).trim()]; });
    if (!lead && regras[0][0] === 'Escopo') lead = regras.shift()[1];
    return {lead: lead, regras: regras};
  }
  /* natureza do recurso lida do texto da modalidade; vazio quando o texto não diz */
  function natModal(m) {
    var t = sem((m.nome || '') + ' ' + (m.desc || '')), nr = /nao[- ]reembols|subvenc|fundo perdido/.test(t), r = /reembols|credito|financiamento|emprestimo/.test(t.replace(/nao[- ]reembols\w*/g, '')), f = /incentivo fiscal|deducao|isencao|renuncia fiscal/.test(t), c = /participacao societaria|equity|capital de risco|\bfips?\b/.test(t);
    return nr && r ? 'misto' : nr ? 'nao-reembolsavel' : r ? 'reembolsavel' : f ? 'fiscal' : c ? 'capital' : '';
  }
  function cartaoModalidade(A, m) {
    var n = natModal(m), d = divideRegras(m.desc), cor = n && A.NAT[n] ? A.NAT[n][1] : 'var(--line-2)', lead = String(d.lead || '').replace(/\s+/g, ' ').trim(), temMais = lead.length > 90 || d.regras.length;
    return '<article class="mod" style="--nc:' + cor + '"><header><h4>' + esc(m.nome) + '</h4>' + (n ? A.natTag(n) : '') + '</header>' +
      (m.ticket ? '<p class="mod-ticket"><b>' + esc(m.ticket) + '</b></p>' : '') +
      (lead ? '<p class="mod-lead">' + esc(lead) + '</p>' : '') +
      (temMais ? '<details class="mod-regras"><summary>ver detalhes' + (d.regras.length ? ' <em>' + d.regras.length + '</em>' : '') + '</summary>' + (lead.length > 90 ? '<p class="mod-full">' + esc(lead) + '</p>' : '') + (d.regras.length ? '<dl>' + d.regras.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' : '') + '</details>' : '') + '</article>';
  }
  ABAS.sobre = function (A, el, x) {
    var P = x.P, ins = x.ins, MOD = x.MOD, cont = x.cont, sub = x.sub, ag = x.ag, h = '';
    h += '<section class="bloco sb-res"><h3 class="sb-tit">Resumo</h3><p class="sb-txt">' + esc(P.sobre || (ag.nome + ': ' + ag.tipo + ', ' + ag.vinculo + '.')) + '</p></section>';
    /* o que o Atlas tem deste agente */
    var at = x.abas.filter(function (a) { return a !== 'sobre'; }).map(function (a) {
      var n = a === 'chamadas' ? x.chT.length : cont[a];
      return '<a class="sb-at" href="#/agentes/' + sub + '?aba=' + a + '"><span>' + ROT[a] + '</span>' + (n ? '<b>' + br(n) + '</b>' : '') + '<small>' + esc(DESC_ABA[a] || '') + '</small></a>';
    });
    h += '<section class="sb-sec"><div class="sb-sec-cab"><h3 class="sb-tit">O que o Atlas tem deste agente</h3></div><div class="sb-ats">' + at.join('') + '</div></section>';
    /* instrumentos por natureza do recurso */
    if (ins.length) {
      var por = {}; ins.forEach(function (i) { var k = i.nat || 'a-confirmar'; (por[k] = por[k] || []).push(i); });
      var ks = Object.keys(A.NAT).filter(function (k) { return por[k]; });
      h += '<section class="sb-sec"><div class="sb-sec-cab"><h3 class="sb-tit">Instrumentos, por natureza do recurso</h3><span class="contagem"><b>' + ins.length + '</b> instrumento' + (ins.length > 1 ? 's' : '') + '</span></div>' +
        '<div class="bloco"><div class="nat-faixa" role="img" aria-label="Instrumentos por natureza do recurso">' + ks.map(function (k) { return '<i style="flex:' + por[k].length + ';background:' + A.NAT[k][1] + '" title="' + esc(A.NAT[k][0]) + ': ' + por[k].length + '"></i>'; }).join('') + '</div>' +
        '<div class="nat-grupos">' + ks.map(function (k) {
          return '<div class="nat-grupo" style="--nc:' + A.NAT[k][1] + '"><div class="nat-cab">' + A.natTag(k) + '<span>' + por[k].length + '</span></div><div class="nat-chips">' + por[k].map(function (i) { var nm = i.sigla && i.sigla.length <= 44 ? i.sigla : i.nome; return '<a class="nat-chip" href="#/instrumentos/' + encodeURIComponent(i.id) + '" title="' + esc(i.nome) + '">' + esc(nm) + '</a>'; }).join('') + '</div></div>';
        }).join('') + '</div></div></section>';
    } else {
      h += '<section class="sb-sec"><div class="sb-sec-cab"><h3 class="sb-tit">Instrumentos</h3></div><div class="bloco"><p class="txt" style="margin-top:0">O Atlas ainda não tem instrumento catalogado para este agente.' + (MOD.length ? ' As modalidades que ele opera estão logo abaixo.' : '') + (x.chT.length ? ' Há ' + x.chT.length + (x.chT.length > 1 ? ' chamadas' : ' chamada') + ' dele no histórico do Radar, na aba <a href="#/agentes/' + sub + '?aba=chamadas">Chamadas</a>.' : ' Também não há chamada dele no histórico do Radar.') + (P.site ? ' Para o que o agente oferece hoje, o canal é o <a href="' + esc(P.site) + '" target="_blank" rel="noopener">site oficial</a>.' : '') + '</p></div></section>';
    }
    /* modalidades */
    if (MOD.length) h += '<section class="sb-sec"><div class="sb-sec-cab"><h3 class="sb-tit">Modalidades de apoio</h3><span class="contagem"><b>' + MOD.length + '</b></span></div><div class="mod-grade">' + MOD.map(function (m) { return cartaoModalidade(A, m); }).join('') + '</div><p class="nota-base">A natureza do recurso, quando aparece, é lida do texto da modalidade; a classificação dos instrumentos está na ficha de cada um.</p></section>';
    /* lateral: ficha, domínios, públicos */
    var dm = top(soma(ins, function (i) { return i.dominios || []; }), 14), pb = top(soma(ins, function (i) { return i.publicos || []; }), 8), ab = top(soma(ins, function (i) { return i.abrangencia; }), 5);
    var fatos = [['Tipo', ag.tipo], ['Vínculo', ag.vinculo], ['Criada em', P.criada], ['Natureza', P.natureza], ['Cobertura', P.cobertura]].filter(function (f) { return f[1]; });
    var lado = '<aside class="sb-side"><div class="bloco"><h4 class="olho">Ficha</h4><dl class="sb-dl">' + fatos.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + (String(f[1]).length > 80 ? detalhe(f[1], 80).replace('>ver tudo<', '>ver mais<') : esc(f[1])) + '</dd></div>'; }).join('') + '</dl>' + '</div>' +
      (P.site ? '<div class="bloco"><h4 class="olho">Canal oficial</h4><a class="sb-canal" href="' + esc(P.site) + '" target="_blank" rel="noopener">' + esc(P.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')) + ' ↗</a></div>' : '') +
      (dm.length ? '<div class="bloco"><h4 class="olho">Domínios dos instrumentos</h4><div class="tags">' + dm.map(function (d) { return '<span class="tag">' + esc(DOMS[d[0]] || d[0]) + ' <small>' + d[1] + '</small></span>'; }).join('') + '</div></div>' : '') +
      (pb.length ? '<div class="bloco"><h4 class="olho">Quem pode participar</h4><ul class="sb-lista">' + pb.map(function (d) { return '<li>' + esc(d[0]) + '</li>'; }).join('') + '</ul></div>' : '') +
      (ab.length ? '<div class="bloco"><h4 class="olho">Abrangência</h4><div class="tags">' + ab.map(function (d) { return '<span class="tag">' + esc(d[0]) + ' <small>' + d[1] + '</small></span>'; }).join('') + '</div></div>' : '') + '</aside>';
    el.innerHTML = '<div class="sb-lay"><div class="sb-main">' + h + '</div>' + lado + '</div>';
  };
  ABAS.instrumentos = function (A, el, x) {
    el.innerHTML = x.ins.length ? '<div class="grade tres">' + x.ins.map(function (i) { return '<article class="op entra"><p class="op-sigla">' + esc(i.tipo || '') + '</p><h3><a href="#/instrumentos/' + encodeURIComponent(i.id) + '">' + esc(i.sigla && i.sigla !== i.nome ? i.sigla + ' · ' + i.nome : i.nome) + '</a></h3><div class="tags">' + A.natTag(i.nat) + '</div><p class="op-txt">' + esc(i.resumo || '') + '</p>' + (i.modalidade ? '<p class="op-modal">' + esc(i.modalidade) + '</p>' : '') + '</article>'; }).join('') + '</div>' :
      '<div class="bloco"><p class="txt" style="margin-top:0">O Atlas ainda não tem instrumento catalogado para este financiador.' + (x.MOD.length ? ' As modalidades que ele opera estão na aba <a href="#/agentes/' + x.sub + '?aba=sobre">Sobre</a>.' : '') + (x.P.site ? ' O que ele oferece hoje está no <a href="' + esc(x.P.site) + '" target="_blank" rel="noopener">site oficial</a>.' : '') + '</p></div>';
  };
  ABAS.chamadas = function (A, el, x) {
    var enc = x.chT.filter(function (c) { return c.status === 'encerrada'; }).sort(function (a, b) { return (b.encerramento || '') < (a.encerramento || '') ? -1 : 1; });
    var eb = x.chT.filter(function (c) { return c.status === 'em-breve'; });
    if (!x.chT.length && !x.chA.length) { el.innerHTML = '<div class="bloco"><p class="txt" style="margin-top:0">Este financiador não tem chamada aberta nem no histórico do Radar. O Radar procura chamadas nos sites oficiais toda semana; quando aparecer uma, ela entra aqui.' + (x.P.site ? ' Enquanto isso, o canal é o <a href="' + esc(x.P.site) + '" target="_blank" rel="noopener">site oficial</a>.' : '') + '</p></div>'; return; }
    el.innerHTML = '<h3 class="tit-md">Abertas <span class="contagem">' + x.chA.length + '</span></h3>' + (x.chA.length ? '<div class="grade" style="margin-top:12px">' + x.chA.map(A.cartaoChamada).join('') + '</div>' : '<p class="txt">Nenhuma chamada aberta agora.</p>') +
      (eb.length ? '<h3 class="tit-md" style="margin-top:28px">Em breve <span class="contagem">' + eb.length + '</span></h3><div class="grade" style="margin-top:12px">' + eb.map(A.cartaoChamada).join('') + '</div>' : '') +
      (enc.length ? '<h3 class="tit-md" style="margin-top:28px">Encerradas <span class="contagem">' + enc.length + '</span></h3><div class="bloco" style="margin-top:12px"><div class="linhas-l" style="margin-top:0">' + enc.map(function (c) { return '<a class="linha-l" href="#/radar/' + encodeURIComponent(c.id) + '"><b>' + esc(c.titulo) + '</b><small>Encerrou em ' + A.fdata(c.encerramento) + (c.regiao ? ' · ' + esc(c.regiao) : '') + (c.valorTotal ? ' · ' + A.mi(c.valorTotal) : '') + '</small>' + (c.resumo ? '<small class="fin-resumo">' + esc(String(c.resumo).length > 160 ? String(c.resumo).slice(0, 157).replace(/\s+\S*$/, '') + '…' : c.resumo) + '</small>' : '') + '<span class="status">Encerrada</span></a>'; }).join('') + '</div></div>' : '');
  };

  /* --- EMBRAPII --- */
  var DOMS = {}; (D.dominios || []).forEach(function (d) { DOMS[d.id] = d.label; });
  /* Unidades: coluna de filtros à esquerda (grupos com contagens), no mesmo visual do catálogo de chamadas */
  ABAS.unidades = function (A, el, x) {
    var U = x.F.EMBRAPII_UNIDADES || [], est = {q: '', dom: [], uf: [], tipo: []};
    var G = [{k: 'dom', t: 'Domínio tecnológico', aberto: 1, val: function (u) { return u.dominios || []; }, rot: function (k) { return DOMS[k] || k; }}, {k: 'uf', t: 'UF', val: function (u) { return [u.uf]; }, alfa: 1, rot: function (k) { return k; }}, {k: 'tipo', t: 'Tipo de instituição', aberto: 1, val: function (u) { return [u.tipo]; }, rot: function (k) { return k; }}];
    function ict(n) { var k = sem(n); return D.icts.filter(function (t) { return sem(t.nome) === k; })[0]; }
    function passa(u, exceto) {
      if (est.q) { var alvo = sem([u.nome, u.competencia, u.cidade, u.uf, u.tipo].concat(u.linhas || []).join(' ')); if (sem(est.q).split(/\s+/).some(function (p) { return alvo.indexOf(p) < 0; })) return false; }
      for (var i = 0; i < G.length; i++) { var g = G[i], s = est[g.k]; if (g.k === exceto || !s.length) continue; if (!g.val(u).some(function (v) { return s.indexOf(v) >= 0; })) return false; }
      return true;
    }
    function desenha() {
      el.querySelector('#un-grupos').innerHTML = G.map(function (g) {
        var c = soma(U.filter(function (u) { return passa(u, g.k); }), g.val), ks = Object.keys(c).concat(est[g.k].filter(function (k) { return !(k in c); }));
        ks.sort(g.alfa ? function (a, b) { return a.localeCompare(b, 'pt-BR'); } : function (a, b) { return (c[b] || 0) - (c[a] || 0) || String(g.rot(a)).localeCompare(g.rot(b), 'pt-BR'); });
        var n = est[g.k].length;
        return '<details class="f-grupo"' + (g.aberto || n ? ' open' : '') + '><summary>' + esc(g.t) + (n ? '<em>' + n + ' marcado' + (n > 1 ? 's' : '') + '</em>' : '') + '</summary><div class="f-opcoes">' + ks.map(function (k) { return '<label><input type="checkbox" data-ug="' + g.k + '" value="' + esc(k) + '"' + (est[g.k].indexOf(k) >= 0 ? ' checked' : '') + '><span>' + esc(g.rot(k)) + '</span><span>' + (c[k] || 0) + '</span></label>'; }).join('') + '</div></details>';
      }).join('');
      var l = U.filter(function (u) { return passa(u); }).sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });
      var ativos = []; G.forEach(function (g) { est[g.k].forEach(function (v) { ativos.push('<button type="button" class="chip x" data-urm="' + g.k + '|' + esc(v) + '">' + esc(g.rot(v)) + '</button>'); }); });
      el.querySelector('#un-cont').innerHTML = 'Encontradas <b>' + l.length + '</b> unidade' + (l.length === 1 ? '' : 's') + (ativos.length ? ' &nbsp;' + ativos.join(' ') : '');
      el.querySelector('#un-lista').innerHTML = l.length ? l.map(function (u) { var t = ict(u.nome); return '<article class="bloco"><p class="op-sigla">' + esc(u.uf) + ' · ' + esc(u.tipo || '') + '</p><h3>' + (t ? '<a href="#/icts/' + encodeURIComponent(t.id) + '">' + esc(u.nome) + '</a>' : esc(u.nome)) + '</h3><p><b style="font-weight:500;color:var(--ink)">' + esc(u.competencia || '') + '</b></p><p>' + esc(u.cidade || '') + '</p>' + ((u.linhas || []).length ? '<p>' + u.linhas.slice(0, 4).map(esc).join(' · ') + '</p>' : '') + '<div class="tags" style="margin-top:8px">' + (u.dominios || []).map(function (d) { return '<span class="tag">' + esc(DOMS[d] || d) + '</span>'; }).join('') + '</div></article>'; }).join('') : '<div class="vazio"><p>Nenhuma unidade com esses filtros.</p></div>';
    }
    el.innerHTML = '<div class="uni-corpo' + (A.largo && !A.largo() ? ' sem-filtros' : '') + '"><div class="sub-barra"><p class="contagem" id="un-cont" aria-live="polite"></p><div class="barra-esq"><div class="busca"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><input type="search" id="un-q" placeholder="Buscar unidade, cidade ou competência" autocomplete="off" aria-label="Buscar unidade"></div><button type="button" class="btn-linha peq btn-filtros" id="un-bf">Filtros</button></div></div>' +
      '<div class="lista-lay"><aside class="filtros-col" aria-label="Filtros"><h3>Filtros <button type="button" class="btn-txt" id="un-limpar">Limpar</button></h3><div id="un-grupos"></div></aside><div><div class="uni-cards" id="un-lista"></div></div></div></div>';
    var tq;
    el.oninput = function (e) { if (e.target.id === 'un-q') { var v = e.target.value.trim(); clearTimeout(tq); tq = setTimeout(function () { est.q = v; desenha(); }, 180); } };
    el.onchange = function (e) { var i = e.target; if (!i.matches('input[data-ug]')) return; var g = i.getAttribute('data-ug'), k = est[g].indexOf(i.value); if (i.checked && k < 0) est[g].push(i.value); if (!i.checked && k >= 0) est[g].splice(k, 1); desenha(); };
    el.onclick = function (e) {
      if (e.target.closest('#un-bf')) { el.querySelector('.uni-corpo').classList.toggle('sem-filtros'); return; }
      if (e.target.closest('#un-limpar')) { est.q = ''; est.dom = []; est.uf = []; est.tipo = []; el.querySelector('#un-q').value = ''; desenha(); return; }
      var r = e.target.closest('[data-urm]'); if (r) { var p = r.getAttribute('data-urm').split('|'), k = est[p[0]].indexOf(p[1]); if (k >= 0) est[p[0]].splice(k, 1); desenha(); }
    };
    desenha();
  };
  /* áreas ou tecnologias da unidade: nível 1 com subníveis recolhidos e o resto agrupado em "outras" */
  function temasUnidade(u, arv, n1, n2, outras, rotSub) {
    var L = u[n1] || [], L2 = u[n2] || [], mx = Math.max.apply(null, L.map(function (a) { return a[1]; }).concat([1]));
    var txt = function (n, v) { return br(n) + ' · ' + (v != null ? reais(v) : '—'); };
    if (!L.length) return '<p class="txt">Sem classificação.</p>';
    return '<div class="fin-tm">' + L.map(function (a) {
      var no = arv[a[0]]; if (!no) return '';
      var fl = L2.filter(function (y) { return y[0] === a[0]; }), linha = '<div class="barras-h">' + linhaB(no.t, a[1], mx, txt(a[1], a[2])) + '</div>';
      if (!fl.length) return linha;
      var mf = Math.max.apply(null, fl.map(function (y) { return y[2]; }).concat([1]));
      return '<details class="fin-tema"><summary>' + linha + '<small>' + fl.length + ' ' + rotSub + (fl.length > 1 ? 's' : '') + '</small></summary><div class="barras-h">' + fl.map(function (y) { var f = (no.f || [])[y[1]]; return f ? linhaB(f.t, y[2], mf, txt(y[2], y[3])) : ''; }).join('') + '</div></details>';
    }).join('') + '</div>' + (outras > 0 ? '<p class="nota-base">+ ' + outras + (outras > 1 ? ' outras' : ' outra') + ' (só as mais frequentes aparecem). — = valor oculto, célula com menos de 5 projetos.</p>' : '<p class="nota-base">— = valor oculto, célula com menos de 5 projetos.</p>');
  }
  function blocoUnidade(A, u, DIC, M) {
    var meta = M.meta || {}, ativa = u.s === 1, painel = 'painel de ' + A.fdata(meta.data), tot = (u.rep || []).reduce(function (s, v) { return s + (v || 0); }, 0), cores = ['#2563EB', '#10b981', '#f59e0b', '#8b5cf6'], nomes = ['EMBRAPII', 'Empresa', 'Unidade EMBRAPII', 'Sebrae'];
    var cab = '<div class="fin-uni-cab"><span class="fin-chip ' + (ativa ? 'ok' : 'x') + '">' + (ativa ? 'Unidade EMBRAPII ativa' : 'Ex-unidade EMBRAPII') + '</span>' + (u.pa ? '<span>Plano de ação assinado em ' + dataBr(u.pa) + '</span>' : '') + (!ativa ? '<span>' + (u.dd ? 'Descredenciada em ' + dataBr(u.dd) : 'Inativa no ' + painel) + '</span>' : '') + '</div>';
    if (!u.n) return '<div style="padding:10px 4px">' + cab + '<p class="txt">' + (ativa ? 'Unidade ativa, ainda sem projeto contratado no ' + painel + '.' : 'Sem projeto contratado no ' + painel + '.') + '</p></div>';
    var arN = function (i) { return (M.areas[i] || {}).t || ('Área ' + i); }, teN = function (i) { return (M.tecs[i] || {}).t || ('Tecnologia ' + i); };
    var an = u.an || [], mxA = Math.max.apply(null, an.map(function (a) { return a[1]; }).concat([1]));
    var porAno = '<div class="barras-h fin-tm">' + an.map(function (a) { return linhaB(String(a[0]), a[1], mxA, br(a[1]) + ' · ' + (a[2] != null ? reais(a[2]) : '—'), a[2] != null ? reais(a[2]) + ' (nominal)' : 'Valor oculto: menos de ' + (meta.k || 5) + ' projetos'); }).join('') + '</div>';
    return '<div style="padding:10px 4px">' + cab + kpis([['Projetos', br(u.n)], ['Valor total', reais(u.v), 'a preços de IPCA ' + (meta.ipca || '')], ['Valor médio', reais2(u.vm)], ['Empresas', br(u.e)], ['Pedidos de PI', br((u.pi || [])[0]), (u.pi || [])[1] ? (u.pi[1] + ' de transferência') : '']]) +
      (tot ? '<h4 class="olho" style="margin-top:14px">Repartição dos aportes</h4><div class="empilhada">' + u.rep.map(function (v, i) { return '<i style="width:' + ((v || 0) / tot * 100).toFixed(1) + '%;background:' + cores[i] + '" title="' + nomes[i] + ': ' + reais(v) + '"></i>'; }).join('') + '</div><div class="leg">' + u.rep.map(function (v, i) { return '<span style="--c:' + cores[i] + '">' + nomes[i] + ' ' + br((v || 0) / tot * 100, 0) + '%</span>'; }).join('') + '</div>' : '') +
      '<div class="grade-graf"><div><h4 class="olho">Projetos por situação</h4>' + barras((u.st || []).map(function (n, i) { return [(DIC.status || [])[i] || i, n]; }).filter(function (p) { return p[1]; })) + '<p class="nota-base">Cancelados e suspensos entram na contagem, como no painel.</p></div><div><h4 class="olho">Projetos por ano de contrato</h4>' + porAno + '<p class="nota-base">Número de projetos e valor nominal contratado, sem correção pelo IPCA. Valor só quando a célula tem ' + (meta.k || 5) + ' projetos ou mais.</p></div>' +
      '<div><h4 class="olho">Principais áreas de aplicação</h4>' + temasUnidade(u, M.areas || [], 'ar', 'ar2', u.ar_outras, 'subárea') + '</div><div><h4 class="olho">Principais tecnologias habilitadoras</h4>' + temasUnidade(u, M.tecs || [], 'te', 'te2', u.te_outras, 'subtecnologia') + '</div></div></div>';
  }
  window.AV2_blocoUnidade = blocoUnidade; window.AV2_kpis = kpis; window.AV2_barras = barras; window.AV2_colunas = colunas; window.AV2_tabela = tabela;
  ABAS.numeros = function (A, el, x) {
    var M = x.F.EMBRAPII_METRICAS, m = M.meta, DIC = x.F.EMBRAPII_DIC || {};
    var us = Object.keys(M.unidades).map(function (k) { var u = M.unidades[k]; u._k = k; return u; });
    var filtro = 'ativas', nAt = us.filter(function (u) { return u.s === 1; }).length;
    var r = pagina(el, {titulo: 'Unidades', kpis: [['Projetos no painel', br(m.n), br(m.un_com_projeto) + ' unidades com projeto'], ['Valor contratado', reais(m.v), 'a preços de IPCA de ' + m.ipca], ['Empresas atendidas', br(m.emp), 'CNPJs distintos'], ['Pedidos de PI', br(m.pi[0]), br(m.pi[1]) + ' de Transferência de Tecnologia'], ['Unidades ativas', br(m.un_ativas), br(m.un_cadastro) + ' no cadastro, com as ex-unidades']],
      sobre: '<p class="txt" style="margin-top:0">Números de cada unidade EMBRAPII no painel público: projetos, valor, empresas e pedidos de PI. Clique no nome da unidade para abrir a ficha, com situação dos projetos, valor por ano e áreas.</p>',
      nota: esc(m.fonte) + ', dados de ' + A.fdata(m.data) + '. Valor de célula com menos de ' + m.k + ' projetos fica oculto.',
      antesTab: '<div class="tags" style="margin-bottom:6px"><button type="button" class="chip" data-nf="ativas" aria-pressed="true">Ativas (' + nAt + ')</button><button type="button" class="chip" data-nf="ex" aria-pressed="false">Ex-unidades (' + (us.length - nAt) + ')</button><button type="button" class="chip" data-nf="todas" aria-pressed="false">Todas (' + us.length + ')</button></div><div data-nt></div>',
      depois: '<p class="nota-base">Empresas: CNPJs distintos por unidade; a soma das unidades supera o total geral porque a mesma empresa atende mais de uma unidade. Pedidos de PI: total do painel, com os de Transferência de Tecnologia ao lado. n/d: valor não exibido (unidade com menos de ' + m.k + ' projetos).</p>'});
    function desenha() {
      var l = us.filter(function (u) { return filtro === 'todas' || (filtro === 'ativas' ? u.s === 1 : u.s !== 1); }).sort(function (p, q) { return nomeUni(p._k, p.nm).localeCompare(nomeUni(q._k, q.nm), 'pt-BR'); });
      var t0 = el.querySelector('[data-nt]'), t = t0.cloneNode(false); t0.parentNode.replaceChild(t, t0);
      tabela(t, {rows: l, rot: 'unidades', ph: 'Buscar unidade, cidade, UF ou tipo', ord: 3, info: function (l) { return '<b>' + br(l.reduce(function (s, u) { return s + (u.n || 0); }, 0)) + '</b> projetos'; }, busca: function (u) { return [nomeUni(u._k, u.nm), u.nm, u.sg, u.ct, u.uf, u.tp].join(' '); },
        filtros: [{t: 'UF', v: function (u) { return u.uf; }, ordem: 'alfa'}, {t: 'Tipo', v: function (u) { return u.tp; }}],
        cols: [{t: 'Unidade', v: function (u) { return nomeUni(u._k, u.nm); }, h: function (u) { var id = ictDeCod(u._k); return '<button type="button" class="btn-txt fin-uni-bt" data-uni="' + u._k + '" title="Ver a ficha da unidade">' + esc(nomeUni(u._k, u.nm)) + ' ▾</button>' + (u.s !== 1 ? ' <span class="fin-selo x">ex-unidade</span>' : !u.n ? ' <span class="fin-selo">sem projeto</span>' : '') + (id ? ' <a class="fin-uni-ict" href="#/icts/' + encodeURIComponent(id) + '">página da ICT ↗</a>' : ''); }}, {t: 'UF', v: function (u) { return u.uf; }}, {t: 'Tipo', v: function (u) { return u.tp; }},
          {t: 'Projetos', num: 1, v: function (u) { return u.n || 0; }, h: function (u) { return br(u.n); }}, {t: 'Valor total', num: 1, v: function (u) { return u.v || 0; }, h: function (u) { return u.v != null ? reais(u.v) : '<span class="fin-nd">n/d</span>'; }}, {t: 'Valor médio', num: 1, v: function (u) { return u.vm || 0; }, h: function (u) { return u.vm != null ? reais2(u.vm) : '<span class="fin-nd">n/d</span>'; }},
          {t: 'Empresas', num: 1, v: function (u) { return u.n ? u.e || 0 : 0; }, h: function (u) { return br(u.n ? u.e : 0); }}, {t: 'Pedidos de PI', num: 1, v: function (u) { return u.n ? (u.pi || [])[0] || 0 : 0; }, h: function (u) { return u.n ? br((u.pi || [])[0]) + ((u.pi || [])[1] > 0 ? ' <small>' + br(u.pi[1]) + ' transf. tec.</small>' : '') : '0'; }}]});
    }
    el.onclick = function (e) {
      var b = e.target.closest('button[data-nf]'); if (b) { filtro = b.getAttribute('data-nf'); el.querySelectorAll('button[data-nf]').forEach(function (x2) { x2.setAttribute('aria-pressed', String(x2 === b)); }); desenha(); return; }
      var u = e.target.closest('button[data-uni]'); if (u) { var tr = u.closest('tr'), prox = tr.nextElementSibling; if (prox && prox.classList.contains('det-uni')) { prox.remove(); return; } var d = document.createElement('tr'); d.className = 'det-uni'; d.innerHTML = '<td colspan="8">' + blocoUnidade(A, M.unidades[u.getAttribute('data-uni')], DIC, M) + '</td>'; tr.parentNode.insertBefore(d, tr.nextSibling); }
    };
    desenha();
  };
  ABAS.areas = function (A, el, x) {
    var M = x.F.EMBRAPII_METRICAS, modo = 'areas', ab = {}, rows = null;
    var uniLink = function (u) { var k = String(u[0]), un = M.unidades[k]; return linkUni(nomeUni(k, un ? un.nm : k), k) + ' (' + u[1] + ')'; };
    function projs() { return rows || (rows = linhasEmbrapii(x)); }
    function chave(i, j) { var a = (M[modo] || [])[i], f = j != null ? a.f[j] : null; return {a1: a.t, a2: f ? f.t : ''}; }
    function lista(i) {
      var e = ab[i], k = chave(i, e.sub), c1 = modo === 'areas' ? '_a1' : '_t1', c2 = modo === 'areas' ? '_a2' : '_t2';
      var l = projs().filter(function (p) { return p[c1] === k.a1 && (!k.a2 || p[c2] === k.a2); }).sort(function (a, b) { return (+b.ano || 0) - (+a.ano || 0); });
      var par = (modo === 'areas' ? 'a1=' : 't1=') + encodeURIComponent(k.a1) + (k.a2 ? '&' + (modo === 'areas' ? 'a2=' : 't2=') + encodeURIComponent(k.a2) : '');
      return '<div class="fin-pl"><div class="fin-pl-cab"><p><b>' + br(l.length) + '</b> projeto' + (l.length === 1 ? '' : 's') + ' em <b>' + esc(k.a1 + (k.a2 ? ' › ' + k.a2 : '')) + '</b></p><a class="btn-linha peq" href="#/agentes/embrapii?aba=projetos&amp;' + par + '">Abrir na aba Projetos</a></div><ul>' +
        l.slice(0, e.n).map(function (p) { return '<li><b>' + esc(p.titulo) + '</b><span>' + esc(p.ano) + ' ' + chipSt(p._st) + ' ' + String(p.empresa || '').split('; ').filter(Boolean).map(function (n) { return linkEmp(n); }).join('; ') + ' · ' + (window.AV2_execLink ? window.AV2_execLink(A, p.unidade) : esc(p.unidade)) + '</span></li>'; }).join('') + '</ul>' +
        (l.length > e.n ? '<button type="button" class="btn-linha peq" data-mais="' + i + '">Mostrar mais (' + br(Math.min(20, l.length - e.n)) + ' de ' + br(l.length - e.n) + ' restantes)</button>' : '') + '</div>';
    }
    function desenha() {
      var L = M[modo] || [], mx = Math.max.apply(null, L.map(function (a) { return a.n; })), ord = L.map(function (a, i) { return i; }).sort(function (p, q) { return L[q].n - L[p].n || L[p].t.localeCompare(L[q].t, 'pt-BR'); });
      el.querySelector('[data-cont]').textContent = L.length + ' ' + (modo === 'areas' ? 'áreas de aplicação' : 'tecnologias habilitadoras') + ' · ' + br(L.reduce(function (s, a) { return s + a.n; }, 0)) + ' projetos';
      el.querySelector('[data-arv]').innerHTML = ord.map(function (i) {
        var a = L[i], e = ab[i], aberto = !!e;
        return '<div class="ramo"><button type="button" data-ramo="' + i + '" aria-expanded="' + aberto + '"><span>' + (aberto ? '▾' : '▸') + '</span><span>' + esc(a.t) + '</span><i style="width:' + (a.n / mx * 100).toFixed(0) + '%"></i><b>' + br(a.n) + '</b><b>' + reais(a.v) + '</b></button>' +
          '<small>Unidades que mais atuam: ' + (a.u || []).map(uniLink).join(', ') + '</small>' +
          (aberto ? '<div class="sub">' + (a.f || []).map(function (f, j) { return j; }).sort(function (p, q) { return a.f[q].n - a.f[p].n || a.f[p].t.localeCompare(a.f[q].t, 'pt-BR'); }).map(function (j) { var f = a.f[j]; return '<div class="sub-item"><button type="button" class="ramo-sub" data-sub="' + i + ':' + j + '" aria-pressed="' + (e.sub === j) + '"><span>' + esc(f.t) + '</span><i style="width:' + (f.n / a.n * 100).toFixed(0) + '%"></i><b>' + br(f.n) + '</b><b>' + reais(f.v) + '</b></button>' + (e.sub === j && (f.u || []).length ? '<small>Unidades: ' + f.u.map(uniLink).join(', ') + '</small>' : '') + '</div>'; }).join('') + '</div>' + lista(i) : '') + '</div>';
      }).join('');
      el.querySelectorAll('[data-modo]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-modo') === modo)); });
    }
    el.innerHTML = '<div class="medida"><button type="button" data-modo="areas" aria-pressed="true">Áreas de aplicação (' + (M.areas || []).length + ')</button><button type="button" data-modo="tecs" aria-pressed="false">Tecnologias habilitadoras (' + (M.tecs || []).length + ')</button></div>' +
      '<p class="contagem" data-cont style="margin:12px 0 0"></p><div class="bloco largo"><div class="ramo-cab"><span></span><span>Ramo</span><span></span><span>Projetos</span><span>Valor</span></div><div class="arvore" data-arv></div></div><p class="nota-base">Clique num ramo para ver as subáreas e os projetos dele; clique numa subárea para restringir a lista. "Abrir na aba Projetos" leva o filtro já aplicado.</p>';
    el.onclick = function (e) {
      var b = e.target.closest('[data-modo]'); if (b) { modo = b.getAttribute('data-modo'); ab = {}; desenha(); return; }
      var m = e.target.closest('[data-mais]'); if (m) { ab[m.getAttribute('data-mais')].n += 20; desenha(); return; }
      var sb = e.target.closest('button[data-sub]'); if (sb) { var p = sb.getAttribute('data-sub').split(':'), cur = ab[p[0]]; cur.sub = cur.sub === +p[1] ? null : +p[1]; cur.n = 20; desenha(); return; }
      var r = e.target.closest('[data-ramo]'); if (r) { var i = r.getAttribute('data-ramo'); if (ab[i]) delete ab[i]; else ab[i] = {sub: null, n: 20}; desenha(); }
    };
    desenha();
  };
  function linhasEmbrapii(x) {
    var TB = x.TB, DIC = x.F.EMBRAPII_DIC || {}, rows = linhas(TB.EMBRAPII_PROJETOS_COLS, TB.EMBRAPII_PROJETOS || []);
    rows.forEach(function (r) { var a = (DIC.area || [])[r.area] || [], t = (DIC.tec || [])[r.tecnologia] || []; r._st = (DIC.status || [])[r.status] || ''; r._a1 = a[0] || 'Não classificado'; r._a2 = a[1] || ''; r._t1 = t[0] || 'Não classificado'; r._t2 = t[1] || ''; r._emps = String(r.empresa || '').split('; ').filter(Boolean); });
    return rows;
  }
  /* --- Projetos (todas as bases com tabela): KPIs, gráficos clicáveis, tabela com filtros e "Sobre esta base" recolhido --- */
  function distintos(rows, f) { var o = {}; rows.forEach(function (r) { [].concat(f(r)).forEach(function (k) { if (k) o[k] = 1; }); }); return Object.keys(o).length; }
  function somaV(rows, f) { return rows.reduce(function (s, r) { return s + (+f(r) || 0); }, 0); }
  function faixaAnos(rows, f) { var a = rows.map(function (r) { return +f(r) || 0; }).filter(Boolean); return a.length ? Math.min.apply(null, a) + '–' + Math.max.apply(null, a) : '—'; }
  function anoDe(d) { var m = /(19|20)\d{2}/.exec(d || ''); return m ? m[0] : ''; }
  ABAS.projetos = function (A, el, x) {
    var s = x.sub, TB = x.TB, F = x.F, V = function (f) { return function (p) { return p[f]; }; }, dtS = function (p) { var d = String(p.data || '').split('/'); return d.length === 3 ? d[2] + d[1] + d[0] : String(p.data || ''); };
    if (s === 'embrapii') {
      var r = linhasEmbrapii(x), pq = function (k) { var m = new RegExp('(?:^|&)' + k + '=([^&]*)').exec(x.q || ''); try { return m ? decodeURIComponent(m[1]) : ''; } catch (e) { return ''; } };
      var pg = pagina(el, {titulo: 'Projetos', kpis: [['Projetos', br(r.length)], ['Empresas (nomes distintos)', br(distintos(r, function (p) { return p._emps; })), 'por CNPJ são ' + br(F.EMBRAPII_METRICAS.meta.emp) + ', nas Unidades em números'], ['Unidades', br(distintos(r, V('unidade')))], ['Anos de contrato', faixaAnos(r, V('ano'))]],
        sobre: '<p class="txt" style="margin-top:0">Projetos do painel público da EMBRAPII. O painel não traz valor por projeto. Projetos com mais de uma empresa listam cada uma, e o filtro de empresa procura em todas.</p>', nota: 'Painel público da EMBRAPII, dados de ' + A.fdata((F.EMBRAPII_META || {}).data_dos_dados) + '.',
        graficos: gradeG([blocoG('Projetos por ano de contrato', seguro(function () { return colunas(soma(r, V('ano')), null, 'data-gf3'); })), blocoG('Projetos por situação', seguro(function () { return barras(top(soma(r, V('_st')), 6), null, 'data-gf2'); })), blocoG('Unidades com mais projetos', seguro(function () { return barras(top(soma(r, V('unidade')), 8), null, 'data-gf0'); })), blocoG('Áreas de aplicação', seguro(function () { return barras(top(soma(r, V('_a1')), 8), null, 'data-gf4'); }))]),
        cfg: {rows: r, rot: 'projetos', ph: 'Título, empresa, unidade, descrição ou código', ord: 3, busca: function (p) { return [p.titulo, p.empresa, p.unidade, p.descricao, p.cod].join(' '); },
          filtros: [{t: 'Unidade', v: function (p) { return p.unidade; }, ordem: 'alfa'}, {t: 'Empresa contratante', v: function (p) { return p._emps; }, lista: true}, {t: 'Situação', v: function (p) { return p._st; }}, {t: 'Ano', v: function (p) { return p.ano; }, ordem: 'num'}, {t: 'Área', v: function (p) { return p._a1; }}, {t: 'Subárea', v: function (p) { return p._a2; }}, {t: 'Tecnologia', v: function (p) { return p._t1; }}, {t: 'Subtecnologia', v: function (p) { return p._t2; }}],
          cols: [{t: 'Título', v: function (p) { return p.titulo; }, h: function (p) { return esc(p.titulo) + '<br><small>' + esc([p._a2 || p._a1, p._t2 || p._t1].filter(Boolean).join(' · ')) + '</small>'; }}, {t: 'Descrição', v: function (p) { return p.descricao; }, h: function (p) { return '<div class="fin-celdesc">' + (p.descricao ? detalhe(p.descricao, 150) : '<small>Sem descrição no painel</small>') + '</div>'; }}, {t: 'Situação', v: function (p) { return p._st; }, h: function (p) { return chipSt(p._st); }}, {t: 'Ano', num: 1, v: function (p) { return +p.ano || 0; }, h: function (p) { return esc(p.ano); }}, {t: 'Unidade', v: function (p) { return p.unidade; }, h: function (p) { return window.AV2_execLink ? window.AV2_execLink(A, p.unidade) : esc(p.unidade); }}, {t: 'Empresa', v: function (p) { return p.empresa; }, h: function (p) { return p._emps.map(function (n) { return linkEmp(n); }).join('<br>'); }}]}});
      [['a1', 4], ['a2', 5], ['t1', 6], ['t2', 7], ['emp', 1], ['uni', 0]].forEach(function (k) { var v = pq(k[0]); if (v) pg.tx._filtro(k[1], v, true); });
      return;
    }
    if (s === 'finep') {
      var rf = linhas(TB.FINEP_PROJETOS_COLS, TB.FINEP_PROJETOS || []), vf = V('valor');
      return pagina(el, {titulo: 'Projetos', kpis: [['Projetos', br(rf.length)], ['Valor contratado', reais(somaV(rf, vf))], ['Modalidades', br(distintos(rf, V('instr')))], ['Proponentes', br(distintos(rf, V('proponente')))]],
        sobre: '<p class="txt" style="margin-top:0">Carteira de projetos contratados pela Finep em operação direta, com crédito, subvenção e recursos não reembolsáveis a ICTs.</p>', nota: esc((F.FINEP_META || {}).fonte || '') + ', gerado em ' + A.fdata((F.FINEP_META || {}).gerado) + '.',
        graficos: gradeG([blocoG('Valor por modalidade', barras(comN(rf, V('instr'), vf, 8), reais, 'data-gf0')), blocoG('Valor contratado por ano', colunas(soma(rf, function (p) { return anoDe(p.data); }, vf), reais)), blocoG('Valor por UF', barras(top(soma(rf, V('uf'), vf), 10), reais, 'data-gf2')), blocoG('Projetos por situação', barras(top(soma(rf, V('status')), 6), null, 'data-gf3'))]),
        cfg: {rows: rf, rot: 'projetos', ph: 'Título, proponente ou município', ord: 4, soma: vf, busca: function (p) { return [p.titulo, p.proponente, p.municipio].join(' '); },
          filtros: [{t: 'Modalidade', v: V('instr')}, {t: 'Programa ou demanda', v: V('demanda')}, {t: 'UF', v: V('uf'), ordem: 'alfa'}, {t: 'Situação', v: V('status')}],
          cols: [{t: 'Título', v: V('titulo'), h: function (p) { return esc(p.titulo) + '<br><small>' + esc([p.demanda, p.status].filter(Boolean).join(' · ')) + '</small>'; }}, {t: 'Proponente', v: V('proponente'), h: function (p) { return linkEmp(p.proponente); }}, {t: 'Modalidade', v: V('instr')}, {t: 'UF', v: V('uf')}, {t: 'Valor', num: 1, v: function (p) { return +p.valor || 0; }, h: function (p) { return reais(p.valor); }}, {t: 'Data', v: V('data'), s: dtS}]}});
    }
    if (s === 'anp') {
      var ra = linhas(TB.ANP_PROJETOS_COLS, TB.ANP_PROJETOS || []), va = V('valor');
      return pagina(el, {titulo: 'Projetos', kpis: [['Projetos', br(ra.length)], ['Valor dos projetos', reais(somaV(ra, va))], ['Empresas', br(distintos(ra, V('empresa')))], ['Instituições executoras', br(distintos(ra, V('instituicao')))]],
        sobre: '<p class="txt" style="margin-top:0">Projetos de PD&amp;I executados com a cláusula de investimento dos contratos de petróleo. A obrigação acumulada por grupo econômico (' + (F.ANP_OBRIGACAO_POR_GRUPO || []).length + ' grupos, 1998–2025) está na aba <a href="#/agentes/anp?aba=obrigacao">Obrigação de PD&amp;I</a>.</p>', nota: esc((F.ANP_META || {}).fonte || '') + ', gerado em ' + A.fdata((F.ANP_META || {}).gerado) + '.',
        graficos: gradeG([blocoG('Valor por ano', colunas(soma(ra, function (p) { return anoDe(p.data); }, va), reais)), blocoG('Empresas, por valor', barras(top(soma(ra, V('empresa'), va), 8), reais, 'data-gf0')), blocoG('Temas, por valor', barras(top(soma(ra, V('tema'), va), 8), reais, 'data-gf3')), blocoG('Qualificação', barras(top(soma(ra, V('qualif')), 6), null, 'data-gf1'))]),
        cfg: {rows: ra, rot: 'projetos', ph: 'Título, empresa, instituição executora ou unidade', ord: 5, soma: va, busca: function (p) { return [p.titulo, p.empresa, p.instituicao, p.unidade, p.num].join(' '); },
          filtros: [{t: 'Empresa', v: V('empresa')}, {t: 'Qualificação', v: V('qualif')}, {t: 'Área', v: V('area')}, {t: 'Tema', v: V('tema')}],
          cols: [{t: 'Título', v: V('titulo'), h: function (p) { return esc(p.titulo) + '<br><small>' + esc([p.tema, p.qualif].filter(Boolean).join(' · ')) + '</small>'; }}, {t: 'Empresa', v: V('empresa'), h: function (p) { return linkEmp(p.empresa); }}, {t: 'Executora', v: V('instituicao'), h: function (p) { return p.instituicao && window.AV2_execLink ? window.AV2_execLink(A, p.instituicao) : esc(p.instituicao); }}, {t: 'Área', v: V('area')}, {t: 'Data', v: V('data'), s: dtS}, {t: 'Valor', num: 1, v: function (p) { return +p.valor || 0; }, h: function (p) { return reais(p.valor); }}]}});
    }
    if (s === 'aneel') {
      var rn = linhas(TB.ANEEL_PROJETOS_COLS, TB.ANEEL_PROJETOS || []), vp = V('valorprev');
      return pagina(el, {titulo: 'Projetos', kpis: [['Projetos', br(rn.length)], ['Custo previsto', reais(somaV(rn, vp))], ['Valor auditado', reais(somaV(rn, V('valoraud'))), 'só após a auditoria'], ['Empresas', br(distintos(rn, V('empresa')))]],
        sobre: '<p class="txt" style="margin-top:0">Projetos de P&amp;D executados sob a obrigação regulatória do setor elétrico (Lei 9.991/2000), cadastrados no ProPDI/ConectaANEEL. Filtre por situação, segmento e tema do programa.</p>', nota: esc((F.ANEEL_META || {}).fonte || '') + ', gerado em ' + A.fdata((F.ANEEL_META || {}).gerado) + '. O custo previsto vem do cadastro do projeto; o valor auditado só existe depois da auditoria e não substitui o previsto.',
        graficos: gradeG([blocoG('Custo previsto por segmento', barras(comN(rn, V('segmento'), vp, 6), reais, 'data-gf1')), blocoG('Custo previsto por ano', colunas(soma(rn, V('ano'), vp), reais, 'data-gf3')), blocoG('Temas, por custo previsto', barras(comN(rn, V('tema'), vp, 8), reais, 'data-gf2')), blocoG('Projetos por situação', barras(top(soma(rn, V('status')), 6), null, 'data-gf0'))]),
        cfg: {rows: rn, rot: 'projetos', ph: 'Título, empresa, código ou chamada', ord: 6, soma: vp, somaRot: 'Custo previsto filtrado', soma2: V('valoraud'), soma2Rot: 'Valor auditado filtrado', busca: function (p) { return [p.titulo, p.empresa, p.codigo, p.chamada, p.tema, p.segmento].join(' '); },
          filtros: [{t: 'Situação', v: V('status')}, {t: 'Segmento', v: V('segmento')}, {t: 'Tema', v: V('tema')}, {t: 'Ano', v: V('ano'), ordem: 'num'}],
          cols: [{t: 'Título', v: V('titulo'), h: function (p) { return esc(p.titulo) + '<br><small>' + esc([p.codigo, p.chamada].filter(Boolean).join(' · ')) + '</small>'; }}, {t: 'Empresa', v: V('empresa'), h: function (p) { return linkEmp(p.empresa); }}, {t: 'Segmento', v: V('segmento')}, {t: 'Tema', v: V('tema')}, {t: 'Situação', v: V('status')}, {t: 'Ano', num: 1, v: function (p) { return +p.ano || 0; }, h: function (p) { return esc(p.ano); }}, {t: 'Custo previsto', num: 1, v: function (p) { return +p.valorprev || 0; }, h: function (p) { return reais(p.valorprev); }}, {t: 'Valor auditado', num: 1, v: function (p) { return +p.valoraud || 0; }, h: function (p) { return reais(p.valoraud); }}]}});
    }
    if (s === 'antt') {
      var rt = linhas(TB.ANTT_PROJETOS_COLS, TB.ANTT_PROJETOS || []), vt = V('valor');
      return pagina(el, {titulo: 'Projetos', kpis: [['Projetos', br(rt.length)], ['Valor', reais(somaV(rt, vt))], ['Concessionárias', br(distintos(rt, V('concessionaria')))], ['Temas', br(distintos(rt, V('tema')))]],
        sobre: '<p class="txt" style="margin-top:0">Recursos para Desenvolvimento Tecnológico (RDT): parte da receita das concessionárias de rodovias federais aplicada em pesquisa.</p>', nota: esc((F.ANTT_META || {}).fonte || '') + ', gerado em ' + A.fdata((F.ANTT_META || {}).gerado) + '.',
        graficos: gradeG([blocoG('Valor por tema', barras(comN(rt, V('tema'), vt, 8), reais, 'data-gf1')), blocoG('Valor por ano de início', colunas(soma(rt, V('inicio'), vt), reais, 'data-gf3')), blocoG('Concessionárias, por valor', barras(top(soma(rt, V('concessionaria'), vt), 8), reais, 'data-gf2')), blocoG('Situação', barras(top(soma(rt, V('situacao')), 6), null, 'data-gf0'))]),
        cfg: {rows: rt, rot: 'projetos', ph: 'Pesquisa, concessionária ou processo', ord: 4, soma: vt, busca: function (p) { return [p.pesquisa, p.concessionaria, p.processo, p.tema].join(' '); },
          filtros: [{t: 'Situação', v: V('situacao')}, {t: 'Tema', v: V('tema')}, {t: 'Concessionária', v: V('concessionaria'), ordem: 'alfa'}, {t: 'Ano de início', v: V('inicio'), ordem: 'num'}],
          cols: [{t: 'Pesquisa', v: V('pesquisa')}, {t: 'Concessionária', v: V('concessionaria'), h: function (p) { return linkEmp(p.concessionaria); }}, {t: 'Tema', v: V('tema')}, {t: 'Situação', v: V('situacao')}, {t: 'Valor', num: 1, v: function (p) { return +p.valor || 0; }, h: function (p) { return reais(p.valor); }}, {t: 'Início', num: 1, v: function (p) { return +p.inicio || 0; }, h: function (p) { return esc(p.inicio); }}]}});
    }
    el.innerHTML = '<p class="txt">Sem base de projetos.</p>';
  };
  /* --- ANP: obrigação de PD&I --- */
  ABAS.obrigacao = function (A, el, x) {
    var F = x.F, ano = {}, tot = 0; (F.ANP_OBRIGACAO_POR_ANO || []).forEach(function (a) { ano[a.ano] = a.total; tot += a.total || 0; });
    var anos = Object.keys(ano).sort();
    pagina(el, {kpis: [['Obrigação acumulada', reais(tot), anos.length ? anos[0] + '–' + anos[anos.length - 1] : ''], ['Grupos econômicos', br((F.ANP_OBRIGACAO_POR_GRUPO || []).length)], ['Maior grupo', (F.ANP_OBRIGACAO_POR_GRUPO || [{}])[0].grupo || '—', reais((F.ANP_OBRIGACAO_POR_GRUPO || [{}])[0].total)]],
      sobre: '<p class="txt" style="margin-top:0">A cláusula de PD&amp;I dos contratos de exploração e produção obriga as petroleiras a investir parte da receita dos campos de grande produção em pesquisa. Estes são os valores de obrigação gerada.</p>', nota: esc((F.ANP_META || {}).fonte || ''),
      graficos: '<div class="bloco"><h4 class="olho">Obrigação gerada por ano</h4>' + colunas(ano, reais) + '</div>' + gradeG([blocoG('Por grupo econômico', barras((F.ANP_OBRIGACAO_POR_GRUPO || []).map(function (g) { return [g.grupo, g.total]; }), reais)), blocoG('Campos com maior obrigação (top 25)', barras((F.ANP_OBRIGACAO_POR_AREA_TOP || []).map(function (g) { return [g.area, g.total]; }), reais))])});
  };
  /* --- ANEEL: empresas e grupos --- */
  ABAS.empresas = function (A, el, x) {
    var r = linhas(x.TB.ANEEL_EMPRESAS_COLS, x.TB.ANEEL_EMPRESAS || []);
    var sim = function (v) { return /^(sim|s|x|✓)$/i.test(String(v || '').trim()) ? 'Sim' : 'Não'; }, ct = function (f) { return br(r.filter(function (p) { return sim(p[f]) === 'Sim'; }).length); };
    pagina(el, {titulo: 'Empresas', kpis: [['Empresas', br(r.length)], ['Geração', ct('ger')], ['Transmissão', ct('trans')], ['Distribuição', ct('dist')], ['Comercialização', ct('com')]],
      nota: 'Agentes do setor elétrico cadastrados na ANEEL, dados de ' + A.fdata((x.F.ANEEL_META || {}).gerado) + '.',
      cfg: {rows: r, rot: 'empresas', ph: 'Razão social ou CNPJ', ord: 0, desc: false, busca: function (p) { return [p.nome, p.cnpj].join(' '); },
        filtros: [{t: 'Geração', v: function (p) { return sim(p.ger); }}, {t: 'Transmissão', v: function (p) { return sim(p.trans); }}, {t: 'Distribuição', v: function (p) { return sim(p.dist); }}, {t: 'Comercialização', v: function (p) { return sim(p.com); }}, {t: 'Situação', v: function (p) { return p.ativo; }}],
        cols: [{t: 'Razão social', v: function (p) { return p.nome; }, h: function (p) { return linkEmp(p.nome); }}, {t: 'CNPJ', v: function (p) { return p.cnpj; }}, {t: 'Atividades reguladas', v: function (p) { return p.atividades; }}, {t: 'Situação', v: function (p) { return p.ativo; }}]}});
  };
  ABAS.grupos = function (A, el, x) {
    var G = (x.F.PDI_ANEEL || {}).grupos || {}, l = Object.keys(G).map(function (k) { var g = G[k]; g._k = k; return g; }).sort(function (a, b) { return (b.n || 0) - (a.n || 0); });
    pagina(el, {titulo: 'Grupos', kpis: [['Grupos', br(l.length)], ['Projetos na ANEEL', br(somaV(l, function (g) { return g.n; }))], ['Com chamada', br(l.filter(function (g) { return g.chamada; }).length)], ['Fluxo contínuo', br(l.filter(function (g) { return g.fluxo; }).length)]],
      sobre: '<p class="txt" style="margin-top:0">Cada distribuidora, geradora ou transmissora aplica sua obrigação de P&amp;D por um programa próprio. Aqui estão os grupos, quantos projetos têm na base da ANEEL e se há porta de entrada ou chamada aberta.</p>',
      cfg: {rows: l, rot: 'grupos', ph: 'Grupo ou empresa', ord: 1, busca: function (g) { return g.grupo; },
        cols: [{t: 'Grupo', v: function (g) { return g.grupo; }, h: function (g) { return g.url ? '<a href="' + esc(g.url) + '" target="_blank" rel="noopener">' + esc(g.grupo) + ' ↗</a>' : esc(g.grupo); }}, {t: 'Projetos na ANEEL', num: 1, v: function (g) { return g.n || 0; }, h: function (g) { return br(g.n); }}, {t: 'Último ano', num: 1, v: function (g) { return g.ultimo || 0; }, h: function (g) { return esc(g.ultimo || ''); }}, {t: 'Chamada', v: function (g) { return g.chamada ? g.chamada.titulo : ''; }, h: function (g) { return g.chamada ? '<a href="' + esc(g.chamada.link) + '" target="_blank" rel="noopener">' + esc(g.chamada.titulo) + '</a><br><small>até ' + A.fdata(g.chamada.encerramento) + '</small>' : '<small>' + (g.fluxo ? 'Fluxo contínuo' : '—') + '</small>'; }}]}});
  };
  /* --- BNDES --- */
  ABAS.operacoes = function (A, el, x) {
    var B = x.F.BNDES_INOVACAO, ops = [], grp = {};
    /* empresas dos grupos curados do DNA viram uma só, como no Atlas; raízes sem grupo seguem sozinhas */
    B.e.forEach(function (e) { var gid = IDX.raiz[e[0]] || '', k = gid || e[0], g = grp[k] || (grp[k] = {k: k, id: gid, nome: gid ? (nomeDna(gid) || e[1]) : e[1], n: 0, v: 0});
      (e[9] || []).forEach(function (o) { var op = {raiz: e[0], gid: gid, emp: g.nome, ano: o[0], prod: B.P[o[1]] || '', instr: B.I[o[2]] || '', vc: o[3] || 0, desc: o[4] || '', vd: o[5] || 0, uf: o[6] || '', setor: B.S[o[7]] || ''}; ops.push(op); g.n++; g.v += op.vc; }); });
    var vistos = {}; B.e.forEach(function (e) { vistos[e[0]] = 1; });
    var dupC = (B.cc || []).reduce(function (s, g) { var n = g.filter(function (r) { return vistos[r]; }).length; return s + (n > 1 ? n - 1 : 0); }, 0);
    var vc = ops.reduce(function (s, o) { return s + o.vc; }, 0), vd = ops.reduce(function (s, o) { return s + o.vd; }, 0), nct = B.e.reduce(function (s, e) { return s + (e[10] || 0); }, 0) - dupC;
    var a0 = Math.min.apply(null, ops.map(function (o) { return o.ano; })), a1 = Math.max.apply(null, ops.map(function (o) { return o.ano; })), ex = B.excl, med = 'v';
    var topE = Object.keys(grp).map(function (k) { return grp[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 10);
    var pg = pagina(el, {titulo: 'Explorador de operações', kpis: [['Operações', br(ops.length), br(nct) + ' contratos distintos'], ['Valor contratado', reais(vc)], ['Valor desembolsado', reais(vd), br(vd / vc * 100, 1) + '% do contratado'], ['Empresas', br(B.e.length), 'raízes de CNPJ'], ['Período', a0 + '–' + a1]],
      sobre: '<p class="txt" style="margin-top:0">Operações de financiamento direto e indireto não automático que o BNDES classifica como inovação nos dados abertos, de empresas com CNPJ identificado. Cada operação é uma linha do arquivo do BNDES; um contrato pode ter várias, e uma operação não é um projeto. O valor contratado é crédito, em sua maior parte reembolsável, e pode incluir limites de crédito; o desembolsado é o que já foi liberado. Cada empresa abre a ficha do DNA da Inovação.</p><p class="txt">Contratos distintos' + (dupC ? ' (descontados ' + dupC + ' repetidos entre empresas do mesmo grupo)' : '') + ': ' + br(nct) + '. A marca de inovação é do próprio BNDES e a data em que foi atribuída não consta do arquivo.' + (ex ? ' Ficam de fora ' + br(ex[0]) + ' instituições de ensino, pesquisa, fomento e administração pública (' + br(ex[1]) + ' operações, ' + reais(ex[2]) + '), que o DNA não trata como empresa, e ' + br(ex[3]) + ' linhas idênticas repetidas.' : '') + '</p><p class="nota-base">Critério técnico da extração: ' + esc(B.criterio) + '</p>',
      nota: esc(B.fonte) + ', arquivo de ' + A.fdata(B.arquivo_data) + ', contratações até ' + A.fdata(B.corte) + ', filtro inovação = SIM (<a href="https://dadosabertos.bndes.gov.br/dataset/operacoes-financiamento" target="_blank" rel="noopener">dadosabertos.bndes.gov.br</a>).',
      titGraf: 'Distribuição das operações', cabGraf: '<div class="medida"><button type="button" data-med="v" aria-pressed="true">Valor contratado</button><button type="button" data-med="n" aria-pressed="false">Nº de operações</button></div>', graficos: '<div data-bg></div>',
      cfg: {rows: ops, rot: 'operações', ph: 'Empresa, descrição, instrumento, produto ou UF', ord: 1, soma: function (o) { return o.vc; }, somaRot: 'Contratado filtrado', soma2: function (o) { return o.vd; }, soma2Rot: 'Desembolsado filtrado', busca: function (o) { return [o.emp, o.desc, o.instr, o.prod, o.uf, o.setor].join(' '); },
        filtros: [{t: 'Ano', v: function (o) { return o.ano; }, ordem: 'num'}, {t: 'Instrumento', v: function (o) { return o.instr; }}, {t: 'Produto', v: function (o) { return o.prod; }}, {t: 'UF', v: function (o) { return o.uf; }, ordem: 'alfa'}, {t: 'Setor', v: function (o) { return o.setor; }}],
        cols: [{t: 'Empresa', v: function (o) { return o.emp; }, h: function (o) { var id = o.gid; return (id ? '<a href="#/dna/' + encodeURIComponent(id) + '">' + esc(o.emp) + '</a>' : esc(o.emp)) + '<br><small>' + esc(o.desc) + '</small>'; }}, {t: 'Ano', num: 1, v: function (o) { return o.ano; }}, {t: 'Produto', v: function (o) { return o.prod; }}, {t: 'Instrumento', v: function (o) { return o.instr; }}, {t: 'Contratado', num: 1, v: function (o) { return o.vc; }, h: function (o) { return reais(o.vc); }}, {t: 'Desembolsado', num: 1, v: function (o) { return o.vd; }, h: function (o) { return reais(o.vd); }}, {t: 'UF', v: function (o) { return o.uf; }}, {t: 'Setor', v: function (o) { return o.setor; }}]}});
    var tod = {};
    function graf() {
      var f = med === 'v' ? function (o) { return o.vc; } : null, fmt = med === 'v' ? reais : null;
      function L(chave) { var n = soma(ops, chave), v = soma(ops, chave, function (o) { return o.vc; }); return Object.keys(n).map(function (k) { return {k: k, n: n[k], v: v[k] || 0}; }); }
      var lUf = L(function (o) { return o.uf; });
      pg.fg.querySelector('[data-bg]').innerHTML = '<div class="bloco largo" style="margin-top:0"><h4 class="olho">Por ano</h4>' + colunas(soma(ops, function (o) { return o.ano; }, f), fmt, 'data-gf0') + '</div><div class="grade-graf fin-graf">' +
        blocoG('Por instrumento financeiro', distVN(L(function (o) { return o.instr; }), med, 8, tod.i, 'data-gf1', 'i')) + blocoG('Por produto', distVN(L(function (o) { return o.prod; }), med, 0, false, 'data-gf2', 'p')) +
        blocoG('Por UF do cliente', distVN(lUf, med, 8, tod.u, 'data-gf3', 'u'), lUf.some(function (l) { return l.k === 'IE'; }) ? 'IE é um código do arquivo do BNDES que o dicionário de dados não define. Nos registros, aparece em operações sem município informado; parte delas descreve projetos em mais de um estado.' : '') + blocoG('Por setor (classificação do BNDES)', distVN(L(function (o) { return o.setor; }), med, 0, false, 'data-gf4', 's')) +
        '<div class="bloco fin-largo"><h4 class="olho">Maiores empresas por valor contratado</h4><div class="barras-h">' + topE.map(function (g) { var mx = topE[0].v; return (g.id ? '<a href="#/dna/' + encodeURIComponent(g.id) + '">' : '<div>') + '<span title="' + esc(g.nome) + '">' + esc(g.nome) + ' <small>' + br(g.n) + ' op.</small></span><i style="width:' + (g.v / mx * 100).toFixed(1) + '%"></i><b>' + reais(g.v) + '</b>' + (g.id ? '</a>' : '</div>'); }).join('') + '</div><p class="nota-base">Empresas do mesmo grupo (várias raízes de CNPJ) aparecem somadas, como na ficha do DNA da Inovação.</p></div></div>';
    }
    graf();
    pg.fg.parentNode.addEventListener('click', function (e) { var t = e.target.closest('button[data-vt]'); if (t) { var id = t.getAttribute('data-vt'); tod[id] = !tod[id]; graf(); return; } var m = e.target.closest('button[data-med]'); if (m) { med = m.getAttribute('data-med'); pg.fg.parentNode.querySelectorAll('button[data-med]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === m)); }); graf(); } });

  };
  ABAS.indiretas = function (A, el, x) {
    var I = x.F.BNDES_INDIRETAS, ano = {}, n = {}; (I.ano || []).forEach(function (a) { ano[a[0]] = a[2]; n[a[0]] = a[1]; });
    var med = 'v', anos = (I.ano || []).map(function (a) { return +a[0]; });
    var pg = pagina(el, {titulo: null, kpis: [['Operações', br(I.n), 'marcadas como inovação'], ['Valor', reais(I.valor), 'da operação, não é desembolso'], ['Período', anos.length ? Math.min.apply(null, anos) + '–' + Math.max.apply(null, anos) : '—']],
      aviso: '<strong>Esta aba mostra totais, não uma lista de operações.</strong> Os números vêm do arquivo público de operações indiretas automáticas do BNDES (' + esc(I.arquivo || '') + ', de ' + A.fdata(I.arquivo_data) + ', contratações até ' + A.fdata(I.corte) + '): dos ' + br(I.linhas) + ' registros, ' + br(I.n) + ' têm a marca de inovação. O arquivo não identifica o cliente (CPF/CNPJ mascarado), e o Atlas guarda só os agregados por ano, UF, setor, produto e instrumento. Para ver operações com a empresa identificada, use a aba <a href="#/agentes/bndes?aba=operacoes">Operações de inovação</a> (diretas).',
      sobre: '<p class="txt" style="margin-top:0">' + esc(I.criterio) + '</p>', nota: esc(I.fonte) + '. O valor é o da operação contratada, não o desembolso.',
      titGraf: 'Distribuição', cabGraf: '<div class="medida"><button type="button" data-imed="v" aria-pressed="true">Valor</button><button type="button" data-imed="n" aria-pressed="false">Nº de operações</button></div>', graficos: '<div data-ig></div>'});
    var tod = {};
    function desenha() {
      var k = med === 'v' ? 2 : 1, f = med === 'v' ? reais : null;
      function L(c) { return (I[c] || []).map(function (a) { return {k: a[0], n: a[1], v: a[2]}; }); }
      pg.fg.querySelector('[data-ig]').innerHTML = '<div class="bloco largo" style="margin-top:0"><h4 class="olho">Por ano</h4>' + colunas(med === 'v' ? ano : n, f) + '</div><div class="grade-graf fin-graf">' +
        [['Por programa ou instrumento', 'instrumento', 6, 'i'], ['Por UF do cliente', 'uf', 8, 'u'], ['Por setor', 'setor', 0, 's'], ['Por produto', 'produto', 0, 'p']].map(function (g) { return blocoG(g[0], distVN(L(g[1]), med, g[2], tod[g[3]], null, g[3])); }).join('') + '</div>';
      pg.fg.querySelectorAll('button[data-imed]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-imed') === med)); });
    }
    pg.fg.parentNode.addEventListener('click', function (e) { var t = e.target.closest('button[data-vt]'); if (t) { var id = t.getAttribute('data-vt'); tod[id] = !tod[id]; desenha(); return; } var b = e.target.closest('button[data-imed]'); if (b) { med = b.getAttribute('data-imed'); desenha(); } });
    desenha();
  };
  ABAS.funttel = function (A, el, x) {
    var F = x.F.FUNTTEL, ind = F.indicadores, P = F.projetos, vv = function (p) { return p.v; };
    var base = '<dl class="fin-dl">' + F.blocos.map(function (b) { return '<dt>' + esc(b.t) + '</dt><dd>' + esc(b.x) + '</dd>'; }).join('') + '</dl>';
    var tabInd = '<details class="fin-base"><summary>Indicadores do Funttel, ' + ind.anos[0] + '–' + ind.anos[ind.anos.length - 1] + '</summary><div class="fin-base-corpo tab-rola"><table class="tabela"><thead><tr><th>Indicador</th>' + ind.anos.map(function (a) { return '<th class="num">' + a + '</th>'; }).join('') + '</tr></thead><tbody>' + ind.linhas.map(function (l) { return '<tr><td>' + esc(l.n) + '</td>' + l.v.map(function (v) { return '<td class="num">' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table><p class="nota-base">' + esc(ind.nota) + '</p></div></details>';
    var nConv = P.filter(function (p) { return /^MCom/.test(p.ag); }).length;
    pagina(el, {aviso: 'Das ' + br(P.length) + ' operações, ' + br(nConv) + ' são convênios não reembolsáveis do MCom com a Finep, para ICTs; as outras ' + br(P.length - nConv) + ' são crédito. O Funttel é operado pela Finep e pelo BNDES.', titulo: 'Operações com recursos do Funttel', kpis: [['Operações', br(P.length)], ['Valor', reais(somaV(P, vv))], ['Beneficiárias', br(distintos(P, function (p) { return p.b; }))], ['Período', faixaAnos(P, function (p) { return p.a; })]],
      sobre: base, nota: esc(F.nota_projetos || ''), depois: tabInd,
      graficos: gradeG([blocoG('Valor por ano', colunas(soma(P, function (p) { return p.a; }, vv), reais, 'data-gf1')), blocoG('Valor por agente', barras(top(soma(P, function (p) { return p.ag; }, vv), 8), reais, 'data-gf0')), blocoG('Maiores beneficiárias', barras(top(soma(P, function (p) { return p.b; }, vv), 8), reais))]),
      cfg: {rows: P, rot: 'operações', ph: 'Beneficiária ou título', ord: 3, soma: vv, busca: function (p) { return [p.b, p.t, p.s].join(' '); },
        filtros: [{t: 'Agente', v: function (p) { return p.ag; }}, {t: 'Ano', v: function (p) { return p.a; }, ordem: 'num'}],
        cols: [{t: 'Beneficiária', v: function (p) { return p.b; }, h: function (p) { return linkEmp(p.b); }}, {t: 'Operação', v: function (p) { return p.t; }, h: function (p) { return esc(p.t) + (p.s ? '<br><small>' + esc(p.s) + '</small>' : ''); }}, {t: 'Agente', v: function (p) { return p.ag; }}, {t: 'Ano', num: 1, v: function (p) { return +p.a || 0; }, h: function (p) { return esc(p.a); }}, {t: 'Valor', num: 1, v: function (p) { return +p.v || 0; }, h: function (p) { return reais(p.v); }}]}});
  };
  /* --- MCTI --- */
  ABAS.fndct = function (A, el, x) {
    var r = linhas(x.TB.FNDCT_PROJETOS_COLS, x.TB.FNDCT_PROJETOS || []), m = x.F.FNDCT_META || {}, V = function (f) { return function (p) { return p[f]; }; }, vc = V('valorcontr');
    pagina(el, {titulo: 'Maiores projetos', kpis: [['Projetos (base completa)', br(m.total_rows)], ['Valor contratado', reais(m.sum_contr)], ['Valor pago', reais(m.sum_pago)], ['Na tabela', br(m.embedded), 'os maiores, ' + br(m.embedded_sum_contr / m.sum_contr * 100, 0) + '% do valor']],
      sobre: '<p class="txt" style="margin-top:0">A Finep e o CNPq operam os recursos do FNDCT. A tabela traz os maiores projetos contratados, com a agência operadora de cada um.</p><p class="txt">Os ' + br(m.embedded) + ' maiores projetos somam ' + reais(m.embedded_sum_contr) + ', cerca de ' + br(m.embedded_sum_contr / m.sum_contr * 100, 0) + '% do valor contratado, embora sejam ' + br(m.embedded / m.total_rows * 100, 1) + '% dos projetos.</p>',
      nota: 'Base completa: ' + br(m.total_rows) + ' projetos, ' + reais(m.sum_contr) + ' contratados, corte de ' + A.fdata(m.corte) + '. Gerada em ' + A.fdata(m.gerado) + '.',
      graficos: gradeG([blocoG('Valor por fundo (8 maiores da base completa)', barras((x.F.FNDCT_STATS || []).map(function (k) { return [k.fundo, k.total, k.fundo, nProj(k.n)]; }), reais)), blocoG('Valor por ano (maiores projetos)', colunas(soma(r, V('ano'), vc), reais)), blocoG('Valor por agência operadora (5.000 maiores projetos)', barras(top(soma(r, V('agencia'), vc), 4), reais, 'data-gf0')), blocoG('Valor por UF (5.000 maiores projetos)', barras(top(soma(r, V('uf'), vc), 10), reais, 'data-gf3'))]),
      cfg: {rows: r, rot: 'projetos', ph: 'Título ou município', ord: 6, soma: vc, busca: function (p) { return [p.nome, p.mun].join(' '); },
        filtros: [{t: 'Agência operadora', v: V('agencia')}, {t: 'Fundo', v: V('fundo')}, {t: 'Tipo de demanda', v: V('tipodemanda')}, {t: 'UF', v: V('uf'), ordem: 'alfa'}],
        cols: [{t: 'Projeto', v: V('nome')}, {t: 'Agência', v: V('agencia')}, {t: 'Fundo', v: V('fundo')}, {t: 'UF', v: V('uf')}, {t: 'Município', v: V('mun')}, {t: 'Ano', num: 1, v: function (p) { return +p.ano || 0; }, h: function (p) { return esc(p.ano); }}, {t: 'Contratado', num: 1, v: function (p) { return +p.valorcontr || 0; }, h: function (p) { return reais(p.valorcontr); }}, {t: 'Pago', num: 1, v: function (p) { return +p.valorpago || 0; }, h: function (p) { return reais(p.valorpago); }}]}});
  };
  ABAS.leidobem = function (A, el, x) {
    var r = linhas(x.TB.LEIDOBEM_EMPRESAS_COLS, x.TB.LEIDOBEM_EMPRESAS || []), st = {}, M = x.F.LEIDOBEM_META || {}, V = function (f) { return function (p) { return p[f]; }; }; (x.F.LEIDOBEM_STATS || []).forEach(function (k) { st[k.ano] = k.n; });
    pagina(el, {titulo: 'Empresas', kpis: [['Registros', br(r.length), 'empresa por ano-base'], ['Empresas (CNPJ)', br(distintos(r, V('cnpj')))], ['Anos-base', faixaAnos(r, V('ano'))], ['UFs', br(distintos(r, V('uf')))]],
      sobre: '<p class="txt" style="margin-top:0">Empresas que usaram os incentivos fiscais da Lei do Bem, por ano-base, na relação publicada pelo MCTI.</p>', nota: esc(M.fonte || 'MCTI, relação de empresas beneficiárias') + (M.gerado ? ', arquivo de ' + A.fdata(M.gerado) : '') + '.',
      graficos: gradeG([blocoG('Empresas por ano-base', colunas(st, null, 'data-gf0', true)), blocoG('Registros por UF', barras(top(soma(r, V('uf')), 10), null, 'data-gf1'))]),
      cfg: {rows: r, rot: 'registros', ph: 'Razão social ou CNPJ', ord: 0, desc: false, busca: function (p) { return [p.razao, p.cnpj].join(' '); },
        filtros: [{t: 'Ano-base', v: V('ano'), ordem: 'num'}, {t: 'UF', v: V('uf'), ordem: 'alfa'}],
        cols: [{t: 'Razão social', v: V('razao'), h: function (p) { return linkEmp(p.razao); }}, {t: 'CNPJ', v: V('cnpj')}, {t: 'UF', v: V('uf')}, {t: 'Ano-base', num: 1, v: function (p) { return +p.ano || 0; }, h: function (p) { return esc(p.ano); }}]}});
  };
  ABAS.leiinfo = function (A, el, x) {
    var r = linhas(x.TB.LEIINFO_EMPRESAS_COLS, x.TB.LEIINFO_EMPRESAS || []);
    pagina(el, {titulo: 'Empresas', kpis: [['Empresas habilitadas', br(r.length)]], sobre: '<p class="txt" style="margin-top:0">Empresas habilitadas aos benefícios da Lei de Informática (PPB, Processo Produtivo Básico).</p>', nota: 'Fonte: MCTI, Lista de Empresas Habilitadas.',
      cfg: {rows: r, rot: 'empresas', ph: 'Razão social ou nome fantasia', ord: 0, desc: false, busca: function (p) { return [p.razao, p.fantasia].join(' '); },
        cols: [{t: 'Razão social', v: function (p) { return p.razao; }, h: function (p) { return linkEmp(p.razao); }}, {t: 'Nome fantasia', v: function (p) { return p.fantasia; }}]}});
  };
  ABAS.reciclagem = function (A, el, x) {
    var r = linhas(x.TB.LEIRECICLAGEM_PROJETOS_COLS, x.TB.LEIRECICLAGEM_PROJETOS || []), m = x.TB.LEIRECICLAGEM_META || {}, V = function (f) { return function (p) { return p[f]; }; }, vv = V('valor');
    pagina(el, {titulo: 'Propostas em captação', kpis: [['Propostas', br(r.length)], ['Valor das propostas', reais(somaV(r, vv))], ['UFs', br(distintos(r, V('uf')))], ['Municípios', br(distintos(r, V('municipio')))]],
      sobre: '<p class="txt" style="margin-top:0">Propostas da Lei de Incentivo à Reciclagem que buscam apoiadores, com valor, objetivo e público-alvo.</p>', nota: esc(m.fonte || 'SINIR+, Lei de Incentivo à Reciclagem') + (m.atualizado ? ', atualizado em ' + esc(m.atualizado) : (m.gerado ? ', atualizado em ' + A.fdata(m.gerado) : '')) + '. ' + br(r.length) + ' propostas em captação.',
      graficos: gradeG([blocoG('Propostas por UF (todas as ' + distintos(r, V('uf')) + ')', barras(top(soma(r, V('uf')), 30), null, 'data-gf0')), blocoG('Valor por UF (todas as ' + distintos(r, V('uf')) + ')', barras(top(soma(r, V('uf'), vv), 30), reais, 'data-gf0'))]),
      cfg: {rows: r, rot: 'propostas', ph: 'Solicitante, município, objetivo ou público-alvo', ord: 0, desc: false, soma: vv, busca: function (p) { return [p.proponente, p.municipio, p.uf, p.objeto, p.publico].join(' '); },
        filtros: [{t: 'UF', v: V('uf'), ordem: 'alfa'}],
        cols: [{t: 'Solicitante', v: V('proponente')}, {t: 'UF', v: V('uf')}, {t: 'Município', v: V('municipio')}, {t: 'Valor', num: 1, v: function (p) { return +p.valor || 0; }, h: function (p) { return reais(p.valor); }}, {t: 'Objetivo', v: V('objeto'), h: function (p) { return '<div class="fin-celdesc">' + detalhe(p.objeto, 150) + '</div>'; }}, {t: 'Público-alvo', v: V('publico'), h: function (p) { return '<div class="fin-celdesc">' + detalhe(p.publico, 110) + '</div>'; }}, {t: 'Proposta', v: V('link'), h: function (p) { return p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">ver ↗</a>' : ''; }}]}});
  };
  ABAS.pi = function (A, el, x) {
    var P = x.F.PI_TOTAIS || {}, T = P.totais || {};
    el.innerHTML = '<div class="bloco"><p class="txt" style="margin-top:0">O INPI registra patentes, desenhos industriais, programas de computador e contratos de transferência de tecnologia. O painel completo, com séries, UFs e maiores depositantes, está em Propriedade intelectual.</p>' +
      (T.patentes ? kpis([['Patentes', br(T.patentes), 'pedidos distintos'], ['Desenhos industriais', br(T.desenhos_industriais), 'registros'], ['Programas de computador', br(T.programas_de_computador), 'registros'], ['Contratos de tecnologia', br(T.contratos_transferencia_tecnologia), 'processos']]) + '<p class="nota-base">INPI, bases abertas' + (P.gerado ? ', gerado em ' + A.fdata(P.gerado) : '') + '. Totais de processos distintos em cada base completa do INPI.</p>' : '') +
      '<a class="btn-azul peq" style="margin-top:14px" href="#/pi">Abrir o painel de PI</a></div>';
  };

  /* --- Análise: KPIs e gráficos do que cada financiador mais apoia --- */
  ABAS.analise = function (A, el, x) {
    var s = x.sub, TB = x.TB, g = [], k = [], V = function (f) { return function (p) { return p[f]; }; };
    function bloco(t, fn) { return blocoG(t, seguro(fn)); }
    if (s === 'embrapii') {
      var r = linhasEmbrapii(x), M = x.F.EMBRAPII_METRICAS, ordV = function (l) { return l.map(function (a) { return [a.t, a.v || 0]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10); };
      k = [['Projetos', br(r.length)], ['Valor contratado', reais(M.meta.v), 'a preços de IPCA ' + M.meta.ipca], ['Empresas', br(M.meta.emp)], ['Unidades com projeto', br(M.meta.un_com_projeto)]];
      g = [bloco('Projetos por ano de contrato', function () { return colunas(soma(r, V('ano'))); }), bloco('Projetos por situação', function () { return barras(top(soma(r, V('_st')), 6)); }),
        bloco('Áreas de aplicação, por valor (10 maiores)', function () { return barras(ordV(M.areas || []), reais); }), bloco('Tecnologias habilitadoras, por valor (10 maiores)', function () { return barras(ordV(M.tecs || []), reais); }),
        bloco('Unidades com mais projetos', function () { return barras(top(soma(r, V('unidade')), 10)); }), bloco('Empresas com mais projetos', function () { return barras(top(soma(r, V('_emps')), 10)); })];
    } else if (s === 'finep') {
      var f = linhas(TB.FINEP_PROJETOS_COLS, TB.FINEP_PROJETOS || []), vf = V('valor');
      k = [['Projetos', br(f.length)], ['Valor contratado', reais(somaV(f, vf))], ['Modalidades', br(distintos(f, V('instr')))], ['Proponentes', br(distintos(f, V('proponente')))]];
      g = [bloco('Valor contratado por ano', function () { return colunas(soma(f, function (p) { return anoDe(p.data); }, vf), reais); }), bloco('Por modalidade (valor)', function () { return barras(top(soma(f, V('instr'), vf), 8), reais); }),
        bloco('Por UF (valor)', function () { return barras(top(soma(f, V('uf'), vf), 12), reais); }), bloco('Programas e demandas (valor)', function () { return barras(top(soma(f, V('demanda'), vf), 12), reais); }),
        bloco('Proponentes com maior valor', function () { return barras(top(soma(f, V('proponente'), vf), 12), reais); }), bloco('Projetos por situação', function () { return barras(top(soma(f, V('status')), 8)); })];
    } else if (s === 'anp') {
      var a = linhas(TB.ANP_PROJETOS_COLS, TB.ANP_PROJETOS || []), va = V('valor');
      k = [['Projetos', br(a.length)], ['Valor dos projetos', reais(somaV(a, va))], ['Empresas', br(distintos(a, V('empresa')))], ['Instituições executoras', br(distintos(a, V('instituicao')))]];
      g = [bloco('Valor dos projetos por ano', function () { return colunas(soma(a, function (p) { return anoDe(p.data); }, va), reais); }), bloco('Temas (valor)', function () { return barras(top(soma(a, V('tema'), va), 10), reais); }),
        bloco('Instituições executoras com mais projetos', function () { return barras(top(soma(a, V('instituicao')), 12)); }), bloco('Empresas (valor)', function () { return barras(top(soma(a, V('empresa'), va), 10), reais); }),
        bloco('Áreas (valor)', function () { return barras(top(soma(a, V('area'), va), 8), reais); }), bloco('Qualificação dos projetos', function () { return barras(top(soma(a, V('qualif')), 6)); })];
    } else if (s === 'aneel') {
      var n = linhas(TB.ANEEL_PROJETOS_COLS, TB.ANEEL_PROJETOS || []), vn = V('valorprev');
      k = [['Projetos', br(n.length)], ['Custo previsto', reais(somaV(n, vn))], ['Empresas', br(distintos(n, V('empresa')))], ['Temas', br(distintos(n, V('tema')))]];
      g = [bloco('Custo previsto por ano', function () { return colunas(soma(n, V('ano'), vn), reais); }), bloco('Por segmento (custo previsto)', function () { return barras(top(soma(n, V('segmento'), vn), 6), reais); }),
        bloco('Por tema (custo previsto)', function () { return barras(top(soma(n, V('tema'), vn), 10), reais); }), bloco('Empresas com maior custo previsto', function () { return barras(top(soma(n, V('empresa'), vn), 12), reais); }), bloco('Projetos por situação', function () { return barras(top(soma(n, V('status')), 8)); })];
    } else if (s === 'antt') {
      var t = linhas(TB.ANTT_PROJETOS_COLS, TB.ANTT_PROJETOS || []), vt = V('valor');
      k = [['Projetos', br(t.length)], ['Valor', reais(somaV(t, vt))], ['Concessionárias', br(distintos(t, V('concessionaria')))], ['Temas', br(distintos(t, V('tema')))]];
      g = [bloco('Valor por ano de início', function () { return colunas(soma(t, V('inicio'), vt), reais); }), bloco('Temas (valor)', function () { return barras(top(soma(t, V('tema'), vt), 10), reais); }),
        bloco('Concessionárias (valor)', function () { return barras(top(soma(t, V('concessionaria'), vt), 12), reais); }), bloco('Situação', function () { return barras(top(soma(t, V('situacao')), 6)); })];
    } else if (s === 'mcti') {
      var fd = linhas(TB.FNDCT_PROJETOS_COLS, TB.FNDCT_PROJETOS || []), lb = linhas(TB.LEIDOBEM_EMPRESAS_COLS, TB.LEIDOBEM_EMPRESAS || []), fm = x.F.FNDCT_META || {}, vc = V('valorcontr');
      k = [['Projetos do FNDCT', br(fm.total_rows), 'base completa'], ['Valor contratado', reais(fm.sum_contr)], ['Registros da Lei do Bem', br(lb.length)], ['Empresas na Lei de Informática', br((TB.LEIINFO_EMPRESAS || []).length)]];
      g = [bloco('FNDCT: valor contratado por ano (5 mil maiores)', function () { return colunas(soma(fd, V('ano'), vc), reais); }), bloco('FNDCT: por fundo (8 maiores da base completa)', function () { return barras((x.F.FNDCT_STATS || []).map(function (q) { return [q.fundo, q.total, q.fundo, nProj(q.n)]; }), reais); }),
        bloco('FNDCT: por UF (valor, 5.000 maiores projetos)', function () { return barras(top(soma(fd, V('uf'), vc), 12), reais); }), bloco('Lei do Bem: registros por UF', function () { return barras(top(soma(lb, V('uf')), 12)); })];
    } else if (s === 'bndes') {
      var B = x.F.BNDES_INOVACAO, ops = []; B.e.forEach(function (e) { (e[9] || []).forEach(function (o) { ops.push({ano: o[0], vc: o[3] || 0, uf: o[6], setor: B.S[o[7]], prod: B.P[o[1]]}); }); });
      k = [['Operações', br(ops.length)], ['Valor contratado', reais(somaV(ops, function (o) { return o.vc; }))], ['Empresas', br(B.e.length), 'raízes de CNPJ'], ['Operações indiretas', br((x.F.BNDES_INDIRETAS || {}).n || 0), 'só agregados']];
      g = [bloco('Valor contratado por ano', function () { return colunas(soma(ops, function (o) { return o.ano; }, function (o) { return o.vc; }), reais); }), bloco('Por setor', function () { return barras(top(soma(ops, function (o) { return o.setor; }, function (o) { return o.vc; }), 6), reais); }),
        bloco('Por UF', function () { return barras(top(soma(ops, function (o) { return o.uf; }, function (o) { return o.vc; }), 12), reais); }), bloco('Por produto', function () { return barras(top(soma(ops, function (o) { return o.prod; }, function (o) { return o.vc; }), 8), reais); })];
    }
    if (!g.length) { el.innerHTML = '<p class="txt">Sem dados para análise.</p>'; return; }
    pagina(el, {kpis: k, nota: 'Gráficos calculados sobre as mesmas bases das outras abas.', graficos: gradeG(g), titGraf: 'Gráficos'});
  };
})();
