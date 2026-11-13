/* Atlas da Inovação · protótipo v2 — comportamento das telas (Hub, Radar, Ficha, Mapa de ICTs, Por estado). */
(function () {
  'use strict';
  var D = window.ATLAS2, root = document.documentElement;
  var MOVER = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.classList.add('anim');
  var HOJE = new Date(D.hoje + 'T12:00:00');
  var UFS = Object.keys(D.ufGeo).sort();

  /* ================= Utilidades ================= */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function br(n, casas) { return Number(n).toLocaleString('pt-BR', {minimumFractionDigits: casas || 0, maximumFractionDigits: casas || 0}); }
  function limita(x) { return Math.max(0, Math.min(1, x)); }
  function largo() { return window.innerWidth >= 1100; }
  function $(id) { return document.getElementById(id); }
  function data(s) { return s ? new Date(s + 'T12:00:00') : null; }
  function dias(s) { var d = data(s); return d ? Math.round((d - HOJE) / 864e5) : null; }
  function fdata(s) { if (!s) return ''; var p = s.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function sem(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function corta(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s; }
  var DOM = {}; D.dominios.forEach(function (d) { DOM[d.id] = d.label; });
  function dom(id) { return DOM[id] || id; }
  function mi(v) { return v >= 1000 ? 'R$ ' + (v / 1000).toFixed(1).replace('.', ',') + ' bi' : v >= 1 ? 'R$ ' + Number(v).toLocaleString('pt-BR', {maximumFractionDigits: 3}) + ' mi' : 'R$ ' + br(v * 1000) + ' mil'; }
  function valorCurto(c) { return c.valorTotal ? mi(c.valorTotal) : null; }
  function novo(c) { var d = dias(c.abertura); return d !== null && d <= 0 && d >= -15 && c.status === 'aberta'; }
  function estado(c) {
    if (c.status === 'encerrada') return {cls: '', rot: 'Encerrada', k: 'enc'};
    if (c.status === 'em-breve') return {cls: 'breve', rot: c.abertura ? 'Abre em ' + fdata(c.abertura).slice(0, 5) : 'Em breve', k: 'breve'};
    var d = dias(c.encerramento);
    if (d === null) return {cls: 'cont', rot: 'Fluxo contínuo', k: 'ab'};
    if (d <= 15) return {cls: 'urg', rot: d <= 0 ? 'Fecha hoje' : 'Fecha em ' + d + ' dia' + (d > 1 ? 's' : ''), k: 'urg'};
    return {cls: 'ab', rot: 'Aberta até ' + fdata(c.encerramento).slice(0, 5), k: 'ab'};
  }
  var ABERTAS = D.chamadas.filter(function (c) { return c.status === 'aberta'; });
  /* Arquivo de calendário (.ics) de uma ou mais datas */
  function txtIcs(s) { return String(s || '').replace(/[\\;,]/g, function (c) { return '\\' + c; }).replace(/\r?\n/g, ' '); }
  function baixaIcs(lista, nome) {
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Atlas da Inovacao//Chamada//PT', 'CALSCALE:GREGORIAN'];
    lista.forEach(function (x) {
      var d2 = new Date(x.d + 'T12:00:00'); d2.setDate(d2.getDate() + 1);
      L.push('BEGIN:VEVENT', 'UID:' + x.id + '@atlas-inovacao', 'DTSTAMP:' + D.hoje.replace(/-/g, '') + 'T000000Z', 'DTSTART;VALUE=DATE:' + x.d.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + d2.toISOString().slice(0, 10).replace(/-/g, ''), 'SUMMARY:' + txtIcs(x.t), 'DESCRIPTION:' + txtIcs(x.desc), x.url ? 'URL:' + x.url : '', 'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([L.filter(Boolean).join('\r\n')], {type: 'text/calendar'})); a.download = nome + '.ics'; document.body.appendChild(a); a.click(); a.remove();
  }
  function dataIcs(c) { if (c.status === 'encerrada') return ''; return c.status === 'em-breve' ? (c.abertura || c.encerramento || '') : (c.encerramento || ''); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ics-ch]'); if (!b) return;
    e.preventDefault(); var c = D.chamadas.filter(function (k) { return k.id === b.getAttribute('data-ics-ch'); })[0]; if (!c || !dataIcs(c)) return;
    baixaIcs([{id: c.id, d: dataIcs(c), t: (c.status === 'em-breve' ? 'Abertura: ' : 'Prazo: ') + c.titulo, desc: (c.agenciaNome || '') + (c.link ? ' · ' + c.link : ''), url: c.link}], 'atlas-' + c.id.slice(0, 40));
  });
  /* As datas escritas nas páginas seguem a data do bundle de dados */
  (function () {
    var alvo = fdata(D.geradoEm), w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n, l = [];
    while ((n = w.nextNode())) if (n.nodeValue.indexOf('13/11/2026') >= 0 && !/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) l.push(n);
    l.forEach(function (n) { n.nodeValue = n.nodeValue.replace(/13\/11\/2026/g, alvo); });
  })();
  /* Natureza do recurso (regra do Atlas de 13/11/2026): a empresa devolve o dinheiro? */
  var NAT = {
    'nao-reembolsavel': ['Não reembolsável', '#10b981', 'A empresa não devolve o recurso: subvenção, bolsa, cofinanciamento, prêmio ou P&D obrigatório.'],
    'reembolsavel': ['Reembolsável (crédito)', '#f59e0b', 'Financiamento: a empresa devolve o recurso, com juros e prazo.'],
    'misto': ['Misto (crédito e fomento)', '#8b5cf6', 'Programa com linhas reembolsáveis e não reembolsáveis.'],
    'fiscal': ['Incentivo fiscal', '#3b82f6', 'Redução, crédito ou suspensão de tributo. Não há repasse de dinheiro.'],
    'capital': ['Capital (participação)', '#ec4899', 'Investimento em troca de participação na empresa.'],
    'compra': ['Contrato (compra pública ou PoC paga)', '#14b8a6', 'O comprador paga pela solução ou pelo piloto.'],
    'sem-aporte': ['Sem aporte financeiro', '#94a3b8', 'Mentoria, aceleração ou conexão, sem dinheiro para a empresa.'],
    'marco': ['Marco legal ou serviço', '#94a3b8', 'Lei habilitadora ou serviço público, sem recurso direto.'],
    'empresa-paga': ['A empresa paga', '#64748b', 'Programa com taxa ou mensalidade.'],
    'a-confirmar': ['Aporte a confirmar', '#64748b', 'A fonte não deixa claro se há recurso.']
  };
  var NAT_ROT = {}; Object.keys(NAT).forEach(function (k) { NAT_ROT[k] = NAT[k][0]; });
  function natTag(n) { var x = NAT[n] || NAT['a-confirmar']; return '<span class="tag tag-nat" title="' + esc(x[2]) + '"><i style="background:' + x[1] + '"></i>' + esc(x[0]) + '</span>'; }
  function breve(c) { var d = dias(c.encerramento); return c.status === 'aberta' && d !== null && d <= 15; }
  var ICO = {
    pub: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="8" cy="5.5" r="2.5"/><path d="M3 14c.6-2.8 2.6-4 5-4s4.4 1.2 5 4"/></svg>',
    din: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="2" y="4" width="12" height="8" rx="1.5"/><circle cx="8" cy="8" r="1.8"/></svg>',
    geo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 9.8 8 14 8 14z"/><circle cx="8" cy="6.5" r="1.5"/></svg>',
    dom: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 2l5.5 3v6L8 14l-5.5-3V5z"/></svg>',
    est: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 1.8l1.9 4 4.3.5-3.2 3 .9 4.3L8 11.4l-3.9 2.2.9-4.3-3.2-3 4.3-.5z"/></svg>',
    doc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 1.5h5.5L13 5v9.5H4z"/><path d="M9.5 1.5V5H13"/></svg>'
  };
  function lerFavs() { try { return JSON.parse(localStorage.getItem('atlas-favs') || '[]'); } catch (e) { return []; } }
  var FAVS = lerFavs();
  function favorito(id) { return FAVS.indexOf(id) >= 0; }
  function alternaFav(id) { var i = FAVS.indexOf(id); if (i >= 0) FAVS.splice(i, 1); else FAVS.push(id); try { localStorage.setItem('atlas-favs', JSON.stringify(FAVS)); } catch (e) {} return i < 0; }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.estrela, .btn-fav'); if (!b) return;
    e.preventDefault(); var on = alternaFav(b.getAttribute('data-id'));
    b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    var t = b.querySelector('.rot-fav'); if (t) t.textContent = on ? 'Favorito ✓' : 'Favorito';
  });

  $('m-abertas').textContent = ABERTAS.length + ' abertas';
  if (D.novidades && $('m-novs')) $('m-novs').textContent = (D.novidades.itens || []).length + ' no mês';
  $('m-instr').textContent = D.instrumentos.length;
  $('m-icts').textContent = D.icts.length;

  /* ================= Tema ================= */
  var aoTrocarTema = [];
  function marcarTema() {
    var t = root.getAttribute('data-tema');
    document.querySelectorAll('[data-tema-opt]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tema-opt') === t)); });
  }
  document.querySelectorAll('[data-tema-opt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-tema-opt');
      root.setAttribute('data-tema', t);
      try { localStorage.setItem('atlas-tema', t); } catch (e) {}
      marcarTema();
      campos.forEach(function (c) { c.cor(); c.desenha(performance.now()); });
      aoTrocarTema.forEach(function (f) { f(); });
    });
  });
  marcarTema();

  /* ================= Menu lateral ================= */
  var btnAbrir = $('btn-abrir'), aoMudarMenu = [];
  function menu(aberto, guardar) {
    root.classList.toggle('menu-aberto', aberto);
    btnAbrir.setAttribute('aria-expanded', String(aberto));
    if (guardar && largo()) { try { localStorage.setItem('atlas-menu', aberto ? 'aberto' : 'oculto'); } catch (e) {} }
    setTimeout(function () { campos.forEach(function (c) { c.ajusta(); c.desenha(performance.now()); }); aoRolar(); aoMudarMenu.forEach(function (f) { f(); }); }, 420);
  }
  btnAbrir.addEventListener('click', function () { menu(true, true); });
  $('btn-ocultar').addEventListener('click', function () { menu(false, true); });
  $('veu').addEventListener('click', function () { menu(false, false); });
  document.querySelectorAll('.lat-nav a, .lat-base a').forEach(function (a) { a.addEventListener('click', function () { if (!largo()) menu(false, false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !largo() && root.classList.contains('menu-aberto')) menu(false, false); });
  btnAbrir.setAttribute('aria-expanded', String(root.classList.contains('menu-aberto')));

  /* ================= Campo de partículas (do protótipo anterior) ================= */
  function Campo(canvas, semente, opcoes) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.pts = []; this.ativo = false; this.o = opcoes || {};
    var s = semente;
    function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    var self = this, i, j, n;
    function add(x, y, z, peso) { self.pts.push([x, y, z, rnd() * 6.28, peso, rnd() < 0.16 ? 1 : 0]); }
    for (i = 0; i < 16; i++) {
      var x = rnd() * 2.4 - 1.2, z = rnd() * 2 - 1, y0 = -1 + rnd() * 0.6, y1 = y0 + 0.5 + rnd() * 1.1;
      n = 26 + Math.floor(rnd() * 34);
      for (j = 0; j < n; j++) add(x + (rnd() - 0.5) * 0.02, y0 + (y1 - y0) * rnd(), z + (rnd() - 0.5) * 0.02, 0.6 + rnd());
    }
    for (i = 0; i < 6; i++) {
      var a = [rnd() * 2.6 - 1.3, rnd() * 1.2 - 1, rnd() * 2 - 1], b = [rnd() * 2.6 - 1.3, rnd() * 1.2 - 0.6, rnd() * 2 - 1];
      n = 80 + Math.floor(rnd() * 40);
      for (j = 0; j < n; j++) { var t = rnd(); add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 0.6 + rnd()); }
    }
    for (i = 0; i < 7; i++) {
      var c = [rnd() * 2.4 - 1.0, rnd() * 1.6 - 0.8, rnd() * 2 - 1];
      for (j = 0; j < 60; j++) { var r = Math.pow(rnd(), 1.6) * 0.35, ang = rnd() * 6.28, ph = rnd() * 3.14; add(c[0] + Math.cos(ang) * Math.sin(ph) * r, c[1] + Math.cos(ph) * r * 0.8, c[2] + Math.sin(ang) * Math.sin(ph) * r, 0.6 + rnd()); }
    }
    for (i = 0; i < 280; i++) add(rnd() * 3.2 - 1.6, rnd() * 2.2 - 1.1, rnd() * 2 - 1, 0.4 + rnd());
    this.cor(); this.ajusta();
  }
  Campo.prototype.cor = function () {
    var cs = getComputedStyle(root);
    if (this.o.marinho) { this.rgb = '234,241,250'; this.rgbAzul = '120,170,240'; this.alfaTema = 0.75; return; }
    this.rgb = cs.getPropertyValue('--particula').trim() || '226,234,244';
    this.rgbAzul = cs.getPropertyValue('--particula-azul').trim() || '96,165,250';
    this.alfaTema = parseFloat(cs.getPropertyValue('--particula-alfa')) || 1;
  };
  Campo.prototype.ajusta = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), r = this.cv.getBoundingClientRect();
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  Campo.prototype.desenha = function (t) {
    var ctx = this.ctx, w = this.w, h = this.h, cx = w * (this.o.cx || 0.6), cy = h * (this.o.cy || 0.42), e = Math.max(w, h) * 0.55;
    var ang = t * 0.00004 + Math.sin(t * 0.00011) * 0.25, ca = Math.cos(ang), sa = Math.sin(ang), ci = Math.cos(0.18), si = Math.sin(0.18);
    ctx.clearRect(0, 0, w, h);
    for (var passe = 0; passe < 2; passe++) {
      ctx.fillStyle = 'rgb(' + (passe ? this.rgbAzul : this.rgb) + ')';
      for (var i = 0; i < this.pts.length; i++) {
        var p = this.pts[i]; if (p[5] !== passe) continue;
        var x = p[0] * ca - p[2] * sa, z = p[0] * sa + p[2] * ca, y = p[1] * ci - z * si; z = p[1] * si + z * ci;
        var f = 2.6 / (z + 3.2), px = cx + x * e * f, py = cy + y * e * f;
        if (px < -4 || px > w + 4 || py < -4 || py > h + 4) continue;
        var tw = 0.55 + 0.45 * Math.sin(t * 0.0012 * p[4] + p[3]), prox = 1 - (z + 1) / 2;
        ctx.globalAlpha = Math.max(0.06, Math.min(0.95, (0.32 + 0.65 * prox) * tw * (this.o.alfa || 1) * this.alfaTema));
        var sz = (1 + prox * 1.4) * p[4] * (passe ? 1.25 : 1);
        ctx.fillRect(px, py, sz, sz);
      }
    }
    ctx.globalAlpha = 1;
  };
  var campos = [];
  document.querySelectorAll('canvas[data-campo]').forEach(function (cv, k) {
    var tipo = cv.getAttribute('data-campo');
    var op = tipo === 'numeros' ? {cx: 0.5, cy: 0.55, alfa: 0.8} : (tipo === 'radar' || tipo === 'estados') ? {cx: 0.3, cy: 0.5, alfa: 0.7, marinho: true} : {cx: 0.62, cy: 0.4};
    var c = new Campo(cv, 7 + k * 101, op);
    campos.push(c);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (en) { c.ativo = en.isIntersecting; }); }).observe(cv);
    else c.ativo = true;
    c.desenha(0);
  });
  window.addEventListener('resize', function () { campos.forEach(function (c) { c.ajusta(); c.desenha(performance.now()); }); });
  if (MOVER) (function laco(t) { campos.forEach(function (c) { if (c.ativo && c.w > 1) c.desenha(t); }); requestAnimationFrame(laco); })(0);

  /* ================= Título que se monta letra a letra ================= */
  var GLIFOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';
  function embaralhar(h1) {
    var linhas = h1.querySelectorAll('.l');
    linhas.forEach(function (l) { if (!l.dataset.final) l.dataset.final = l.textContent; });
    if (!MOVER) { linhas.forEach(function (l) { l.textContent = l.dataset.final; }); return; }
    var inicio = performance.now(), atraso = 0, plano = [];
    linhas.forEach(function (l) { var f = l.dataset.final; plano.push({el: l, f: f, t0: atraso}); atraso += f.length * 28 + 120; });
    (function passo(agora) {
      var dt = agora - inicio, fim = true;
      plano.forEach(function (p) {
        var s = '';
        for (var i = 0; i < p.f.length; i++) {
          var ch = p.f[i], ti = p.t0 + i * 28 + 260;
          if (ch === ' ' || dt >= ti) s += ch;
          else { fim = false; s += dt < p.t0 ? ' ' : GLIFOS[Math.floor(Math.random() * GLIFOS.length)]; }
        }
        p.el.textContent = s;
      });
      if (!fim) requestAnimationFrame(passo);
    })(inicio);
  }

  /* ================= Efeitos de rolagem (só no Hub) ================= */
  var giros = [], blurs = [];
  function coletar() {
    giros = [].slice.call(document.querySelectorAll('[data-view]:not([hidden]) [data-girar]'));
    blurs = [].slice.call(document.querySelectorAll('[data-view]:not([hidden]) [data-blur]'));
  }
  function aoRolar() {
    if (!MOVER) return;
    var vh = window.innerHeight;
    giros.forEach(function (el, i) {
      var r = el.getBoundingClientRect(), p = limita((vh - r.top) / (vh * 0.75)), q = 1 - p, s = i % 2 ? -1 : 1;
      el.style.transform = 'translate3d(0,' + (q * 140).toFixed(1) + 'px,0) rotateX(' + (q * 36).toFixed(2) + 'deg) rotateY(' + (q * -24 * s).toFixed(2) + 'deg) rotateZ(' + (q * 10 * s).toFixed(2) + 'deg)';
      el.style.opacity = (0.15 + 0.85 * p).toFixed(3);
    });
    blurs.forEach(function (el) {
      var r = el.getBoundingClientRect(), p = limita((vh - r.top) / (vh * 0.55));
      el.style.filter = 'blur(' + ((1 - p) * 10).toFixed(2) + 'px)';
      el.style.opacity = (0.2 + 0.8 * p).toFixed(3);
    });
  }
  var pedido = false;
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(function () { pedido = false; aoRolar(); }); } }, {passive: true});
  window.addEventListener('resize', aoRolar);

  function contar(el) {
    var alvo = parseFloat(el.getAttribute('data-contar')), casas = parseInt(el.getAttribute('data-casas') || '0', 10);
    if (!MOVER) { el.textContent = br(alvo, casas); return; }
    var t0 = performance.now(), dur = 1400;
    (function passo(t) { var p = limita((t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = br(alvo * e, casas); if (p < 1) requestAnimationFrame(passo); })(t0);
  }
  var obs = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; obs.unobserve(el);
      if (el.hasAttribute('data-contar')) contar(el);
      if (el.classList.contains('op')) el.classList.remove('entra');
      if (el.classList.contains('tl')) el.classList.add('visto');
    });
  }, {threshold: 0.15}) : null;
  function observar(seletor, base) {
    (base || document).querySelectorAll(seletor).forEach(function (el) {
      if (obs) obs.observe(el); else { el.classList.remove('entra'); el.classList.add('visto'); }
    });
  }

  /* ================= Mapa do Brasil (SVG da malha do IBGE) ================= */
  function svgBrasil(classe, rotulos) {
    var s = '<svg viewBox="0 0 1000 ' + D.alturaMapa + '" role="img" aria-label="Mapa do Brasil por estado">';
    UFS.forEach(function (uf) { s += '<path class="uf ' + (classe || '') + '" data-uf="' + uf + '" d="' + D.ufGeo[uf].d + '"><title>' + esc(D.ufNomes[uf]) + '</title></path>'; });
    if (rotulos) UFS.forEach(function (uf) { var c = D.ufGeo[uf].c; s += '<text class="rot" data-rot="' + uf + '" x="' + c[0] + '" y="' + c[1] + '">' + uf + '</text>'; });
    return s + '</svg>';
  }
  function mistura(a, b, t) {
    var pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
    var pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
    return 'rgb(' + pa.map(function (v, i) { return Math.round(v + (pb[i] - v) * t); }).join(',') + ')';
  }

  /* ================= Cartão de oportunidade ================= */
  function cartaoChamada(c) {
    var st = estado(c), v = valorCurto(c), fav = favorito(c.id);
    var onde = c.abrangencia === 'nacional' ? 'Nacional' : c.abrangencia === 'estadual' ? (D.ufNomes[c.uf] || c.regiao || 'Estadual') : (c.regiao || 'Regional');
    var doms = (c.dominios || []).slice(0, 3).map(function (d) { return '<span class="tag">' + ICO.dom + esc(dom(d)) + '</span>'; }).join('');
    if ((c.dominios || []).length > 3) doms += '<span class="tag mais">+' + (c.dominios.length - 3) + '</span>';
    var fonte = c.link || c.edital, insC = c.instrumento ? D.instrumentos.filter(function (i) { return i.id === c.instrumento; })[0] : null;
    return '<article class="op entra" id="op-' + esc(c.id) + '">' +
      '<div class="op-topo"><div><h3><a href="#/radar/' + encodeURIComponent(c.id) + '">' + esc(c.titulo) + '</a></h3><p class="op-inst">' + esc(c.agenciaNome || '') + (c.categoria ? ' · ' + esc(c.categoria) : '') + '</p></div>' +
      '<button type="button" class="estrela" data-id="' + esc(c.id) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '">' + ICO.est + '</button></div>' +
      (c.resumo ? '<p class="op-resumo">' + esc(c.resumo) + '</p>' : '') +
      '<div class="op-linhas">' +
        '<div class="op-linha"><span>Recurso</span><div class="tags">' + natTag(c.nat) + '</div></div>' +
        (c.publico ? '<div class="op-linha"><span>Para quem</span><div class="op-pub">' + esc(c.publico) + '</div></div>' : '') +
        '<div class="op-linha"><span>Onde vale</span><div class="tags"><span class="tag">' + ICO.geo + esc(onde) + '</span></div></div>' +
        (doms ? '<div class="op-linha"><span>Domínios</span><div class="tags">' + doms + '</div></div>' : '') +
        '<div class="op-linha"><span>Valor</span><div class="op-valor">' + (v ? esc(v) : '<span style="font-family:var(--f-sans);font-size:13px;color:var(--ink-3)">Ver no edital</span>') + '</div></div>' +
      '</div>' +
      '<div class="op-base"><span class="status ' + st.cls + '">' + esc(st.rot) + '</span>' +
      '<span class="fonte">' + (c.encerramento ? 'Prazo ' + fdata(c.encerramento) : '') + (insC ? (c.encerramento ? ' · ' : '') + '<a class="op-ins" href="#/instrumentos/' + encodeURIComponent(insC.id) + '">Instrumento: ' + esc(insC.sigla || insC.nome) + '</a>' : '') + (fonte ? ((c.encerramento || insC) ? ' · ' : '') + '<a href="' + esc(fonte) + '" target="_blank" rel="noopener">fonte oficial ↗</a>' : '') + '</span>' +
      '</div></article>';
  }

  /* ================= HUB ================= */
  function montaHub() {
    var volume = ABERTAS.reduce(function (s, c) { return s + (c.valorTotal || 0); }, 0);
    if (window.AV2_novidadesHub) window.AV2_novidadesHub(A, $('hub-nov'));
    $('hub-selo').textContent = 'Dados de ' + fdata(D.geradoEm) + ' · ' + ABERTAS.length + ' chamadas abertas';
    montaDestaque(); montaDominios();
    var novas = ABERTAS.filter(function (c) { return c.abertura; }).sort(function (a, b) { return a.abertura < b.abertura ? 1 : -1; }).slice(0, 4);
    var icos = [ICO.doc, ICO.din, ICO.dom, ICO.geo];
    $('hub-novas').innerHTML = novas.map(function (c, i) {
      return '<article class="cartao" data-girar><span class="cartao-ico">' + icos[i] + '</span><p class="cartao-data">Abriu em ' + fdata(c.abertura) + ' · ' + esc(c.agenciaNome) + '</p><h3>' + esc(c.titulo) + '</h3><p class="cartao-fatos"><b>' + esc(c.valorTotal ? mi(c.valorTotal) : 'Valor no edital') + '</b><span>' + esc(c.encerramento ? 'Prazo ' + fdata(c.encerramento) : 'Fluxo contínuo') + '</span></p><a class="btn-txt" style="margin-top:16px;align-self:flex-start" href="#/radar/' + encodeURIComponent(c.id) + '">Ver a ficha</a></article>';
    }).join('');
    var prox = ABERTAS.filter(breve).sort(function (a, b) { return a.encerramento < b.encerramento ? -1 : 1; });
    $('hub-n-prazo').textContent = prox.length === 1 ? 'Uma' : ['Nenhuma', 'Uma', 'Duas', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez'][prox.length] || String(prox.length);
    $('hub-prazos').innerHTML = prox.map(function (c) {
      var d = dias(c.encerramento);
      return '<li><a href="#/radar/' + encodeURIComponent(c.id) + '"><span class="p-dias">' + Math.max(d, 0) + '<small>DIAS</small></span><span class="p-tit">' + esc(c.titulo) + '<small>' + esc(c.agenciaNome) + ' · fecha ' + fdata(c.encerramento) + '</small></span><span class="p-meta"><b>' + (valorCurto(c) || '—') + '</b>' + esc(c.categoria || '') + '</span><span class="seta" aria-hidden="true">→</span></a></li>';
    }).join('');
    var vbi = volume / 1000;
    $('hub-numeros').innerHTML =
      '<div><span class="n-grande" data-contar="' + D.instrumentos.length + '">' + D.instrumentos.length + '</span><span class="n-rot">instrumentos mapeados</span></div>' +
      '<div><span class="n-grande" data-contar="' + ABERTAS.length + '">' + ABERTAS.length + '</span><span class="n-rot">chamadas abertas</span></div>' +
      '<div><span class="n-grande" data-contar="' + D.icts.length + '">' + D.icts.length + '</span><span class="n-rot">ICTs no mapa</span></div>' +
      '<div><span class="n-grande"><small>R$</small><span data-contar="' + vbi.toFixed(1) + '" data-casas="1">' + br(vbi, 1) + '</span><small>bi</small></span><span class="n-rot">em chamadas abertas</span></div>';
    $('hub-portas').innerHTML =
      '<a class="porta" href="#/estados"><div><p class="olho">Oportunidades</p><h3>Por estado</h3><p>Clique numa UF e veja as chamadas, instrumentos, leis e desafios que valem ali, somados aos nacionais.</p><span class="entrar">Abrir o mapa <span class="seta" aria-hidden="true">→</span></span></div>' + miniMapa('estados') + '</a>' +
      '<a class="porta" href="#/mapa"><div><p class="olho">Instituições</p><h3>Mapa de ICTs</h3><p>' + D.icts.length + ' universidades, institutos, INCTs, Unidades EMBRAPII e Institutos SENAI, com filtros por região, tipo e domínio.</p><p class="porta-reg" aria-label="ICTs por região">' + [['Norte', 'N'], ['Nordeste', 'NE'], ['Centro-Oeste', 'CO'], ['Sudeste', 'SE'], ['Sul', 'S']].map(function (r) { return '<span><b>' + br(D.icts.filter(function (t) { return t.regiao === r[0]; }).length) + '</b> ' + r[1] + '</span>'; }).join('') + '</p><span class="entrar">Abrir o mapa <span class="seta" aria-hidden="true">→</span></span></div>' + miniMapa('icts') + '</a>';
    var MOD = [
      ['27 UFs', 'Brasil por estado', 'Tudo o que vale em cada estado, num mapa clicável.', 'estados'],
      [ABERTAS.length + ' abertas', 'Chamadas e editais', 'O Radar: prazo, valor, público e o link da fonte oficial.', 'radar'],
      ['Programas e desafios', 'Inovação aberta', 'Prêmios, aceleração e desafios de inovação aberta de empresas.', 'ecossistema'],
      ['CPSI e encomendas', 'Compras públicas', 'O Estado como primeiro cliente: licitações especiais e CPSI.', 'compras'],
      [(D.internacional.programas || []).length + ' programas', 'Internacional', 'Programas de financiamento e incentivos fiscais de P&D em outros países.', 'internacional'],
      [D.instrumentos.length + ' fichas', 'Instrumentos', 'Leis, programas, crédito e incentivos, com quem pode, quanto e como acessar.', 'instrumentos'],
      [D.agencias.length + ' financiadores', 'Financiadores', 'FINEP, BNDES, EMBRAPII, CNPq, FAPs, ANEEL, ANP e os demais: o que operam e o que já apoiaram.', 'agentes'],
      [br(((window.ATLAS2_IDX || {}).dna || []).length) + ' empresas', 'DNA da Inovação (empresas)', 'O retrato de inovação de cada empresa a partir de bases públicas.', 'dna'],
      [D.icts.length + ' ICTs', 'Mapa e Diretório de ICTs', 'Instituições de pesquisa por região, tipo, domínio e credenciamento.', 'mapa'],
      [br((((window.ATLAS2_R3 || {}).pi || {}).totais_por_tipo || {}).patentes || 0) + ' patentes', 'Propriedade intelectual', 'Patentes, desenhos, programas de computador e contratos no INPI.', 'pi'],
      [(((window.ATLAS2_R3 || {}).sim || {}).perguntas || []).length + ' perguntas + IA', 'Simulador e Sapiens', 'Ranking de instrumentos por aderência e o agente de IA do Atlas.', 'simulador'],
      ['Guia, TRL e dicionário', 'Aprender', 'Do enquadramento à prestação de contas, maturidade tecnológica e 659 verbetes.', 'guia']
    ];
    $('modulos').innerHTML = MOD.map(function (m, i) {
      return '<a class="modulo" href="#/' + m[3] + '"><span class="modulo-topo"><span>' + (i < 9 ? '0' : '') + (i + 1) + '</span><b>' + esc(m[0]) + '</b></span><h3>' + esc(m[1]) + '</h3><p>' + esc(m[2]) + '</p><span class="entrar">Entrar <span class="seta" aria-hidden="true">→</span></span></a>';
    }).join('');
    var FONTES = ['FINEP', 'BNDES', 'EMBRAPII', 'CNPq', 'CAPES', 'MCTI', 'MDIC', 'ANEEL', 'ANP', 'ANTT', 'INPI', 'SEBRAE', 'SENAI', 'CONFAP', 'IBGE', 'Programa Mover'];
    var fx = FONTES.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('');
    $('faixa').innerHTML = fx + fx;
    $('hub-busca').addEventListener('submit', function (e) { e.preventDefault(); location.hash = '#/busca?q=' + encodeURIComponent($('hub-q').value.trim()); });
  }
  /* Em destaque agora: a curadoria (campo destaque) das chamadas abertas */
  function montaDestaque() {
    var l = ABERTAS.filter(function (c) { return c.destaque; }).sort(function (a, b) { return (a.encerramento || '9999') < (b.encerramento || '9999') ? -1 : 1; }).slice(0, 3);
    var ref = $('hub-novas'); if (!l.length || !ref || $('hub-destaque')) return;
    var sec = document.createElement('section'); sec.className = 'sec'; sec.id = 'hub-destaque'; sec.setAttribute('aria-labelledby', 't-dest');
    sec.innerHTML = '<div class="wrap duas larga"><div class="col-fixa"><h2 class="tit-xl" id="t-dest" data-blur>Em destaque <em>agora</em></h2><p class="intro-azul">Chamadas abertas que a curadoria do Atlas põe na frente: tema estratégico, valor alto ou público amplo.</p><a class="btn-azul" href="#/radar">Ver todas no Radar</a></div>' +
      '<div class="cartoes dest-cartoes">' + l.map(function (c) {
        var d = dias(c.encerramento), doms = (c.dominios || []).slice(0, 3).map(function (x) { return '<span class="tag">' + esc(dom(x)) + '</span>'; }).join('');
        return '<article class="cartao" data-girar><p class="cartao-data">' + esc(c.agenciaNome) + (c.encerramento ? ' · encerra ' + fdata(c.encerramento) + (d !== null && d >= 0 ? ' (' + (d === 0 ? 'hoje' : d + ' dias') + ')' : '') : ' · fluxo contínuo') + '</p><h3>' + esc(c.titulo) + '</h3><p class="cartao-fatos"><b>' + esc(c.valorTotal ? mi(c.valorTotal) : 'Valor no edital') + '</b></p>' +
          '<div class="dest-meta"><div class="tags">' + doms + '</div>' + (valorCurto(c) ? '<b class="dest-valor">' + esc(valorCurto(c)) + '</b>' : '') + '</div>' +
          '<a class="btn-txt" style="margin-top:14px;align-self:flex-start" href="#/radar/' + encodeURIComponent(c.id) + '">Ver a ficha</a></article>';
      }).join('') + '</div></div>';
    ref.closest('section').parentNode.insertBefore(sec, ref.closest('section'));
  }
  /* Domínios em fomento: valor das chamadas abertas por domínio (rateio igual entre os domínios de cada chamada) */
  function montaDominios() {
    var ref = $('hub-portas'); if (!ref || $('hub-dominios')) return;
    var soma = {}, nCh = {}, tot = 0;
    ABERTAS.forEach(function (c) {
      var ds = c.dominios || []; if (!ds.length) return;
      ds.forEach(function (d) { nCh[d] = (nCh[d] || 0) + 1; if (c.valorTotal) soma[d] = (soma[d] || 0) + c.valorTotal / ds.length; });
      if (c.valorTotal) tot += c.valorTotal;
    });
    var ks = Object.keys(soma).sort(function (a, b) { return soma[b] - soma[a]; }).slice(0, 10), mx = soma[ks[0]] || 1;
    if (!ks.length) return;
    var sec = document.createElement('section'); sec.className = 'sec'; sec.id = 'hub-dominios'; sec.setAttribute('aria-labelledby', 't-doms');
    sec.innerHTML = '<div class="wrap"><div class="lado-a-lado"><h2 class="tit-xl" id="t-doms" data-blur>Domínios em <em>fomento</em></h2><div class="col-dir"><p class="intro-azul">Quanto as chamadas abertas somam em cada domínio tecnológico. O valor de cada chamada é dividido por igual entre os seus domínios. Clique para filtrar o Radar.</p></div></div>' +
      '<div class="barras-h dom-bars">' + ks.map(function (k) { return '<a href="#/radar?dom=' + encodeURIComponent(k) + '"><span>' + esc(dom(k)) + '</span><i style="width:' + Math.max(2, soma[k] / mx * 100).toFixed(0) + '%"></i><b>' + esc(mi(soma[k])) + ' · ' + nCh[k] + '</b></a>'; }).join('') + '</div>' +
      '<p class="dom-nota">Soma das chamadas abertas com valor informado: ' + esc(mi(tot)) + ' (' + ABERTAS.filter(function (c) { return c.valorTotal; }).length + ' de ' + ABERTAS.length + ' chamadas). O número depois do valor é a quantidade de chamadas abertas do domínio.</p></div>';
    ref.closest('section').parentNode.insertBefore(sec, ref.closest('section'));
  }
  function miniMapa(tipo) {
    var s = '<svg class="mini" viewBox="0 0 1000 ' + D.alturaMapa + '" aria-hidden="true">';
    if (tipo === 'estados') {
      var cont = contagemUF('tudo', false), mx = Math.max.apply(null, UFS.map(function (u) { return cont[u]; })) || 1;
      UFS.forEach(function (uf) { s += '<path d="' + D.ufGeo[uf].d + '" fill="var(--uf-' + Math.min(5, Math.ceil(cont[uf] / mx * 5)) + ')" stroke="var(--uf-borda)" stroke-width="2"/>'; });
    } else {
      UFS.forEach(function (uf) { s += '<path d="' + D.ufGeo[uf].d + '" fill="var(--uf-0)" stroke="var(--line-2)" stroke-width="2"/>'; });
      D.icts.forEach(function (t) { if (t.lat == null) return; var x = (t.lng + 74.2) * Math.cos(15 * Math.PI / 180) * (1000 / (45.6 * Math.cos(15 * Math.PI / 180))), y = (5.4 - t.lat) * (1000 / (45.6 * Math.cos(15 * Math.PI / 180))); s += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="7" fill="' + corCat(t.categoria) + '" opacity=".75"/>'; });
    }
    return s + '</svg>';
  }

  /* ================= RADAR ================= */
  var FAIXAS_VALOR = [['ate5', 'Até R$ 5 mi', 0, 5], ['5a50', 'R$ 5 a 50 mi', 5, 50], ['50a200', 'R$ 50 a 200 mi', 50, 200], ['200', 'Acima de R$ 200 mi', 200, 1e9], ['sv', 'Sem valor informado', -1, -1]];
  var MACRO = ['Nacional', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
  function macroRegioes(c) {
    if (c.abrangencia === 'nacional') return ['Nacional'];
    var ufs = c.ufs || []; return Object.keys(D.regioes).filter(function (r) { return D.regioes[r].some(function (u) { return ufs.indexOf(u) >= 0; }); });
  }
  var GRUPOS = [
    {k: 'status', t: 'Situação', aberto: true, val: function (c) { return [c.status]; }, rot: {'aberta': 'Aberta', 'em-breve': 'Em breve', 'encerrada': 'Encerrada'}},
    {k: 'ab', t: 'Abrangência', aberto: true, val: function (c) { return [c.abrangencia]; }, rot: {nacional: 'Nacional', regional: 'Regional', estadual: 'Estadual', internacional: 'Internacional'}},
    {k: 'reg', t: 'Região do país', val: macroRegioes, ordemFixa: MACRO},
    {k: 'uf', t: 'Estado (inclui as nacionais)', val: null},
    {k: 'dom', t: 'Domínio tecnológico', aberto: true, val: function (c) { return c.dominios || []; }, rot: DOM},
    {k: 'ag', t: 'Agência', val: function (c) { return [c.agenciaNome || '—']; }},
    {k: 'nat', t: 'Natureza do recurso', aberto: true, val: function (c) { return [c.nat || 'a-confirmar']; }, rot: NAT_ROT},
    {k: 'cat', t: 'Tipo de apoio', val: function (c) { return [c.categoria || 'Não informado']; }},
    {k: 'valor', t: 'Valor da chamada', val: function (c) { return [FAIXAS_VALOR.filter(function (f) { return f[0] === 'sv' ? !c.valorTotal : c.valorTotal > f[2] && c.valorTotal <= f[3]; })[0][0]]; }, rot: (function () { var o = {}; FAIXAS_VALOR.forEach(function (f) { o[f[0]] = f[1]; }); return o; })(), ordemFixa: FAIXAS_VALOR.map(function (f) { return f[0]; })}
  ];
  var ATALHOS = [['IA e software', 'tic'], ['Energia', 'energia'], ['Saúde', 'saude'], ['Agro', 'agro'], ['Meio ambiente', 'ambiental'], ['Startups', '@startup'], ['Subvenção', '@subvenção']];
  function estVazio() { return {q: '', breve: false, novo: false, ordem: 'prazo', status: ['aberta'], ab: [], reg: [], uf: [], dom: [], ag: [], nat: [], cat: [], valor: [], atalho: ''}; }
  var est = estVazio(), radarPronto = false;
  function vale(c, uf) { return c.abrangencia === 'nacional' || (c.ufs || []).indexOf(uf) >= 0; }
  function passa(c, exceto) {
    if (est.q) { var q = sem(est.q), alvo = sem([c.titulo, c.agenciaNome, c.resumo, (c.tags || []).join(' '), c.regiao, c.categoria].join(' ')); if (q.split(/\s+/).some(function (p) { return alvo.indexOf(p) < 0; })) return false; }
    if (est.atalho && est.atalho.charAt(0) === '@') { var a = sem(est.atalho.slice(1)); if (sem([c.titulo, c.resumo, c.publico, c.categoria, (c.tags || []).join(' ')].join(' ')).indexOf(a) < 0) return false; }
    if (est.breve && !breve(c)) return false;
    if (est.novo && !novo(c)) return false;
    for (var i = 0; i < GRUPOS.length; i++) {
      var g = GRUPOS[i], sel = est[g.k]; if (g.k === exceto || !sel.length) continue;
      if (g.k === 'uf') { if (!sel.some(function (u) { return vale(c, u); })) return false; continue; }
      var vs = g.val(c); if (!vs.some(function (v) { return sel.indexOf(v) >= 0; })) return false;
    }
    return true;
  }
  function desenhaFiltros() {
    $('f-grupos').innerHTML = GRUPOS.map(function (g) {
      var cont = {}, base = D.chamadas.filter(function (c) { return passa(c, g.k); });
      if (g.k === 'uf') UFS.forEach(function (u) { cont[u] = base.filter(function (c) { return vale(c, u); }).length; });
      else base.forEach(function (c) { g.val(c).forEach(function (v) { cont[v] = (cont[v] || 0) + 1; }); });
      var chaves = g.k === 'uf' ? UFS.slice() : g.ordemFixa ? g.ordemFixa.filter(function (k) { return cont[k] || est[g.k].indexOf(k) >= 0; }) : Object.keys(cont).concat(est[g.k].filter(function (k) { return !(k in cont); }));
      if (!g.ordemFixa && g.k !== 'uf' && g.k !== 'status') chaves.sort(function (a, b) { return (cont[b] || 0) - (cont[a] || 0) || String(a).localeCompare(b, 'pt-BR'); });
      if (g.k === 'uf') chaves.sort(function (a, b) { return D.ufNomes[a].localeCompare(D.ufNomes[b], 'pt-BR'); });
      var aberto = g.aberto || est[g.k].length;
      return '<details class="f-grupo"' + (aberto ? ' open' : '') + '><summary>' + esc(g.t) + (est[g.k].length ? '<em>' + est[g.k].length + ' marcado' + (est[g.k].length > 1 ? 's' : '') + '</em>' : '') + '</summary><div class="f-opcoes">' +
        chaves.map(function (k) {
          var rot = g.k === 'uf' ? D.ufNomes[k] : (g.rot && g.rot[k]) || k;
          return '<label><input type="checkbox" data-g="' + g.k + '" value="' + esc(k) + '"' + (est[g.k].indexOf(k) >= 0 ? ' checked' : '') + '><span>' + esc(rot) + '</span><span>' + (cont[k] || 0) + '</span></label>';
        }).join('') + '</div></details>';
    }).join('');
  }
  $('f-grupos').addEventListener('change', function (e) {
    var i = e.target; if (!i.matches('input[type=checkbox]')) return;
    var g = i.getAttribute('data-g'), v = i.value, k = est[g].indexOf(v);
    if (i.checked && k < 0) est[g].push(v); if (!i.checked && k >= 0) est[g].splice(k, 1);
    atualizaRadar(true);
  });
  $('f-limpar').addEventListener('click', function () { est = estVazio(); $('radar-q').value = ''; $('ordem').value = 'prazo'; atualizaRadar(true); });
  $('selo-breve').addEventListener('click', function () { est.breve = !est.breve; atualizaRadar(true); });
  $('selo-novo').addEventListener('click', function () { est.novo = !est.novo; atualizaRadar(true); });
  $('ordem').addEventListener('change', function () { est.ordem = this.value; atualizaRadar(true); });
  var tq; $('radar-q').addEventListener('input', function () { var v = this.value; clearTimeout(tq); tq = setTimeout(function () { est.q = v.trim(); atualizaRadar(true); }, 180); });
  $('btn-filtros').addEventListener('click', function () { var corpo = $('radar-corpo'), on = corpo.classList.toggle('sem-filtros'); this.setAttribute('aria-expanded', String(!on)); });
  $('atalhos').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return; var v = b.getAttribute('data-v');
    if (v.charAt(0) === '@') est.atalho = est.atalho === v ? '' : v;
    else { var k = est.dom.indexOf(v); if (k >= 0) est.dom.splice(k, 1); else est.dom = [v]; }
    atualizaRadar(true);
  });
  $('copiar').addEventListener('click', function () {
    var url = location.href.split('#')[0] + '#/radar' + queryRadar(), btn = this;
    function ok() { btn.querySelector('span').textContent = 'Link copiado ✓'; setTimeout(function () { btn.querySelector('span').textContent = 'Copiar link desta busca'; }, 1800); }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, ok); else ok();
  });
  function queryRadar() {
    var p = [];
    if (est.q) p.push('q=' + encodeURIComponent(est.q));
    if (est.breve) p.push('breve=1'); if (est.novo) p.push('novo=1');
    if (est.ordem !== 'prazo') p.push('ordem=' + est.ordem);
    if (est.atalho) p.push('atalho=' + encodeURIComponent(est.atalho));
    GRUPOS.forEach(function (g) { var v = est[g.k]; if (g.k === 'status' && v.length === 1 && v[0] === 'aberta') return; if (v.length) p.push(g.k + '=' + encodeURIComponent(v.join(','))); });
    return p.length ? '?' + p.join('&') : '';
  }
  function lerQuery(q) {
    est = estVazio(); if (!q) return;
    q.split('&').forEach(function (par) {
      var kv = par.split('='), k = kv[0], v = decodeURIComponent(kv[1] || '');
      if (k === 'q') est.q = v; else if (k === 'breve') est.breve = true; else if (k === 'novo') est.novo = true; else if (k === 'ordem') est.ordem = v; else if (k === 'atalho') est.atalho = v;
      else if (est[k] && Array.isArray(est[k])) est[k] = v ? v.split(',') : [];
    });
  }
  $('contagem').addEventListener('click', function (e) {
    var b = e.target.closest('[data-rm]'); if (!b) return; var p = b.getAttribute('data-rm').split('|'), k = est[p[0]].indexOf(p[1]);
    if (k >= 0) est[p[0]].splice(k, 1); if (p[0] === 'status' && !est.status.length) est.status = ['aberta']; atualizaRadar(true);
  });
  function ordenar(l) {
    var o = est.ordem;
    return l.sort(function (a, b) {
      if (est.uf.length && o === 'prazo') { var la = a.abrangencia === 'nacional' ? 1 : 0, lb = b.abrangencia === 'nacional' ? 1 : 0; if (la !== lb) return la - lb; }
      if (o === 'valor') return (b.valorTotal || 0) - (a.valorTotal || 0);
      if (o === 'nome') return a.titulo.localeCompare(b.titulo, 'pt-BR');
      if (o === 'novo') return (b.abertura || '') < (a.abertura || '') ? -1 : 1;
      var pa = a.status === 'encerrada' ? 2 : a.status === 'em-breve' ? 1 : 0, pb = b.status === 'encerrada' ? 2 : b.status === 'em-breve' ? 1 : 0;
      if (pa !== pb) return pa - pb;
      if (pa === 2) return (b.encerramento || '') < (a.encerramento || '') ? -1 : 1;
      return (a.encerramento || '9999') < (b.encerramento || '9999') ? -1 : 1;
    });
  }
  function atualizaRadar(gravar) {
    if (gravar) { var h = '#/radar' + queryRadar(); if (location.hash !== h) history.replaceState(null, '', h); }
    $('radar-q').value = est.q; $('ordem').value = est.ordem;
    $('selo-breve').setAttribute('aria-pressed', String(est.breve)); $('selo-novo').setAttribute('aria-pressed', String(est.novo));
    $('n-breve').textContent = ABERTAS.filter(breve).length; $('n-novo').textContent = ABERTAS.filter(novo).length;
    $('atalhos').innerHTML = '<span>Atalhos:</span>' + ATALHOS.map(function (a) { var on = a[1].charAt(0) === '@' ? est.atalho === a[1] : est.dom.length === 1 && est.dom[0] === a[1]; return '<button type="button" class="chip" data-v="' + esc(a[1]) + '" aria-pressed="' + on + '">' + esc(a[0]) + '</button>'; }).join('');
    desenhaFiltros();
    var l = ordenar(D.chamadas.filter(function (c) { return passa(c); }));
    var nNac = est.uf.length ? l.filter(function (c) { return c.abrangencia === 'nacional'; }).length : 0;
    var ativos = [];
    GRUPOS.forEach(function (g) { est[g.k].forEach(function (v) { if (g.k === 'status' && v === 'aberta' && est.status.length === 1) return; ativos.push('<button type="button" class="chip x" data-rm="' + g.k + '|' + esc(v) + '">' + esc(g.k === 'uf' ? D.ufNomes[v] : (g.rot && g.rot[v]) || v) + '</button>'); }); });
    var vol = l.reduce(function (s, c) { return s + (c.valorTotal || 0); }, 0), nVol = l.filter(function (c) { return c.valorTotal; }).length;
    if ($('radar-vol')) { $('radar-vol').textContent = vol ? mi(vol) : '—'; $('radar-vol-n').textContent = 'volume do filtro atual (' + nVol + ' de ' + l.length + ' com valor)'; }
    $('contagem').innerHTML = 'Encontradas <b>' + l.length + '</b> chamada' + (l.length === 1 ? '' : 's') + (vol ? ', somando <b>' + esc(mi(vol)) + '</b>' : '') + (est.uf.length ? ' em ' + est.uf.map(function (u) { return D.ufNomes[u]; }).join(', ') + (nNac ? ', incluindo ' + nNac + ' nacionais' : '') : '') + (ativos.length ? ' &nbsp;' + ativos.join(' ') : '');
    var alvo = $('radar-lista');
    alvo.innerHTML = l.length ? l.map(cartaoChamada).join('') : '<div class="vazio"><p>Nenhuma chamada com esses filtros.</p><button type="button" class="btn-linha peq" onclick="document.getElementById(\'f-limpar\').click()">Limpar filtros</button></div>';
    alvo.querySelectorAll('.op').forEach(function (el, k) { el.style.transitionDelay = Math.min(k, 6) * 40 + 'ms'; });
    observar('.op.entra', alvo);
    pintaMapaRadar();
  }
  function montaNumRadar() {
    if (!largo()) { $('radar-corpo').classList.add('sem-filtros'); $('btn-filtros').setAttribute('aria-expanded', 'false'); }
    var nac = ABERTAS.filter(function (c) { return c.abrangencia === 'nacional'; }).length, reg = ABERTAS.filter(function (c) { return c.abrangencia === 'regional'; }).length, estd = ABERTAS.filter(function (c) { return c.abrangencia === 'estadual'; }).length;
    var porAg = {}; ABERTAS.forEach(function (c) { porAg[c.agenciaNome] = (porAg[c.agenciaNome] || 0) + 1; });
    var top = Object.keys(porAg).sort(function (a, b) { return porAg[b] - porAg[a]; });
    $('radar-num').innerHTML = '<b data-contar="' + ABERTAS.length + '">' + ABERTAS.length + '</b><span>chamadas abertas no Radar</span>' +
      '<div class="faixa-quebra"><div><b>' + nac + '</b><span>nacionais</span></div><div><b>' + reg + '</b><span>regionais</span></div><div><b>' + estd + '</b><span>estaduais</span></div></div>' +
      '<div class="faixa-quebra faixa-vol"><div><b id="radar-vol">—</b><span id="radar-vol-n">volume do filtro atual</span></div><div><b>' + D.chamadas.filter(function (c) { return c.status === 'em-breve'; }).length + '</b><span>em abertura (abrem em breve)</span></div></div>' +
      '<p class="faixa-ags">' + top.slice(0, 6).map(function (a) { return esc(a.split(',')[0]) + ' <b>'+ porAg[a] + '</b>'; }).join('') + (top.length > 6 ? '<span>+' + (top.length - 6) + ' agências</span>' : '') + '</p>';
    $('radar-mapa').innerHTML = svgBrasil('', false);
    $('radar-mapa').addEventListener('click', function (e) {
      var p = e.target.closest('.uf'); if (!p) return; var uf = p.getAttribute('data-uf');
      est.uf = est.uf.length === 1 && est.uf[0] === uf ? [] : [uf]; atualizaRadar(true);
      var y = $('radar-corpo').getBoundingClientRect().top + window.scrollY - 20; window.scrollTo({top: y, behavior: MOVER ? 'smooth' : 'auto'});
    });
  }
  function pintaMapaRadar() {
    var cont = {}; UFS.forEach(function (u) { cont[u] = ABERTAS.filter(function (c) { return (c.ufs || []).indexOf(u) >= 0; }).length; });
    var mx = Math.max.apply(null, UFS.map(function (u) { return cont[u]; })) || 1;
    $('radar-mapa').querySelectorAll('.uf').forEach(function (p) {
      var u = p.getAttribute('data-uf'), v = cont[u];
      p.style.fill = v ? mistura('#33506F', '#9EC1F2', v / mx) : '#22395A';
      p.classList.toggle('sel', est.uf.indexOf(u) >= 0);
      p.querySelector('title').textContent = D.ufNomes[u] + ': ' + v + ' chamada' + (v === 1 ? '' : 's') + ' estadual ou regional aberta' + (v === 1 ? '' : 's') + ' + as nacionais';
    });
  }
  function linhaDoTempo() {
    var lista = ABERTAS.filter(function (c) { return c.encerramento && dias(c.encerramento) >= 0; });
    var W = 1000, ay = 118, x0 = 40, x1 = 980, xm = x0 + (x1 - x0) * 0.72;
    function x(d) { return d <= 60 ? x0 + (xm - x0) * d / 60 : xm + (x1 - xm) * (Math.min(d, 200) - 60) / 140; }
    var s = '<svg viewBox="0 0 ' + W + ' 160" role="img" aria-label="Prazos das chamadas abertas, de hoje a 200 dias">';
    s += '<rect class="tl-zona" x="' + x0 + '" y="8" width="' + (x(15) - x0).toFixed(1) + '" height="' + (ay - 8) + '" rx="3"/>';
    [0, 15, 30, 45, 60, 120, 180].forEach(function (d) {
      s += '<line class="tl-tick" x1="' + x(d).toFixed(1) + '" y1="8" x2="' + x(d).toFixed(1) + '" y2="' + (ay + 6) + '"/>';
      s += '<text class="' + (d ? 'tl-rot' : 'tl-hoje') + '" x="' + x(d).toFixed(1) + '" y="' + (ay + 30) + '" text-anchor="' + (d ? 'middle' : 'start') + '">' + (d ? '+' + d + 'd' : 'HOJE') + '</text>';
    });
    s += '<line class="tl-eixo" x1="' + x0 + '" y1="' + ay + '" x2="' + x1 + '" y2="' + ay + '"/>';
    var pilha = {};
    lista.forEach(function (c, i) {
      var d = dias(c.encerramento), chave = Math.round(x(d) / 10);
      pilha[chave] = (pilha[chave] || 0) + 1;
      var cy = ay - 14 - (pilha[chave] - 1) * 15;
      s += '<circle class="tl-pt ' + (d <= 15 ? 'urg' : 'ab') + '" style="transition-delay:' + (i * 40) + 'ms" data-id="' + esc(c.id) + '" cx="' + x(d).toFixed(1) + '" cy="' + cy + '" r="6"></circle>';
    });
    var box = $('tl');
    box.innerHTML = s + '</svg><div class="tl-dica" hidden></div>';
    var dica = box.querySelector('.tl-dica');
    box.addEventListener('pointerover', function (e) {
      var p = e.target.closest('.tl-pt'); if (!p) return;
      var c = D.chamadas.filter(function (k) { return k.id === p.getAttribute('data-id'); })[0], r = p.getBoundingClientRect(), rb = box.getBoundingClientRect();
      var insT = c.instrumento ? D.instrumentos.filter(function (i) { return i.id === c.instrumento; })[0] : null;
      dica.innerHTML = '<b>' + dias(c.encerramento) + ' dias</b> · ' + esc(c.agenciaNome) + '<br>' + esc(c.titulo) + (c.publico ? '<br><small>Para quem: ' + esc(corta(c.publico, 90)) + '</small>' : '') + (insT ? '<br><small>Instrumento: ' + esc(insT.sigla || insT.nome) + '</small>' : '');
      dica.style.left = (r.left + r.width / 2 - rb.left) + 'px'; dica.style.top = (r.top - rb.top) + 'px'; dica.hidden = false;
    });
    box.addEventListener('pointerout', function (e) { if (e.target.closest('.tl-pt')) dica.hidden = true; });
    box.addEventListener('click', function (e) {
      var p = e.target.closest('.tl-pt'); if (!p) return;
      var card = $('op-' + p.getAttribute('data-id'));
      if (!card) { est = estVazio(); atualizaRadar(true); card = $('op-' + p.getAttribute('data-id')); }
      if (!card) return;
      card.classList.remove('entra');
      window.scrollTo({top: card.getBoundingClientRect().top + window.scrollY - 100, behavior: MOVER ? 'smooth' : 'auto'});
      card.classList.add('foco'); setTimeout(function () { card.classList.remove('foco'); }, 1800);
    });
    $('painel-tl').addEventListener('toggle', function () { if (this.open) { box.classList.remove('visto'); observar('.tl'); } });
  }

  /* ================= FICHA DA CHAMADA ================= */
  function montaFicha(id, q) {
    var c = D.chamadas.filter(function (k) { return k.id === id; })[0], box = $('ficha');
    if (!c) { box.innerHTML = '<p class="migalha"><a href="#/radar">Radar</a></p><div class="bloco ficha-cab"><h1>Chamada não encontrada</h1><p class="ag">Ela pode ter saído do Radar.</p></div>'; return; }
    var st = estado(c), d = dias(c.encerramento), v = valorCurto(c), fav = favorito(c.id);
    var onde = c.abrangencia === 'nacional' ? 'Nacional: vale em todo o país' : c.abrangencia === 'estadual' ? (D.ufNomes[c.uf] || c.regiao) : (c.regiao || 'Regional');
    var docs = [];
    if (c.edital) docs.push({u: c.edital, t: c.editalRotulo || 'Edital', pdf: /\.pdf($|\?)/i.test(c.edital)});
    (c.docs || []).forEach(function (k) { docs.push({u: k.url, t: k.label, pdf: /\.pdf($|\?)/i.test(k.url)}); });
    var relAg = D.chamadas.filter(function (k) { return k.id !== c.id && k.agencia === c.agencia && k.status !== 'encerrada'; }).slice(0, 4);
    var relDom = ABERTAS.filter(function (k) { return k.id !== c.id && relAg.indexOf(k) < 0 && (k.dominios || []).some(function (x) { return (c.dominios || []).indexOf(x) >= 0; }); }).slice(0, 3);
    box.innerHTML =
      '<div class="ficha-acoes"><p class="migalha"><a href="#/radar">Radar</a> / ' + esc(c.agenciaNome) + '</p><div class="barra-esq">' +
        (dataIcs(c) ? '<button type="button" class="btn-linha peq" data-ics-ch="' + esc(c.id) + '" title="Baixa um arquivo .ics com ' + (c.status === 'em-breve' ? 'a data de abertura' : 'o prazo de submissão') + '"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 7h12M5.5 1.5v3M10.5 1.5v3"/></svg>Adicionar ao calendário</button>' : '') +
        '<button type="button" class="btn-linha peq btn-fav" data-id="' + esc(c.id) + '" aria-pressed="' + fav + '">' + ICO.est + '<span class="rot-fav">' + (fav ? 'Favorito ✓' : 'Favorito') + '</span></button>' +
        '<a class="btn-azul peq" href="#/radar' + queryRadar() + '">← Voltar à busca</a></div></div>' +
      '<div class="bloco ficha-cab"><p class="olho">Chamada · ' + esc(c.categoria || 'Fomento') + '</p><h1>' + esc(c.titulo) + '</h1><p class="ag">' + esc(c.agenciaNome) + '</p>' +
        '<div class="tags">' + (c.dominios || []).map(function (x) { return '<span class="tag">' + ICO.dom + esc(dom(x)) + '</span>'; }).join('') + '</div></div>' +
      '<div class="ficha-tres">' +
        '<div class="bloco"><h4>Quem pode pedir</h4><ul class="lista-ico"><li>' + ICO.pub + '<span>' + esc(c.publico || 'Ver o edital') + '</span></li><li>' + ICO.geo + '<span>' + esc(onde) + '</span></li></ul></div>' +
        '<div class="bloco"><h4>Valores</h4><div class="dado"><span>Valor total da chamada</span><b class="grande">' + (v ? esc(v) : '—') + '</b></div>' + (c.valor ? '<div class="dado"><span>Como o edital descreve</span><b style="font-weight:400;font-size:14px;line-height:1.5;color:var(--ink-2)">' + esc(c.valor) + '</b></div>' : '') + '</div>' +
        '<div class="bloco"><h4>Prazo e situação</h4>' + (c.encerramento ? '<div class="dado"><span>Encerra em</span><b class="grande' + (d !== null && d <= 15 && c.status === 'aberta' ? ' urg' : '') + '">' + fdata(c.encerramento) + '</b></div>' : '<div class="dado"><span>Prazo</span><b>Fluxo contínuo</b></div>') +
          (c.abertura ? '<div class="dado"><span>Abertura</span><b>' + fdata(c.abertura) + '</b></div>' : '') +
          '<div class="dado"><span>Natureza do recurso</span><b>' + natTag(c.nat) + '</b></div>' +
          '<div class="dado"><span>Situação</span><b><span class="status ' + st.cls + '">' + esc(st.rot) + '</span></b></div>' +
          (c.link ? '<a class="btn-azul peq" style="margin-top:16px" href="' + esc(c.link) + '" target="_blank" rel="noopener">Ver página oficial ↗</a>' : '') + '</div>' +
      '</div>' +
      '<div class="ficha-duas"><div class="bloco"><h4>Objetivo</h4><p>' + esc(c.resumo || '') + '</p></div>' +
        '<div class="bloco"><h4>Observações</h4><p>' + (c.tags && c.tags.length ? 'Palavras-chave: ' + c.tags.map(esc).join(', ') + '.' : 'Sem observações adicionais.') + '</p>' +
        (c.instrumento ? (function () { var ins = D.instrumentos.filter(function (i) { return i.id === c.instrumento; })[0]; return '<p>Instrumento ligado: <a href="#/instrumentos/' + encodeURIComponent(c.instrumento) + '" class="btn-txt">' + esc(ins ? (ins.sigla || ins.nome) : c.instrumento) + '</a></p>'; })() : '') +
        '<p style="font-size:13px;color:var(--ink-3)">Confirme valores e prazos na página oficial antes de submeter.</p></div></div>' +
      (docs.length ? docs.map(function (k) { return '<div class="bloco ficha-pdf"><div class="doc"><i>' + (k.pdf ? 'PDF' : 'WEB') + '</i><div><b style="font-weight:500">' + esc(k.t) + '</b><br><span style="font-size:13px;color:var(--ink-3)">' + esc(k.u.replace(/^https?:\/\//, '').slice(0, 70)) + '</span></div></div><a class="btn-linha peq" href="' + esc(k.u) + '" target="_blank" rel="noopener">' + (k.pdf ? 'Abrir PDF ↗' : 'Abrir ↗') + '</a></div>'; }).join('') : '') +
      (relAg.length ? '<section class="rel"><h2 class="tit-md">Outras chamadas de ' + esc(c.agenciaNome) + '</h2><div class="grade">' + relAg.map(cartaoChamada).join('') + '</div></section>' : '') +
      (relDom.length ? '<section class="rel"><h2 class="tit-md">Chamadas abertas no mesmo domínio</h2><div class="grade">' + relDom.map(cartaoChamada).join('') + '</div></section>' : '');
    observar('.op.entra', box);
    if (window.AV2_tldrChamada) window.AV2_tldrChamada(A, c, box, q);
  }

  /* ================= MAPA DE ICTs ================= */
  var CAT_COR = [['INCT', '#7C3AED'], ['Instituto de Pesquisa', '#2563EB'], ['EMBRAPII', '#059669'], ['SENAI', '#D97706'], ['Arranjo', '#DB2777'], ['Centro de', '#0891B2']];
  function corCat(cat) { for (var i = 0; i < CAT_COR.length; i++) if ((cat || '').indexOf(CAT_COR[i][0]) >= 0) return CAT_COR[i][1]; return '#64748B'; }
  var mapa = null, camada = null, fundo = null, ictEst = {q: '', reg: '', cat: '', dom: '', cred: '', uf: ''}, marcadores = {};
  /* 'Unidade EMBRAPII' = flag oficial do painel (96), como no Atlas; as demais categorias pelo selo */
  function ehCat(t, c) { return c === 'Unidade EMBRAPII' ? !!t.unidadeEmbrapii : t.categoria === c; }
  /* Região, tipo e credenciamento aceitam várias seleções (ou dentro do grupo), como no Atlas; ictEst guarda os valores separados por '|' */
  function emSel(f, v) { return ('|' + ictEst[f] + '|').indexOf('|' + v + '|') >= 0; }
  function ictPassa(t, exceto) {
    if (ictEst.q && exceto !== 'q') { var q = sem(ictEst.q); if (sem([t.nome, t.longo, t.cidade, t.uf, (t.linhasPesquisa || []).join(' '), (t.areas || []).join(' '), t.area].join(' ')).indexOf(q) < 0) return false; }
    if (ictEst.reg && exceto !== 'reg' && ictEst.reg.split('|').indexOf(t.regiao) < 0) return false;
    if (ictEst.uf && exceto !== 'uf' && t.uf !== ictEst.uf) return false;
    if (ictEst.cat && exceto !== 'cat' && !ictEst.cat.split('|').some(function (c) { return ehCat(t, c); })) return false;
    if (ictEst.dom && exceto !== 'dom' && (t.dominios || []).indexOf(ictEst.dom) < 0) return false;
    if (ictEst.cred && exceto !== 'cred' && !ictEst.cred.split('|').some(function (c) { return (t.credenciamentos || []).indexOf(c) >= 0; })) return false;
    return true;
  }
  /* Fundo vetorial: estados da malha do IBGE, estilizados por CSS (segue o tema e é clicável) */
  function tiles() {
    if (fundo) return;
    var porUF = {}; D.icts.forEach(function (t) { porUF[t.uf] = (porUF[t.uf] || 0) + 1; });
    fundo = L.geoJSON(D.ufGeoJSON, {
      style: function () { return {className: 'uf-l', weight: 1}; },
      onEachFeature: function (f, camadaUF) {
        var uf = f.properties.uf;
        camadaUF.bindTooltip('<b>' + esc(D.ufNomes[uf]) + '</b> · ' + (porUF[uf] || 0) + ' ICTs · clique para filtrar', {sticky: true, direction: 'top', className: 'uf-tip'});
        camadaUF.on('click', function () { ictEst.uf = ictEst.uf === uf ? '' : uf; if (ictEst.uf) ictEst.reg = ''; filtraICTs(!ictEst.uf); if (ictEst.uf) mapa.fitBounds(camadaUF.getBounds(), {paddingTopLeft: [40, 70], paddingBottomRight: [40, 90]}); });
      }
    }).addTo(mapa);
    mapa.attributionControl.addAttribution('Malha das UFs: <a href="https://www.ibge.gov.br/" target="_blank" rel="noopener">IBGE</a>');
  }
  function marcaUFMapa() { if (fundo) fundo.eachLayer(function (c) { if (c._path) c._path.classList.toggle('sel', c.feature.properties.uf === ictEst.uf); }); }
  function popupICT(t) {
    return '<h5>' + esc(t.nome) + '</h5>' + (t.longo && t.longo !== t.nome ? '<p>' + esc(t.longo) + '</p>' : '') + '<p>' + esc(t.categoria) + ' · ' + esc(t.cidade || '') + ' (' + esc(t.uf) + ')</p>' +
      '<div class="tags">' + (t.dominios || []).slice(0, 4).map(function (d) { return '<span class="tag">' + esc(dom(d)) + '</span>'; }).join('') + (t.credenciamentos || []).map(function (c) { return '<span class="tag" style="border-color:var(--azul-borda);color:var(--azul-txt)">' + esc(c) + '</span>'; }).join('') + '</div>' +
      '<p style="margin-top:10px!important">' + (t.site ? '<a href="' + esc(t.site) + '" target="_blank" rel="noopener">Site oficial ↗</a> · ' : '') + '<a href="#/icts/' + encodeURIComponent(t.id) + '">Ficha da ICT</a> · <a href="#/estados/' + t.uf + '">Oportunidades em ' + esc(t.uf) + '</a></p>';
  }
  function iniciaMapa() {
    if (mapa || !window.L) return;
    mapa = L.map('mapa-icts', {zoomControl: true, scrollWheelZoom: false, minZoom: 3, maxZoom: 12, zoomSnap: 0.25}).setView([-14.5, -52], 4.25); /* rolar a página não dá zoom; zoom com clique no mapa ou Ctrl + roda */ mapa.on('click', function () { mapa.scrollWheelZoom.enable(); }); mapa.on('mouseout', function () { mapa.scrollWheelZoom.disable(); }); mapa.getContainer().addEventListener('wheel', function (e) { if (e.ctrlKey) { e.preventDefault(); mapa.setZoom(mapa.getZoom() + (e.deltaY < 0 ? 0.5 : -0.5)); } }, {passive: false});
    tiles();
    camada = L.markerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 46, iconCreateFunction: function (cl) { var n = cl.getChildCount(), s = n < 10 ? 32 : n < 50 ? 40 : 48; return L.divIcon({html: '<div class="grupo-pinos" style="width:' + s + 'px;height:' + s + 'px">' + n + '</div>', className: '', iconSize: [s, s]}); }});
    mapa.addLayer(camada);
    D.icts.forEach(function (t) {
      if (t.lat == null || t.lng == null) return;
      var m = L.marker([t.lat, t.lng], {icon: L.divIcon({html: '<div class="pino" style="background:' + corCat(t.categoria) + '"></div>', className: '', iconSize: [14, 14], iconAnchor: [7, 7]}), title: t.nome});
      m.bindPopup(function () { return popupICT(t); }, {maxWidth: 320});
      marcadores[t.id] = m;
    });
    aoMudarMenu.push(function () { if (mapa) mapa.invalidateSize(); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { mapa.invalidateSize(); }).observe($('mapa-icts'));
    mapa.on('moveend', function () { if (ictArea) cardsICT(); });
    $('ict-q').addEventListener('input', function () { ictEst.q = this.value.trim(); filtraICTs(false); });
    $('ict-dom').innerHTML = '<option value="">Todos os domínios</option>' + D.dominios.map(function (d) { return '<option value="' + d.id + '">' + esc(d.label) + '</option>'; }).join('');
    $('ict-dom').addEventListener('change', function () { ictEst.dom = this.value; filtraICTs(false); });
    document.querySelector('.ict-filtros').addEventListener('click', function (e) {
      var b = e.target.closest('[data-f]'); if (!b) return;
      var f = b.getAttribute('data-f'), v = b.getAttribute('data-v');
      if (f === 'reg' || f === 'cat' || f === 'cred') { var sel = ictEst[f] ? ictEst[f].split('|') : [], ix = sel.indexOf(v); if (ix >= 0) sel.splice(ix, 1); else sel.push(v); ictEst[f] = sel.join('|'); }
      else ictEst[f] = ictEst[f] === v ? '' : v;
      if (f === 'reg') ictEst.uf = '';
      filtraICTs(f === 'reg' || f === 'uf');
    });
    $('ict-limpar').addEventListener('click', function () { ictEst = {q: '', reg: '', cat: '', dom: '', cred: '', uf: ''}; $('ict-q').value = ''; $('ict-dom').value = ''; filtraICTs(true); });
    $('mapa-legenda').addEventListener('click', function (e) { if (e.target.closest('[data-lista]')) irParaLista(); });
    var mz = $('ict-matriz');
    mz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mz]'); if (!b) return; var p = b.getAttribute('data-mz').split('|');
      var igual = ictEst.dom === p[0] && ictEst.reg === p[1];
      ictEst.dom = igual ? '' : p[0]; ictEst.reg = igual ? '' : p[1]; ictEst.uf = ''; $('ict-dom').value = ictEst.dom; filtraICTs(true);
    });
    $('ict-baixo').addEventListener('change', function (e) { if (e.target.id === 'ict-area') { ictArea = e.target.checked; ictLim = 24; cardsICT(); } });
    $('ict-baixo').addEventListener('click', function (e) {
      if (e.target.closest('[data-mais-ict]')) { ictLim += 24; cardsICT(); return; }
      var pin = e.target.closest('[data-pin]'); if (!pin) return;
      var m = marcadores[pin.getAttribute('data-pin')]; if (!m) return;
      window.scrollTo({top: Math.max(0, $('mapa-icts').getBoundingClientRect().top + window.scrollY - 70), behavior: MOVER ? 'smooth' : 'auto'});
      setTimeout(function () { camada.zoomToShowLayer(m, function () { m.openPopup(); }); }, MOVER ? 350 : 0);
    });
  }
  /* Matriz: quantas ICTs declaram cada domínio em cada região (respeita os demais filtros) */
  function matrizICT() {
    var box = $('ict-matriz'); if (!box) return;
    var regs = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'], salvo = [ictEst.dom, ictEst.reg, ictEst.uf], cel = {}, tot = {}, mx = 1;
    ictEst.dom = ''; ictEst.reg = ''; ictEst.uf = '';
    var base = D.icts.filter(function (t) { return ictPassa(t); });
    ictEst.dom = salvo[0]; ictEst.reg = salvo[1]; ictEst.uf = salvo[2];
    base.forEach(function (t) { (t.dominios || []).forEach(function (d) { var k = d + '|' + t.regiao; cel[k] = (cel[k] || 0) + 1; tot[d] = (tot[d] || 0) + 1; if (cel[k] > mx) mx = cel[k]; }); });
    var doms = D.dominios.map(function (d) { return d.id; }).filter(function (d) { return tot[d]; }).sort(function (a, b) { return tot[b] - tot[a]; });
    box.innerHTML = '<p class="contagem" style="margin-top:14px">Quantas ICTs declaram cada domínio, em cada região. Clique numa célula para filtrar o mapa e a lista.</p>' +
      (doms.length ? '<div class="rola-x"><table class="mz-tab"><thead><tr><th>Domínio</th>' + regs.map(function (r) { return '<th>' + esc(r) + '</th>'; }).join('') + '<th>Total</th></tr></thead><tbody>' +
        doms.map(function (d) { return '<tr><th scope="row">' + esc(dom(d)) + '</th>' + regs.map(function (r) { var n = cel[d + '|' + r] || 0; return '<td>' + (n ? '<button type="button" class="mz-c" style="--i:' + (0.12 + 0.78 * n / mx).toFixed(2) + '" data-mz="' + esc(d) + '|' + esc(r) + '" aria-pressed="' + (ictEst.dom === d && ictEst.reg === r) + '" title="' + esc(dom(d) + ' em ' + r + ': ' + n + ' ICTs') + '">' + n + '</button>' : '<span class="mz-0">·</span>') + '</td>'; }).join('') + '<td class="mz-t">' + tot[d] + '</td></tr>'; }).join('') +
        '</tbody></table></div>' : '<p class="uf-vazio" style="border:0">Nenhuma ICT com esses filtros.</p>');
  }
  function filtraICTs(enquadrar) {
    var l = D.icts.filter(function (t) { return ictPassa(t); });
    camada.clearLayers();
    camada.addLayers(l.filter(function (t) { return marcadores[t.id]; }).map(function (t) { return marcadores[t.id]; }));
    $('kpi-total').textContent = br(l.length);
    $('kpi-total-rot').textContent = (l.length === 1 ? 'ICT' : 'ICTs') + (ictEst.uf ? ' em ' + D.ufNomes[ictEst.uf] : ictEst.reg ? ' no ' + ictEst.reg.split('|').join(' e ') : ' no mapa');
    function barras(campo, chaves, rot) {
      var base = D.icts.filter(function (t) { return ictPassa(t, campo); }), cont = {};
      base.forEach(function (t) { if (campo === 'reg') cont[t.regiao] = (cont[t.regiao] || 0) + 1; else { cont[t.categoria] = (cont[t.categoria] || 0) + 1; if (t.unidadeEmbrapii && t.categoria !== 'Unidade EMBRAPII') cont['Unidade EMBRAPII'] = (cont['Unidade EMBRAPII'] || 0) + 1; } });
      var ks = chaves || Object.keys(cont).sort(function (a, b) { return cont[b] - cont[a]; }), mx = Math.max.apply(null, ks.map(function (k) { return cont[k] || 0; })) || 1;
      return ks.map(function (k) { var n = cont[k] || 0; return '<button type="button" class="barra-l" data-f="' + campo + '" data-v="' + esc(k) + '" aria-pressed="' + emSel(campo, k) + '"><span>' + (campo === 'cat' ? '<i style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:' + corCat(k) + '"></i>' : '') + esc(rot ? rot(k) : k) + '</span><i style="width:' + (n / mx * 100).toFixed(0) + '%"></i><b>' + n + '</b></button>'; }).join('');
    }
    $('kpi-reg').innerHTML = barras('reg', ['Sudeste', 'Sul', 'Nordeste', 'Norte', 'Centro-Oeste']) + (ictEst.uf ? '<button type="button" class="barra-l" data-f="uf" data-v="' + ictEst.uf + '" aria-pressed="true"><span>' + esc(D.ufNomes[ictEst.uf]) + '</span><i style="width:100%"></i><b>×</b></button>' : '');
    $('kpi-cat').innerHTML = barras('cat', null, function (k) { return k.replace('Arranjo de Pesquisa & Inovação', 'Arranjo de P&I').replace('Instituto SENAI de Inovação', 'Instituto SENAI'); });
    document.querySelectorAll('#kpi-cat .barra-l').forEach(function (b) { b.style.gridTemplateColumns = '140px minmax(0,1fr) 36px'; });
    var creds = {}; D.icts.filter(function (t) { return ictPassa(t, 'cred'); }).forEach(function (t) { (t.credenciamentos || []).forEach(function (c) { creds[c] = (creds[c] || 0) + 1; }); });
    $('ict-cred').innerHTML = Object.keys(creds).sort(function (a, b) { return creds[b] - creds[a] || a.localeCompare(b, 'pt-BR'); }).map(function (c) { return '<button type="button" class="chip" data-f="cred" data-v="' + esc(c) + '" aria-pressed="' + emSel('cred', c) + '">' + esc(c) + ' · ' + creds[c] + '</button>'; }).join('');
    $('mapa-legenda').innerHTML = CAT_COR.map(function (c) { return '<span><i style="background:' + c[1] + '"></i>' + {INCT: 'INCT', 'Instituto de Pesquisa': 'Instituto de pesquisa', EMBRAPII: 'EMBRAPII', SENAI: 'SENAI', Arranjo: 'Arranjo de P&I', 'Centro de': 'Centro de inovação'}[c[0]] + '</span>'; }).join('') + '<button type="button" class="btn-azul peq" data-lista style="padding:6px 12px;font-size:12.5px">Ver as ' + l.length + ' ICTs abaixo ↓</button>';
    marcaUFMapa(); matrizICT();
    if (enquadrar && l.length) { var pts = l.filter(function (t) { return t.lat != null; }).map(function (t) { return [t.lat, t.lng]; }); if (pts.length) mapa.fitBounds(pts, {paddingTopLeft: [50, 80], paddingBottomRight: [50, 90], maxZoom: 9}); }
    ictLim = 24; cardsICT();
  }
  /* Lista de cartões embaixo do mapa: acompanha os filtros e, se marcado, a área visível */
  var ictArea = false, ictLim = 24;
  function irParaLista() { var y = $('ict-corpo').getBoundingClientRect().top + window.scrollY - 20; window.scrollTo({top: y, behavior: MOVER ? 'smooth' : 'auto'}); }
  function cartaoICT(t) {
    return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla"><i class="ponto-cat" style="background:' + corCat(t.categoria) + '"></i>' + esc(t.categoria) + '</p><h3><a href="#/icts/' + encodeURIComponent(t.id) + '">' + esc(t.nome) + '</a></h3>' + (t.longo && t.longo !== t.nome ? '<p class="op-inst">' + esc(t.longo) + '</p>' : '') + '</div></div>' +
      '<div class="op-linhas"><div class="op-linha"><span>Onde</span><div class="tags"><span class="tag">' + ICO.geo + esc((t.cidade ? t.cidade + ', ' : '') + t.uf) + '</span></div></div>' +
      ((t.dominios || []).length ? '<div class="op-linha"><span>Domínios</span><div class="tags">' + t.dominios.slice(0, 3).map(function (d) { return '<span class="tag">' + esc(dom(d)) + '</span>'; }).join('') + (t.dominios.length > 3 ? '<span class="tag mais">+' + (t.dominios.length - 3) + '</span>' : '') + '</div></div>' : '') +
      ((t.credenciamentos || []).length ? '<div class="op-linha"><span>Credenciada</span><div class="tags">' + t.credenciamentos.map(function (c) { return '<span class="tag" style="border-color:var(--azul-borda);color:var(--azul-txt)">' + esc(c) + '</span>'; }).join('') + '</div></div>' : '') + '</div>' +
      '<div class="op-base">' + (t.lat != null ? '<button type="button" class="btn-txt" style="position:relative;z-index:2;font-size:13px" data-pin="' + esc(t.id) + '">Mostrar no mapa</button>' : '<span></span>') + (t.site ? '<span class="fonte"><a href="' + esc(t.site) + '" target="_blank" rel="noopener">site oficial ↗</a></span>' : '') + '</div></article>';
  }
  function cardsICT() {
    var box = $('ict-baixo'); if (!mapa) return;
    var l = D.icts.filter(function (t) { return ictPassa(t); });
    if (ictArea) { var b = mapa.getBounds(); l = l.filter(function (t) { return t.lat != null && b.contains([t.lat, t.lng]); }); }
    l.sort(function (a, c) { return (c.destaque ? 1 : 0) - (a.destaque ? 1 : 0) || a.nome.localeCompare(c.nome, 'pt-BR'); });
    var semPino = l.filter(function (t) { return t.lat == null; }).length;
    var onde = ictEst.uf ? ' em <em>' + esc(D.ufNomes[ictEst.uf]) + '</em>' : ictEst.reg ? ' no <em>' + esc(ictEst.reg.split('|').join(' e ')) + '</em>' : '';
    box.innerHTML = '<div class="secao-tit" style="margin-top:0"><h2 class="tit-xl" style="font-size:clamp(24px,2.4vw,34px)">' + l.length + ' ICT' + (l.length === 1 ? '' : 's') + onde + '</h2>' +
      '<label class="uf-nacional"><input type="checkbox" id="ict-area"' + (ictArea ? ' checked' : '') + '>Mostrar só as que estão na área visível do mapa</label></div>' +
      '<p class="contagem" style="margin-top:6px">A lista segue os filtros e o estado escolhido no mapa. Clique no nome para abrir a ficha da ICT.' + (semPino ? ' ' + semPino + (semPino === 1 ? ' ICT não tem' : ' ICTs não têm') + ' coordenada e só aparece' + (semPino === 1 ? '' : 'm') + ' na lista.' : '') + '</p>' +
      (l.length ? '<div class="grade dois" style="margin-top:16px">' + l.slice(0, ictLim).map(cartaoICT).join('') + '</div>' + (l.length > ictLim ? '<button type="button" class="btn-linha" style="margin-top:16px" data-mais-ict>Mostrar mais ' + Math.min(24, l.length - ictLim) + ' de ' + (l.length - ictLim) + '</button>' : '') : '<p class="uf-vazio" style="border:0">Nenhuma ICT com esses filtros.</p>');
    observar('.op.entra', box);
  }
  function listaVisivelAntiga() {
    var box = $('mapa-lista'); if (!mapa || box.hidden) return;
    var b = mapa.getBounds(), l = D.icts.filter(function (t) { return t.lat != null && ictPassa(t) && b.contains([t.lat, t.lng]); });
    box.innerHTML = '<h4><span>' + l.length + ' ICT' + (l.length === 1 ? '' : 's') + ' na área do mapa</span><button type="button" class="fechar" aria-label="Fechar lista">×</button></h4><ul>' +
      l.slice(0, 150).map(function (t) { return '<li data-id="' + esc(t.id) + '"><b>' + esc(t.nome) + '</b><span>' + esc(t.categoria) + ' · ' + esc(t.cidade || '') + ' (' + t.uf + ')</span></li>'; }).join('') + '</ul>' + (l.length > 150 ? '<p style="font-size:12.5px;color:var(--ink-3);margin-top:6px">Aproxime o mapa para ver o restante.</p>' : '');
  }

  /* ================= POR ESTADO ================= */
  var CAMADAS = [['tudo', 'Todas as oportunidades'], ['chamadas', 'Chamadas abertas'], ['instrumentos', 'Instrumentos e leis'], ['eco', 'Inovação aberta'], ['icts', 'ICTs']];
  var ufCamada = 'tudo', ufSel = '', ufNac = false, ufPronto = false;
  function ecoAtivo(e) { return !e.encerramento || dias(e.encerramento) >= 0; }
  function listasUF(uf, nac) {
    return {
      chamadas: ABERTAS.filter(function (c) { return (c.ufs || []).indexOf(uf) >= 0 || (nac && c.abrangencia === 'nacional'); }).sort(function (a, b) { return (a.encerramento || '9999') < (b.encerramento || '9999') ? -1 : 1; }),
      instrumentos: D.instrumentos.filter(function (i) { return (i.ufs || []).indexOf(uf) >= 0 || (nac && i.abrangencia === 'federal'); }),
      eco: D.ecossistema.filter(function (e) { return ecoAtivo(e) && ((e.ufs || []).indexOf(uf) >= 0 || (nac && e.abrangencia === 'Nacional')); }),
      icts: D.icts.filter(function (t) { return t.uf === uf; })
    };
  }
  function contagemUF(cam, nac) {
    var r = {};
    UFS.forEach(function (u) { var l = listasUF(u, nac); r[u] = cam === 'tudo' ? l.chamadas.length + l.instrumentos.length + l.eco.length : l[cam].length; });
    return r;
  }
  function montaEstados() {
    $('uf-camadas').innerHTML = CAMADAS.map(function (c) { return '<button type="button" class="chip" data-cam="' + c[0] + '" aria-pressed="' + (ufCamada === c[0]) + '">' + esc(c[1]) + '</button>'; }).join('');
    $('uf-mapa').innerHTML = svgBrasil('', true) + '<div class="uf-dica" hidden></div>';
    $('uf-camadas').addEventListener('click', function (e) { var b = e.target.closest('[data-cam]'); if (!b) return; ufCamada = b.getAttribute('data-cam'); this.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); pintaUF(); });
    var box = $('uf-mapa'), dica = box.querySelector('.uf-dica');
    box.addEventListener('click', function (e) { var p = e.target.closest('.uf'); if (!p) return; var uf = p.getAttribute('data-uf'); location.hash = ufSel === uf ? '#/estados' : '#/estados/' + uf; });
    box.addEventListener('pointermove', function (e) {
      var p = e.target.closest('.uf'); if (!p) { dica.hidden = true; return; }
      var uf = p.getAttribute('data-uf'), l = listasUF(uf, false), rb = box.getBoundingClientRect();
      dica.innerHTML = '<b>' + esc(D.ufNomes[uf]) + '</b> · ' + l.chamadas.length + ' chamadas · ' + l.instrumentos.length + ' instrumentos · ' + l.eco.length + ' desafios · ' + l.icts.length + ' ICTs';
      dica.style.left = (e.clientX - rb.left) + 'px'; dica.style.top = (e.clientY - rb.top) + 'px'; dica.hidden = false;
    });
    box.addEventListener('pointerleave', function () { dica.hidden = true; });
    $('uf-painel').addEventListener('change', function (e) { if (e.target.id === 'uf-nac') { ufNac = e.target.checked; painelUF(); } });
    $('uf-baixo').addEventListener('click', function (e) {
      var g = e.target.closest('[data-mais-g]'); if (g) { $('uf-baixo').querySelectorAll('[data-extra]').forEach(function (x) { x.hidden = false; x.classList.remove('entra'); }); g.remove(); return; }
      var m = e.target.closest('[data-mais]'); if (m) { m.parentNode.querySelectorAll('.uf-item[hidden]').forEach(function (x) { x.hidden = false; }); m.remove(); }
    });
    $('uf-painel').addEventListener('click', function (e) {
      var b = e.target.closest('[data-ir]'); if (b) { var s = $('uf-sec-' + b.getAttribute('data-ir')); if (s) window.scrollTo({top: s.getBoundingClientRect().top + window.scrollY - 90, behavior: MOVER ? 'smooth' : 'auto'}); return; }
      var m = e.target.closest('[data-mais]'); if (m) { m.parentNode.querySelectorAll('.uf-item[hidden]').forEach(function (x) { x.hidden = false; }); m.remove(); }
      var u = e.target.closest('[data-uf-ir]'); if (u) location.hash = '#/estados/' + u.getAttribute('data-uf-ir');
    });
  }
  function pintaUF() {
    var cont = ufCamada === 'icts' ? (function () { var r = {}; UFS.forEach(function (u) { r[u] = 0; }); D.icts.forEach(function (t) { r[t.uf]++; }); return r; })() : contagemUF(ufCamada, false);
    var mx = Math.max.apply(null, UFS.map(function (u) { return cont[u]; })) || 1;
    $('uf-mapa').querySelectorAll('.uf').forEach(function (p) {
      var u = p.getAttribute('data-uf'), n = Math.min(5, Math.ceil(cont[u] / mx * 5));
      p.style.fill = 'var(--uf-' + n + ')'; p.classList.toggle('sel', u === ufSel);
      var r = $('uf-mapa').querySelector('[data-rot="' + u + '"]'); if (r) r.classList.toggle('claro', n >= 4);
    });
    $('uf-escala').innerHTML = '<span>0</span><i>' + [0, 1, 2, 3, 4, 5].map(function (k) { return '<b style="background:var(--uf-' + k + ')"></b>'; }).join('') + '</i><span>' + mx + ' ' + (CAMADAS.filter(function (c) { return c[0] === ufCamada; })[0][1]).toLowerCase() + ' (sem contar as nacionais)</span>';
  }
  function itemUF(tipo, x, i) {
    var oculto = i >= 6 ? ' hidden' : '';
    if (tipo === 'chamadas') { var st = estado(x); return '<a class="uf-item" href="#/radar/' + encodeURIComponent(x.id) + '"' + oculto + '><b>' + esc(x.titulo) + '</b><small>' + esc(x.agenciaNome) + (x.abrangencia === 'nacional' ? ' · nacional' : '') + (valorCurto(x) ? ' · ' + valorCurto(x) : '') + '</small><span class="status ' + st.cls + '">' + esc(st.rot) + '</span></a>'; }
    if (tipo === 'instrumentos') { var lk = (x.links || [])[0]; return '<a class="uf-item" href="' + (lk ? esc(lk.url) + '" target="_blank" rel="noopener' : '#/instrumentos') + '"' + oculto + '><b>' + esc(x.sigla && x.sigla !== x.nome ? x.sigla + ' · ' + x.nome : x.nome) + '</b><small>' + esc(x.tipo || '') + ' · ' + esc(x.agenciaNome || '') + (x.abrangencia === 'federal' ? ' · federal' : x.abrangencia === 'regional' ? ' · regional' : '') + '</small></a>'; }
    if (tipo === 'eco') return '<a class="uf-item" href="' + esc(x.url || '#/ecossistema') + '" target="_blank" rel="noopener"' + oculto + '><b>' + esc(x.nome) + '</b><small>' + esc(x.promotor || x.tipo || '') + (x.encerramento ? ' · até ' + fdata(x.encerramento) : '') + '</small>' + (x.encerramento ? '' : '<span class="status cont">Contínuo</span>') + '</a>';
    return '';
  }
  function secaoUF(id, titulo, tipo, lista, vazio) {
    return '<section class="uf-secao" id="uf-sec-' + id + '"><h3>' + esc(titulo) + '<em>' + lista.length + '</em></h3>' +
      (lista.length ? lista.map(function (x, i) { return itemUF(tipo, x, i); }).join('') + (lista.length > 6 ? '<button type="button" class="uf-mais" data-mais>Ver todas as ' + lista.length + '</button>' : '') : '<p class="uf-vazio">' + vazio + '</p>') + '</section>';
  }
  function painelUF() {
    var p = $('uf-painel'), baixo = $('uf-baixo');
    if (!ufSel) {
      var cont = contagemUF('tudo', false), ord = UFS.slice().sort(function (a, b) { return cont[b] - cont[a]; }), mx = cont[ord[0]] || 1;
      var nNac = ABERTAS.filter(function (c) { return c.abrangencia === 'nacional'; }).length + D.instrumentos.filter(function (i) { return i.abrangencia === 'federal'; }).length;
      p.innerHTML = '<section class="uf-secao uf-rank-full"><h3>Escolha um estado<em>oportunidades próprias de cada UF</em></h3><div class="barras uf-ranking" style="padding:4px 0 10px">' +
        ord.map(function (u) { return '<button type="button" class="barra-l" style="grid-template-columns:130px minmax(0,1fr) 34px" data-uf-ir="' + u + '"><span>' + esc(D.ufNomes[u]) + '</span><i style="width:' + (cont[u] / mx * 100).toFixed(0) + '%"></i><b>' + cont[u] + '</b></button>'; }).join('') + '</div><p class="uf-nota">Além das próprias, ' + nNac + ' chamadas e instrumentos nacionais valem em todos os estados.</p></section>';
      baixo.innerHTML = '';
      return;
    }
    var l = listasUF(ufSel, ufNac), cats = {};
    l.icts.forEach(function (t) { cats[t.categoria] = (cats[t.categoria] || 0) + 1; });
    var mx2 = Math.max.apply(null, Object.keys(cats).map(function (x) { return cats[x]; }).concat([1]));
    var nome = D.ufNomes[ufSel];
    /* Em cima, ao lado do mapa: o resumo do estado e as ICTs */
    p.innerHTML = '<div class="uf-cab"><p class="olho">' + esc(ufSel) + ' · ' + esc(Object.keys(D.regioes).filter(function (r) { return D.regioes[r].indexOf(ufSel) >= 0; })[0] || '') + '</p><h2>' + esc(nome) + '</h2>' +
      '<label class="uf-nacional" style="margin-top:12px"><input type="checkbox" id="uf-nac"' + (ufNac ? ' checked' : '') + '>Incluir as oportunidades nacionais, que valem em todos os estados</label>' +
      '<div class="uf-resumo"><button type="button" data-ir="ch"><b>' + l.chamadas.length + '</b><span>chamadas abertas</span></button><button type="button" data-ir="in"><b>' + l.instrumentos.length + '</b><span>instrumentos e leis</span></button><button type="button" data-ir="eco"><b>' + l.eco.length + '</b><span>inovação aberta</span></button><button type="button" data-ir="ict"><b>' + l.icts.length + '</b><span>ICTs</span></button></div></div>' +
      '<section class="uf-secao" id="uf-sec-ict"><h3>ICTs no estado<em>' + l.icts.length + '</em></h3><div class="barras" style="padding:4px 0 8px">' +
        Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; }).map(function (k) { return '<a class="barra-l" style="grid-template-columns:170px minmax(0,1fr) 36px;text-decoration:none" href="#/icts?uf=' + ufSel + '&cat=' + encodeURIComponent(k) + '"><span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:' + corCat(k) + '"></i>' + esc(k) + '</span><i style="width:' + (cats[k] / mx2 * 100).toFixed(0) + '%"></i><b>' + cats[k] + '</b></a>'; }).join('') +
        '</div>' + (l.icts.length ? '<div style="display:flex;flex-wrap:wrap;gap:8px 18px;padding:8px 0 10px;border-top:1px solid var(--line)"><a class="btn-txt" href="#/mapa?uf=' + ufSel + '">Ver no Mapa de ICTs →</a><a class="btn-txt" href="#/icts?uf=' + ufSel + '">Ver a lista no Diretório →</a></div>' : '<p class="uf-vazio">Nenhuma ICT cadastrada.</p>') + '</section>';
    /* Embaixo, na largura toda: as oportunidades */
    var ch = l.chamadas;
    baixo.innerHTML = '<div class="secao-tit" style="margin-top:8px"><h2 class="tit-xl" style="font-size:clamp(26px,2.6vw,36px)">Oportunidades em <em>' + esc(nome) + '</em></h2>' +
        (ufNac ? '<span class="contagem">Incluindo as nacionais</span>' : '<span class="contagem">Só as próprias do estado e da região. Marque “Incluir as nacionais” acima para somar as federais.</span>') + '</div>' +
      '<section id="uf-sec-ch" style="margin-top:18px"><h3 class="tit-md" style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">Chamadas abertas <span class="contagem">' + ch.length + '</span></h3>' +
        (ch.length ? '<div class="grade tres" style="margin-top:14px">' + ch.map(function (c, i) { return i >= 6 ? cartaoChamada(c).replace('<article class="op entra"', '<article class="op entra" hidden data-extra') : cartaoChamada(c); }).join('') + '</div>' +
          (ch.length > 6 ? '<button type="button" class="btn-linha peq" style="margin-top:14px" data-mais-g>Ver todas as ' + ch.length + ' chamadas</button>' : '') :
          '<p class="uf-vazio" style="border:0">Nenhuma chamada estadual ou regional aberta agora. Marque “Incluir as nacionais” para ver as que valem aqui também.</p>') + '</section>' +
      '<div class="uf-duas">' +
        secaoUF('in', 'Instrumentos, leis e incentivos', 'instrumentos', l.instrumentos, 'Nenhum instrumento próprio do estado no catálogo. Os federais valem aqui: marque “Incluir as nacionais”.') +
        secaoUF('eco', 'Inovação aberta e ecossistema', 'eco', l.eco, 'Nenhum desafio ou programa local ativo no Atlas.') +
      '</div>';
    observar('.op.entra:not([hidden])', baixo);
  }

  /* ================= Passeio da primeira visita ================= */
  var PASSOS = [
    {t: 'O que é o Atlas da Inovação?', h: '<p>Um mapa do <b>fomento à inovação no Brasil</b>: as chamadas abertas, os instrumentos e leis que financiam P&amp;D, as agências que os operam e as instituições de pesquisa que podem ser parceiras.</p>'},
    {t: 'Chamada ou instrumento?', h: '<p>Um <b>instrumento</b> é a regra permanente, como a Lei do Bem ou a subvenção da FINEP. Uma <b>chamada</b> é a janela com prazo em que esse dinheiro é oferecido.</p><div class="tour-dupla"><div><h5>Instrumento</h5>Existe o ano todo. Diz quem pode, quanto e em que condições.</div><div class="forte"><h5>Chamada</h5>Tem data para fechar. É no Radar que você acompanha.</div></div>'},
    {t: 'Radar: filtre e decida rápido', h: '<p>No Radar, a coluna da esquerda filtra por <b>situação, estado, domínio, agência, tipo de apoio e valor</b>. Os selos “Fechando em breve” e “Novo” mostram o que pede atenção. Cada cartão leva à ficha e à <b>fonte oficial</b>.</p>'},
    {t: 'Dois mapas', h: '<p><b>Por estado</b>: clique numa UF para ver tudo o que vale ali, somado ao que é nacional. <b>Mapa de ICTs</b>: encontre universidades, institutos e Unidades EMBRAPII por região, tipo e domínio.</p>'},
    {t: 'Leve o que interessa', h: '<p>De onde vêm os dados? Veja a <a href="#/metodologia" data-t="fim">Metodologia e fontes</a>.</p><p>Marque a <b>estrela</b> para guardar uma chamada, use “Copiar link desta busca” para mandar um filtro pronto a alguém e troque entre os temas <b>Claro e Escuro</b> no canto superior direito.</p>'}
  ];
  var passo = 0;
  function tour(abrir) {
    var t = $('tour');
    if (!abrir) { t.hidden = true; try { localStorage.setItem('atlas-tour-v2', 'visto'); } catch (e) {} return; }
    var p = PASSOS[passo];
    $('tour-caixa').innerHTML = '<div class="tour-topo"><span>' + (passo + 1) + '/' + PASSOS.length + '</span><button type="button" class="fechar" data-t="fim" aria-label="Fechar">×</button></div><h2 id="tour-tit">' + p.t + '</h2>' + p.h +
      '<div class="tour-base"><div class="tour-pontos">' + PASSOS.map(function (x, i) { return '<i class="' + (i === passo ? 'on' : '') + '"></i>'; }).join('') + '</div><div class="tour-btns">' +
      (passo ? '<button type="button" class="btn-linha peq" data-t="volta">Voltar</button>' : '<button type="button" class="btn-linha peq" data-t="fim">Pular</button>') +
      '<button type="button" class="btn-azul peq" data-t="' + (passo < PASSOS.length - 1 ? 'vai' : 'fim') + '">' + (passo < PASSOS.length - 1 ? 'Próximo' : 'Conhecer o Atlas') + '</button></div></div>';
    t.hidden = false; var f = t.querySelector('[data-t="vai"],[data-t="fim"].btn-azul'); if (f) f.focus();
  }
  $('tour').addEventListener('click', function (e) {
    if (e.target === this) return tour(false);
    var b = e.target.closest('[data-t]'); if (!b) return; var a = b.getAttribute('data-t');
    if (a === 'fim') tour(false); else { passo += a === 'vai' ? 1 : -1; tour(true); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('tour').hidden) tour(false); });
  document.querySelectorAll('[data-tour]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); passo = 0; tour(true); }); });

  /* ================= Metodologia e fontes (#/metodologia) ================= */
  window.AV2_TELAS = window.AV2_TELAS || {};
  window.AV2_TELAS.metodologia = function (A, sub, q, el, mesma) {
    if (mesma) return;
    var e = A.esc, hoje = A.fdata(A.D.geradoEm);
    function sec(id, tit, corpo) { return '<section class="met-sec" id="met-' + id + '"><h2 class="tit-md">' + tit + '</h2>' + corpo + '</section>'; }
    el.innerHTML = '<div class="wrap met"><p class="migalha"><a href="#/">Visão geral</a> / Metodologia e fontes</p>' +
      '<div class="bloco ficha-cab"><p class="olho">Metodologia e fontes</p><h1>Como os números do Atlas são feitos</h1>' +
      '<p class="ag">O Atlas junta bases públicas oficiais, organiza e cruza as informações. Esta página diz o que vem direto da fonte, o que o Atlas infere e onde estão os limites. Dados do Atlas de ' + e(hoje) + '.</p>' +
      '<nav class="met-ind" aria-label="Nesta página"><a href="#met-fontes" data-met>Fontes</a><a href="#met-inferencias" data-met>Inferências</a><a href="#met-empresas" data-met>Identificação das empresas</a><a href="#met-valores" data-met>Natureza dos valores</a><a href="#met-datas" data-met>Datas</a><a href="#met-limites" data-met>Limitações</a></nav></div>' +
      sec('fontes', 'De onde vêm os dados', '<p>Os dados vêm de <b>bases e portais públicos oficiais</b>: leis e atos normativos federais, portais do MCTI, FINEP, BNDES, EMBRAPII, CNPq, CAPES, ANEEL, ANP, ANTT, INPI, SEBRAE, SENAI, CONFAP e das FAPs estaduais; malha das UFs do IBGE. Cada chamada, instrumento e empresa traz o link da fonte oficial. Valores e prazos devem ser confirmados no canal oficial antes de qualquer submissão.</p>') +
      sec('inferencias', 'O que o Atlas infere', '<p>Alguns campos não existem nas bases de origem. O Atlas os deriva, e por isso podem conter erro:</p><ul class="met-lista">' +
        '<li><b>Áreas tecnológicas do DNA da Inovação.</b> Inferidas por <b>palavras-chave</b> encontradas em títulos de projetos, áreas e temas declarados. Um projeto pode cair em mais de uma área, ou em nenhuma, se o título for genérico.</li>' +
        '<li><b>Vínculo de empresas.</b> Feito pela <b>raiz do CNPJ</b> e, quando a base não traz CNPJ, pelo <b>nome</b> (detalhes abaixo).</li>' +
        '<li><b>Natureza do recurso</b> (reembolsável, não reembolsável, misto, incentivo fiscal, a confirmar). Classificada pelo Atlas a partir do instrumento e do edital; quando não há como afirmar, aparece como a confirmar.</li>' +
        '<li><b>Domínios tecnológicos</b> de chamadas, instrumentos e ICTs. Atribuídos por tema e palavras-chave, para permitir filtros e cruzamentos.</li></ul>') +
      sec('empresas', 'Como as empresas são identificadas', '<ul class="met-lista"><li>Quando a base traz o CNPJ, a empresa é identificada pela <b>raiz do CNPJ</b> (os 8 primeiros dígitos), o que reúne matriz e filiais.</li><li>Quando a base <b>não traz CNPJ</b>, a identificação é pelo <b>nome</b>. Isso pode gerar imprecisão: nomes parecidos podem ser confundidos e o mesmo grupo pode aparecer com grafias diferentes.</li><li><b>Grupos curados</b> reúnem várias raízes de CNPJ numa só entidade (por exemplo, empresas de um mesmo grupo econômico), por decisão editorial do Atlas.</li></ul>') +
      sec('valores', 'Os valores têm naturezas diferentes e não são somados', '<p>Na ficha da empresa, cada valor vem de uma fonte com significado próprio. Por isso o Atlas <b>não soma</b> os valores entre fontes:</p><div class="met-grade">' +
        '<div class="bloco"><h4>Obrigação regulatória (ANP)</h4><p>O que a empresa investiu por exigência da agência, na cláusula de PD&amp;I.</p></div>' +
        '<div class="bloco"><h4>Contratado (FINEP)</h4><p>Valor de contrato de fomento.</p></div>' +
        '<div class="bloco"><h4>Previsto (ANEEL e ANTT)</h4><p>Orçamento declarado dos projetos, não o gasto efetivo.</p></div>' +
        '<div class="bloco"><h4>Financiamento (BNDES)</h4><p>Crédito contratado ou desembolsado.</p></div>' +
        '<div class="bloco"><h4>EMBRAPII</h4><p>A base não traz valor por projeto; aparecem a contagem de projetos e as unidades.</p></div></div>') +
      sec('datas', 'Datas das bases', '<ul class="met-lista"><li>Visão geral e Radar: dados do Atlas de <b>' + e(hoje) + '</b>. O Radar é revisto toda semana e a cada edital novo.</li><li>Propriedade intelectual (INPI): base gerada em <b>29/08/2026</b>.</li><li>Redata: dados de <b>06/10/2026</b>.</li><li>Compras públicas e agenda de eventos: atualização de <b>22/10/2026</b>; histórico de compras de inovação gerado em <b>10/11/2026</b>.</li><li>Demais bases (DNA da Inovação, FNDCT, ANEEL, ANP, EMBRAPII, ICTs): a <b>data de corte aparece na própria tela</b>; bases oficiais são retratos de uma data e podem ter mudado depois dela.</li></ul>') +
      sec('limites', 'Limitações', '<ul class="met-lista"><li>As bases oficiais têm lacunas, atrasos e erros de preenchimento que o Atlas não corrige na origem.</li><li>Inferências por palavra-chave e por nome não substituem a conferência na fonte.</li><li>O Atlas orienta a busca e a decisão, mas <b>não é fonte oficial</b> nem aconselhamento jurídico ou financeiro: confirme regras, valores e prazos no edital e no órgão responsável.</li><li>Achou um erro? Aponte ao responsável pelo Atlas para que seja corrigido.</li></ul>') +
      '<p class="met-fim"><a class="btn-linha peq" href="#/">Voltar à Visão geral</a></p></div>';
    el.querySelector('.met-ind').addEventListener('click', function (ev) {
      var a = ev.target.closest('a[data-met]'); if (!a) return; ev.preventDefault();
      var alvo = document.getElementById(a.getAttribute('href').slice(1)); if (alvo) window.scrollTo({top: alvo.getBoundingClientRect().top + window.scrollY - 80, behavior: MOVER ? 'smooth' : 'auto'});
    });
  };
  /* Links externos abrem em nova aba, em qualquer tela */
  (function () {
    var agendado = false;
    function externos() {
      agendado = false;
      document.querySelectorAll('a[href^="http"]:not([target])').forEach(function (a) { try { if (new URL(a.href).host !== location.host) { a.target = '_blank'; a.rel = 'noopener'; } } catch (er) {} });
    }
    new MutationObserver(function () { if (!agendado) { agendado = true; requestAnimationFrame(externos); } }).observe(document.body, {childList: true, subtree: true});
    externos();
  })();

  /* ================= Rotas ================= */
  var NOMES = {instrumentos: 'Instrumentos', agentes: 'Financiadores', ecossistema: 'Ecossistema', agenda: 'Agenda', compras: 'Compras', icts: 'ICTs', dna: 'DNA', pi: 'PI', guia: 'Guia', simulador: 'Simulador', trl: 'TRL & AD²', glossario: 'Dicionário', novidades: 'Novidades'};
  var hubPronto = false;
  /* Ferramentas compartilhadas com as telas da rodada 2 (assets/atlas-v2-telas.js) */
  var A = {NAT: NAT, NAT_ROT: NAT_ROT, natTag: natTag, D: D, esc: esc, br: br, fdata: fdata, dias: dias, sem: sem, dom: dom, mi: mi, valorCurto: valorCurto, estado: estado, breve: breve, novo: novo,
    cartaoChamada: cartaoChamada, baixaIcs: baixaIcs, dataIcs: dataIcs, corta: corta, ICO: ICO, favorito: favorito, FAVS: FAVS, observar: observar, svgBrasil: svgBrasil, corCat: corCat, ABERTAS: ABERTAS, UFS: UFS, MOVER: MOVER, HOJE: HOJE, largo: largo,
    campo: function (cv) { var c = new Campo(cv, 31 + campos.length * 101, {cx: 0.3, cy: 0.5, alfa: 0.7, marinho: true}); campos.push(c); if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (en) { c.ativo = en.isIntersecting; }); }).observe(cv); else c.ativo = true; c.desenha(0); }};
  function rota() {
    var h = (location.hash || '').replace(/^#\/?/, ''), q = '';
    if (h.indexOf('?') >= 0) { q = h.slice(h.indexOf('?') + 1); h = h.slice(0, h.indexOf('?')); }
    var partes = h.split('/'), base = partes[0], sub = decodeURIComponent(partes[1] || '');
    /* Endereços do Atlas atual continuam funcionando */
    var ANTIGAS = {ict: 'icts', instrumento: 'instrumentos', chamada: 'radar', agente: 'agentes', home: ''};
    if (Object.prototype.hasOwnProperty.call(ANTIGAS, base)) { location.replace('#/' + ANTIGAS[base] + (partes[1] ? '/' + partes[1] : '') + (q ? '?' + q : '')); return; }
    var TELAS = window.AV2_TELAS || {};
    var vista = base === '' ? 'hub' : base === 'radar' ? (sub ? 'ficha' : 'radar') : base === 'mapa' ? 'mapa' : base === 'estados' ? 'estados' : TELAS[base] ? 'tela' : 'fora';
    var mesma = document.querySelector('[data-view="' + vista + '"]:not([hidden])');
    document.querySelectorAll('[data-view]').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== vista; });
    var ativo = vista === 'ficha' ? 'radar' : base;
    document.querySelectorAll('.lat-nav [data-rota]').forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('data-rota') === ativo); });
    if (vista === 'hub' && !hubPronto) { hubPronto = true; montaHub(); }
    if (vista === 'fora') $('fora-tit').textContent = 'Página não encontrada';
    if (vista === 'tela') { var mesmaTela = $('tela').getAttribute('data-base') === base && $('tela').getAttribute('data-sub') === sub; $('tela').setAttribute('data-base', base); $('tela').setAttribute('data-sub', sub); TELAS[base](A, sub, q, $("tela"), mesmaTela); mesma = mesmaTela ? true : null; }
    if (vista === 'radar') {
      if (!radarPronto) { radarPronto = true; montaNumRadar(); linhaDoTempo(); }
      lerQuery(q); atualizaRadar(false);
    }
    if (vista === 'ficha') montaFicha(sub, q);
    if (vista === 'estados') {
      if (!ufPronto) { ufPronto = true; montaEstados(); }
      ufSel = UFS.indexOf(sub.toUpperCase()) >= 0 ? sub.toUpperCase() : '';
      pintaUF(); painelUF();
    }
    /* trocar de sub-aba (Compras, Internacional) não volta ao topo */
    var soSub = window.__ultBase === base && (base === 'internacional' || base === 'compras');
    window.__ultBase = base;
    if (!mesma && !soSub) window.scrollTo(0, 0);
    if (vista === 'mapa') {
      iniciaMapa();
      if (mapa) {
        setTimeout(function () { mapa.invalidateSize(); }, 30);
        var m = /(?:^|&)uf=([A-Z]{2})/.exec(q); ictEst.uf = m ? m[1] : ''; if (ictEst.uf) ictEst.reg = '';
        filtraICTs(!!ictEst.uf);
        var mi2 = /(?:^|&)ict=([^&]+)/.exec(q), pino = mi2 && marcadores[decodeURIComponent(mi2[1])];
        if (pino && camada) setTimeout(function () { camada.zoomToShowLayer(pino, function () { pino.openPopup(); }); }, 350);
      }
    }
    campos.forEach(function (c) { c.ajusta(); c.desenha(performance.now()); });
    if (!mesma) { var t = document.querySelector('[data-view="' + vista + '"] [data-embaralhar]'); if (t) embaralhar(t); }
    coletar(); aoRolar();
    observar('[data-view]:not([hidden]) [data-contar]');
  }
  window.addEventListener('hashchange', rota);
  rota();
  var vistoTour = null; try { vistoTour = localStorage.getItem('atlas-tour-v2'); } catch (e) {}
  if (!vistoTour) setTimeout(function () { passo = 0; tour(true); }, 900);
})();
