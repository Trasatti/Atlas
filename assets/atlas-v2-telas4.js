/* Atlas v2 · rodada 4 — busca geral, Sapiens, Internacional, projetos financiados/executados, executor e consulta de PI. */
(function () {
  'use strict';
  var T = window.AV2_TELAS, U = window.AV2_UTIL, D = window.ATLAS2, IDX = window.ATLAS2_IDX || {dna: []};
  var SAPIENS = 'https://chatgpt.com/g/g-688a3901604c81918f8b617c27418da8-sapiens';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function sem(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function br(n) { return Number(n || 0).toLocaleString('pt-BR'); }
  function reais(v) { if (!v) return ''; return v >= 1e9 ? 'R$ ' + (v / 1e9).toLocaleString('pt-BR', {maximumFractionDigits: 1}) + ' bi' : v >= 1e6 ? 'R$ ' + (v / 1e6).toLocaleString('pt-BR', {maximumFractionDigits: 1}) + ' mi' : 'R$ ' + Math.round(v / 1e3).toLocaleString('pt-BR') + ' mil'; }
  function carrega(src, teste, feito) { if (teste()) return feito(); var s = document.createElement('script'); s.src = src; s.onload = feito; document.body.appendChild(s); }

  /* ---------- Executor: link para a ficha da ICT ou para a página do executor ---------- */
  var ICT_NOME = {};
  D.icts.forEach(function (t) { [t.nome, t.longo].forEach(function (n) { if (n && !ICT_NOME[sem(n)]) ICT_NOME[sem(n)] = t; }); });
  function ictDe(nome) { var k = sem(nome); return ICT_NOME[k] || (k.indexOf(' ') > 0 && k.split(' ')[0].length >= 3 ? ICT_NOME[k.split(' ')[0]] : null) || null; }
  window.AV2_execLink = function (A, nome) { var t = ictDe(nome); return '<a href="' + (t ? '#/icts/' + encodeURIComponent(t.id) : '#/executor/' + encodeURIComponent(nome)) + '">' + esc(nome) + '</a>'; };

  /* ---------- Sapiens: copia o resumo e abre o agente ---------- */
  window.AV2_abreSapiens = function (texto, botao) {
    function abre() { window.open(SAPIENS, '_blank', 'noopener'); if (botao) { var t = botao.textContent; botao.textContent = 'Resumo copiado: cole no Sapiens ✓'; setTimeout(function () { botao.textContent = t; }, 3500); } }
    if (texto && navigator.clipboard) navigator.clipboard.writeText(texto).then(abre, abre); else abre();
  };

  /* ================= BUSCA GERAL ================= */
  var NOME_AG = {}; D.agencias.forEach(function (a) { NOME_AG[a.id] = a.nome; });
  var TELAS_IDX = [['Radar de Fomento', 'radar'], ['Oportunidades por estado', 'estados'], ['Inovação aberta', 'ecossistema'], ['Compras públicas', 'compras'], ['Internacional', 'internacional'], ['Agenda de inovação', 'agenda'], ['Instrumentos', 'instrumentos'], ['Financiadores', 'agentes'], ['Simulador de Fomentos', 'simulador'], ['Sapiens, agente de IA', 'sapiens'], ['DNA da Inovação', 'dna'], ['Propriedade intelectual', 'pi'], ['Mapa de ICTs', 'mapa'], ['Diretório de ICTs', 'icts'], ['Guia do Bom Projeto', 'guia'], ['TRL & AD²', 'trl'], ['Dicionário da Inovação', 'glossario']];
  var BASE = null;
  function base() {
    if (BASE) return BASE;
    var B = [];
    function add(g, t, s, h, extra, peso) { B.push({g: g, t: t, s: s || '', h: h, k: sem(t + ' ' + (s || '') + ' ' + (extra || '')), kt: sem(t), p: peso || 0}); }
    TELAS_IDX.forEach(function (x) { add('Telas do Atlas', x[0], 'Abrir a tela', '#/' + x[1], '', 1); });
    D.agencias.forEach(function (a) { add('Financiadores', a.nome, a.tipo + ' · ' + a.vinculo, '#/agentes/' + encodeURIComponent(a.id), a.id, 3); });
    D.chamadas.forEach(function (c) { add('Chamadas', c.titulo, (c.agenciaNome || '') + (c.status === 'aberta' ? ' · aberta' : c.status === 'em-breve' ? ' · em breve' : ' · encerrada'), '#/radar/' + encodeURIComponent(c.id), [c.agencia, (c.tags || []).join(' '), c.categoria].join(' '), c.status === 'aberta' ? 2 : 0); });
    D.instrumentos.forEach(function (i) { add('Instrumentos', (i.sigla && i.sigla !== i.nome ? i.sigla + ' · ' : '') + i.nome, (i.agenciaNome || '') + ' · ' + (i.tipo || ''), '#/instrumentos/' + encodeURIComponent(i.id), [i.agencia, (i.tags || []).join(' '), i.base].join(' '), 2); });
    IDX.dna.forEach(function (e) { add('Empresas (DNA)', e[1], (e[2] ? e[2] + ' · ' : '') + br(e[3]) + ' projeto' + (e[3] === 1 ? '' : 's'), '#/dna/' + encodeURIComponent(e[0]), '', e[3] > 20 ? 1 : 0); });
    D.icts.forEach(function (t) { add('ICTs', t.nome + (t.longo && t.longo !== t.nome ? ' · ' + t.longo : ''), t.categoria + ' · ' + (t.cidade ? t.cidade + ', ' : '') + t.uf, '#/icts/' + encodeURIComponent(t.id), (t.credenciamentos || []).join(' '), 1); });
    D.ecossistema.forEach(function (e) { add('Inovação aberta', e.nome, e.promotor || '', e.url || '#/ecossistema', e.tipo, 0); });
    (D.internacional.programas || []).forEach(function (x) { add('Internacional', x.nome_pt || x.programa, x.pais + ' · ' + x.orgao, '#/internacional/programas?q=' + encodeURIComponent(x.nome_pt || x.programa), x.programa, 0); });
    (D.internacional.incentivos || []).forEach(function (x) { add('Internacional', x.nome_pt || x.nome_oficial, x.pais + ' · incentivo fiscal', '#/internacional/incentivos?q=' + encodeURIComponent(x.nome_pt || x.nome_oficial), x.nome_oficial, 0); });
    (D.dicionario || []).forEach(function (v) { add('Dicionário', v.termo, v.sigla || '', '#/glossario?q=' + encodeURIComponent(v.termo), '', 0); });
    BASE = B; return B;
  }
  var ORDEM_G = ['Telas do Atlas', 'Financiadores', 'Chamadas', 'Instrumentos', 'Empresas (DNA)', 'ICTs', 'Inovação aberta', 'Internacional', 'Dicionário'];
  function busca(q) {
    var qs = sem(q).trim(); if (!qs) return [];
    var ts = qs.split(/\s+/);
    return base().filter(function (x) { return ts.every(function (t) { return x.k.indexOf(t) >= 0; }); }).map(function (x) {
      var sc = x.p + (x.kt === qs ? 50 : x.kt.indexOf(qs) === 0 ? 20 : x.kt.indexOf(qs) >= 0 ? 10 : 0); return {x: x, sc: sc};
    }).sort(function (a, b) { return b.sc - a.sc || a.x.t.length - b.x.t.length; }).map(function (r) { return r.x; });
  }
  function realce(t, q) { var i = sem(t).indexOf(sem(q).trim()); if (i < 0 || !q.trim()) return esc(t); var n = q.trim().length; return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + n)) + '</mark>' + esc(t.slice(i + n)); }
  function porGrupo(l) { var g = {}; l.forEach(function (x) { (g[x.g] = g[x.g] || []).push(x); }); return g; }
  function itemHTML(x, q, cls) { var ext = /^https?:/.test(x.h); return '<a class="' + cls + '" href="' + esc(x.h) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' role="option"><b>' + realce(x.t, q) + '</b><small>' + esc(x.s) + '</small>' + (ext ? '<em>↗</em>' : '') + '</a>'; }
  function iniciaBusca() {
    var inp = document.getElementById('bg-q'), res = document.getElementById('bg-res'), sel = -1;
    if (!inp) return;
    function fecha() { res.hidden = true; inp.setAttribute('aria-expanded', 'false'); sel = -1; }
    function mostra() {
      var q = inp.value; if (!q.trim()) return fecha();
      var l = busca(q), g = porGrupo(l);
      res.innerHTML = (l.length ? ORDEM_G.filter(function (k) { return g[k]; }).map(function (k) { return '<div class="bg-grupo"><h5><span>' + esc(k) + '</span><span>' + g[k].length + '</span></h5>' + g[k].slice(0, k === 'Telas do Atlas' ? 2 : 4).map(function (x) { return itemHTML(x, q, 'bg-it'); }).join('') + '</div>'; }).join('') : '<p class="bg-vazio">Nada encontrado para “' + esc(q) + '”.</p>') +
        '<a class="bg-todos" href="#/busca?q=' + encodeURIComponent(q.trim()) + '">Ver todos os resultados' + (l.length ? ' (' + br(l.length) + ')' : '') + ', incluindo os projetos financiados →</a>';
      res.hidden = false; inp.setAttribute('aria-expanded', 'true'); sel = -1;
    }
    var tq; inp.addEventListener('input', function () { clearTimeout(tq); tq = setTimeout(mostra, 120); });
    inp.addEventListener('focus', function () { if (inp.value.trim()) mostra(); });
    inp.addEventListener('keydown', function (e) {
      var its = [].slice.call(res.querySelectorAll('.bg-it,.bg-todos'));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (res.hidden) mostra(); sel = Math.max(0, Math.min(its.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1))); its.forEach(function (a, i) { a.classList.toggle('sel', i === sel); }); if (its[sel]) its[sel].scrollIntoView({block: 'nearest'}); }
      else if (e.key === 'Enter') { e.preventDefault(); if (its[sel]) its[sel].click(); else if (inp.value.trim()) { location.hash = '#/busca?q=' + encodeURIComponent(inp.value.trim()); } fecha(); inp.blur(); }
      else if (e.key === 'Escape') { fecha(); inp.blur(); }
    });
    res.addEventListener('click', function (e) { if (e.target.closest('a')) setTimeout(fecha, 0); });
    document.addEventListener('click', function (e) { if (!e.target.closest('#busca-geral')) fecha(); });
    document.addEventListener('keydown', function (e) { if (e.key === '/' && !/input|textarea|select/i.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); inp.focus(); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciaBusca); else iniciaBusca();

  /* ================= PROJETOS (financiados e executados) ================= */
  function carregaProj(feito) { carrega('assets/atlas-v2-projetos.js?v=r91', function () { return !!window.ATLAS2_PROJ; }, feito); }
  var DNA_NOME = {}; IDX.dna.forEach(function (e) { DNA_NOME[e[0]] = e[1]; });
  function projetosBloco(A, el, filtro, opt) {
    opt = opt || {};
    el.innerHTML = '<div class="carregando" style="padding:30px 0"><i></i><span>Carregando a base de projetos…</span></div>';
    carregaProj(function () {
      var P = window.ATLAS2_PROJ, F = P.fontes, rows = P.r.filter(filtro);
      var st = {q: opt.q || '', fonte: '', ordem: 'ano', lim: 30};
      if (!rows.length) { el.innerHTML = '<p class="txt">' + esc(opt.vazio || 'Nenhum projeto nas bases do Atlas.') + '</p>'; return; }
      var fontes = {}; rows.forEach(function (r) { fontes[r[0]] = (fontes[r[0]] || 0) + 1; });
      var soma = rows.reduce(function (s, r) { return s + (r[5] || 0); }, 0);
      el.innerHTML = '<div class="proj-cab"><div class="proj-resumo"><div><span>Projetos</span><b>' + br(rows.length) + '</b></div>' + (soma ? '<div><span>Valor somado</span><b>' + reais(soma) + '</b></div>' : '') + '<div><span>Bases</span><b style="font-size:15px;padding-top:5px">' + Object.keys(fontes).map(function (k) { return F[k].nome; }).join(', ') + '</b></div></div></div>' +
        '<div class="proj-ferr"><div class="busca"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><label class="sr">Buscar nos projetos</label><input type="search" data-pq placeholder="Buscar no título, empresa ou executor" value="' + esc(st.q) + '" autocomplete="off"></div>' +
        '<label class="ordem">Ordenar <select data-pord><option value="ano">Mais recentes</option><option value="valor">Maior valor</option></select></label></div>' +
        (Object.keys(fontes).length > 1 ? '<div class="tags" style="margin-top:10px" data-pfontes></div>' : '') + '<div data-plista></div>' +
        '<p class="nota-base">Fontes: ' + Object.keys(fontes).map(function (k) { var m = F[k].meta || {}; return F[k].nome + ' (' + esc(m.fonte || '') + (m.gerado || m.data_dos_dados ? ', dados de ' + A.fdata(m.gerado || m.data_dos_dados) : '') + ')'; }).join('; ') + (fontes[5] ? '. A base FNDCT embutida no Atlas é um recorte dos ' + br((F[5].meta || {}).embedded) + ' maiores projetos de ' + br((F[5].meta || {}).total_rows) + '.' : '.') + (fontes[0] && fontes[5] ? ' FINEP e FNDCT são bases diferentes e podem repetir o mesmo projeto: o valor somado pode contar duas vezes.' : '') + '</p>';
      function desenha() {
        var qn = sem(st.q).trim(), ts = qn ? qn.split(/\s+/) : [];
        var l = rows.filter(function (r) { if (st.fonte !== '' && String(r[0]) !== st.fonte) return false; if (!ts.length) return true; var k = sem([r[1], r[2], r[3], r[8], r[7]].join(' ')); return ts.every(function (t) { return k.indexOf(t) >= 0; }); });
        l.sort(st.ordem === 'valor' ? function (a, b) { return (b[5] || 0) - (a[5] || 0); } : function (a, b) { return (b[4] || 0) - (a[4] || 0); });
        var pf = el.querySelector('[data-pfontes]'); if (pf) pf.innerHTML = ['<button type="button" class="chip" data-pf="" aria-pressed="' + (st.fonte === '') + '">Todas · ' + br(rows.length) + '</button>'].concat(Object.keys(fontes).map(function (k) { return '<button type="button" class="chip" data-pf="' + k + '" aria-pressed="' + (st.fonte === k) + '">' + F[k].nome + ' · ' + br(fontes[k]) + '</button>'; })).join('');
        el.querySelector('[data-plista]').innerHTML = (qn || st.fonte !== '' ? '<p class="contagem" style="margin-top:12px"><b>' + br(l.length) + '</b> projeto' + (l.length === 1 ? '' : 's') + '</p>' : '') +
          (l.length ? '<table class="tabela"><thead><tr><th>Base</th><th>Projeto</th>' + (opt.semEmpresa ? '' : '<th>Empresa</th>') + (opt.semExecutor ? '' : '<th>Executor</th>') + '<th>Ano</th><th>Valor</th></tr></thead><tbody>' +
            l.slice(0, st.lim).map(function (r) {
              var emp = r[2] ? (r[9] && r[9].length ? '<a href="#/dna/' + encodeURIComponent(r[9][0]) + '">' + esc(r[2]) + '</a>' : esc(r[2])) : (r[9] && r[9].length ? '<a href="#/dna/' + encodeURIComponent(r[9][0]) + '">' + esc(DNA_NOME[r[9][0]] || r[9][0]) + '</a>' : '');
              var exe = r[3] ? (r[10] ? '<a href="#/icts/' + encodeURIComponent(r[10]) + '">' + esc(r[3]) + '</a>' : '<a href="#/executor/' + encodeURIComponent(r[3]) + '">' + esc(r[3]) + '</a>') : '';
              return '<tr><td><span class="selo-t">' + F[r[0]].nome + '</span></td><td>' + esc(r[1]) + (r[8] || r[7] ? '<br><small>' + esc([r[8], r[7]].filter(Boolean).join(' · ')) + '</small>' : '') + '</td>' + (opt.semEmpresa ? '' : '<td>' + emp + '</td>') + (opt.semExecutor ? '' : '<td>' + exe + '</td>') + '<td>' + esc(r[4] || '') + '</td><td style="white-space:nowrap">' + reais(r[5]) + '</td></tr>';
            }).join('') + '</tbody></table>' + (l.length > st.lim ? '<button type="button" class="btn-linha peq" style="margin-top:12px" data-pmais>Mostrar mais ' + Math.min(30, l.length - st.lim) + ' de ' + br(l.length - st.lim) + '</button>' : '') : '<p class="txt">Nenhum projeto com esse filtro.</p>');
      }
      var tq; el.oninput = function (e) { if (e.target.hasAttribute('data-pq')) { var v = e.target.value; clearTimeout(tq); tq = setTimeout(function () { st.q = v; st.lim = 30; desenha(); }, 200); } };
      el.onchange = function (e) { if (e.target.hasAttribute('data-pord')) { st.ordem = e.target.value; desenha(); } };
      el.onclick = function (e) { var f = e.target.closest('[data-pf]'); if (f) { st.fonte = f.getAttribute('data-pf'); st.lim = 30; desenha(); return; } if (e.target.closest('[data-pmais]')) { st.lim += 30; desenha(); } };
      desenha();
    });
  }

  /* Financiador: projetos que pagou */
  var agOrig = T.agentes;
  T.agentes = function (A, sub, q, box, mesma) {
    agOrig.apply(this, arguments);
    if (!sub) return;
    var f = box.querySelector('.ficha'); if (!f) return;
    var tem = ['finep', 'embrapii', 'anp', 'aneel', 'antt', 'cnpq'].indexOf(sub) >= 0;
    var div = document.createElement('div');
    div.innerHTML = '<div class="secao-tit"><h2 class="tit-md">Projetos que ' + esc(NOME_AG[sub] || sub) + ' apoiou</h2></div><div class="bloco" data-proj></div>';
    f.appendChild(div);
    if (tem) projetosBloco(A, div.querySelector('[data-proj]'), function (r) { return r[11] === sub; });
    else div.querySelector('[data-proj]').innerHTML = '<p class="txt">O Atlas ainda não tem a lista de projetos deste financiador. Hoje há bases de projetos de FINEP, EMBRAPII, ANP, ANEEL, ANTT e FNDCT (FINEP e CNPq).</p>';
  };
  /* ICT: projetos que executou */
  var ictOrig = T.icts;
  T.icts = function (A, sub, q, box, mesma) {
    ictOrig.apply(this, arguments);
    if (!sub) return;
    var t = D.icts.filter(function (x) { return x.id === sub; })[0], f = box.querySelector('.ficha'); if (!t || !f) return;
    var nomes = [t.nome, t.longo].filter(Boolean).map(sem);
    /* Regras do Atlas: EMBRAPII pelo código da unidade (id já gravado na linha, r[10]); ANP pelo nível da instituição, só por nome exato ou por sigla quando a ICT é a instituição inteira (projetosAnpDe). FINEP: id ou nome do executor. */
    function nk(s) { return sem(s).replace(/[^a-z0-9]/g, ''); }
    var kIct = nk(t.nome), aIct = nk(String(t.nome || '').split(/[–—-]/)[0]), plain = !/[–—-]/.test(t.nome || '');
    var iAnp = -1; ((window.ATLAS2_PROJ && window.ATLAS2_PROJ.fontes) || []).forEach(function (x, i) { if (x.id === 'anp') iAnp = i; });
    function passaIct(r) {
      if (iAnp < 0 && window.ATLAS2_PROJ) ((window.ATLAS2_PROJ.fontes) || []).forEach(function (x, i) { if (x.id === 'anp') iAnp = i; });
      if (r[0] === iAnp) { if (!r[3]) return false; var kk = nk(r[3]); return kk === kIct || (plain && aIct.length >= 3 && nk(String(r[3]).split(/[–—-]/)[0]) === aIct); }
      if (r[11] === 'embrapii') return r[10] === t.id;
      return r[10] === t.id || (r[3] && nomes.indexOf(sem(r[3])) >= 0);
    }
    var div = document.createElement('div');
    div.innerHTML = '<div class="secao-tit"><h2 class="tit-md">Projetos executados pela ' + esc(t.nome) + '</h2></div><div class="bloco" data-proj></div>';
    f.appendChild(div);
    projetosBloco(A, div.querySelector('[data-proj]'), passaIct, {semExecutor: true, vazio: 'Nenhum projeto desta ICT nas bases de EMBRAPII, ANP e FINEP.'});
  };
  /* Executor sem ficha de ICT (universidades, fundações de apoio, institutos) */
  T.executor = function (A, sub, q, box) {
    var nome = sub || '', t = ictDe(nome);
    if (t) { location.replace('#/icts/' + encodeURIComponent(t.id)); return; }
    box.innerHTML = '<div class="wrap ficha">' + U.cabecalho(A, {migalha: '<a href="#/icts">ICTs</a> / Executor', voltar: 'javascript:history.back()', voltarRot: 'Voltar', olho: 'Executor de projetos', tit: nome, sub: 'Instituição que executou projetos nas bases do Atlas. Ainda não tem ficha no Diretório de ICTs.'}) +
      '<div class="secao-tit"><h2 class="tit-md">Projetos executados</h2></div><div class="bloco" data-proj></div><div class="secao-tit"><h2 class="tit-md">Empresas parceiras</h2></div><div class="bloco" data-emp></div></div>';
    box.onclick = null; box.onchange = null; box.oninput = null;
    var k = sem(nome);
    projetosBloco(A, box.querySelector('[data-proj]'), function (r) { return r[3] && sem(r[3]) === k; }, {semExecutor: true});
    carregaProj(function () {
      var c = {}, ids = {}; window.ATLAS2_PROJ.r.forEach(function (r) { if (r[3] && sem(r[3]) === k && r[2]) { c[r[2]] = (c[r[2]] || 0) + 1; if (r[9] && r[9][0]) ids[r[2]] = r[9][0]; } });
      var l = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).slice(0, 15);
      box.querySelector('[data-emp]').innerHTML = l.length ? '<div class="barras-h">' + l.map(function (n) { var mx = c[l[0]]; return (ids[n] ? '<a href="#/dna/' + encodeURIComponent(ids[n]) + '">' : '<div>') + '<span>' + esc(n) + '</span><i style="width:' + (c[n] / mx * 100).toFixed(0) + '%"></i><b>' + c[n] + '</b>' + (ids[n] ? '</a>' : '</div>'); }).join('') + '</div>' : '<p class="txt">Sem empresa registrada nos projetos.</p>';
    });
  };

  /* ================= BUSCA: página de resultados ================= */
  T.busca = function (A, sub, q, box) {
    var termo = decodeURIComponent(((/(?:^|&)q=([^&]*)/.exec(q || '') || [])[1] || '').replace(/\+/g, ' '));
    var l = busca(termo), g = porGrupo(l);
    var inp = document.getElementById('bg-q'); if (inp && !inp.value) inp.value = termo;
    box.innerHTML = U.faixa(A, {olho: 'Busca no Atlas', tit: 'Resultados para<br><em>“' + esc(termo) + '”</em>', txt: br(l.length) + ' resultado' + (l.length === 1 ? '' : 's') + ' em financiadores, chamadas, instrumentos, empresas, ICTs, inovação aberta, internacional e dicionário, além dos projetos financiados.'}) +
      '<div class="wrap" style="padding-bottom:110px">' + (l.length ? ORDEM_G.filter(function (k) { return g[k]; }).map(function (k) { return '<div class="secao-tit"><h2 class="tit-md">' + esc(k) + '</h2><span class="contagem">' + br(g[k].length) + '</span></div><div class="bloco"><div class="linhas-l" style="margin-top:0">' + g[k].slice(0, 30).map(function (x) { var ext = /^https?:/.test(x.h); return '<a class="linha-l" href="' + esc(x.h) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '><b>' + realce(x.t, termo) + (ext ? ' ↗' : '') + '</b><small>' + esc(x.s) + '</small></a>'; }).join('') + (g[k].length > 30 ? '<p class="nota-base">Mostrando 30 de ' + br(g[k].length) + '. Refine a busca para ver o restante.</p>' : '') + '</div></div>'; }).join('') : '<p class="txt" style="margin-top:28px">Nada nas listas do Atlas com “' + esc(termo) + '”.</p>') +
      '<div class="secao-tit"><h2 class="tit-md">Projetos financiados</h2></div><div class="bloco" data-proj></div></div>';
    U.ativaCampos(A, box); box.onclick = null; box.onchange = null; box.oninput = null;
    var ts = sem(termo).trim().split(/\s+/).filter(Boolean);
    if (ts.length) projetosBloco(A, box.querySelector('[data-proj]'), function (r) { var k = sem([r[1], r[2], r[3], r[8]].join(' ')); return ts.every(function (t) { return k.indexOf(t) >= 0; }); }, {vazio: 'Nenhum projeto com esse termo.'});
  };

  /* ================= SAPIENS ================= */
  var PERGUNTAS = ['Minha empresa é de médio porte, no Lucro Real, com um projeto de software em TRL 4. Quais instrumentos combinam?', 'Qual a diferença entre subvenção da FINEP e um projeto EMBRAPII para uma pequena empresa?', 'Como funciona a Lei do Bem e o que preciso guardar para comprovar os dispêndios?', 'Que documentos costumam ser pedidos numa proposta de subvenção econômica?', 'Como encontro uma ICT parceira para um projeto de hidrogênio verde?', 'O que é CPSI e como uma startup participa de uma compra pública de inovação?'];
  /* #/sapiens leva ao Simulador, no cartão do Sapiens (window.AV2_abreSapiens continua disponível) */
  T.sapiens = function () { location.replace('#/simulador?sap=1'); };

  /* ================= INTERNACIONAL ================= */
  var CONT = {'União Europeia': 'Europa', 'Portugal': 'Europa', 'Alemanha': 'Europa', 'Reino Unido': 'Europa', 'França': 'Europa', 'Suécia': 'Europa', 'Noruega': 'Europa', 'Espanha': 'Europa', 'Itália': 'Europa', 'Países Baixos': 'Europa', 'Finlândia': 'Europa', 'Suíça': 'Europa', 'Polônia': 'Europa', 'Irlanda': 'Europa', 'Dinamarca': 'Europa', 'Bélgica': 'Europa', 'Luxemburgo': 'Europa', 'Lituânia': 'Europa', 'Áustria': 'Europa', 'Grécia': 'Europa', 'Hungria': 'Europa', 'República Tcheca': 'Europa', 'Eslováquia': 'Europa', 'Romênia': 'Europa', 'Chipre': 'Europa', 'Turquia': 'Europa e Ásia', 'Canadá': 'América do Norte', 'Estados Unidos': 'América do Norte', 'Chile': 'América do Sul', 'Argentina': 'América do Sul', 'Colômbia': 'América do Sul', 'Peru': 'América do Sul', 'Israel': 'Oriente Médio', 'Emirados Árabes Unidos': 'Oriente Médio', 'Cingapura': 'Ásia e Oceania', 'Coreia do Sul': 'Ásia e Oceania', 'Japão': 'Ásia e Oceania', 'China': 'Ásia e Oceania', 'Índia': 'Ásia e Oceania', 'Tailândia': 'Ásia e Oceania', 'Austrália': 'Ásia e Oceania', 'Nova Zelândia': 'Ásia e Oceania', 'Tunísia': 'África', 'África do Sul': 'África'};
  function acesso(t) { var s = sem(t); if (/^diret/.test(s)) return 'Direto para empresa brasileira'; if (/^consorcio/.test(s)) return 'Em consórcio com parceiros locais'; if (/^sem acesso/.test(s)) return 'Sem acesso direto'; if (/^exige (empresa|entidade)|filial|subsidiaria/.test(s)) return 'Exige empresa ou filial no país'; if (/^empresa brasil/.test(s)) return 'Direto para empresa brasileira'; if (/nao (verificado|confirmado)/.test(s)) return 'Não confirmado'; return 'Ver condições'; }
  var ROT_ECO_I = {'pdi-aneel': 'P&D&I ANEEL', desafio: 'Desafio de inovação aberta', premio: 'Prêmio', aceleracao: 'Aceleração', outros: 'Outro programa', edital: 'Edital', investimento: 'Investimento', incubacao: 'Incubação', concurso: 'Concurso', mentoria: 'Mentoria', 'pre-aceleracao': 'Pré-aceleração'};
  var SUB_INT = [['chamadas', '', 'Chamadas abertas ao Brasil'], ['programas', '/programas', 'Programas de financiamento'], ['incentivos', '/incentivos', 'Incentivos fiscais de P&D']];
  T.internacional = function (A, sub, q, box, mesma) {
    var aba = sub === 'programas' ? 'programas' : sub === 'incentivos' ? 'incentivos' : 'chamadas';
    var I = D.internacional, RP = I.radarPaises || {}, EP = I.ecoPaises || {};
    /* ---- itens das três listas ---- */
    var prog = (I.programas || []).map(function (x) { return {k: 'programa', nome: x.nome_pt || x.programa, orig: x.programa, pais: x.pais, orgao: x.orgao, cat: x.tipo, nat: x.nat, valor: x.valor, quem: x.quem_pode, acesso: x.acesso_brasil, resumo: x.resumo_pt, url: x.url_oficial, doc: x.url_documento, enc: x.encerramento, setores: x.setores || [], mod: x.modalidade, trl: x.trl, ab: x.abertura}; });
    var inc = (I.incentivos || []).map(function (x) { return {k: 'incentivo', nome: x.nome_pt || x.nome_oficial, orig: x.nome_oficial, pais: x.pais, regiao: x.regiao, orgao: x.orgao, cat: x.categoria, nat: x.nat, valor: x.beneficio, quem: x.quem_pode, acesso: x.acesso_brasil, resumo: x.resumo_pt, url: x.url_oficial, doc: x.url_documento, base: x.base_legal, vig: x.vigencia, como: x.como_acessar, setores: []}; });
    var cham = [];
    D.chamadas.forEach(function (c) { if (RP[c.id] && A.estado(c).k !== 'enc') cham.push({k: 'radar', c: c, nome: c.titulo, paises: RP[c.id], ag: c.agenciaNome || '—', nat: c.nat, enc: c.encerramento, resumo: c.resumo, orig: 'Radar'}); });
    D.ecossistema.forEach(function (e) { if (e.abrangencia !== 'Internacional') return; if (e.prazoTipo === 'data' && e.encerramento && A.dias(e.encerramento) < 0) return; cham.push({k: 'eco', e: e, nome: e.nome, paises: EP[e.id] || ['Qualquer país'], ag: e.promotor || '—', nat: e.nat, enc: e.prazoTipo === 'data' ? e.encerramento : null, resumo: e.resumo, orig: 'Ecossistema'}); });
    var todosPaises = U.cont(prog.concat(inc), function (x) { return x.pais; });
    var subAbas = '<div class="sub-abas" role="tablist" aria-label="Seções de Internacional">' + SUB_INT.map(function (a) { var n = a[0] === 'chamadas' ? cham.length : a[0] === 'programas' ? prog.length : inc.length; return '<a role="tab" href="#/internacional' + a[1] + '" class="chip" aria-pressed="' + (aba === a[0]) + '">' + a[2] + ' · ' + n + '</a>'; }).join('') + '</div>';
    var lista = aba === 'chamadas' ? cham : aba === 'programas' ? prog : inc;
    var cP = U.cont(lista, function (x) { return x.paises || x.pais; });
    var faixa = {abas: U.abasDinheiro('internacional'), olho: 'Internacional · conferido em ' + (I.conferidoEm || '13/11/2026'), tit: 'Financiamento à inovação<br><em>fora do Brasil</em>', txt: '<b>Chamadas abertas</b> a quem inova no Brasil, <b>programas de financiamento</b> e <b>incentivos fiscais de P&amp;D</b> de outros países, com o que se sabe sobre o acesso de empresas brasileiras.',
      num: [String(cham.length), 'chamadas abertas ao Brasil'], quebra: [[String(prog.length), 'programas de financiamento'], [String(inc.length), 'incentivos fiscais'], [String(Object.keys(todosPaises).length), 'países e blocos']],
      dir: U.barrasFaixa(A, 'Países e blocos com mais ' + (aba === 'chamadas' ? 'chamadas' : aba === 'programas' ? 'programas' : 'incentivos'), Object.keys(cP).filter(function (k) { return k !== 'Qualquer país'; }).sort(function (a, b) { return cP[b] - cP[a]; }).slice(0, 8).map(function (k) { return [k, cP[k]]; }), function (p) { return '#/internacional' + (aba === 'chamadas' ? '' : '/' + aba) + '?pais=' + encodeURIComponent(p[0]); })};
    var gPais = {k: 'pais', t: 'País ou bloco', val: function (x) { return x.paises || [x.pais]; }, ordem: 'alfa'};
    var gNat = {k: 'nat', t: 'Natureza do recurso', aberto: true, val: function (x) { return [x.nat || 'a-confirmar']; }, rot: A.NAT_ROT};
    var gAcesso = {k: 'acesso', t: 'Acesso de empresa brasileira', aberto: true, val: function (x) { return [acesso(x.acesso)]; }};
    var gCont = {k: 'cont', t: 'Continente', val: function (x) { return [CONT[x.pais] || 'Outros']; }};
    function cmpNome(a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); }
    function porPrazo(a, b) { var da = a.enc && A.dias(a.enc) >= 0 ? a.enc : '9999', db = b.enc && A.dias(b.enc) >= 0 ? b.enc : '9999'; return da < db ? -1 : da > db ? 1 : cmpNome(a, b); }
    function data(iso) { return A.fdata(iso); }
    /* ---- cartões ---- */
    function detalhes(x) {
      var l = [['Nome oficial', x.orig && x.orig !== x.nome ? x.orig : ''], ['Órgão', x.orgao], ['País', x.pais + (x.regiao && x.regiao !== 'Nacional' ? ' · ' + x.regiao : '')], [x.k === 'programa' ? 'Valor' : 'Benefício', x.valor], ['Quem pode', x.quem], ['Acesso a partir do Brasil', x.acesso], ['Como acessar', x.como], ['Base legal', x.base], ['Vigência', x.vig],
        ['Setores', (x.setores || []).join(', ')], ['Modalidade', x.mod], ['TRL', x.trl], ['Abertura', x.ab ? data(x.ab) : ''], ['Encerramento', x.enc ? data(x.enc) : ''],
        ['Guia ou regulamento', x.doc ? '<a href="' + esc(x.doc) + '" target="_blank" rel="noopener">documento oficial ↗</a>' : '', true]];
      return U.detalhes(A, l, x.url, 'Fonte oficial');
    }
    function cartaoPI(x) {
      var d = x.enc ? A.dias(x.enc) : null, st = x.k === 'incentivo' ? ['cont', x.vig ? U.primeiro(String(x.vig), 60) : 'Regime permanente'] : !x.enc ? ['cont', 'Sem prazo publicado'] : d < 0 ? ['', 'Encerrado'] : d <= 15 ? ['urg', 'Fecha em ' + d + ' dia' + (d === 1 ? '' : 's')] : ['ab', 'Aberto até ' + data(x.enc)];
      return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla">' + esc(x.pais) + (x.regiao && x.regiao !== 'Nacional' ? ' · ' + esc(x.regiao) : '') + ' · ' + (x.k === 'programa' ? 'programa' : 'incentivo fiscal') + '</p><h3>' + (x.url ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.nome) + '</a>' : esc(x.nome)) + '</h3><p class="op-inst">' + esc(x.orgao || '') + '</p>' + (x.orig && x.orig !== x.nome ? '<p class="op-inst op-orig">' + esc(x.orig) + '</p>' : '') + '</div></div>' +
        '<p class="op-txt">' + esc(x.resumo || '') + '</p>' +
        '<div class="op-linhas"><div class="op-linha"><span>Recurso</span><div class="tags">' + A.natTag(x.nat) + '</div></div>' + (x.valor ? '<div class="op-linha"><span>' + (x.k === 'programa' ? 'Valor' : 'Benefício') + '</span><div style="font-size:13px;color:var(--ink-2)">' + esc(U.primeiro(x.valor, 120)) + '</div></div>' : '') +
        '<div class="op-linha"><span>Para o Brasil</span><div style="font-size:13px;color:var(--ink-2)">' + esc(acesso(x.acesso)) + '</div></div></div>' + detalhes(x) +
        '<div class="op-base"><span class="status ' + st[0] + '">' + st[1] + '</span>' + (x.url ? '<span class="fonte"><a href="' + esc(x.url) + '" target="_blank" rel="noopener">fonte oficial ↗</a></span>' : '') + '</div></article>';
    }
    function cartaoEco(x) {
      var e = x.e, d = e.encerramento ? A.dias(e.encerramento) : null, ab = e.abertura ? A.dias(e.abertura) : null;
      var st = ab != null && ab > 0 ? ['cont', 'Abre em ' + data(e.abertura)] : e.prazoTipo !== 'data' || !e.encerramento ? ['cont', e.prazoTipo === 'fluxo-continuo' ? 'Fluxo contínuo' : 'Sem prazo definido'] : d <= 15 ? ['urg', 'Fecha em ' + d + ' dia' + (d === 1 ? '' : 's')] : ['ab', 'Aberto até ' + data(e.encerramento)];
      return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla">' + esc(ROT_ECO_I[e.tipo] || e.tipo) + ' · Inovação aberta</p><h3><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.nome) + '</a></h3><p class="op-inst">' + esc(e.promotor || '') + '</p></div></div>' +
        '<p class="op-txt">' + esc(e.resumo || '') + '</p>' +
        '<div class="op-linhas"><div class="op-linha"><span>Recurso</span><div class="tags">' + A.natTag(e.nat) + '</div></div>' + (e.valor ? '<div class="op-linha"><span>Aporte</span><div style="font-size:13px;color:var(--ink-2)">' + esc(U.primeiro(e.valor, 100)) + '</div></div>' : '') + (e.publico ? '<div class="op-linha"><span>Para quem</span><div style="font-size:13px;color:var(--ink-2)">' + esc(U.primeiro(e.publico, 100)) + '</div></div>' : '') + '</div>' +
        (e.nota ? '<p class="op-nota">' + esc(e.nota) + '</p>' : '') +
        U.detalhes(A, [['Tipo', ROT_ECO_I[e.tipo] || e.tipo], ['Promotor', e.promotor], ['Resumo', e.resumo], ['Para quem', e.publico], ['Aporte ou valor', e.valor], ['Países', x.paises.join(', ')], ['Abertura', e.abertura ? data(e.abertura) : ''], ['Encerramento', e.encerramento ? data(e.encerramento) : (e.prazoTipo === 'fluxo-continuo' ? 'Fluxo contínuo' : 'Sem prazo definido na fonte')], ['Conferido em', e.verificadoEm ? data(e.verificadoEm) : '']], e.url, 'Fonte oficial') +
        '<div class="op-base"><span class="status ' + st[0] + '">' + st[1] + '</span><span class="fonte">' + (e.verificadoEm ? 'Conferido em ' + data(e.verificadoEm) + ' · ' : '') + '<a href="' + esc(e.url) + '" target="_blank" rel="noopener">fonte oficial ↗</a></span></div></article>';
    }
    if (aba === 'chamadas') {
      return U.catalogo(A, box, {
        chave: 'internacional', titulo: 'Chamadas abertas ao Brasil', placeholder: 'País, agência ou tema', genero: 'a', contagemRot: ['chamada', 'chamadas'], faixa: faixa, selos: subAbas,
        aviso: 'Sete editais do Radar com parceiro de outro país e seis programas de inovação aberta com abrangência internacional. Quem não tem país definido vale para qualquer país.',
        itens: cham,
        grupos: [{k: 'prazo', t: 'Prazo', aberto: true, val: function (x) { if (!x.enc) return ['sem']; var d = A.dias(x.enc); return [d <= 15 ? 'urg' : d <= 60 ? 'med' : 'lon']; }, rot: {urg: 'Encerra em até 15 dias', med: 'Em até 60 dias', lon: 'Mais de 60 dias', sem: 'Sem prazo definido'}, ordem: ['urg', 'med', 'lon', 'sem']},
          {k: 'pais', t: 'País ou bloco', aberto: true, val: gPais.val, ordem: 'alfa'}, {k: 'ag', t: 'Agência ou promotor', val: function (x) { return [x.ag]; }}, gNat, {k: 'orig', t: 'Origem no Atlas', val: function (x) { return [x.orig]; }}],
        busca: function (x) { return [x.nome, x.ag, x.resumo, x.paises.join(' ')].join(' '); },
        ordens: [['prazo', 'Prazo mais próximo', porPrazo], ['nome', 'Nome (A–Z)', cmpNome]],
        cartao: function (x) { return x.k === 'radar' ? A.cartaoChamada(x.c) : cartaoEco(x); }
      }, q, mesma);
    }
    var ehProg = aba === 'programas';
    return U.catalogo(A, box, {
      chave: 'internacional/' + aba, titulo: ehProg ? 'Programas de financiamento' : 'Incentivos fiscais de P&D', placeholder: 'País, programa, órgão ou tema', genero: 'o', contagemRot: ehProg ? ['programa', 'programas'] : ['incentivo', 'incentivos'], faixa: faixa, selos: subAbas,
      aviso: (ehProg ? 'O acesso de empresas brasileiras varia: muitos programas exigem consórcio ou filial local. ' : 'Para usar um incentivo estrangeiro, em regra a empresa brasileira precisa de filial ou subsidiária tributada no país e de P&D executado lá. ') + 'Fontes oficiais de cada país, conferidas em ' + (I.conferidoEm || 'novembro de 2026') + '. Regras mudam a cada orçamento: confirme a vigência.',
      itens: lista,
      grupos: (ehProg ? [{k: 'sit', t: 'Situação do prazo', aberto: true, val: function (x) { return [!x.enc ? 'sem' : A.dias(x.enc) < 0 ? 'enc' : 'ab']; }, rot: {ab: 'Com prazo aberto', sem: 'Sem prazo publicado', enc: 'Encerrado'}, ordem: ['ab', 'sem', 'enc']}] : []).concat([gNat, gAcesso, gCont, gPais,
        {k: 'cat', t: ehProg ? 'Modalidade' : 'Tipo de incentivo', val: function (x) { return [x.cat || '—']; }}], ehProg ? [{k: 'set', t: 'Setor', val: function (x) { return x.setores && x.setores.length ? x.setores : ['—']; }}] : []),
      busca: function (x) { return [x.nome, x.orig, x.pais, x.orgao, x.resumo, x.valor, x.setores.join(' ')].join(' '); },
      ordens: ehProg ? [['prazo', 'Prazo mais próximo', porPrazo], ['pais', 'País', function (a, b) { return a.pais.localeCompare(b.pais, 'pt-BR') || cmpNome(a, b); }], ['nome', 'Nome (A–Z)', cmpNome]] : [['pais', 'País', function (a, b) { return a.pais.localeCompare(b.pais, 'pt-BR') || cmpNome(a, b); }], ['nome', 'Nome (A–Z)', cmpNome]],
      cartao: cartaoPI
    }, q, mesma);
  };

  /* ================= PI: consultar registros e organizações ================= */
  var TIPOS_PI = ['Patente', 'Desenho industrial', 'Programa de computador', 'Contrato de tecnologia'];
  window.AV2_PIX = function (A, aba, el, trocaAba) {
    el.innerHTML = '<div class="carregando" style="padding:40px 0"><i></i><span>Carregando os registros de PI das organizações do Atlas (cerca de 6 MB)…</span></div>';
    carrega('assets/atlas-v2-pi-registros.js?v=r91', function () { return !!window.ATLAS2_PIREG; }, function () {
      var P = window.ATLAS2_PIREG, O = P.orgs, R = P.r;
      function orgLink(o) { return '<a href="' + (o[0] === 'ict' ? '#/icts/' : '#/dna/') + encodeURIComponent(o[1]) + '">' + esc(o[2]) + '</a> <span class="selo-t' + (o[0] === 'ict' ? ' ict' : '') + '">' + (o[0] === 'ict' ? 'ICT' : 'empresa') + '</span>'; }
      if (aba === 'orgs') {
        var st = {q: '', ord: 'total', tipo: '', lim: 50};
        el.innerHTML = '<div class="bloco largo"><h4 class="olho">' + br(O.length) + ' organizações do Atlas com registros no INPI</h4><div class="proj-ferr"><div class="busca"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><input type="search" data-oq placeholder="Buscar organização" autocomplete="off"></div>' +
          '<label class="ordem">Tipo <select data-ot><option value="">Todas</option><option value="empresa">Empresas</option><option value="ict">ICTs</option></select></label><label class="ordem">Ordenar <select data-oo><option value="total">Total</option><option value="3">Patentes</option><option value="4">Desenhos</option><option value="5">Programas</option><option value="6">Contratos</option><option value="nome">Nome</option></select></label></div><div data-ol></div></div>';
        var desenha = function () {
          var qn = sem(st.q), l = O.map(function (o, i) { return [o, i]; }).filter(function (x) { return (!st.tipo || x[0][0] === st.tipo) && (!qn || sem(x[0][2]).indexOf(qn) >= 0); });
          var tot = function (o) { return o[3] + o[4] + o[5] + o[6]; };
          l.sort(st.ord === 'nome' ? function (a, b) { return a[0][2].localeCompare(b[0][2], 'pt-BR'); } : st.ord === 'total' ? function (a, b) { return tot(b[0]) - tot(a[0]); } : function (a, b) { return b[0][+st.ord] - a[0][+st.ord]; });
          el.querySelector('[data-ol]').innerHTML = '<p class="contagem" style="margin-top:10px"><b>' + br(l.length) + '</b> organizações</p><table class="tabela"><thead><tr><th>Organização</th><th>Patentes</th><th>Desenhos</th><th>Programas</th><th>Contratos</th><th>Total</th><th></th></tr></thead><tbody>' +
            l.slice(0, st.lim).map(function (x) { var o = x[0]; return '<tr><td>' + orgLink(o) + '</td><td>' + br(o[3]) + '</td><td>' + br(o[4]) + '</td><td>' + br(o[5]) + '</td><td>' + br(o[6]) + '</td><td><b>' + br(tot(o)) + '</b></td><td><button type="button" class="btn-txt" style="font-size:13px" data-vorg="' + x[1] + '">ver registros</button></td></tr>'; }).join('') + '</tbody></table>' + (l.length > st.lim ? '<button type="button" class="btn-linha peq" style="margin-top:12px" data-omais>Mostrar mais 50 de ' + br(l.length - st.lim) + '</button>' : '');
        };
        var tq; el.oninput = function (e) { if (e.target.hasAttribute('data-oq')) { var v = e.target.value; clearTimeout(tq); tq = setTimeout(function () { st.q = v; st.lim = 50; desenha(); }, 180); } };
        el.onchange = function (e) { if (e.target.hasAttribute('data-oo')) { st.ord = e.target.value; desenha(); } if (e.target.hasAttribute('data-ot')) { st.tipo = e.target.value; st.lim = 50; desenha(); } };
        el.onclick = function (e) { if (e.target.closest('[data-omais]')) { st.lim += 50; desenha(); return; } var v = e.target.closest('[data-vorg]'); if (v) { trocaAba('consulta'); window.AV2_PIX(A, 'consulta', el, trocaAba); setTimeout(function () { el._piOrg && el._piOrg(+v.getAttribute('data-vorg')); }, 0); } };
        desenha(); return;
      }
      var cs = {q: '', tipo: '', org: -1, de: '', ate: '', lim: 50, ord: 'ano', tit: true, ot: ''};
      var anos = {}; R.forEach(function (r) { if (r[3]) anos[r[3]] = 1; }); var la = Object.keys(anos).sort();
      el.innerHTML = '<div class="bloco largo"><h4 class="olho">Consultar ' + br(R.length) + ' registros de PI das organizações do Atlas</h4><div class="proj-ferr"><div class="busca"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><input type="search" data-cq placeholder="Título, número do processo ou organização" autocomplete="off"></div>' +
        '<label class="ordem">De <select data-cde><option value="">—</option>' + la.map(function (a) { return '<option>' + a + '</option>'; }).join('') + '</select></label><label class="ordem">até <select data-cate><option value="">—</option>' + la.map(function (a) { return '<option>' + a + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="proj-ferr" style="margin-top:10px"><label class="ordem">Ordenar <select data-cord><option value="ano">Mais recentes</option><option value="antigo">Mais antigos</option><option value="org">Organização (A–Z)</option><option value="titulo">Título (A–Z)</option></select></label><label class="ordem">Organização <select data-cot><option value="">Todas</option><option value="empresa">Empresas</option><option value="ict">ICTs</option></select></label>' +
        '<label class="ordem" style="gap:8px"><input type="checkbox" data-ctit checked> Só com título</label><button type="button" class="btn-txt" style="font-size:13px" data-climpa>Limpar filtros</button></div>' +
        '<p class="aviso-txt" data-ctitdica>Registros sem título ficam ocultos: os pedidos de patente são mantidos em sigilo por 18 meses e, antes da publicação, o INPI não divulga o título. Desmarque para ver todos.</p>' +
        '<div class="tags" style="margin-top:10px" data-ctipos></div><div data-corg></div><div data-cl></div><p class="nota-base">Registros do INPI (dados abertos, 29/08/2026) ligados às organizações do Atlas por CNPJ ou razão social. Programas de computador e contratos nem sempre trazem título.</p></div>';
      var desenhaC = function () {
        var qn = sem(cs.q).trim(), ts = qn ? qn.split(/\s+/) : [], cont = [0, 0, 0, 0];
        var l = R.filter(function (r) {
          if (cs.org >= 0 && r[1] !== cs.org) return false;
          if (cs.de && r[3] < +cs.de) return false; if (cs.ate && r[3] > +cs.ate) return false;
          if (cs.tit && !r[4]) return false;
          if (cs.ot && (O[r[1]] || [])[0] !== cs.ot) return false;
          if (ts.length) { var k = sem(r[4] + ' ' + r[2] + ' ' + (O[r[1]] ? O[r[1]][2] : '')); if (!ts.every(function (t) { return k.indexOf(t) >= 0; })) return false; }
          cont[r[0]]++; return cs.tipo === '' || String(r[0]) === cs.tipo;
        });
        var nomeO = function (r) { return O[r[1]] ? O[r[1]][2] : ''; };
        l.sort(cs.ord === 'antigo' ? function (a, b) { return (a[3] || 9999) - (b[3] || 9999); } : cs.ord === 'org' ? function (a, b) { return nomeO(a).localeCompare(nomeO(b), 'pt-BR') || (b[3] || 0) - (a[3] || 0); } : cs.ord === 'titulo' ? function (a, b) { return String(a[4] || '￿').localeCompare(String(b[4] || '￿'), 'pt-BR'); } : function (a, b) { return (b[3] || 0) - (a[3] || 0); });
        el.querySelector('[data-ctitdica]').hidden = !cs.tit;
        el.querySelector('[data-ctipos]').innerHTML = ['<button type="button" class="chip" data-ct="" aria-pressed="' + (cs.tipo === '') + '">Todos · ' + br(cont[0] + cont[1] + cont[2] + cont[3]) + '</button>'].concat(TIPOS_PI.map(function (t, i) { return '<button type="button" class="chip" data-ct="' + i + '" aria-pressed="' + (cs.tipo === String(i)) + '">' + t + ' · ' + br(cont[i]) + '</button>'; })).join('');
        el.querySelector('[data-corg]').innerHTML = cs.org >= 0 ? '<p class="contagem" style="margin-top:10px">Organização: <button type="button" class="chip x" data-corgx>' + esc(O[cs.org][2]) + '</button></p>' : '';
        el.querySelector('[data-cl]').innerHTML = '<p class="contagem" style="margin-top:10px"><b>' + br(l.length) + '</b> registros</p>' + (l.length ? '<table class="tabela"><thead><tr><th>Tipo</th><th>Número</th><th>Ano</th><th>Título</th><th>Titular</th></tr></thead><tbody>' +
          l.slice(0, cs.lim).map(function (r) { var o = O[r[1]]; return '<tr><td><span class="selo-t">' + TIPOS_PI[r[0]] + '</span></td><td style="white-space:nowrap;font-family:var(--f-mono);font-size:12.5px">' + esc(r[2]) + '</td><td>' + esc(r[3] || '') + '</td><td>' + (r[4] ? esc(r[4]) : '<small>sem título na base</small>') + '</td><td>' + (o ? orgLink(o) : '') + '</td></tr>'; }).join('') + '</tbody></table>' + (l.length > cs.lim ? '<button type="button" class="btn-linha peq" style="margin-top:12px" data-cmais>Mostrar mais 50 de ' + br(l.length - cs.lim) + '</button>' : '') : '<p class="txt">Nenhum registro com esse filtro.</p>');
      };
      el._piOrg = function (i) { cs.org = i; cs.lim = 50; desenhaC(); };
      var tq2; el.oninput = function (e) { if (e.target.hasAttribute('data-cq')) { var v = e.target.value; clearTimeout(tq2); tq2 = setTimeout(function () { cs.q = v; cs.lim = 50; desenhaC(); }, 220); } };
      el.onchange = function (e) { var t = e.target; if (t.hasAttribute('data-cde')) cs.de = t.value; else if (t.hasAttribute('data-cate')) cs.ate = t.value; else if (t.hasAttribute('data-cord')) cs.ord = t.value; else if (t.hasAttribute('data-cot')) cs.ot = t.value; else if (t.hasAttribute('data-ctit')) cs.tit = t.checked; else return; cs.lim = 50; desenhaC(); };
      el.onclick = function (e) { var t = e.target.closest('[data-ct]');
        if (e.target.closest('[data-climpa]')) { cs.q = ''; cs.tipo = ''; cs.org = -1; cs.de = ''; cs.ate = ''; cs.lim = 50; cs.ord = 'ano'; cs.tit = true; cs.ot = ''; ['cq', 'cde', 'cate', 'cord', 'cot'].forEach(function (k) { var c = el.querySelector('[data-' + k + ']'); if (c) c.value = k === 'cord' ? 'ano' : ''; }); el.querySelector('[data-ctit]').checked = true; desenhaC(); return; } if (t) { cs.tipo = t.getAttribute('data-ct'); cs.lim = 50; desenhaC(); return; } if (e.target.closest('[data-cmais]')) { cs.lim += 50; desenhaC(); return; } if (e.target.closest('[data-corgx]')) { cs.org = -1; desenhaC(); } };
      desenhaC();
    });
  };
})();
