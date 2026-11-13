/* Atlas v2 · telas11 — TRL & AD² (v3): gráfico interativo, árvore de decisão do TRL, calculadora AD² em passos, como usar. Dados: window.ATLAS2_R3. */
(function () {
  'use strict';
  var T = window.AV2_TELAS, U = window.AV2_UTIL, R = window.ATLAS2_R3;
  if (!T || !U || !R || !R.trl) return;
  var TR = R.trl, CALC = TR.calculadora, SIM = R.sim || {catalogo: []};
  var RISCO_COR = CALC.matriz_risco_5x5.cores, RISCO_ROT = CALC.matriz_risco_5x5.rotulos, MATRIZ = CALC.matriz_risco_5x5.linhas_consequencia_5_a_1;
  function prob(n) { return n <= 3 ? 1 : n <= 5 ? 2 : n === 6 ? 3 : n <= 8 ? 4 : 5; }
  function ls(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function grava(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function hojeIso() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function baixa(nome, obj) {
    try {
      var blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'}), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) {}
  }
  function copia(txt, bt, rot) {
    function ok() { var o = bt.textContent; bt.textContent = 'Copiado ✓'; setTimeout(function () { bt.textContent = rot || o; }, 1800); }
    try { if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(ok, ok); return; } } catch (e) {}
    ok();
  }
  var FONTES = [
    ['NASA. Technology Readiness Levels. Página oficial, publicada em 2023, atualizada em 2026.', 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/technology-readiness-levels/'],
    ['Mankins, J. C. (1995). Technology Readiness Levels: A White Paper. NASA, Office of Space Access and Technology.', ''],
    ['ISO 16290:2013. Space systems: Definition of the Technology Readiness Levels (TRLs) and their criteria of assessment. No Brasil: ABNT NBR ISO 16290:2015.', ''],
    ['U.S. Government Accountability Office (2020). Technology Readiness Assessment Guide, GAO-20-48G.', 'https://www.gao.gov/products/gao-20-48g'],
    ['European Commission. Horizon 2020 Work Programme 2014-2015, General Annex G: Technology readiness levels (TRL). Reaproveitado nos anexos gerais do Horizon Europe.', 'https://ec.europa.eu/research/participants/data/ref/h2020/wp/2014_2015/annexes/h2020-wp1415-annex-g-trl_en.pdf'],
    ['EARTO (2014). The TRL Scale as a Research & Innovation Policy Tool, EARTO Recommendations.', ''],
    ['U.S. Department of Defense, OSD Manufacturing Technology Program. Manufacturing Readiness Level (MRL) Deskbook, versão vigente.', ''],
    ['Sauser, B.; Ramirez-Marquez, J.; Magnaye, R.; Tan, W. (2008). A systems approach to expanding the Technology Readiness Level within defense acquisition. International Journal of Defense Acquisition Management, 1 (origem do Integration Readiness Level).', ''],
    ['ARENA, Australian Renewable Energy Agency (2014). Commercial Readiness Index for Renewable Energy Sectors.', ''],
    ['INPI. Chuba, T. TRL e Inovação: desafios e oportunidades (apresentação). Resume o uso da escala por FINEP, MCTI e EMBRAPII.', 'https://www.gov.br/inpi/pt-br/servicos/a-academia/arquivo/arquivo-eventos/apresentacao-thiago-chuba.pdf'],
    ['FINEP e MCTI. Editais de chamadas públicas: o TRL é definido com base na ISO 16290, em versão simplificada. Vale o anexo de TRL de cada edital.', 'https://www.finep.gov.br']
  ];
  function fontesHtml(A, ids) {
    return '<ol class="t11-fontes">' + FONTES.filter(function (f, i) { return !ids || ids.indexOf(i) >= 0; }).map(function (f) { return '<li>' + A.esc(f[0]) + (f[1] ? ' <a href="' + A.esc(f[1]) + '" target="_blank" rel="noopener">Abrir ↗</a>' : '') + '</li>'; }).join('') + '</ol>';
  }
  function hrefInstr(A, c) {
    var ins = (A.D && A.D.instrumentos) || [];
    return ins.some(function (i) { return i.id === c.instrId; }) ? '#/instrumentos/' + encodeURIComponent(c.instrId) : c.agenteId ? '#/agentes/' + encodeURIComponent(c.agenteId) : '#/instrumentos';
  }
  function dentro(c, n) { return c.trl && n >= c.trl[0] && n <= c.trl[1]; }


  /* ================= Dados da escala (curtos; fiel ao sentido da ISO 16290 / NASA / H2020 Anexo G) ================= */
  var FASEC = ['#6D28D9', '#2563EB', '#0F766E', '#15803D'];
  function corNivel(n) { return n <= 3 ? FASEC[0] : n <= 6 ? FASEC[1] : n <= 8 ? FASEC[2] : FASEC[3]; }
  var ADCOR = ['#16A34A', '#4D9F1E', '#84A312', '#C0A40A', '#E0A106', '#F28A0C', '#EA6410', '#DC3F1F', '#C81E1E'];
  var NIV = [
    {n: 1, nome: 'Princípios básicos observados', rot: ['Princípios', 'básicos'],
      dem: 'O princípio científico por trás da ideia foi identificado e descrito.', amb: 'Nenhum teste. Só literatura e pesquisa básica.', evi: 'Artigos, revisão da literatura, notas de pesquisa.',
      ok: 'Os princípios científicos estão identificados e documentados.', falta: 'Registrar o princípio científico e revisar a literatura.'},
    {n: 2, nome: 'Conceito de aplicação formulado', rot: ['Conceito', 'formulado'],
      dem: 'Uma aplicação foi proposta. Ainda é hipótese, sem prova.', amb: 'Estudos analíticos e simulações preliminares.', evi: 'Documento de conceito com o desempenho esperado.',
      ok: 'Há um conceito de aplicação definido.', falta: 'Definir o conceito: o que faz, para quem e com que desempenho.'},
    {n: 3, nome: 'Prova de conceito', rot: ['Prova de', 'conceito'],
      dem: 'A função crítica funciona em cálculo, simulação ou experimento.', amb: 'Laboratório, bancada, modelo.', evi: 'Relatório do experimento ou da simulação.',
      ok: 'A função crítica foi provada em cálculo, simulação ou experimento.', falta: 'Fazer o cálculo, a simulação ou o experimento que prova a função crítica.'},
    {n: 4, nome: 'Verificação funcional em laboratório', rot: ['Verificação', 'em lab.'],
      dem: 'Os componentes funcionam juntos, em escala reduzida.', amb: 'Laboratório controlado.', evi: 'Relatório de testes da bancada integrada.',
      ok: 'Os componentes já funcionaram juntos em laboratório.', falta: 'Integrar os componentes e testá-los juntos em bancada.'},
    {n: 5, nome: 'Verificação em ambiente relevante', rot: ['Ambiente', 'relevante'],
      dem: 'O conjunto integrado foi validado em condições que simulam o uso real.', amb: 'Ambiente relevante (simulado).', evi: 'Protocolo e laudo de ensaio.',
      ok: 'O conjunto foi validado em ambiente que simula o uso real.', falta: 'Testar o conjunto em ambiente que reproduza os fatores críticos do uso real.'},
    {n: 6, nome: 'Protótipo em ambiente relevante', rot: ['Protótipo', 'relevante'],
      dem: 'Um protótipo completo e representativo foi demonstrado.', amb: 'Ambiente relevante, escala piloto.', evi: 'Relatório de demonstração do protótipo.',
      ok: 'O protótipo completo foi demonstrado em ambiente relevante.', falta: 'Construir o protótipo completo e demonstrá-lo em ambiente relevante.'},
    {n: 7, nome: 'Protótipo em ambiente operacional', rot: ['Protótipo', 'operacional'],
      dem: 'O protótipo operou no local e nas condições reais de uso.', amb: 'Cliente ou campo.', evi: 'Ata de aceite do piloto e dados de campo.',
      ok: 'O protótipo operou no ambiente real do cliente.', falta: 'Levar o protótipo ao ambiente real do cliente e coletar dados de operação.'},
    {n: 8, nome: 'Sistema real desenvolvido e aprovado', rot: ['Sistema', 'aprovado'],
      dem: 'O sistema final está completo, testado e qualificado.', amb: 'Ambiente operacional, com certificação.', evi: 'Laudos, certificados e testes de qualificação.',
      ok: 'O sistema final está pronto e qualificado.', falta: 'Concluir o sistema final, qualificá-lo e certificá-lo.'},
    {n: 9, nome: 'Sistema real aprovado em operação', rot: ['Em', 'operação'],
      dem: 'O sistema está provado em operação real, de forma recorrente.', amb: 'Operação comercial.', evi: 'Histórico de operação, contratos e vendas.',
      ok: 'O sistema já opera comercialmente.', falta: 'Operar em escala comercial e registrar o desempenho.'}
  ];
  var FASES4 = [{nome: 'Pesquisa', a: 1, b: 3}, {nome: 'Desenvolvimento e validação', a: 4, b: 6}, {nome: 'Demonstração e piloto', a: 7, b: 8}, {nome: ['Produção', 'e mercado'], a: 9, b: 9}];
  var CORTE = [
    {t: ['Pesquisa', 'básica'], a: 1, b: 1}, {t: ['Pesquisa', 'aplicada'], a: 2, b: 2}, {t: ['Desenvolvimento experimental'], a: 3, b: 6},
    {t: ['Industrialização'], a: 7, b: 8}, {t: ['Produção e', 'comercialização'], a: 9, b: 9}
  ];
  var DESTAQUE = ['embrapii', 'finep-subvencao', 'lei-do-bem', 'finep-startup', 'finep-centelha', 'bndes-funtec', 'finep-tecnova', 'aneel-pd', 'lei-informatica', 'finep-credito'];
  var INSTCOR = ['#DB2777', '#EA580C', '#0891B2', '#7C3AED', '#CA8A04', '#059669', '#2563EB', '#E11D48'];

  var ABAS = [['entenda', 'O que é TRL'], ['calc-trl', 'Calculadora de TRL'], ['calc-ad2', 'Calculadora AD²'], ['uso', 'Como usar no projeto']];

  T.trl = function (A, sub, q, box, mesma) {
    var aba = (/(?:^|&)aba=([a-z0-9-]+)/.exec(q || '') || [])[1];
    if (!aba) aba = sub === 'ad2' || sub === 'calculadora' ? 'calc-ad2' : 'entenda';
    if (ABAS.every(function (a) { return a[0] !== aba; })) aba = 'entenda';
    box.onclick = null; box.onchange = null; box.oninput = null; box.onmouseover = null; box.onmouseleave = null; box.onfocusin = null; box.onfocusout = null;
    var dir = '<div class="g11-hero"><a class="g11-hc" href="#/trl?aba=calc-trl" style="--c:#7C5CFF"><span class="g11-hn">TRL</span><div><b>Calcular o TRL</b><small>Em que ponto a tecnologia está, de 1 a 9.</small></div><i>→</i></a><a class="g11-hc" href="#/trl?aba=calc-ad2" style="--c:#22D3A0"><span class="g11-hn">AD²</span><div><b>Calcular o AD²</b><small>Quão difícil é o salto até o próximo nível.</small></div><i>→</i></a></div>';
    var fx = U.faixa(A, {olho: 'TRL & método AD²', tit: 'Maturidade da tecnologia<br><em>e da empresa</em>', dir: dir});
    var nav = '<nav class="fin-abas" aria-label="Seções de TRL e AD²">' + ABAS.map(function (a) { return '<a href="#/trl?aba=' + a[0] + '" class="' + (a[0] === aba ? 'ativa' : '') + '">' + a[1] + '</a>'; }).join('') + '</nav>';
    box.innerHTML = fx + '<div class="wrap t11" style="padding-bottom:110px">' + nav + '<div class="t11-corpo" id="t11-corpo"></div></div>';
    U.ativaCampos(A, box);
    var el = box.querySelector('#t11-corpo');
    ({'entenda': aEntenda, 'calc-trl': aCalcTrl, 'calc-ad2': aCalcAd2, 'uso': aUso})[aba](A, el, box);
    if (mesma) { var n = box.querySelector('.fin-abas'); if (n && window.scrollY > n.offsetTop) window.scrollTo(0, n.getBoundingClientRect().top + window.scrollY - 70); }
  };

  /* ================= Aba 1: O que é TRL (gráfico interativo) ================= */
  var X0 = 45, W9 = 90;
  function gx(i) { return X0 + i * W9; }
  function curvaV(t) { var s = t < 3.6 ? 1.5 : 2.3; return Math.exp(-Math.pow(t - 3.6, 2) / (2 * s * s)); }
  function curvaY(x) { return 330 - curvaV((x - X0) / W9) * 236; }

  function aEntenda(A, el, box) {
    var esc = A.esc, KS = 'atlas-trl-instr', pin = 0;
    var cat = (SIM.catalogo || []).filter(function (c) { return c.trl; });
    function porId(id) { return cat.filter(function (c) { return c.id === id; })[0]; }
    function corI(id) { var ix = 0; cat.forEach(function (c, i) { if (c.id === id) ix = i; }); return INSTCOR[ix % INSTCOR.length]; }
    var sel = ls(KS, null);
    if (!Array.isArray(sel)) sel = ['embrapii', 'finep-subvencao', 'lei-do-bem'];
    sel = sel.filter(porId);

    function grafico() {
      var rows = sel.map(porId).filter(Boolean), HC = 498, H = rows.length ? HC + 22 + rows.length * 26 + 6 : HC;
      var s = '<svg class="g11-svg" viewBox="0 0 900 ' + H + '" role="group" aria-label="Escala TRL de 1 a 9 com fases, curva de dispêndios e faixa dos instrumentos">';
      s += '<defs><linearGradient id="g11-gf" gradientUnits="userSpaceOnUse" x1="45" x2="855" y1="0" y2="0"><stop offset=".12" stop-color="' + FASEC[0] + '"/><stop offset=".48" stop-color="' + FASEC[1] + '"/><stop offset=".78" stop-color="' + FASEC[2] + '"/><stop offset=".98" stop-color="' + FASEC[3] + '"/></linearGradient>' +
        '<linearGradient id="g11-ga" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="66" y2="330"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>' +
        '<mask id="g11-mk"><rect x="0" y="60" width="900" height="272" fill="url(#g11-ga)"/></mask></defs>';
      /* fases (setas) */
      FASES4.forEach(function (f, i) {
        var L = gx(f.a - 1) + 2, R = gx(f.b) - 2, tip = 14, last = i === FASES4.length - 1, pts = i === 0 ? [[L, 8], [R - tip, 8], [R, 32], [R - tip, 56], [L, 56]] : last ? [[L, 8], [R, 8], [R, 56], [L, 56], [L + tip, 32]] : [[L, 8], [R - tip, 8], [R, 32], [R - tip, 56], [L, 56], [L + tip, 32]];
        var cx = (L + R) / 2 + (i === 0 ? -3 : 3), tx = Array.isArray(f.nome) ? '<text class="g11-ft" x="' + cx + '" y="29" text-anchor="middle">' + esc(f.nome[0]) + '</text><text class="g11-ft" x="' + cx + '" y="44" text-anchor="middle">' + esc(f.nome[1]) + '</text>' : '<text class="g11-ft" x="' + cx + '" y="37" text-anchor="middle">' + esc(f.nome) + '</text>';
        s += '<polygon points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="' + FASEC[i] + '"/>' + tx;
      });
      /* curva de dispêndios */
      var pts = [], x;
      for (x = X0; x <= 855; x += 9) pts.push(x + ',' + curvaY(x).toFixed(1));
      s += '<line class="g11-base" x1="45" x2="855" y1="330" y2="330"/>';
      s += '<g mask="url(#g11-mk)"><path d="M45,330 L' + pts.join(' L') + ' L855,330 Z" fill="url(#g11-gf)"/></g>';
      s += '<path d="M' + pts.join(' L') + '" fill="none" stroke="url(#g11-gf)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
      [[2, ['Aplicação do', 'novo conhecimento']], [6, ['Manufatura']]].forEach(function (m) {
        var mx = gx(m[0]);
        s += '<line class="g11-marco" x1="' + mx + '" x2="' + mx + '" y1="64" y2="338"/>' + m[1].map(function (t, i) { return '<text class="g11-mt" x="' + (mx + 8) + '" y="' + (80 + i * 14) + '">' + esc(t) + '</text>'; }).join('');
      });
      s += '<text class="g11-mt g11-disp" x="640" y="150">Dispêndios do projeto</text>';
      /* faixa destacada (hover) */
      s += '<rect id="g11-band" x="45" y="0" width="90" height="' + HC + '" rx="6" fill="#2563EB" opacity="0"/>';
      NIV.forEach(function (L, i) { var cx = gx(i) + W9 / 2; s += '<circle cx="' + cx + '" cy="' + curvaY(cx).toFixed(1) + '" r="5" fill="#fff" stroke="' + corNivel(L.n) + '" stroke-width="3"/>'; });
      /* régua 1-9 */
      NIV.forEach(function (L, i) {
        var bx = gx(i) + 2, c = corNivel(L.n);
        s += '<rect x="' + bx + '" y="344" width="86" height="76" rx="10" fill="' + c + '"/><text class="g11-rn" x="' + (bx + 43) + '" y="378" text-anchor="middle">' + L.n + '</text>' +
          '<text class="g11-rl" x="' + (bx + 43) + '" y="398" text-anchor="middle">' + esc(L.rot[0]) + '</text><text class="g11-rl" x="' + (bx + 43) + '" y="412" text-anchor="middle">' + esc(L.rot[1]) + '</text>';
      });
      /* chaves: pesquisa básica, aplicada, desenvolvimento, industrialização, produção */
      CORTE.forEach(function (g) {
        var a = gx(g.a - 1) + 4, b = gx(g.b) - 4, c = corNivel(g.a);
        s += '<path d="M' + a + ',428 v6 H' + b + ' v-6" fill="none" stroke="' + c + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          g.t.map(function (t, i) { return '<text class="g11-ct" x="' + ((a + b) / 2) + '" y="' + (450 + i * 14) + '" text-anchor="middle">' + esc(t) + '</text>'; }).join('');
      });
      /* instrumentos */
      if (rows.length) {
        s += '<text class="g11-it" x="45" y="' + (HC + 6) + '">FAIXA DE CADA INSTRUMENTO (CATÁLOGO DO SIMULADOR)</text>';
        rows.forEach(function (c, i) {
          var y = HC + 16 + i * 26, bx = gx(c.trl[0] - 1) + 2, bw = (c.trl[1] - c.trl[0] + 1) * W9 - 4, cor = corI(c.id), nm = c.nome + ' · TRL ' + c.trl[0] + (c.trl[1] > c.trl[0] ? ' a ' + c.trl[1] : ''), ln = nm.length * 6.4 + 16;
          s += '<g><title>' + esc(nm) + '</title><rect x="' + bx + '" y="' + y + '" width="' + bw + '" height="20" rx="10" fill="' + cor + '"/>';
          if (ln <= bw) s += '<text class="g11-bt" x="' + (bx + 11) + '" y="' + (y + 14) + '">' + esc(nm) + '</text>';
          else if (bx + bw + 8 + ln < 900) s += '<text class="g11-bt2" x="' + (bx + bw + 8) + '" y="' + (y + 14) + '">' + esc(nm) + '</text>';
          else s += '<text class="g11-bt2" x="' + (bx - 8) + '" y="' + (y + 14) + '" text-anchor="end">' + esc(nm) + '</text>';
          s += '</g>';
        });
      }
      /* colunas sensíveis ao mouse */
      NIV.forEach(function (L, i) {
        s += '<rect class="g11-hit" data-nv="' + L.n + '" tabindex="0" role="button" aria-label="TRL ' + L.n + ': ' + esc(L.nome) + '" x="' + (gx(i) + 1) + '" y="0" width="88" height="' + HC + '" fill="transparent"/>';
      });
      return s + '</svg>';
    }
    function chip(c) { return '<button type="button" class="g11-chip" style="--c:' + corI(c.id) + '" data-gfi="' + c.id + '" aria-pressed="' + (sel.indexOf(c.id) >= 0) + '">' + esc(c.nome) + ' <i>' + c.trl[0] + (c.trl[1] > c.trl[0] ? '-' + c.trl[1] : '') + '</i></button>'; }
    function chips() {
      var dest = DESTAQUE.map(porId).filter(Boolean), resto = cat.filter(function (c) { return DESTAQUE.indexOf(c.id) < 0; });
      return '<div class="g11-chips"><span class="t11-num">Mostrar faixa de</span>' + dest.map(chip).join('') + '<button type="button" class="g11-lim" data-gfx>Limpar</button></div>' +
        '<details class="g11-mais"><summary>Mais instrumentos (' + resto.length + ')</summary><div class="g11-chips">' + resto.map(chip).join('') + '</div></details>';
    }
    function mostra(n) {
      var tip = el.querySelector('#g11-tip'), band = el.querySelector('#g11-band'), wrap = el.querySelector('.g11');
      if (!tip || !band || !wrap) return;
      if (!n) { tip.hidden = true; band.setAttribute('opacity', '0'); return; }
      var L = NIV[n - 1], c = corNivel(n);
      band.setAttribute('x', gx(n - 1) + 1); band.setAttribute('fill', c); band.setAttribute('opacity', '.16');
      tip.style.setProperty('--c', c);
      tip.innerHTML = '<div class="g11-tip-t"><b>TRL ' + n + '</b>' + esc(L.nome) + '</div><p><i>Demonstrado</i>' + esc(L.dem) + '</p><p><i>Ambiente</i>' + esc(L.amb) + '</p><p><i>Evidência</i>' + esc(L.evi) + '</p>';
      tip.hidden = false;
      var r = band.getBoundingClientRect(), w = wrap.getBoundingClientRect(), tw = tip.offsetWidth, cx = r.left - w.left + r.width / 2;
      tip.style.left = Math.max(4, Math.min(w.width - tw - 4, cx - tw / 2)) + 'px';
      tip.style.top = (r.top - w.top + r.height * 0.2) + 'px';
    }
    function redesenha() {
      el.querySelector('#g11-chart').innerHTML = grafico();
      el.querySelector('#g11-chips').innerHTML = chips();
      mostra(pin);
    }
    el.innerHTML =
      '<section class="t11-sec"><div class="g11-cab"><div><h3 class="t11-h">A escala TRL, de 1 a 9</h3></div><span class="g11-dica">Passe o mouse ou toque num nível</span></div>' +
      '<div id="g11-chips">' + chips() + '</div><div class="g11"><div class="g11-rola"><div id="g11-chart">' + grafico() + '</div></div><div class="g11-tip" id="g11-tip" hidden role="tooltip"></div></div>' +
      '</section>' +
      '<section class="t11-sec"><div class="g11-tres">' +
      '<div class="g11-card" style="--c:' + FASEC[0] + '"><h4>Laboratório <span>TRL 1 a 4</span></h4><p>Bancada controlada. Prova que a ideia funciona; o uso real ainda não entrou.</p></div>' +
      '<div class="g11-card" style="--c:' + FASEC[1] + '"><h4>Ambiente relevante <span>TRL 5 e 6</span></h4><p>Condições que reproduzem os fatores críticos do uso. É o vale da morte: falta recurso e muitos projetos param aqui.</p></div>' +
      '<div class="g11-card" style="--c:' + FASEC[2] + '"><h4>Ambiente operacional <span>TRL 7 a 9</span></h4><p>O sistema roda no lugar e nas condições reais do cliente, até virar rotina.</p></div></div>' +
      '<div class="t11-acoes" style="margin-top:4px"><a class="btn-azul" href="#/trl?aba=calc-trl">Descobrir o TRL do meu projeto</a><a class="btn-linha" href="#/trl?aba=uso">Como declarar no projeto</a></div>' +
      '<details class="g11-fontes"><summary>Fontes e metodologia</summary>' + fontesHtml(A, [0, 1, 2, 3, 4, 5, 9, 10]) + '<p class="t11-aviso">A escala é a mesma de NASA, ISO 16290 e Horizon 2020; a leitura “laboratório, relevante, operacional” vem do Anexo G do H2020. A curva de dispêndios é ilustrativa. Cada edital pode trazer o seu anexo de TRL, e é ele que vale.</p></details></section>';

    box.onmouseover = function (e) {
      if (!el.querySelector('#g11-tip')) return;
      var g = e.target.closest ? e.target.closest('[data-nv]') : null;
      if (g) mostra(+g.getAttribute('data-nv')); else if (!e.target.closest('.g11-tip')) mostra(pin);
    };
    box.onmouseleave = function () { mostra(pin); };
    box.onfocusin = function (e) { var g = e.target.closest ? e.target.closest('[data-nv]') : null; if (g) mostra(+g.getAttribute('data-nv')); };
    box.onfocusout = function () { mostra(pin); };
    box.onclick = function (e) {
      var b;
      if ((b = e.target.closest('[data-nv]'))) { var n = +b.getAttribute('data-nv'); pin = pin === n ? 0 : n; mostra(n); return; }
      if ((b = e.target.closest('[data-gfi]'))) {
        var id = b.getAttribute('data-gfi'), ix = sel.indexOf(id);
        if (ix >= 0) sel.splice(ix, 1); else sel.push(id);
        grava(KS, sel); redesenha(); return;
      }
      if (e.target.closest('[data-gfx]')) { sel = []; grava(KS, sel); redesenha(); }
    };
  }

  /* ================= Aba 2: Calculadora de TRL (árvore de decisão) ================= */
  var KTQ = 'atlas-trl-q-v1';
  var QS = {
    c1: {blk: 'Contexto', t: 'Você já viu essa tecnologia funcionando em outro lugar?', h: 'Outra empresa, país ou laboratório.'},
    c2: {blk: 'Contexto', t: 'Lá, ela já opera comercialmente?', h: 'Em uso real, com clientes, e não só em demonstração.'},
    l1: {t: 'Os princípios científicos por trás da ideia já são conhecidos e publicados?', h: 'Artigos, literatura, pesquisa básica.'},
    l2: {t: 'Já existe um conceito de aplicação definido?', h: 'O que faz, para quem e com que desempenho.'},
    l3: {t: 'Você já fez uma prova de conceito?', h: 'Cálculo, simulação ou experimento que prova a função crítica.'},
    l4: {t: 'Os componentes já funcionaram juntos em laboratório?', h: 'Bancada integrada, em escala reduzida.'},
    l5: {t: 'Já testou em um ambiente que simula o real?', h: 'Reproduz os fatores críticos do uso: carga, clima, dados, usuários.'},
    l6: {t: 'Já tem um protótipo completo, testado nesse ambiente?', h: 'Representativo do produto final, não só partes dele.'},
    l7: {t: 'O protótipo já operou no ambiente real do cliente?', h: 'No local e nas condições reais de uso.'},
    l8: {t: 'O sistema final está pronto e qualificado?', h: 'Testado, aprovado e, quando exigido, certificado.'},
    l9: {t: 'Já está em operação comercial?', h: 'Funcionando de forma recorrente, com clientes reais.'},
    e1: {blk: 'Sua empresa', t: 'A equipe tem experiência com essa tecnologia?', h: 'Já entregou algo parecido ou domina a base técnica.', c: 'Equipe com experiência'},
    e2: {blk: 'Sua empresa', t: 'Sua empresa já testou algo parecido?', h: 'Protótipo, piloto ou ensaio anterior, mesmo de outra solução.', c: 'Já testou algo parecido'},
    e3: {blk: 'Sua empresa', t: 'Já há fornecedor ou parceiro técnico definido?', h: 'ICT, universidade, fornecedor de componente crítico.', c: 'Parceiro ou fornecedor'},
    e4: {blk: 'Sua empresa', t: 'Existe um cliente piloto ou interessado em testar?', h: 'Carta de intenção, conversa estruturada ou piloto combinado.', c: 'Cliente piloto'},
    e5: {blk: 'Sua empresa', t: 'A propriedade intelectual está protegida ou mapeada?', h: 'Busca de anterioridade feita, titularidade clara, proteção definida.', c: 'PI protegida ou mapeada'}
  };
  var EMPS = ['e1', 'e2', 'e3', 'e4', 'e5'];
  var SELO_TX = {alta: 'Equipe, parceiros, cliente e PI no lugar: a empresa está bem posicionada para esse salto.', 'média': 'Há uma base, mas faltam peças. Veja o que ficou em “não” ou “não sei”.', baixa: 'Ainda faltam as peças principais. Vale buscar um parceiro técnico (ICT, universidade) antes do salto.'};

  function aCalcTrl(A, el, box) {
    var esc = A.esc, S = Object.assign({a: {}, nome: ''}, ls(KTQ, {}));
    if (!S.a || typeof S.a !== 'object') S.a = {};
    function salva() { grava(KTQ, S); }
    function fila(a) {
      var f = [];
      function add(id) { f.push(id); return a[id] !== undefined; }
      if (!add('c1')) return f;
      if (a.c1 === 's' && !add('c2')) return f;
      for (var i = 1; i <= 9; i++) { if (!add('l' + i)) return f; if (a['l' + i] !== 's') break; }
      for (var j = 0; j < EMPS.length; j++) if (!add(EMPS[j])) return f;
      return f;
    }
    function calc(a) {
      var trl = 0, i; for (i = 1; i <= 9; i++) { if (a['l' + i] === 's') trl = i; else break; }
      var parou = trl < 9 ? a['l' + (trl + 1)] : null, sims = 0, resp = 0;
      EMPS.forEach(function (id) { if (a[id] !== undefined) resp++; if (a[id] === 's') sims++; });
      var selo = resp === 0 ? '' : sims >= 4 ? 'alta' : sims >= 2 ? 'média' : 'baixa';
      var mundo = a.c1 === 's' ? (a.c2 === 's' ? ['ok', 'Já funciona no mundo: o desafio é adaptar e dominar a tecnologia.'] : a.c2 !== undefined ? ['pa', 'Há referência externa, ainda em demonstração.'] : null) : a.c1 === 'n' ? ['no', 'Sem referência externa: o risco de ser pioneira é seu.'] : null;
      return {trl: trl, parou: parou, sims: sims, resp: resp, selo: selo, mundo: mundo, l1: a.l1 !== undefined, prov: parou === undefined && trl < 9};
    }
    function nomeTrl(r) { return r.trl ? NIV[r.trl - 1].nome : r.l1 ? 'Antes do TRL 1' : 'Responda para começar'; }
    function porque(r) {
      if (!r.trl) return r.l1 ? 'Os princípios científicos ainda não estão estabelecidos.' : 'Vou subindo a escada, um nível por vez.';
      var t = NIV[r.trl - 1].ok;
      if (r.parou === 'n') t += ' O próximo nível ainda não.';
      else if (r.parou === 'x') t += ' O próximo nível ficou como “não sei”: confirme com evidência.';
      else if (r.prov) t += ' Provisório: ainda há perguntas.';
      return t;
    }
    function regua(r) {
      return '<div class="g11-reg" aria-label="Régua TRL 1 a 9">' + NIV.map(function (L) { return '<i class="' + (L.n <= r.trl ? 'on' : L.n === r.trl + 1 && r.trl < 9 ? 'nx' : '') + '" style="--c:' + corNivel(L.n) + '"><b>' + L.n + '</b></i>'; }).join('') + '</div>';
    }
    function live(r) {
      var seloTx = r.selo ? '<span class="g11-selo s-' + (r.selo === 'média' ? 'media' : r.selo) + '">' + r.selo + (r.resp < 5 ? ' · parcial' : '') + '</span>' : '<span class="g11-selo">a responder</span>';
      var falta = r.trl < 9 && (r.trl > 0 || r.l1) ? '<p class="g11-falta"><b>Para o TRL ' + (r.trl + 1) + '</b>' + esc(NIV[r.trl].falta) + '</p>' : '';
      return '<aside class="g11-live" style="--c:' + corNivel(r.trl || 1) + '" aria-live="polite"><span class="t11-num">TRL provável</span><div class="g11-big"><b>' + (r.trl || '—') + '</b><div><strong>' + esc(nomeTrl(r)) + '</strong><span>' + esc(porque(r)) + '</span></div></div>' +
        regua(r) + falta + '<div class="g11-chipsl">' + (r.mundo ? '<span class="g11-mundo m-' + r.mundo[0] + '">' + esc(r.mundo[1]) + '</span>' : '') + '<span class="g11-emp"><em>Empresa</em>' + seloTx + '</span></div></aside>';
    }
    function pergunta(f, a) {
      var id = f[f.length - 1], Q = QS[id], blk = Q.blk || 'Escada de maturidade', cor = id.charAt(0) === 'e' ? '#DB2777' : id.charAt(0) === 'c' ? '#0891B2' : corNivel(+id.slice(1)), pos = id.charAt(0) === 'l' ? ' · nível ' + id.slice(1) + ' de 9' : '';
      var dots = f.map(function (k, i) { var v = a[k]; return '<button type="button" class="g11-dot ' + (v || 'cur') + '" data-jump="' + k + '" title="' + esc(QS[k].t) + '" aria-label="Pergunta ' + (i + 1) + (v ? ': ' + (v === 's' ? 'sim' : v === 'n' ? 'não' : 'não sei') : ' (atual)') + '"></button>'; }).join('');
      return '<div class="g11-q" style="--c:' + cor + '"><div class="g11-q-top"><span class="g11-pill">' + esc(blk) + pos + '</span><span class="g11-dots">' + dots + '</span></div>' +
        '<h3 class="g11-q-t">' + esc(Q.t) + '</h3><p class="g11-q-h">' + esc(Q.h) + '</p>' +
        '<div class="g11-resp"><button type="button" class="s" data-r="s"><i>✓</i>Sim</button><button type="button" class="n" data-r="n"><i>✕</i>Não</button><button type="button" class="x" data-r="x"><i>?</i>Não sei</button></div>' +
        '<div class="g11-q-pe">' + (f.length > 1 ? '<button type="button" class="btn-linha peq" data-volta>← Voltar</button>' : '') + '<button type="button" class="btn-txt" data-reset>Recomeçar</button></div></div>';
    }
    function compat(r) {
      var cat = (SIM.catalogo || []).filter(function (c) { return c.trl; });
      return {dentro: cat.filter(function (c) { return dentro(c, r.trl); }).sort(function (x, y) { return (x.trl[1] - x.trl[0]) - (y.trl[1] - y.trl[0]); }),
        abrem: r.trl < 9 ? cat.filter(function (c) { return c.trl[0] === r.trl + 1; }) : []};
    }
    function tags(l, max) {
      var m = l.slice(0, max);
      return '<div class="g11-tags">' + m.map(function (c) { return '<a href="' + esc(hrefInstr(A, c)) + '" style="--c:' + corNivel(c.trl[0]) + '">' + esc(c.nome) + '<i>' + c.trl[0] + (c.trl[1] > c.trl[0] ? '-' + c.trl[1] : '') + '</i></a>'; }).join('') + (l.length > max ? '<span class="g11-mais-n">e mais ' + (l.length - max) + ' no <a href="#/simulador">Simulador</a></span>' : '') + '</div>';
    }
    function resultado(r, a) {
      var cp = compat(r), nx = r.trl < 9 ? NIV[r.trl] : null;
      var emps = EMPS.map(function (id) { var v = a[id]; return '<li class="e-' + (v || 'x') + '"><i>' + (v === 's' ? '✓' : v === 'n' ? '✕' : '?') + '</i>' + esc(QS[id].c) + '</li>'; }).join('');
      return '<div class="g11-res" style="--c:' + corNivel(r.trl || 1) + '"><span class="t11-num">Resultado</span>' +
        '<div class="g11-res-big"><b>' + (r.trl ? 'TRL ' + r.trl : 'Antes do TRL 1') + '</b><div><strong>' + esc(nomeTrl(r)) + '</strong><p>' + esc(porque(r)) + '</p></div></div>' + regua(r) +
        '<div class="g11-res-grade"><div class="g11-box" style="--c:#EA580C"><h4>' + (nx ? 'O que falta para o TRL ' + (r.trl + 1) : 'Nível máximo') + '</h4><p>' + (nx ? esc(nx.falta) : 'O sistema já opera comercialmente. O foco passa a ser escala e melhoria contínua.') + '</p></div>' +
        '<div class="g11-box" style="--c:#DB2777"><h4>Maturidade da empresa <span class="g11-selo s-' + (r.selo === 'média' ? 'media' : r.selo) + '">' + r.selo + '</span></h4><p>' + esc(SELO_TX[r.selo] || '') + '</p><ul class="g11-emps">' + emps + '</ul><small>O selo não altera o TRL: mede se a empresa está pronta para esse salto.</small></div></div>' +
        (r.mundo ? '<p class="g11-mundo m-' + r.mundo[0] + '" style="margin:14px 0 0">' + esc(r.mundo[1]) + '</p>' : '') +
        '<h4 class="g11-h4">Instrumentos compatíveis com o TRL ' + r.trl + '</h4>' + (cp.dentro.length && r.trl ? tags(cp.dentro, 14) : '<p class="t11-aviso">Nenhum instrumento do catálogo cobre esse nível. Veja o Simulador.</p>') +
        (cp.abrem.length ? '<h4 class="g11-h4">Passam a servir no TRL ' + (r.trl + 1) + '</h4>' + tags(cp.abrem, 8) : '') +
        '<label class="t11-f g11-nome no-print"><span>Nome da tecnologia (opcional, entra no resumo)</span><input type="text" data-nome value="' + esc(S.nome) + '"></label>' +
        '<div class="t11-acoes no-print"><button type="button" class="btn-azul" id="trl-copiar">Copiar resultado</button><button type="button" class="btn-linha" id="trl-print">Imprimir</button><button type="button" class="btn-linha" id="trl-ad2">Usar como TRL atual no AD²</button><button type="button" class="btn-txt" data-reset>Refazer</button></div></div>';
    }
    function sintese(r, a) {
      var cp = compat(r), nx = r.trl < 9 ? NIV[r.trl] : null;
      return 'Calculadora de TRL (Atlas da Inovação)\nTecnologia: ' + (S.nome || '—') + '\nTRL provável: ' + (r.trl || 'antes do TRL 1') + (r.trl ? ' · ' + NIV[r.trl - 1].nome : '') + '\n' + porque(r) + '\n' + (nx ? 'Falta para o TRL ' + (r.trl + 1) + ': ' + nx.falta + '\n' : '') +
        (r.mundo ? 'Referência externa: ' + r.mundo[1] + '\n' : '') + 'Maturidade da empresa: ' + (r.selo || '—') + ' (' + r.sims + ' de 5 itens)\n' + 'Instrumentos compatíveis: ' + (cp.dentro.map(function (c) { return c.nome + ' (TRL ' + c.trl.join(' a ') + ')'; }).join('; ') || '—') + '\nResultado de apoio ao planejamento; vale a evidência de cada nível e o anexo de TRL do edital.';
    }
    function monta() {
      var a = S.a, f = fila(a), r = calc(a), fim = a[f[f.length - 1]] !== undefined;
      el.innerHTML = '<section class="t11-sec"><div class="g11-cab"><div><h3 class="t11-h">Qual é o TRL da sua tecnologia?</h3></div></div>' +
        '<div class="g11-calc"><div class="g11-main">' + (fim ? resultado(r, a) : pergunta(f, a)) + '</div>' + live(r) + '</div>' +
        '<details class="g11-fontes"><summary>Como a árvore decide</summary><p class="t11-aviso" style="margin-top:8px">O TRL é o último nível cujo critério, e o de todos os anteriores, foi respondido com “sim”. “Não” e “não sei” interrompem a escada: sem evidência, o nível não vale. As perguntas seguem NASA, ISO 16290, Anexo G do H2020 e o guia GAO-20-48G. É uma triagem; a avaliação formal exige evidência documentada. O bloco da empresa e a referência externa não mudam o TRL.</p>' + fontesHtml(A, [0, 2, 3, 4]) + '</details></section>';
    }
    box.onclick = function (e) {
      var b, id = e.target.id;
      if ((b = e.target.closest('[data-r]'))) { var f = fila(S.a); S.a[f[f.length - 1]] = b.getAttribute('data-r'); salva(); monta(); return; }
      if (e.target.closest('[data-volta]')) { var g = fila(S.a); for (var i = g.length - 1; i >= 0; i--) if (S.a[g[i]] !== undefined) { delete S.a[g[i]]; break; } salva(); monta(); return; }
      if ((b = e.target.closest('[data-jump]'))) { var h = fila(S.a), k = h.indexOf(b.getAttribute('data-jump')); if (k >= 0) { h.slice(k).forEach(function (x) { delete S.a[x]; }); salva(); monta(); } return; }
      if (e.target.closest('[data-reset]')) { S.a = {}; salva(); monta(); return; }
      if (id === 'trl-print') { window.print(); return; }
      if (id === 'trl-copiar') { copia(sintese(calc(S.a), S.a), e.target, 'Copiar resultado'); return; }
      if (id === 'trl-ad2') {
        var r = calc(S.a), st = ls('atlas-ad2-v2', {});
        st.trlAtual = Math.max(1, r.trl); if (!(+st.trlAlvo > st.trlAtual)) st.trlAlvo = Math.min(9, st.trlAtual + 3);
        if (S.nome && !st.tecnologia) st.tecnologia = S.nome;
        grava('atlas-ad2-v2', st); window.location.hash = '#/trl?aba=calc-ad2';
      }
    };
    box.oninput = function (e) { if (e.target.hasAttribute('data-nome')) { S.nome = e.target.value; salva(); } };
    monta();
  }

  /* ================= Aba 3: Calculadora AD² ================= */
  var MOEDAS = {BRL: 'R$', USD: 'US$', EUR: '€'}, STATUS_ACAO = ['Planejada', 'Em execução', 'Bloqueada', 'Concluída'];
  function stNovo(perfil) { return {perfil: perfil || 'bilbro', projeto: '', tecnologia: '', escopo: 'Componente', avaliador: '', data: hojeIso(), moeda: 'BRL', contexto: '', trlAtual: 3, trlAlvo: 6, notas: {}, pesos: {}, arred: 'ceil', cons: {technical: 1, schedule: 1, cost: 1}, consNotes: '', evidence: {}, acoes: []}; }
  function aCalcAd2(A, el, box) {
    var esc = A.esc, KEY = 'atlas-ad2-v2', KP = 'atlas-ad2-v2-passo';
    var st = Object.assign(stNovo(), ls(KEY, {})), passo = +ls(KP, 0) || 0;
    st.cons = Object.assign({technical: 1, schedule: 1, cost: 1}, st.cons || {}); st.notas = st.notas || {}; st.pesos = st.pesos || {}; st.evidence = st.evidence || {}; st.acoes = st.acoes || [];
    if (!CALC.perfis[st.perfil]) st.perfil = 'bilbro';
    function perfil() { return CALC.perfis[st.perfil]; }
    function passos() { return [['proj', 'Projeto']].concat(perfil().domains.map(function (d) { return ['d:' + d.id, d.short || d.name]; })).concat([['cons', 'Pesos e consequência'], ['res', 'Resumo']]); }
    function salva() { grava(KEY, st); }
    function opts(l, a) { return l.map(function (o) { return '<option value="' + esc(o) + '"' + (String(a) === String(o) ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join(''); }
    function trlOpts(a) { return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<option value="' + n + '"' + (+a === n ? ' selected' : '') + '>TRL ' + n + ' · ' + esc(NIV[n - 1].nome) + '</option>'; }).join(''); }
    function peso(d) { return st.pesos[d.id] != null ? st.pesos[d.id] : 20; }
    function calcula() {
      var P = perfil(), tot = 0, toc = 0, ws = P.domains.map(function (d) { return Math.max(0, +peso(d) || 0); }), sw = ws.reduce(function (a, b) { return a + b; }, 0);
      if (sw <= 0) { ws = ws.map(function () { return 1; }); sw = ws.length; }
      var doms = P.domains.map(function (d, i) { var ns = d.questions.map(function (qq) { tot++; if (st.notas[qq[0]]) toc++; return st.notas[qq[0]] || 1; }); return {d: d, m: ns.reduce(function (a, b) { return a + b; }, 0) / ns.length, w: ws[i] / sw}; });
      var idx = doms.reduce(function (s, x) { return s + x.m * x.w; }, 0);
      var nivel = Math.max(1, Math.min(9, st.arred === 'floor' ? Math.floor(idx) : st.arred === 'nearest' ? Math.round(idx) : Math.ceil(idx - 1e-9)));
      var cons = Math.max(+st.cons.technical, +st.cons.schedule, +st.cons.cost), pr = prob(nivel), cls = MATRIZ[5 - cons][pr - 1];
      var crit = []; P.domains.forEach(function (d) { d.questions.forEach(function (qq) { var v = st.notas[qq[0]] || 1; if (v >= 7) crit.push({d: d.name, did: d.id, qid: qq[0], q: qq[1], v: v}); }); });
      crit.sort(function (a, b) { return b.v - a.v; });
      return {idx: idx, nivel: nivel, cons: cons, pr: pr, cls: cls, doms: doms, crit: crit, comp: Math.round(toc / tot * 100), toc: toc, tot: tot};
    }
    function domFeito(d) { return d.questions.every(function (qq) { return st.notas[qq[0]]; }); }
    function feito(i) { var k = passos()[i][0]; if (k === 'proj') return !!(st.projeto && st.tecnologia && +st.trlAlvo > +st.trlAtual); if (k.indexOf('d:') === 0) return domFeito(perfil().domains.filter(function (d) { return 'd:' + d.id === k; })[0]); if (k === 'cons') return true; return false; }
    function acoesVis() { return st.acoes.filter(function (a) { return a.profile === st.perfil; }); }
    function totaisAcoes() { var l = acoesVis(), c = l.reduce(function (s, a) { return s + (+a.cost || 0); }, 0), w = l.reduce(function (m, a) { return Math.max(m, +a.weeks || 0); }, 0); return {n: l.length, custo: c, semanas: w}; }
    function textoTotais() { var t = totaisAcoes(); return '<b>' + t.n + '</b> ação' + (t.n === 1 ? '' : 'ões') + ' · custo total <b>' + MOEDAS[st.moeda] + ' ' + A.br(t.custo) + '</b> · duração (maior prazo) <b>' + t.semanas + ' semana' + (t.semanas === 1 ? '' : 's') + '</b>'; }
    function stepper() { var ps = passos(); return '<ol class="t11-steps" aria-label="Passos">' + ps.map(function (p, i) { var f = feito(i); return '<li><button type="button" data-passo="' + i + '"' + (i === passo ? ' aria-current="step"' : '') + ' title="' + esc(p[1]) + '"' + (f ? ' class="feito"' : '') + '><i>' + (f ? '✓' : i + 1) + '</i><span class="l">' + esc(p[1]) + '</span></button></li>'; }).join('') + '</ol>'; }
    function barraNav() { var n = passos().length, ult = passo === n - 1; return '<div class="t11-nav"><div>' + (passo > 0 ? '<button type="button" class="btn-linha peq" data-ir="-1">← Anterior</button>' : '') + '</div><div>' + (!ult ? '<button type="button" class="btn-azul peq" data-ir="1">' + (passo === n - 2 ? 'Calcular e ver o resumo' : 'Próximo →') + '</button>' : '') + '</div></div>'; }
    function pProj() {
      var P = perfil();
      return '<div class="t11-painel-cab"><div><h3 class="t11-h">Projeto e salto de maturidade</h3></div></div><div class="t11-g">' +
        '<label class="t11-f"><span>Nome do projeto</span><input type="text" data-c="projeto" value="' + esc(st.projeto) + '"></label>' +
        '<label class="t11-f"><span>Tecnologia avaliada</span><input type="text" data-c="tecnologia" value="' + esc(st.tecnologia) + '"></label>' +
        '<label class="t11-f"><span>Unidade de análise</span><select data-c="escopo">' + opts(CALC.campos_projeto.escopo, st.escopo) + '</select></label>' +
        '<label class="t11-f"><span>Responsável pela avaliação</span><input type="text" data-c="avaliador" value="' + esc(st.avaliador) + '"></label>' +
        '<label class="t11-f"><span>Data</span><input type="date" data-c="data" value="' + esc(st.data) + '"></label>' +
        '<label class="t11-f"><span>Moeda dos custos</span><select data-c="moeda">' + opts(Object.keys(MOEDAS), st.moeda) + '</select></label>' +
        '<label class="t11-f"><span>TRL atual</span><select data-c="trlAtual">' + trlOpts(st.trlAtual) + '</select><small>Não sabe? <a href="#/trl?aba=calc-trl">Use a calculadora de TRL</a>.</small></label>' +
        '<label class="t11-f"><span>TRL alvo</span><select data-c="trlAlvo">' + trlOpts(st.trlAlvo) + '</select></label>' +
        '<label class="t11-f"><span>Perfil de avaliação</span><select data-c="perfil">' + Object.keys(CALC.perfis).map(function (k) { return '<option value="' + k + '"' + (st.perfil === k ? ' selected' : '') + '>' + esc(CALC.perfis[k].name) + '</option>'; }).join('') + '</select><small>' + esc(P.description || '') + '</small></label>' +
        '<label class="t11-f"><span>Arredondamento do nível</span><select data-c="arred">' + CALC.arredondamento.map(function (o) { return '<option value="' + o.id + '"' + (st.arred === o.id ? ' selected' : '') + '>' + esc(o.rotulo) + '</option>'; }).join('') + '</select></label>' +
        '<label class="t11-f cheio"><span>Contexto e premissas</span><textarea data-c="contexto" rows="3" placeholder="Premissas, limites da avaliação, ambiente de operação previsto.">' + esc(st.contexto) + '</textarea></label></div>' +
        '<p class="t11-aviso" style="margin-top:14px"><b>Como é calculado:</b> média simples dos indicadores de cada dimensão, média ponderada entre as dimensões e nível inteiro pela regra de arredondamento. Escala de cada indicador: 1 (ajuste mínimo) a 9 (fora da experiência).</p>' + barraNav();
    }
    function pDom(d) {
      var P = perfil(), feitos = d.questions.filter(function (qq) { return st.notas[qq[0]]; }).length;
      return '<div class="t11-painel-cab"><div><h3 class="t11-h">' + esc(d.name) + '</h3><p class="t11-sub">' + esc(d.description || '') + ' Dê a nota de <b>1</b> (a solução existe, ajuste mínimo) a <b>9</b> (fora da experiência existente).</p></div><span class="t11-prog" id="t11-prog">' + feitos + ' de ' + d.questions.length + ' respondidos</span></div><div class="t11-g" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))">' +
        d.questions.map(function (qq) {
          var v = st.notas[qq[0]] || 0, ev = st.evidence[qq[0]] || '';
          return '<div class="t11-ind"><p>' + esc(qq[1]) + (qq[2] ? '<small>' + esc(qq[2]) + '</small>' : '') + '</p><div class="t11-n9" role="group" aria-label="' + esc(qq[1]) + '">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button type="button" data-nota="' + qq[0] + '" data-v="' + n + '" aria-pressed="' + (v === n) + '">' + n + '</button>'; }).join('') + '</div><div class="t11-rot" data-vrot="' + qq[0] + '">' + (v ? '<b>' + v + '</b> · ' + esc(CALC.escala_resposta.rotulos[v]) : 'Sem resposta (conta como 1)') + '</div>' +
            '<details' + (ev ? ' open' : '') + '><summary>Evidência ou justificativa</summary><textarea data-ev="' + qq[0] + '" rows="2" placeholder="Fonte, ensaio, documento, premissa ou lacuna observada.">' + esc(ev) + '</textarea></details></div>';
        }).join('') + '</div>' + barraNav();
    }
    function pCons() {
      var P = perfil();
      return '<div class="t11-painel-cab"><div><h3 class="t11-h">Pesos das dimensões e consequência da falha</h3><p class="t11-sub">Os pesos dizem quanto cada dimensão pesa no índice. A consequência, se a tecnologia falhar, cruza com a probabilidade na matriz de risco 5×5.</p></div><button type="button" class="btn-linha peq" id="ad2-pesos">Distribuir pesos igualmente</button></div>' +
        '<h4 class="olho">Pesos (somam qualquer valor; o cálculo normaliza)</h4><div class="t11-g" style="margin-top:8px">' + P.domains.map(function (d) { return '<label class="t11-f"><span>' + esc(d.name) + '</span><input type="number" min="0" max="100" data-peso="' + d.id + '" value="' + peso(d) + '"></label>'; }).join('') + '</div>' +
        '<h4 class="olho" style="margin-top:20px">Consequência se falhar</h4><div class="t11-g" style="margin-top:8px">' + ['technical', 'schedule', 'cost'].map(function (k) { var nm = {technical: 'Técnica', schedule: 'Cronograma', cost: 'Custo'}[k]; return '<label class="t11-f"><span>' + nm + '</span><select data-cons="' + k + '">' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (+st.cons[k] === n ? ' selected' : '') + '>' + n + ' · ' + esc(CALC.consequencias.descricoes[k][n]) + '</option>'; }).join('') + '</select></label>'; }).join('') +
        '<label class="t11-f cheio"><span>Justificativa das consequências</span><textarea data-consnotes rows="2" placeholder="Por que o impacto técnico, no cronograma ou no custo é este.">' + esc(st.consNotes) + '</textarea></label></div>' + barraNav();
    }
    function matrizHtml(r) {
      var m = '<div class="matriz"><div></div>' + [1, 2, 3, 4, 5].map(function (p) { return '<div>P' + p + '</div>'; }).join('');
      for (var c = 5; c >= 1; c--) { m += '<div>C' + c + '</div>'; for (var p = 1; p <= 5; p++) m += '<div class="c ' + MATRIZ[5 - c][p - 1] + (c === r.cons && p === r.pr ? ' on' : '') + '"></div>'; }
      return m + '</div>';
    }
    function planoHtml() {
      var P = perfil(), l = acoesVis();
      return '<div class="t11-painel-cab" style="margin-top:22px;margin-bottom:6px"><div><h3 class="t11-h">Plano de maturação</h3><p class="t11-sub">Ações para reduzir a dificuldade até o TRL alvo. “Sugerir ações críticas” cria uma ação para cada indicador com nota 7 ou mais.</p></div><div class="t11-acoes no-print" style="margin-top:0"><button type="button" class="btn-linha peq" id="ad2-sug">Sugerir ações críticas</button><button type="button" class="btn-linha peq" id="ad2-add">Adicionar ação</button></div></div>' +
        (l.length ? l.map(function (a) {
          var dm = P.domains.filter(function (d) { return d.id === a.domain; })[0];
          return '<div class="pa-acao" data-aid="' + a.id + '"><label class="t11-f pa-desc"><span>Ação' + (dm ? ' · ' + esc(dm.short || dm.name) : '') + '</span><input type="text" data-ac="description" value="' + esc(a.description) + '"></label>' +
            '<label class="t11-f"><span>Responsável</span><input type="text" data-ac="owner" value="' + esc(a.owner) + '"></label><label class="t11-f"><span>Custo (' + MOEDAS[st.moeda] + ')</span><input type="number" min="0" data-ac="cost" value="' + (+a.cost || 0) + '"></label>' +
            '<label class="t11-f"><span>Semanas</span><input type="number" min="0" data-ac="weeks" value="' + (+a.weeks || 0) + '"></label><label class="t11-f"><span>Situação</span><select data-ac="status">' + opts(STATUS_ACAO, a.status) + '</select></label><button type="button" class="btn-txt pa-rm" data-arm="' + a.id + '">Remover</button></div>';
        }).join('') : '<p class="t11-aviso">Nenhuma ação ainda. Use “Sugerir ações críticas” ou “Adicionar ação”.</p>') + '<p class="pa-tot" id="pa-tot" style="margin-top:10px;font-size:13.5px">' + textoTotais() + '</p>';
    }
    function pRes() {
      var r = calcula(), E = TR.ad2.escala_9_niveis[r.nivel - 1], inval = +st.trlAlvo <= +st.trlAtual, ps = passos();
      var falta = []; perfil().domains.forEach(function (d, i) { if (!domFeito(d)) falta.push([i + 1, d.short || d.name]); });
      var leit = 'Para levar <b>' + esc(st.tecnologia || 'a tecnologia') + '</b> do <b>TRL ' + st.trlAtual + '</b> ao <b>TRL ' + st.trlAlvo + '</b>, o índice de dificuldade é <b>' + A.br(r.idx, 2) + '</b>, nível AD² <b>' + r.nivel + '</b> (' + esc(E.rotulo_curto.toLowerCase()) + ', dificuldade ' + esc(E.faixa.toLowerCase()) + '). ' + esc(E.descricao) + ' A dimensão mais difícil é <b>' + esc(r.doms.slice().sort(function (a, b) { return b.m - a.m; })[0].d.name) + '</b>' + (r.crit.length ? ', e há <b>' + r.crit.length + '</b> indicador(es) crítico(s) (nota 7 ou mais).' : ', sem indicadores críticos.');
      return '<div class="t11-res-topo"><div><span class="t11-num">Resultado AD²</span><div class="t11-big" style="--c:' + ADCOR[r.nivel - 1] + '"><b>' + r.nivel + '</b><div><strong>' + esc(E.rotulo_curto) + '</strong><span>' + esc(E.faixa) + ' · índice ' + A.br(r.idx, 2) + ' · probabilidade de risco ' + E.prob_risco_pct + '%</span><span class="t11-risco" style="background:' + RISCO_COR[r.cls] + ';margin-top:10px">Risco ' + esc(RISCO_ROT[r.cls]) + '</span></div></div></div>' +
        '<div class="t11-stats"><div class="t11-stat"><span>Salto de TRL</span><b>' + st.trlAtual + ' → ' + st.trlAlvo + '</b></div><div class="t11-stat"><span>Probabilidade × consequência</span><b>P' + r.pr + ' × C' + r.cons + '</b></div><div class="t11-stat"><span>Completude</span><b>' + r.comp + '%</b></div><div class="t11-stat"><span>Plano de maturação</span><b>' + totaisAcoes().n + ' ação(ões)</b></div></div></div>' +
        '<div style="display:grid;gap:10px;margin-top:16px">' + (inval ? '<div class="t11-ruim">O TRL alvo precisa ser maior que o atual. Ajuste no passo Projeto.</div>' : '') + (falta.length ? '<div class="t11-nota">Há dimensões sem resposta completa (' + falta.map(function (f) { return esc(f[1]); }).join(', ') + '). Indicadores sem nota entram como 1, o que pode subestimar a dificuldade.</div>' : '') + '<div class="t11-card" style="box-shadow:none"><p style="margin:0;color:var(--ink)">' + leit + '</p></div></div>' +
        '<div class="t11-res-grade"><div><h4>Matriz de risco 5×5</h4>' + matrizHtml(r) + '</div><div><h4>Dificuldade por dimensão</h4><div class="t11-barras">' + r.doms.map(function (x) { return '<div class="t11-barra"><span>' + esc(x.d.short || x.d.name) + '</span><div><i style="width:' + (x.m / 9 * 100) + '%"></i></div><b>' + A.br(x.m, 1) + '</b></div>'; }).join('') + '</div></div>' +
        '<div><h4>Indicadores críticos (nota 7 ou mais): ' + r.crit.length + '</h4>' + (r.crit.length ? '<ul class="lista-pontos" style="margin-top:6px">' + r.crit.map(function (c) { return '<li><b>' + c.v + '</b> · ' + esc(c.q) + '</li>'; }).join('') + '</ul>' : '<p class="t11-aviso">Nenhum indicador crítico.</p>') + '</div></div>' +
        '<div class="t11-plano" id="ad2-plano">' + planoHtml() + '</div>' +
        '<div class="t11-acoes"><button type="button" class="btn-azul peq" id="ad2-copiar">Copiar síntese</button><button type="button" class="btn-linha peq" id="ad2-exp">Exportar JSON</button><button type="button" class="btn-linha peq" id="ad2-imp">Importar JSON</button><button type="button" class="btn-linha peq" id="ad2-print">Imprimir</button><button type="button" class="btn-linha peq" id="ad2-limpar">Recomeçar</button></div><input type="file" id="ad2-arq" accept="application/json,.json" hidden>' +
        '<p class="t11-aviso">Simplificação do método de Bilbro (NASA, 2008): não reproduz o AHP com lógica fuzzy de Zhao e Wei (2015). O AD² não tem questionário único e universal. Resultado apoia decisão e planejamento, sem substituir evidência técnica nem avaliação formal. Salvo automaticamente neste navegador; exporte o JSON para guardar ou enviar.</p><p class="t11-aviso" id="ad2-msg" role="status"></p>' + barraNav();
    }
    function intro() {
      return '<div class="g11-cab"><div><h3 class="t11-h">Calculadora AD²</h3><p class="g11-sub">Dê notas de 1 a 9 por dimensão e veja a dificuldade do salto.</p></div><details class="g11-esc"><summary>Escala AD²</summary><div class="t11-rolavel"><table class="t11-tab"><thead><tr><th>Nível</th><th>Leitura</th><th>Dificuldade</th><th>Risco</th></tr></thead><tbody>' + TR.ad2.escala_9_niveis.map(function (n) { return '<tr><td style="color:' + ADCOR[n.nivel - 1] + '">' + n.nivel + '</td><td>' + esc(n.rotulo_curto) + '</td><td>' + esc(n.faixa) + '</td><td>' + n.prob_risco_pct + '%</td></tr>'; }).join('') + '</tbody></table></div></details></div>';
    }
    function monta() {
      var ps = passos(); if (passo >= ps.length || passo < 0) passo = 0;
      var k = ps[passo][0], corpo = k === 'proj' ? pProj() : k === 'cons' ? pCons() : k === 'res' ? pRes() : pDom(perfil().domains.filter(function (d) { return 'd:' + d.id === k; })[0]);
      el.innerHTML = '<section class="t11-sec">' + intro() + stepper() + '<div class="t11-painel" id="t11-painel">' + corpo + '</div></section>' +
        '<section class="t11-sec"><details class="g11-fontes"><summary>Referências metodológicas</summary><ol class="t11-fontes"><li>Bilbro, J. W. (2008). Using the Advancement Degree of Difficulty (AD²) as an Input to Risk Management. DTIC ADA507591.</li><li>Zhao, D.; Wei, F. (2015). Advancement Degree of Difficulty Assessment Method for Complex Products. DOI 10.2991/978-94-6239-100-0_19.</li><li>U.S. GAO (2020). Technology Readiness Assessment Guide, GAO-20-48G.</li></ol></details></section>';
      var s = el.querySelector('.t11-steps [aria-current]'); if (s && s.scrollIntoView) { try { s.scrollIntoView({block: 'nearest', inline: 'center'}); } catch (e) {} }
    }
    function vai(i) { passo = Math.max(0, Math.min(passos().length - 1, i)); grava(KP, passo); monta(); var n = box.querySelector('.fin-abas'); if (n) window.scrollTo(0, n.getBoundingClientRect().top + window.scrollY - 70); }
    function atualizaStep() { el.querySelectorAll('.t11-steps button').forEach(function (b, i) { var f = feito(i); b.classList.toggle('feito', f); b.firstChild.textContent = f ? '✓' : String(i + 1); }); var k = passos()[passo][0], pg = el.querySelector('#t11-prog'); if (pg && k.indexOf('d:') === 0) { var d = perfil().domains.filter(function (x) { return 'd:' + x.id === k; })[0]; pg.textContent = d.questions.filter(function (qq) { return st.notas[qq[0]]; }).length + ' de ' + d.questions.length + ' respondidos'; } }
    function msg(t) { var m = el.querySelector('#ad2-msg'); if (m) { m.textContent = t; setTimeout(function () { if (m.textContent === t) m.textContent = ''; }, 4000); } }
    function sintese() {
      var r = calcula(), E = TR.ad2.escala_9_niveis[r.nivel - 1], t = totaisAcoes();
      return 'Avaliação AD² (Atlas da Inovação)\nProjeto: ' + (st.projeto || '—') + '\nTecnologia: ' + (st.tecnologia || '—') + '\nUnidade de análise: ' + st.escopo + '\nResponsável: ' + (st.avaliador || '—') + ' · Data: ' + (st.data || '—') + '\nTRL ' + st.trlAtual + ' → ' + st.trlAlvo + '\nPerfil: ' + perfil().name + '\nÍndice: ' + A.br(r.idx, 2) + ' · Nível AD² ' + r.nivel + ' (' + E.rotulo_curto + ', ' + E.faixa + ', risco ' + E.prob_risco_pct + '%)\nProbabilidade ' + r.pr + ' × consequência ' + r.cons + ' = risco ' + RISCO_ROT[r.cls] + '\nDimensões: ' + r.doms.map(function (x) { return x.d.name + ' ' + A.br(x.m, 1); }).join('; ') + '\nCríticos: ' + (r.crit.map(function (c) { return c.q + ' (' + c.v + ')'; }).join('; ') || 'nenhum') + '\nPlano de maturação: ' + t.n + ' ação(ões), custo ' + MOEDAS[st.moeda] + ' ' + A.br(t.custo) + ', duração ' + t.semanas + ' semanas\nCompletude: ' + r.comp + '%' + (st.contexto ? '\nContexto: ' + st.contexto : '');
    }
    /* mesmo formato da versão anterior: avaliações salvas entram por Importar JSON */
    function exporta() {
      var answers = {}, touched = {}; Object.keys(CALC.perfis).forEach(function (k) { CALC.perfis[k].domains.forEach(function (d) { d.questions.forEach(function (qq) { answers[qq[0]] = st.notas[qq[0]] || 1; if (st.notas[qq[0]]) touched[qq[0]] = true; }); }); });
      baixa('avaliacao-ad2' + (st.projeto ? '-' + slug(st.projeto) : '') + '.json', {versao: 'atlas-v2', form: {projeto: st.projeto, tecnologia: st.tecnologia, escopo: st.escopo, avaliador: st.avaliador, trlAtual: String(st.trlAtual), trlAlvo: String(st.trlAlvo), data: st.data, moeda: st.moeda, contexto: st.contexto}, profileId: st.perfil, rounding: st.arred, answers: answers, touched: touched, evidence: st.evidence, weights: st.pesos, cons: st.cons, consNotes: st.consNotes, actions: st.acoes});
    }
    function importa(arq) {
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var d = JSON.parse(fr.result), f = d.form || {};
          ['projeto', 'tecnologia', 'escopo', 'avaliador', 'data', 'moeda', 'contexto'].forEach(function (k) { if (typeof f[k] === 'string') st[k] = f[k]; });
          if (f.trlAtual) st.trlAtual = +f.trlAtual; if (f.trlAlvo) st.trlAlvo = +f.trlAlvo;
          if (d.profileId && CALC.perfis[d.profileId]) st.perfil = d.profileId;
          if (d.rounding) st.arred = d.rounding;
          if (d.answers) { st.notas = {}; Object.keys(d.answers).forEach(function (k) { if (!d.touched || d.touched[k]) st.notas[k] = +d.answers[k]; }); }
          if (d.evidence) st.evidence = d.evidence; if (d.weights) st.pesos = d.weights; if (d.cons) st.cons = Object.assign({technical: 1, schedule: 1, cost: 1}, d.cons);
          if (typeof d.consNotes === 'string') st.consNotes = d.consNotes; if (Array.isArray(d.actions)) st.acoes = d.actions;
          salva(); passo = passos().length - 1; grava(KP, passo); monta(); msg('Avaliação importada.');
        } catch (er) { msg('Arquivo inválido.'); }
      };
      fr.readAsText(arq);
    }
    function acaoDe(t) { var w = t.closest('[data-aid]'); return w ? st.acoes.filter(function (x) { return x.id === w.getAttribute('data-aid'); })[0] : null; }
    box.oninput = function (e) {
      var t = e.target, k, ac;
      if ((k = t.getAttribute('data-ev'))) { st.evidence[k] = t.value; salva(); }
      else if ((k = t.getAttribute('data-peso'))) { st.pesos[k] = +t.value; salva(); }
      else if (t.hasAttribute('data-consnotes')) { st.consNotes = t.value; salva(); }
      else if ((k = t.getAttribute('data-ac')) && (ac = acaoDe(t))) { ac[k] = (k === 'cost' || k === 'weeks') ? Math.max(0, +t.value || 0) : t.value; salva(); var pt = el.querySelector('#pa-tot'); if (pt) pt.innerHTML = textoTotais(); }
      else if ((k = t.getAttribute('data-c')) && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) { st[k] = t.value; salva(); if (k === 'projeto' || k === 'tecnologia') atualizaStep(); }
    };
    box.onchange = function (e) {
      var t = e.target, k, ac;
      if (t.id === 'ad2-arq') { if (t.files[0]) importa(t.files[0]); t.value = ''; return; }
      if ((k = t.getAttribute('data-ac')) && t.tagName === 'SELECT') { if ((ac = acaoDe(t))) { ac[k] = t.value; salva(); } return; }
      if ((k = t.getAttribute('data-c')) && t.tagName === 'SELECT') { st[k] = (k === 'trlAtual' || k === 'trlAlvo') ? +t.value : t.value; salva(); if (k === 'perfil') monta(); else atualizaStep(); }
      else if ((k = t.getAttribute('data-cons'))) { st.cons[k] = +t.value; salva(); }
    };
    box.onclick = function (e) {
      var id = e.target.id, b;
      if ((b = e.target.closest('[data-passo]'))) { vai(+b.getAttribute('data-passo')); return; }
      if ((b = e.target.closest('[data-ir]'))) { vai(passo + +b.getAttribute('data-ir')); return; }
      if ((b = e.target.closest('button[data-nota]'))) {
        var qid = b.getAttribute('data-nota'), v = +b.getAttribute('data-v');
        if (st.notas[qid] === v) delete st.notas[qid]; else st.notas[qid] = v;
        b.parentNode.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(st.notas[qid] === +x.getAttribute('data-v'))); });
        var rt = el.querySelector('[data-vrot="' + qid + '"]'); if (rt) rt.innerHTML = st.notas[qid] ? '<b>' + st.notas[qid] + '</b> · ' + esc(CALC.escala_resposta.rotulos[st.notas[qid]]) : 'Sem resposta (conta como 1)';
        salva(); atualizaStep(); return;
      }
      if (id === 'ad2-limpar') { if (!window.confirm('Limpar todos os dados desta avaliação?')) return; st = stNovo(st.perfil); salva(); passo = 0; grava(KP, 0); monta(); return; }
      if (id === 'ad2-pesos') { var P = perfil(), vv = Math.round(100 / P.domains.length * 100) / 100; P.domains.forEach(function (d) { st.pesos[d.id] = vv; }); salva(); el.querySelectorAll('[data-peso]').forEach(function (i) { i.value = st.pesos[i.getAttribute('data-peso')]; }); return; }
      if (id === 'ad2-exp') { exporta(); return; }
      if (id === 'ad2-imp') { el.querySelector('#ad2-arq').click(); return; }
      if (id === 'ad2-print') { window.print(); return; }
      if (id === 'ad2-copiar') { copia(sintese(), e.target, 'Copiar síntese'); return; }
      if (id === 'ad2-add') { st.acoes.push({id: uid(), profile: st.perfil, domain: perfil().domains[0].id, description: '', owner: '', cost: 0, weeks: 0, status: 'Planejada', sourceQid: ''}); salva(); el.querySelector('#ad2-plano').innerHTML = planoHtml(); return; }
      if (id === 'ad2-sug') {
        var ja = {}; acoesVis().forEach(function (a) { if (a.sourceQid) ja[a.sourceQid] = 1; });
        var novas = calcula().crit.filter(function (c) { return !ja[c.qid]; }).map(function (c) { return {id: uid(), profile: st.perfil, domain: c.did, description: 'Reduzir a dificuldade: ' + c.q, owner: '', cost: 0, weeks: 0, status: 'Planejada', sourceQid: c.qid}; });
        if (!novas.length) { msg('Nenhum indicador com nota 7, 8 ou 9 sem ação.'); return; }
        st.acoes = st.acoes.concat(novas); salva(); el.querySelector('#ad2-plano').innerHTML = planoHtml(); msg(novas.length + ' ação(ões) sugerida(s).'); return;
      }
      if ((b = e.target.closest('[data-arm]'))) { st.acoes = st.acoes.filter(function (a) { return a.id !== b.getAttribute('data-arm'); }); salva(); el.querySelector('#ad2-plano').innerHTML = planoHtml(); }
    };
    monta();
  }


  /* ================= Aba 4: Como usar no projeto ================= */
  function aUso(A, el) {
    var esc = A.esc;
    var passos = [
      ['1', '#7C3AED', 'TRL inicial', 'O que já está provado hoje, com documento que mostre.'],
      ['2', '#2563EB', 'TRL final', 'O nível que o projeto entrega, com o ensaio que comprova.'],
      ['3', '#0F766E', 'Evidências', 'Cada marco aponta o laudo, relatório ou ata que o prova.']
    ];
    var erros = [
      ['Pular níveis', 'TRL 6 sem ter validado no ambiente relevante.', '#DC2626'],
      ['Inflar o inicial', 'Um componente bom não eleva o sistema.', '#EA580C'],
      ['Salto grande', 'Prazo e orçamento curtos para muitos níveis.', '#CA8A04'],
      ['Esquecer a empresa', 'PI, parceiros, cliente e certificação também avançam.', '#DB2777']
    ];
    el.innerHTML =
      '<section class="t11-sec"><div class="g11-cab"><div><h3 class="t11-h">Como declarar o TRL no projeto</h3></div></div>' +
      '<div class="g11-tres">' + passos.map(function (p) { return '<div class="g11-card" style="--c:' + p[1] + '"><h4><b class="g11-n">' + p[0] + '</b>' + esc(p[2]) + '</h4><p>' + esc(p[3]) + '</p></div>'; }).join('') + '</div></section>' +
      '<section class="t11-sec"><div class="g11-cab"><div><h3 class="t11-h">Modelo de texto</h3></div><button type="button" class="btn-linha peq" id="uso-copiar">Copiar modelo</button></div>' +
      '<p class="g11-modelo" id="uso-modelo">A tecnologia <b>[nome]</b>, aplicada a <b>[uso]</b> no ambiente <b>[ambiente]</b>, está em <b>TRL [n]</b>, evidenciado por <b>[relatório ou ensaio]</b>. Em <b>[prazo]</b> meses o projeto a levará ao <b>TRL [m]</b>, demonstrado por <b>[ensaio e critério de aceite]</b>.</p></section>' +
      '<section class="t11-sec"><div class="g11-cab"><div><h3 class="t11-h">Erros comuns</h3></div></div><div class="g11-quatro">' +
      erros.map(function (e) { return '<div class="g11-card" style="--c:' + e[2] + '"><h4>' + esc(e[0]) + '</h4><p>' + esc(e[1]) + '</p></div>'; }).join('') + '</div></section>' +
      '<section class="t11-sec"><div class="t11-acoes" style="margin:0"><a class="btn-azul" href="#/trl?aba=calc-trl">Calcular o TRL</a><a class="btn-linha" href="#/trl?aba=calc-ad2">Calcular o AD²</a><a class="btn-linha" href="#/trl?aba=entenda">Ver a escala</a></div>' +
      '<details class="g11-fontes"><summary>Fontes</summary>' + fontesHtml(A, [0, 2, 3, 4, 9, 10]) + '<p class="t11-aviso">Orientação prática de redação: o anexo de TRL do edital sempre manda.</p></details></section>';
    el.onclick = null;
    var bt = el.querySelector('#uso-copiar');
    if (bt) bt.onclick = function () { copia(el.querySelector('#uso-modelo').textContent, bt, 'Copiar modelo'); };
  }
})();
