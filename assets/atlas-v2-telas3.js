/* Atlas v2 · rodada 3 — Simulador, TRL & AD² (com calculadora), DNA da Inovação e Propriedade Intelectual.
   Regras e dados vêm do Atlas publicado (assets/atlas-v2-dados-r3.js; DNA carregado sob demanda). */
(function () {
  'use strict';
  var T = window.AV2_TELAS, U = window.AV2_UTIL, R = window.ATLAS2_R3;
  R.pi.ipc_rotulos = {A: 'Necessidades humanas', B: 'Operações e transporte', C: 'Química e metalurgia', D: 'Têxteis e papel', E: 'Construções fixas', F: 'Máquinas e motores', G: 'Física e instrumentos', H: 'Eletricidade'};
  function ls(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function grava(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function reais(v, br) { if (!v) return '—'; return v >= 1e9 ? 'R$ ' + br(v / 1e9, 1) + ' bi' : v >= 1e6 ? 'R$ ' + br(v / 1e6, v >= 1e8 ? 0 : 1) + ' mi' : 'R$ ' + br(v / 1e3, 0) + ' mil'; }
  function barrasH(A, pares, fmt, link) {
    var mx = Math.max.apply(null, pares.map(function (p) { return p[1]; }).concat([1]));
    return '<div class="barras-h">' + pares.map(function (p) {
      var ab = link ? '<a href="' + link(p) + '">' : '<div>';
      return ab + '<span title="' + A.esc(p[0]) + '">' + A.esc(p[0]) + '</span><i style="width:' + Math.max(1, p[1] / mx * 100).toFixed(1) + '%"></i><b>' + (fmt ? fmt(p[1]) : A.br(p[1])) + '</b>' + (link ? '</a>' : '</div>');
    }).join('') + '</div>';
  }
  function serieAnos(A, obj, parciais) {
    var anos = Object.keys(obj).map(Number).filter(function (a) { return a > 1990; }).sort(function (a, b) { return a - b; });
    if (!anos.length) return '<p class="txt">Sem série.</p>';
    var W = 1000, H = 220, x0 = 46, y0 = 190, w = (W - x0 - 10) / anos.length, mx = Math.max.apply(null, anos.map(function (a) { return obj[a]; }));
    var s = '<div class="serie"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Série por ano">';
    [0, .5, 1].forEach(function (f) { var y = y0 - f * (y0 - 14); s += '<line class="eixo" x1="' + x0 + '" x2="' + (W - 10) + '" y1="' + y + '" y2="' + y + '" stroke-dasharray="' + (f ? '3 4' : '') + '"/><text x="' + (x0 - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + A.br(Math.round(mx * f)) + '</text>'; });
    anos.forEach(function (a, i) {
      var h = obj[a] / mx * (y0 - 14), x = x0 + i * w;
      s += '<rect class="b' + (parciais && parciais.indexOf(a) >= 0 ? ' parcial' : '') + '" x="' + (x + w * .14).toFixed(1) + '" y="' + (y0 - h).toFixed(1) + '" width="' + (w * .72).toFixed(1) + '" height="' + Math.max(h, 1).toFixed(1) + '" rx="2"><title>' + a + ': ' + A.br(obj[a]) + '</title></rect>';
      if (anos.length <= 14 || i % Math.ceil(anos.length / 12) === 0 || i === anos.length - 1) s += '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y0 + 18) + '" text-anchor="middle">' + a + '</text>';
    });
    return s + '</svg></div>';
  }

  /* ================= SIMULADOR ================= */
  var SIM = R.sim, ROTULOS = {};
  SIM.perguntas.forEach(function (p) { ROTULOS[p.id] = {}; p.opcoes.forEach(function (o) { ROTULOS[p.id][o.valor] = o.rotulo; }); });
  function pontua(e, a) {
    if (e.elimIf && e.elimIf(a)) return {st: 'elim', pct: 0, motivos: [e.elimMsg || 'Fora das regras do instrumento.']};
    var s = 0, r = [];
    function add(p, m) { s += p; if (m) r.push(m); }
    var t = +a.trl;
    if (e.trl) { if (t >= e.trl[0] && t <= e.trl[1]) add(22, 'TRL ' + t + ' dentro da faixa ' + e.trl[0] + ' a ' + e.trl[1]); else if (t >= e.trl[0] - 1 && t <= e.trl[1] + 1) add(9, 'TRL perto da faixa ' + e.trl[0] + ' a ' + e.trl[1]); }
    if (e.portes && e.portes.indexOf(a.porte) >= 0) add(16, 'Porte elegível');
    if (e.setores === 'all') add(6, null); else if (e.setores && e.setores.indexOf(a.setor) >= 0) add(24, 'Setor prioritário');
    if (e.apoio && a.apoio !== 'ns' && e.apoio.indexOf(a.apoio) >= 0) add(14, 'Tipo de apoio que você busca');
    if (e.risco && a.risco !== 'ns' && e.risco.indexOf(a.risco) >= 0) add(12, 'Nível de risco compatível');
    if (e.parceiro && a.parceiro !== 'nao' && e.parceiro.indexOf(a.parceiro) >= 0) add(14, 'Parceiro aceito');
    if (e.objetivos && e.objetivos.indexOf(a.objetivo) >= 0) add(10, 'Objetivo coberto');
    if (e.resultados && e.resultados.indexOf(a.resultado) >= 0) add(8, null);
    if (e.orcamentos && e.orcamentos.indexOf(a.orcamento) >= 0) add(10, 'Orçamento na faixa');
    if (e.contrapartidas && e.contrapartidas.indexOf(a.contrapartida) >= 0) add(8, null);
    if (e.regioes && e.regioes.indexOf(a.regiao) >= 0) add(6, 'Região atendida');
    if (e.bonus) e.bonus(a, add);
    return {st: 'ok', pct: Math.max(0, Math.min(100, Math.round(s))), motivos: r.slice(0, 4)};
  }
  function faixaTier(p) { var f = SIM.regras.faixas; for (var i = 0; i < f.length; i++) if (p >= f[i].min) return [i + 1, f[i].label]; return [4, f[f.length - 1].label]; }
  var SIM_TITULO = 'Simulador de Fomentos'; /* nome da ferramenta: troque aqui (ex.: 'Identificador de Fomentos') */
  var BLOCOS = [['O projeto', ['trl', 'objetivo', 'resultado', 'risco']], ['A organização', ['porte', 'regime', 'setor', 'regiao']], ['Recursos e parceria', ['orcamento', 'contrapartida', 'apoio', 'parceiro']]];
  T.simulador = function (A, sub, q, box) {
    var esc = A.esc, D = A.D, ans = Object.assign({}, SIM.padrao, ls('atlas-sim-v2', {}));
    var porId = {}; SIM.perguntas.forEach(function (p) { porId[p.id] = p; });
    box.innerHTML = U.faixa(A, {olho: SIM_TITULO + ' · 12 perguntas', tit: 'Qual instrumento<br><em>serve ao seu projeto?</em>', txt: 'Responda sobre o projeto, a organização e os recursos. O ranking de <b>' + SIM.catalogo.length + ' instrumentos</b> muda a cada resposta, com os motivos e o que fica de fora.',
      dir: (function () {
        var D2 = A.D, nAb = A.ABERTAS.length, nIns = D2.instrumentos.length, nFin = D2.agencias.length, nIct = D2.icts.length;
        var PERG = ['Minha startup de software pode usar a Lei do Bem?', 'Qual instrumento serve para um projeto em TRL 4 com uma ICT?', 'Quais chamadas abertas aceitam empresa do Paraná?'];
        return '<div class="sim-sap" id="sim-sap"><div class="sap-topo"><div class="sap-ico" aria-hidden="true">IA</div><div><p class="sap-sel"><span>✦ Agente de IA</span> Sapiens</p><h4>Converse com um especialista em fomento</h4></div></div>' +
          '<p class="sap-txt">O Sapiens conhece tudo o que está no Atlas e responde como um consultor: elegibilidade, contrapartida, qual instrumento combina com o seu projeto e como montar a proposta.</p>' +
          '<div class="sap-nums"><div><b>' + nAb + '</b><span>chamadas abertas</span></div><div><b>' + nIns + '</b><span>instrumentos</span></div><div><b>' + nFin + '</b><span>financiadores</span></div><div><b>' + A.br(nIct) + '</b><span>ICTs</span></div></div>' +
          '<p class="sap-ex-tit">Experimente perguntar</p><div class="sap-ex">' + PERG.map(function (q) { return '<button type="button" data-sapq="' + A.esc(q) + '">“' + A.esc(q) + '”</button>'; }).join('') + '</div>' +
          '<button type="button" class="btn-azul sap-btn" data-sapiens>Conversar com o Sapiens ↗</button><p class="sap-nota">Responda as perguntas abaixo antes: a conversa já começa com o seu perfil.</p></div>';
      })(),
      num: ['12', 'perguntas'], quebra: [[String(SIM.catalogo.length), 'instrumentos avaliados'], [String(SIM.catalogo.filter(function (c) { return c.elimIf; }).length), 'com regra eliminatória'], ['0–100', 'escala de aderência']]}) +
      '<div class="wrap sim-lay"><form class="bloco form-sim" id="sim-form" onsubmit="return false">' +
        BLOCOS.map(function (b) { return '<fieldset><legend>' + b[0] + '</legend><div class="sim-grid">' + b[1].map(function (id) { var p = porId[id]; return '<label class="campo-f"><span>' + esc(p.texto.replace(/^\d+\s*\S\s+/, '')) + '</span>' + (p.ajuda ? '<small>' + esc(p.ajuda) + '</small>' : '') + '<select class="f-sel" data-q="' + id + '">' + p.opcoes.map(function (o) { return '<option value="' + esc(o.valor) + '"' + (ans[id] === o.valor ? ' selected' : '') + '>' + esc(o.rotulo) + '</option>'; }).join('') + '</select></label>'; }).join('') + '</div></fieldset>'; }).join('') +
        '<button type="button" class="btn-txt" id="sim-reset" style="margin-top:16px">Voltar às respostas padrão</button></form>' +
      '<div class="sim-res" id="sim-res"></div></div>';
    U.ativaCampos(A, box);
    function ficha(e) { return D.instrumentos.some(function (i) { return i.id === e.instrId; }) ? '#/instrumentos/' + encodeURIComponent(e.instrId) : e.agenteId ? '#/agentes/' + encodeURIComponent(e.agenteId) : '#/instrumentos'; }
    function desenha() {
      grava('atlas-sim-v2', ans);
      var res = SIM.catalogo.map(function (e) { return {e: e, r: pontua(e, ans)}; });
      var ok = res.filter(function (x) { return x.r.st === 'ok'; }).sort(function (a, b) { return b.r.pct - a.r.pct; }), el = res.filter(function (x) { return x.r.st === 'elim'; });
      var top = ok.slice(0, 10), ids = top.slice(0, 6).map(function (x) { return x.e.id; });
      var rot = function (k) { return (ROTULOS[k][ans[k]] || '').replace(/^TRL \d+ — /, '').toLowerCase(); };
      var passos = ['Formalize escopo, cronograma e orçamento do projeto em uma página: todo instrumento pede isso.', 'Confira no Radar se há chamada aberta para os mais aderentes.'];
      if (ids.some(function (i) { return ['embrapii', 'embrapii-sebrae', 'bndes-funtec', 'lei-inovacao'].indexOf(i) >= 0; })) passos.push('Procure uma Unidade EMBRAPII ou ICT com competência no tema: veja o Mapa de ICTs.');
      if (ids.some(function (i) { return ['finep-subvencao', 'finep-tecnova', 'embrapii', 'finep-credito'].indexOf(i) >= 0; })) passos.push('Junte evidências do risco tecnológico e do TRL atual: a calculadora TRL & AD² ajuda.');
      if (ans.contrapartida === 'nao') passos.push('Sem contrapartida financeira, priorize Centelha, Sebrae, bolsas e as FAPs. EMBRAPII e Finep, em geral, exigem aporte da empresa.'); else passos.push('Confirme a contrapartida financeira disponível em caixa.');
      if (ids.some(function (i) { return ['faps', 'pipe-fapesp', 'finep-tecnova', 'finep-centelha'].indexOf(i) >= 0; })) passos.push('Veja os editais da FAP do seu estado em Oportunidades por estado.');
      if (ans.regime === 'real') passos.push('Com Lucro Real, use a Lei do Bem em paralelo para os dispêndios de P&D do ano.');
      $res().innerHTML =
                '<div class="sim-cont"><h2 class="tit-md"><b>' + ok.length + '</b> instrumento' + (ok.length === 1 ? ' aderente' : 's aderentes') + ' · <b>' + el.length + '</b> eliminado' + (el.length === 1 ? '' : 's') + '</h2><p class="aviso-txt">Lógica híbrida: filtros eliminatórios, depois pontuação por aderência, depois ranking. Por exemplo, a Lei do Bem é eliminada fora do Lucro Real, e a EMBRAPII exige contrapartida financeira.</p></div>' +
        '<div class="bloco"><h4 class="olho">Leitura do seu caso</h4><p class="leitura" style="margin-top:10px">Para um projeto em <b>TRL ' + ans.trl + '</b> (' + esc(rot('trl')) + '), de <b>' + esc(rot('porte')) + '</b> no setor <b>' + esc(rot('setor')) + '</b>, buscando <b>' + esc(rot('apoio')) + '</b>, os mais aderentes são ' + top.slice(0, 3).map(function (x) { return '<b>' + esc(x.e.nome) + '</b>'; }).join(', ') + '. ' + (el.length ? el.length + ' instrumento' + (el.length > 1 ? 's ficam' : ' fica') + ' de fora pelas regras de elegibilidade.' : '') + '</p><p class="aviso-txt">Resultado heurístico, a partir das regras do Atlas. Não substitui a leitura do edital nem a validação técnica e jurídica.</p></div>' +
        top.map(function (x, i) {
          var t = faixaTier(x.r.pct), nCh = A.ABERTAS.filter(function (c) { return c.instrumento === x.e.instrId; }).length;
          return '<article class="bloco rank t' + t[0] + '"><span class="rank-n">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span><div><h3><a href="' + ficha(x.e) + '">' + esc(x.e.nome) + '</a></h3><p class="tipo">' + esc(x.e.tipo || '') + '</p>' + (x.e.msg ? '<p class="msg">' + esc(x.e.msg) + '</p>' : '') +
            (x.r.motivos.length ? '<div class="tags">' + x.r.motivos.map(function (m) { return '<span class="tag">✓ ' + esc(m) + '</span>'; }).join('') + '</div>' : '') + '</div>' +
            '<div class="rank-pct"><b>' + x.r.pct + '%</b><span>' + esc(t[1]) + '</span></div><div class="rank-barra"><i style="width:' + x.r.pct + '%"></i></div>' +
            '<div class="rank-links"><a class="btn-txt" href="' + ficha(x.e) + '">Ver a ficha</a>' + (nCh ? '<a class="btn-txt" href="' + ficha(x.e) + '">' + nCh + ' chamada' + (nCh > 1 ? 's abertas' : ' aberta') + ' agora</a>' : '') + '</div></article>';
        }).join('') +
        (el.length ? '<details class="bloco elim"><summary>Fora do seu caso (' + el.length + ')</summary><ul>' + el.map(function (x) { return '<li><b>' + esc(x.e.nome) + '</b>: ' + esc(x.r.motivos[0]) + '</li>'; }).join('') + '</ul></details>' : '') +
        '<div class="bloco"><h4 class="olho">Próximos passos</h4>' + U.lista(A, passos, 'passos') + '</div>' +
        '';
      box._resumoSim = 'Simulei meu projeto no Atlas da Inovação. Perfil: ' + SIM.perguntas.map(function (p) { return p.texto.replace(/^\d+\s*\S\s+/, '') + ': ' + (ROTULOS[p.id][ans[p.id]] || ''); }).join('; ') + '. Instrumentos mais aderentes: ' + top.slice(0, 5).map(function (x) { return x.e.nome + ' (' + x.r.pct + '%)'; }).join(', ') + '. Como devo seguir?';
    }
    function $res() { return box.querySelector('#sim-res'); }
    box.onchange = function (e) { var k = e.target.getAttribute('data-q'); if (k) { ans[k] = e.target.value; desenha(); } };
    box.onclick = function (e) { var sq = e.target.closest('[data-sapq]'); if (sq) { window.AV2_abreSapiens(sq.getAttribute('data-sapq'), sq); return; } if (e.target.closest('[data-sapiens]')) { window.AV2_abreSapiens(box._resumoSim, e.target.closest('[data-sapiens]')); return; } if (e.target.id === 'sim-reset') { ans = Object.assign({}, SIM.padrao); box.querySelectorAll('[data-q]').forEach(function (s) { s.value = ans[s.getAttribute('data-q')]; }); desenha(); } };
    box.oninput = null;
    desenha();
    if (/(^|&)sap=1/.test(q || '')) setTimeout(function () { var c = box.querySelector('#sim-sap'); if (c) { c.scrollIntoView({block: 'center', behavior: 'smooth'}); c.classList.add('pulsa'); setTimeout(function () { c.classList.remove('pulsa'); }, 2400); } }, 120);
  };

  /* ================= TRL & AD² ================= */
  var TR = R.trl, CALC = TR.calculadora;
  var RISCO_COR = CALC.matriz_risco_5x5.cores, RISCO_ROT = CALC.matriz_risco_5x5.rotulos, MATRIZ = CALC.matriz_risco_5x5.linhas_consequencia_5_a_1;
  function prob(n) { return n <= 3 ? 1 : n <= 5 ? 2 : n === 6 ? 3 : n <= 8 ? 4 : 5; }
  T.trl = function (A, sub, q, box, mesma) {
    var esc = A.esc, aba = sub === 'ad2' ? 'ad2' : sub === 'calculadora' ? 'calc' : 'trl';
    var abas = '<nav class="abas" aria-label="Seções"><a href="#/trl" class="' + (aba === 'trl' ? 'ativa' : '') + '">Escala TRL</a><a href="#/trl/ad2" class="' + (aba === 'ad2' ? 'ativa' : '') + '">O que é o AD²</a><a href="#/trl/calculadora" class="' + (aba === 'calc' ? 'ativa' : '') + '">Calculadora AD²</a></nav>';
    var fx = U.faixa(A, {olho: 'TRL & método AD²', tit: 'Quão madura é a tecnologia,<br><em>e quão difícil é avançar</em>', txt: 'O <b>TRL</b> diz onde a tecnologia está, de 1 a 9. O <b>AD²</b> mede a dificuldade de chegar ao TRL alvo e vira risco numa matriz 5×5.', abas: abas});
    if (aba === 'trl') return escalaTRL(A, box, fx, sub, q);
    if (aba === 'ad2') return explicaAD2(A, box, fx);
    return calculadora(A, box, fx);
  };
  function cobre(n) { return SIM.catalogo.filter(function (c) { return c.trl && n >= c.trl[0] && n <= c.trl[1]; }); }
  function escalaTRL(A, box, fx, sub, q) {
    var esc = A.esc, sel = +((/(?:^|&)n=(\d)/.exec(q || '') || [])[1] || 4);
    function desenha() {
      var nv = TR.trl.niveis[sel - 1], cob = cobre(sel);
      box.querySelector('#trl-det').innerHTML = '<p class="olho">' + esc((TR.trl.fases.filter(function (f) { return f.id === nv.fase || (f.id === 'desenv' && nv.fase !== 'pesquisa' && nv.fase !== 'operacao'); })[0] || {}).nome || '') + '</p><h2 class="tit-md" style="margin-top:6px">' + esc(nv.rotulo) + '</h2><p class="txt">' + esc(nv.descricao) + '</p>' +
        (sel === 4 || sel === 5 ? '<p class="txt"><span class="vale">Vale da morte</span> É nesta faixa que muitos projetos travam: já saíram da pesquisa, mas ainda não têm protótipo validado.</p>' : '') +
        '<h4 class="olho" style="margin-top:18px">Instrumentos do Simulador que cobrem TRL ' + sel + ' (' + cob.length + ')</h4><div class="tags" style="margin-top:10px">' + cob.map(function (c) { var tem = A.D.instrumentos.some(function (i) { return i.id === c.instrId; }); return tem ? '<a class="tag" style="text-decoration:none" href="#/instrumentos/' + encodeURIComponent(c.instrId) + '">' + esc(c.nome) + '</a>' : '<span class="tag">' + esc(c.nome) + '</span>'; }).join('') + '</div>' +
        '<a class="btn-linha peq" style="margin-top:16px" href="#/simulador">Simular meu projeto →</a>';
      box.querySelectorAll('.trl-nivel').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-n') === sel)); });
    }
    box.innerHTML = fx + '<div class="wrap" style="padding-bottom:110px"><div class="trl-fases">' + TR.trl.fases.map(function (f) {
      var ns = TR.trl.niveis.filter(function (n) { return n.fase === f.id; });
      if (!ns.length) ns = TR.trl.niveis.filter(function (n) { var k = f.id === 'pesquisa' ? [1, 2, 3] : f.id === 'desenv' ? [4, 5, 6] : [7, 8, 9]; return k.indexOf(n.nivel) >= 0; });
      return '<div class="bloco trl-fase"><h3>' + esc(f.nome) + '<small>' + esc(f.faixa) + '</small></h3><p>' + esc(f.desc) + '</p><div class="trl-niveis">' + ns.map(function (n) { return '<button type="button" class="trl-nivel" data-n="' + n.nivel + '" aria-pressed="false"><b>' + n.nivel + '</b><span>' + esc(n.curto) + (n.nivel === 4 || n.nivel === 5 ? '<span class="vale">vale da morte</span>' : '') + '<small>' + esc(n.descricao) + '</small></span></button>'; }).join('') + '</div></div>';
    }).join('') + '</div>' +
      '<div class="bloco largo" id="trl-det" aria-live="polite"></div>' +
      '<div class="ficha-duas"><div class="bloco"><h4 class="olho">Pontos práticos</h4>' + U.lista(A, TR.trl.pontos_praticos) + '</div><div class="bloco"><h4 class="olho">Como o fomento usa o TRL</h4>' + U.lista(A, TR.trl.uso_fomento) + '</div></div>' +
      '<p class="aviso-txt" style="margin-top:14px">Fontes: ' + TR.trl.fontes.map(esc).join('; ') + '.</p></div>';
    U.ativaCampos(A, box);
    box.onclick = function (e) { var b = e.target.closest('.trl-nivel'); if (!b) return; sel = +b.getAttribute('data-n'); history.replaceState(null, '', '#/trl?n=' + sel); desenha(); };
    box.onchange = null; box.oninput = null;
    desenha();
  }
  function explicaAD2(A, box, fx) {
    var esc = A.esc, E = TR.ad2.escala_9_niveis;
    box.innerHTML = fx + '<div class="wrap" style="padding-bottom:110px"><div class="ficha-duas" style="margin-top:28px"><div class="bloco"><h4 class="olho">O que é</h4><p class="txt">' + esc(TR.ad2.definicao) + ' O TRL diz <i>onde a tecnologia está</i>; o AD² diz <i>quão difícil será o próximo passo</i>.</p></div>' +
      '<div class="bloco alerta"><h4 class="olho">Por que importa</h4><p class="txt">O salto de esforço entre TRLs <b>não é linear</b>: ir de TRL 3 a 4 pode não custar o mesmo que de 6 a 7. O TRL sozinho não informa o que falta para completar o desenvolvimento. O AD² captura essa dificuldade e a transforma em <b>probabilidade de risco</b>, insumo direto para a gestão do projeto.</p></div></div>' +
      '<div class="bloco largo"><h4 class="olho">Escala de 9 níveis e probabilidade de risco</h4><div class="escala-ad2">' + E.map(function (n) { return '<div><b>' + n.nivel + '</b><p><strong>' + esc(n.rotulo_curto) + ' · ' + esc(n.faixa) + '</strong>' + esc(n.descricao) + '</p><span class="prob"><i style="--p:' + n.prob_risco_pct + '%"></i>' + n.prob_risco_pct + '%</span></div>'; }).join('') + '</div></div>' +
      '<div class="ficha-duas"><div class="bloco"><h4 class="olho">O que o AD² avalia</h4><p class="txt">O AD² é um conjunto de perguntas aplicadas a <b>cada elemento</b> do produto, do sistema ao componente. A pergunta não é sobre o elemento em si, mas esta: <i>você tem os recursos (pessoas, competências, ferramentas, instalações) para projetar, fabricar, testar e operar este elemento?</i> Bilbro e o GAO organizam as perguntas em cinco áreas funcionais.</p>' + U.lista(A, TR.ad2.cinco_areas_bilbro) +
        '<p class="aviso-txt">A variante de Zhao e Wei, para produtos complexos, usa cinco dimensões equivalentes e calcula o AD² por avaliação fuzzy com AHP (pesos definidos por especialistas). A calculadora do Atlas aplica as duas estruturas de forma simplificada.</p></div>' +
        '<div class="bloco"><h4 class="olho">Do AD² ao risco do programa</h4><p class="txt">O AD² foi concebido como <b>entrada para a gestão de risco</b>. O nível AD² define a <b>probabilidade</b> de um evento adverso (eixo P da matriz), que se cruza com a <b>consequência</b>, a maior entre desempenho técnico, cronograma e custo (eixo C), numa <b>matriz de risco 5×5</b> no formato do DoD. A posição na matriz classifica o risco em baixo (verde), moderado (amarelo) ou alto (vermelho) e orienta a necessidade de rotas duais ou múltiplas de desenvolvimento e de um plano de maturação.</p><a class="btn-azul peq" style="margin-top:16px" href="#/trl/calculadora">Abrir a calculadora</a></div></div>' +
      '<p class="aviso-txt" style="margin-top:14px">Fontes: ' + (TR.ad2.fontes || []).map(esc).join('; ') + '. Zhao e Wei (2015): <a href="https://doi.org/10.2991/978-94-6239-100-0_19" target="_blank" rel="noopener">doi.org/10.2991/978-94-6239-100-0_19</a>. GAO-20-48G: <a href="https://www.gao.gov/products/gao-20-48g" target="_blank" rel="noopener">gao.gov/products/gao-20-48g</a>.</p></div>';
    U.ativaCampos(A, box); box.onclick = null; box.onchange = null; box.oninput = null;
  }
  var MOEDAS = {BRL: 'R$', USD: 'US$', EUR: '€'}, STATUS_ACAO = ['Planejada', 'Em execução', 'Bloqueada', 'Concluída'];
  function hojeIso() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function stNovo(perfil) { return {perfil: perfil || 'bilbro', projeto: '', tecnologia: '', escopo: 'Componente', avaliador: '', data: hojeIso(), moeda: 'BRL', contexto: '', trlAtual: 3, trlAlvo: 6, notas: {}, pesos: {}, arred: 'ceil', cons: {technical: 1, schedule: 1, cost: 1}, consNotes: '', evidence: {}, acoes: []}; }
  function uid() { return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function calculadora(A, box, fx) {
    var esc = A.esc, st = Object.assign(stNovo(), ls('atlas-ad2-v2', {}));
    st.cons = Object.assign({technical: 1, schedule: 1, cost: 1}, st.cons || {}); st.notas = st.notas || {}; st.pesos = st.pesos || {}; st.evidence = st.evidence || {}; st.acoes = st.acoes || [];
    if (!CALC.perfis[st.perfil]) st.perfil = 'bilbro';
    function perfil() { return CALC.perfis[st.perfil]; }
    function opts(lista, atual) { return lista.map(function (o) { return '<option value="' + esc(o) + '"' + (String(atual) === String(o) ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join(''); }
    function form() {
      var P = perfil();
      return '<div class="bloco"><h4 class="olho">Projeto</h4><label class="campo-f"><span>Nome do projeto</span><input type="text" data-c="projeto" value="' + esc(st.projeto) + '"></label><label class="campo-f"><span>Tecnologia avaliada</span><input type="text" data-c="tecnologia" value="' + esc(st.tecnologia) + '"></label>' +
        '<div class="f-dupla"><label class="campo-f"><span>Unidade de análise</span><select class="f-sel" data-c="escopo">' + opts(CALC.campos_projeto.escopo, st.escopo) + '</select></label><label class="campo-f"><span>Moeda dos custos</span><select class="f-sel" data-c="moeda">' + opts(Object.keys(MOEDAS), st.moeda) + '</select></label></div>' +
        '<div class="f-dupla"><label class="campo-f"><span>Responsável pela avaliação</span><input type="text" data-c="avaliador" value="' + esc(st.avaliador) + '"></label><label class="campo-f"><span>Data</span><input type="date" data-c="data" value="' + esc(st.data) + '"></label></div>' +
        '<div class="f-dupla"><label class="campo-f"><span>TRL atual</span><select class="f-sel" data-c="trlAtual">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<option' + (+st.trlAtual === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label><label class="campo-f"><span>TRL alvo</span><select class="f-sel" data-c="trlAlvo">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<option' + (+st.trlAlvo === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label></div>' +
        '<label class="campo-f"><span>Contexto e premissas</span><textarea class="f-area" data-c="contexto" rows="3" placeholder="Premissas, limites da avaliação, ambiente de operação previsto.">' + esc(st.contexto) + '</textarea></label>' +
        '<label class="campo-f"><span>Perfil de avaliação</span><select class="f-sel" data-c="perfil">' + Object.keys(CALC.perfis).map(function (k) { return '<option value="' + k + '"' + (st.perfil === k ? ' selected' : '') + '>' + esc(CALC.perfis[k].name) + '</option>'; }).join('') + '</select><small>' + esc(P.description || '') + '</small></label>' +
        '<label class="campo-f"><span>Arredondamento</span><select class="f-sel" data-c="arred">' + CALC.arredondamento.map(function (o) { return '<option value="' + o.id + '"' + (st.arred === o.id ? ' selected' : '') + '>' + esc(o.rotulo) + '</option>'; }).join('') + '</select></label>' +
        '<p class="aviso-txt"><b>Cálculo:</b> média simples dos 5 indicadores de cada dimensão, média ponderada entre as dimensões e nível inteiro pela regra de arredondamento escolhida.</p></div>' +
        '<div class="bloco largo"><div class="dom-cab"><h4 class="olho">Pesos das dimensões</h4><button type="button" class="btn-linha peq" id="ad2-pesos">Distribuir pesos igualmente</button></div><div class="ad2-pesos">' + P.domains.map(function (d) { return '<label>' + esc(d.short || d.name) + '<input type="number" min="0" max="100" data-peso="' + d.id + '" value="' + (st.pesos[d.id] != null ? st.pesos[d.id] : 20) + '"></label>'; }).join('') + '</div></div>' +
        P.domains.map(function (d) {
          return '<div class="bloco largo"><div class="dom-cab"><h4 class="olho">' + esc(d.name) + '</h4></div><p class="txt" style="font-size:13.5px;margin-top:6px">' + esc(d.description || '') + '</p>' +
            d.questions.map(function (qq) {
              var v = st.notas[qq[0]] || 1, ev = st.evidence[qq[0]] || '';
              return '<div class="ind"><label><span>' + esc(qq[1]) + (qq[2] ? '<br><small>' + esc(qq[2]) + '</small>' : '') + '</span><span><input type="range" min="1" max="9" step="1" value="' + v + '" data-nota="' + qq[0] + '" aria-label="' + esc(qq[1]) + '"><span class="val"><span>1</span><b data-vrot="' + qq[0] + '">' + v + ' · ' + esc(CALC.escala_resposta.rotulos[v]) + '</b><span>9</span></span></span></label>' +
                '<details class="ev"' + (ev ? ' open' : '') + '><summary>Evidência ou justificativa</summary><textarea class="f-area" data-ev="' + qq[0] + '" rows="2" placeholder="Fonte, ensaio, documento, premissa ou lacuna observada.">' + esc(ev) + '</textarea></details></div>';
            }).join('') + '</div>';
        }).join('') +
        '<div class="bloco largo"><h4 class="olho">Consequência se a tecnologia falhar</h4>' + ['technical', 'schedule', 'cost'].map(function (k) { var nm = {technical: 'Técnica', schedule: 'Cronograma', cost: 'Custo'}[k]; return '<label class="campo-f"><span>' + nm + '</span><select class="f-sel" data-cons="' + k + '">' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (+st.cons[k] === n ? ' selected' : '') + '>' + n + ' · ' + esc(CALC.consequencias.descricoes[k][n]) + '</option>'; }).join('') + '</select></label>'; }).join('') +
          '<label class="campo-f"><span>Justificativa das consequências</span><textarea class="f-area" data-consnotes rows="2" placeholder="Por que o impacto técnico, no cronograma ou no custo é este.">' + esc(st.consNotes) + '</textarea></label></div>' +
        '<div class="bloco largo" id="ad2-plano"></div>' +
        '<div class="bloco largo"><h4 class="olho">Referências metodológicas</h4><ol class="ad2-refs"><li>Bilbro, J. W. (2008). <i>Using the Advancement Degree of Difficulty (AD²) as an Input to Risk Management</i>. DTIC ADA507591.</li><li>Zhao, D.; Wei, F. (2015). <i>Advancement Degree of Difficulty Assessment Method for Complex Products</i>. DOI 10.2991/978-94-6239-100-0_19.</li><li>U.S. GAO (2020). <i>Technology Readiness Assessment Guide</i>. GAO-20-48G.</li></ol><p class="aviso-txt">O AD² não tem um questionário único e universal. Esta calculadora operacionaliza as referências de forma simplificada e não reproduz o AHP com lógica fuzzy de Zhao e Wei. O resultado apoia decisão e planejamento; não substitui evidência técnica nem avaliação formal de maturidade.</p></div>';
    }
    function calcula() {
      var P = perfil(), tot = 0, toc = 0, ws = P.domains.map(function (d) { return Math.max(0, +(st.pesos[d.id] != null ? st.pesos[d.id] : 20) || 0); }), sw = ws.reduce(function (a, b) { return a + b; }, 0);
      if (sw <= 0) { ws = ws.map(function () { return 1; }); sw = ws.length; }
      var doms = P.domains.map(function (d, i) { var ns = d.questions.map(function (qq) { tot++; if (st.notas[qq[0]]) toc++; return st.notas[qq[0]] || 1; }); var m = ns.reduce(function (a, b) { return a + b; }, 0) / ns.length; return {d: d, m: m, w: ws[i] / sw}; });
      var idx = doms.reduce(function (s, x) { return s + x.m * x.w; }, 0);
      var nivel = Math.max(1, Math.min(9, st.arred === 'floor' ? Math.floor(idx) : st.arred === 'nearest' ? Math.round(idx) : Math.ceil(idx - 1e-9)));
      var cons = Math.max(+st.cons.technical, +st.cons.schedule, +st.cons.cost), pr = prob(nivel), cls = MATRIZ[5 - cons][pr - 1];
      var crit = []; P.domains.forEach(function (d) { d.questions.forEach(function (qq) { var v = st.notas[qq[0]] || 1; if (v >= 7) crit.push({d: d.name, did: d.id, qid: qq[0], q: qq[1], v: v}); }); });
      crit.sort(function (a, b) { return b.v - a.v; });
      return {idx: idx, nivel: nivel, cons: cons, pr: pr, cls: cls, doms: doms, crit: crit, comp: Math.round(toc / tot * 100)};
    }
    function acoesVis() { return st.acoes.filter(function (a) { return a.profile === st.perfil; }); }
    function totaisAcoes() { var l = acoesVis(), c = l.reduce(function (s, a) { return s + (+a.cost || 0); }, 0), w = l.reduce(function (m, a) { return Math.max(m, +a.weeks || 0); }, 0); return {n: l.length, custo: c, semanas: w}; }
    function textoTotais() { var t = totaisAcoes(); return '<b>' + t.n + '</b> ação' + (t.n === 1 ? '' : 'ões') + ' · custo total <b>' + MOEDAS[st.moeda] + ' ' + A.br(t.custo) + '</b> · duração (maior prazo) <b>' + t.semanas + ' semana' + (t.semanas === 1 ? '' : 's') + '</b>'; }
    function plano() {
      var P = perfil(), l = acoesVis();
      var el = box.querySelector('#ad2-plano'); if (!el) return;
      el.innerHTML = '<div class="dom-cab"><h4 class="olho">Plano de maturação</h4><div class="ad2-acoes"><button type="button" class="btn-linha peq" id="ad2-sug">Sugerir ações críticas</button><button type="button" class="btn-linha peq" id="ad2-add">Adicionar ação</button></div></div>' +
        '<p class="txt" style="font-size:13.5px;margin-top:6px">Ações para reduzir a dificuldade até o TRL alvo. “Sugerir ações críticas” cria uma ação para cada indicador com nota 7 ou mais.</p>' +
        (l.length ? l.map(function (a) {
          var dm = P.domains.filter(function (d) { return d.id === a.domain; })[0];
          return '<div class="pa-acao" data-aid="' + a.id + '"><label class="campo-f pa-desc"><span>Ação' + (dm ? ' · ' + esc(dm.short || dm.name) : '') + '</span><input type="text" data-ac="description" value="' + esc(a.description) + '"></label>' +
            '<label class="campo-f"><span>Responsável</span><input type="text" data-ac="owner" value="' + esc(a.owner) + '"></label>' +
            '<label class="campo-f"><span>Custo (' + MOEDAS[st.moeda] + ')</span><input type="number" min="0" data-ac="cost" value="' + (+a.cost || 0) + '"></label>' +
            '<label class="campo-f"><span>Semanas</span><input type="number" min="0" data-ac="weeks" value="' + (+a.weeks || 0) + '"></label>' +
            '<label class="campo-f"><span>Situação</span><select class="f-sel" data-ac="status">' + opts(STATUS_ACAO, a.status) + '</select></label>' +
            '<button type="button" class="btn-txt pa-rm" data-arm="' + a.id + '">Remover</button></div>';
        }).join('') : '<p class="aviso-txt">Nenhuma ação ainda. Use “Sugerir ações críticas” ou “Adicionar ação”.</p>') +
        '<p class="pa-tot" id="pa-tot">' + textoTotais() + '</p>';
      U.ativaCampos(A, el);
    }
    function resultado() {
      var r = calcula(), E = TR.ad2.escala_9_niveis[r.nivel - 1], inval = +st.trlAlvo <= +st.trlAtual;
      var m = '<div class="matriz"><div></div>' + [1, 2, 3, 4, 5].map(function (p) { return '<div>P' + p + '</div>'; }).join('');
      for (var c = 5; c >= 1; c--) { m += '<div>C' + c + '</div>'; for (var p = 1; p <= 5; p++) m += '<div class="c ' + MATRIZ[5 - c][p - 1] + (c === r.cons && p === r.pr ? ' on' : '') + '"></div>'; }
      m += '</div>';
      box.querySelector('#ad2-res').innerHTML = '<div class="bloco res-ad2"><h4 class="olho">Resultado</h4>' + (inval ? '<p class="f-aviso" style="color:var(--verm);background:var(--verm-bg);border-color:transparent">O TRL alvo precisa ser maior que o atual.</p>' : '') +
        '<div style="display:flex;align-items:flex-end;gap:16px;margin-top:10px"><span class="grande-n">' + r.nivel + '</span><div><b style="display:block;font-weight:500">AD² · ' + esc(E.rotulo_curto) + '</b><span style="font-size:13px;color:var(--ink-3)">' + esc(E.faixa) + ' · índice ' + A.br(r.idx, 2) + ' · risco ' + E.prob_risco_pct + '%</span></div></div>' +
        '<div class="dado"><span>TRL ' + st.trlAtual + ' → ' + st.trlAlvo + ' · completude ' + r.comp + '%</span></div>' +
        '<div class="dado"><span>Risco combinado (probabilidade ' + r.pr + ' × consequência ' + r.cons + ')</span><b><span class="risco" style="background:' + RISCO_COR[r.cls] + '">' + esc(RISCO_ROT[r.cls]) + '</span></b></div>' + m +
        '<h4 class="olho" style="margin-top:18px">Por dimensão</h4>' + barrasH(A, r.doms.map(function (x) { return [x.d.short || x.d.name, x.m]; }), function (v) { return A.br(v, 1); }) +
        '<h4 class="olho" style="margin-top:18px">Indicadores críticos (nota 7 ou mais): ' + r.crit.length + '</h4>' + (r.crit.length ? '<ul class="lista-pontos">' + r.crit.map(function (c) { return '<li><b>' + c.v + '</b> · ' + esc(c.q) + '</li>'; }).join('') + '</ul><p class="aviso-txt">No plano de maturação, cada um vira a ação “Reduzir a dificuldade”.</p>' : '<p class="txt" style="font-size:14px">Nenhum indicador crítico.</p>') +
        '<div class="ad2-acoes" style="margin-top:16px"><button type="button" class="btn-azul peq" id="ad2-copiar">Copiar síntese</button><button type="button" class="btn-linha peq" id="ad2-exp">Exportar JSON</button><button type="button" class="btn-linha peq" id="ad2-imp">Importar JSON</button><button type="button" class="btn-linha peq" id="ad2-print">Imprimir</button><button type="button" class="btn-linha peq" id="ad2-limpar">Recomeçar</button></div><input type="file" id="ad2-arq" accept="application/json,.json" hidden>' +
        '<p class="aviso-txt">Simplificação do método: não reproduz o AHP com lógica fuzzy de Zhao e Wei. A avaliação é salva automaticamente neste navegador; para guardar ou enviar, exporte o JSON.</p><p class="aviso-txt" id="ad2-msg" role="status"></p></div>';
      return r;
    }
    function msg(t) { var m = box.querySelector('#ad2-msg'); if (m) { m.textContent = t; setTimeout(function () { if (m.textContent === t) m.textContent = ''; }, 4000); } }
    function salva() { grava('atlas-ad2-v2', st); }
    function monta() {
      box.innerHTML = fx + '<div class="wrap duas-lay inv"><div>' + form() + '</div><div class="fixo ad2-fixo" id="ad2-res"></div></div>';
      U.ativaCampos(A, box); resultado(); plano();
    }
    function sintese() {
      var r = calcula(), E = TR.ad2.escala_9_niveis[r.nivel - 1], t = totaisAcoes();
      return 'Avaliação AD² (Atlas da Inovação)\nProjeto: ' + (st.projeto || '—') + '\nTecnologia: ' + (st.tecnologia || '—') + '\nUnidade de análise: ' + st.escopo + '\nResponsável: ' + (st.avaliador || '—') + ' · Data: ' + (st.data || '—') + '\nTRL ' + st.trlAtual + ' → ' + st.trlAlvo + '\nPerfil: ' + perfil().name + '\nÍndice: ' + A.br(r.idx, 2) + ' · Nível AD² ' + r.nivel + ' (' + E.rotulo_curto + ', ' + E.faixa + ', risco ' + E.prob_risco_pct + '%)\nProbabilidade ' + r.pr + ' × consequência ' + r.cons + ' = risco ' + RISCO_ROT[r.cls] + '\nDimensões: ' + r.doms.map(function (x) { return x.d.name + ' ' + A.br(x.m, 1); }).join('; ') + '\nCríticos: ' + (r.crit.map(function (c) { return c.q + ' (' + c.v + ')'; }).join('; ') || 'nenhum') + '\nPlano de maturação: ' + t.n + ' ação(ões), custo ' + MOEDAS[st.moeda] + ' ' + A.br(t.custo) + ', duração ' + t.semanas + ' semanas\nCompletude: ' + r.comp + '%' + (st.contexto ? '\nContexto: ' + st.contexto : '');
    }
    /* mesmo formato do Atlas anterior (chave atlas_ad2_v1): as avaliações salvas lá entram por Importar JSON */
    function exporta() {
      var answers = {}, touched = {}; Object.keys(CALC.perfis).forEach(function (k) { CALC.perfis[k].domains.forEach(function (d) { d.questions.forEach(function (qq) { answers[qq[0]] = st.notas[qq[0]] || 1; if (st.notas[qq[0]]) touched[qq[0]] = true; }); }); });
      var o = {versao: 'atlas-v2', form: {projeto: st.projeto, tecnologia: st.tecnologia, escopo: st.escopo, avaliador: st.avaliador, trlAtual: String(st.trlAtual), trlAlvo: String(st.trlAlvo), data: st.data, moeda: st.moeda, contexto: st.contexto}, profileId: st.perfil, rounding: st.arred, answers: answers, touched: touched, evidence: st.evidence, weights: st.pesos, cons: st.cons, consNotes: st.consNotes, actions: st.acoes};
      var blob = new Blob([JSON.stringify(o, null, 2)], {type: 'application/json'}), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'avaliacao-ad2' + (st.projeto ? '-' + st.projeto.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '') + '.json';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
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
          salva(); monta(); msg('Avaliação importada.');
        } catch (er) { msg('Arquivo inválido.'); }
      };
      fr.readAsText(arq);
    }
    box.oninput = function (e) {
      var t = e.target, k;
      if ((k = t.getAttribute('data-nota'))) { st.notas[k] = +t.value; var r = box.querySelector('[data-vrot="' + k + '"]'); if (r) r.textContent = t.value + ' · ' + CALC.escala_resposta.rotulos[t.value]; }
      else if ((k = t.getAttribute('data-peso'))) st.pesos[k] = +t.value;
      else if ((k = t.getAttribute('data-ev'))) { st.evidence[k] = t.value; salva(); return; }
      else if (t.hasAttribute('data-consnotes')) { st.consNotes = t.value; salva(); return; }
      else if ((k = t.getAttribute('data-ac'))) {
        var ac = st.acoes.filter(function (x) { return x.id === t.closest('[data-aid]').getAttribute('data-aid'); })[0];
        if (ac) { ac[k] = (k === 'cost' || k === 'weeks') ? Math.max(0, +t.value || 0) : t.value; salva(); var pt = box.querySelector('#pa-tot'); if (pt) pt.innerHTML = textoTotais(); }
        return;
      }
      else if ((k = t.getAttribute('data-c')) && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) { st[k] = t.value; if (k === 'data') { salva(); return; } }
      else return;
      salva(); resultado();
    };
    box.onchange = function (e) {
      var t = e.target, k;
      if (t.id === 'ad2-arq') { if (t.files[0]) importa(t.files[0]); t.value = ''; return; }
      if ((k = t.getAttribute('data-ac')) && t.tagName === 'SELECT') { var ac = st.acoes.filter(function (x) { return x.id === t.closest('[data-aid]').getAttribute('data-aid'); })[0]; if (ac) { ac[k] = t.value; salva(); } return; }
      if ((k = t.getAttribute('data-c')) && t.tagName === 'SELECT') { st[k] = t.value; salva(); if (k === 'perfil') monta(); else if (k === 'moeda') { plano(); resultado(); } else resultado(); }
      else if ((k = t.getAttribute('data-cons'))) { st.cons[k] = +t.value; salva(); resultado(); }
    };
    box.onclick = function (e) {
      var id = e.target.id, b;
      if (id === 'ad2-limpar') { if (!window.confirm('Limpar todos os dados desta avaliação?')) return; st = stNovo(st.perfil); salva(); monta(); return; }
      if (id === 'ad2-pesos') { var P = perfil(), v = Math.round(100 / P.domains.length * 100) / 100; P.domains.forEach(function (d) { st.pesos[d.id] = v; }); salva(); box.querySelectorAll('[data-peso]').forEach(function (i) { i.value = st.pesos[i.getAttribute('data-peso')]; }); resultado(); msg('Pesos distribuídos igualmente.'); return; }
      if (id === 'ad2-exp') { exporta(); return; }
      if (id === 'ad2-imp') { box.querySelector('#ad2-arq').click(); return; }
      if (id === 'ad2-print') { window.print(); return; }
      if (id === 'ad2-add') { st.acoes.push({id: uid(), profile: st.perfil, domain: perfil().domains[0].id, description: '', owner: '', cost: 0, weeks: 0, status: 'Planejada', sourceQid: ''}); salva(); plano(); return; }
      if (id === 'ad2-sug') {
        var ja = {}; acoesVis().forEach(function (a) { if (a.sourceQid) ja[a.sourceQid] = 1; });
        var novas = calcula().crit.filter(function (c) { return !ja[c.qid]; }).map(function (c) { return {id: uid(), profile: st.perfil, domain: c.did, description: 'Reduzir a dificuldade: ' + c.q, owner: '', cost: 0, weeks: 0, status: 'Planejada', sourceQid: c.qid}; });
        if (!novas.length) { msg('Nenhum indicador com nota 7, 8 ou 9 sem ação.'); return; }
        st.acoes = st.acoes.concat(novas); salva(); plano(); msg(novas.length + ' ação(ões) sugerida(s).'); return;
      }
      if ((b = e.target.closest('[data-arm]'))) { st.acoes = st.acoes.filter(function (a) { return a.id !== b.getAttribute('data-arm'); }); salva(); plano(); return; }
      if (id === 'ad2-copiar') {
        var txt = sintese(), bt = e.target; function ok() { bt.textContent = 'Síntese copiada ✓'; setTimeout(function () { bt.textContent = 'Copiar síntese'; }, 1800); }
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, ok); else ok();
      }
    };
    monta();
  }

  /* ================= DNA DA INOVAÇÃO ================= */
  var carregandoDNA = false;
  function carregaDNA(feito) {
    if (window.ATLAS2_DNA && window.ATLAS2_DNA_PROJ) return feito();
    if (carregandoDNA) return; carregandoDNA = true;
    var arqs = ['assets/atlas-v2-dna-empresas.js?v=r90', 'assets/atlas-v2-dna-projetos.js?v=r90'], i = 0;
    (function prox() { if (i >= arqs.length) { carregandoDNA = false; return feito(); } var s = document.createElement('script'); s.src = arqs[i++]; s.onload = prox; s.onerror = function () { carregandoDNA = false; }; document.body.appendChild(s); })();
  }
  var FONTE_ROT = {embrapii: 'EMBRAPII', anp: 'ANP', finep: 'FINEP', aneel: 'ANEEL', antt: 'ANTT', bndes_operacoes: 'BNDES (operações)'};
  /* Projetos "executados" como no Atlas: EMBRAPII + ANP + FINEP. ANEEL e ANTT (PD&I regulatória, em que a empresa é a financiadora) ficam à parte. */
  function nExec(e) { var n = e.n_proj || {}; return (n.embrapii || 0) + (n.anp || 0) + (n.finep || 0); }
  function nReg(e) { var n = e.n_proj || {}; return (n.aneel || 0) + (n.antt || 0); }
  function faixaProj(n) { return n >= 50 ? '50+' : n >= 10 ? '10-49' : n >= 5 ? '5-9' : n >= 2 ? '2-4' : n >= 1 ? '1' : '0'; }
  function cnpjFmt(r) { return r ? r.slice(0, 2) + '.' + r.slice(2, 5) + '.' + r.slice(5, 8) : ''; }
  T.dna = function (A, sub, q, box, mesma) {
    if (!window.ATLAS2_DNA || !window.ATLAS2_DNA_PROJ) {
      box.innerHTML = U.faixa(A, {olho: 'DNA da Inovação · empresas', tit: 'Quem já inova<br><em>no Brasil</em>', txt: 'Carregando o retrato de mais de 5 mil empresas a partir das bases públicas…'}) + '<div class="wrap"><div class="carregando"><i></i><span>Carregando empresas e projetos (cerca de 6 MB)…</span></div></div>';
      U.ativaCampos(A, box);
      carregaDNA(function () { if ((location.hash || '').indexOf('#/dna') === 0) T.dna(A, sub, q, box, false); });
      return;
    }
    var esc = A.esc, E = window.ATLAS2_DNA;
    if (sub) return fichaDNA(A, sub, box, q);
    var porProg = U.cont(E, function (e) { return e.programas || []; });
    var multi = E.filter(function (e) { return (e.programas || []).length > 1; }).length, vinc = E.reduce(function (s, e) { return s + nExec(e); }, 0);
    U.catalogo(A, box, {
      chave: 'dna', titulo: 'Empresas', placeholder: 'Nome da empresa ou raiz do CNPJ', genero: 'a', contagemRot: ['empresa', 'empresas'],
      faixa: {olho: 'DNA da Inovação · empresas que já fizeram projetos', tit: 'Quem já inova<br><em>no Brasil</em>', txt: 'O retrato de cada empresa a partir de <b>EMBRAPII, FINEP, ANP, ANEEL, ANTT, BNDES, Lei do Bem, Lei da Informática e Defesa</b>: projetos, ICTs parceiras e áreas tecnológicas.',
        num: [A.br(E.length), 'empresas no DNA'], quebra: [[A.br(vinc), 'projetos ligados'], [A.br(multi), 'em mais de uma fonte'], [A.br(E.filter(function (e) { return e.cnpj_raiz || e.cnpj_raizes_grupo; }).length), 'com CNPJ identificado']],
        dir: U.barrasFaixa(A, 'Empresas por programa', Object.keys(porProg).sort(function (a, b) { return porProg[b] - porProg[a]; }).slice(0, 8).map(function (k) { return [k, porProg[k]]; }), function (p) { return '#/dna?prog=' + encodeURIComponent(p[0]); })},
      aviso: '<span class="nota-met">* Áreas inferidas por palavra-chave; não é classificação oficial. <a href="#/metodologia">Metodologia</a></span>',
      itens: E,
      grupos: [
        {k: 'prog', t: 'Programa ou base', aberto: true, val: function (e) { return e.programas || []; }},
        {k: 'dom', t: 'Área tecnológica (inferida)', aberto: true, val: function (e) { return (e.dominios || []).map(function (d) { return d.dom; }); }, rot: function (k) { return A.dom(k); }},
        {k: 'faixa', t: 'Número de projetos', val: function (e) { return [faixaProj(nExec(e))]; }, rot: {'0': 'Sem projeto (só incentivo ou BNDES)', '1': '1 projeto', '2-4': '2 a 4', '5-9': '5 a 9', '10-49': '10 a 49', '50+': '50 ou mais'}, ordem: ['50+', '10-49', '5-9', '2-4', '1', '0']},
        {k: 'uf', t: 'Estado', val: function (e) { return [e.uf || 'sem UF']; }, rot: function (k) { return A.D.ufNomes[k] || 'Sem UF na base'; }, ordem: 'alfa'}
      ],
      busca: function (e) { return [e.nome, e.cnpj_raiz, (e.cnpj_raizes_grupo || []).join(' ')].join(' '); },
      ordens: [['proj', 'Mais projetos', function (a, b) { return nExec(b) - nExec(a) || a.nome.localeCompare(b.nome, 'pt-BR'); }], ['valor', 'Maior valor declarado', function (a, b) { var x = maiorParcela(a), y = maiorParcela(b); return (y ? y[0] : 0) - (x ? x[0] : 0); }], ['icts', 'Mais ICTs parceiras', function (a, b) { return (b.n_icts || 0) - (a.n_icts || 0); }], ['nome', 'Nome (A–Z)', function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); }]],
      cartao: function (e) {
        var np_ = e.n_proj || {}, progs = (e.programas || []).slice().sort(function (x, y) { return (/^Defesa/.test(y) ? 1 : 0) - (/^Defesa/.test(x) ? 1 : 0); });
        return '<article class="op entra"><div class="op-topo"><div><p class="op-sigla">' + esc(e.uf ? A.D.ufNomes[e.uf] || e.uf : 'Empresa') + (e.tipo_identidade === 'grupo' ? ' · grupo' : '') + '</p><h3><a href="#/dna/' + encodeURIComponent(e.id) + '">' + esc(e.nome) + '</a></h3>' + (e.cnpj_raiz ? '<p class="op-inst">CNPJ raiz ' + cnpjFmt(e.cnpj_raiz) + '</p>' : '') + '</div>' +
          '<button type="button" class="estrela" data-id="dna:' + esc(e.id) + '" aria-pressed="' + A.favorito('dna:' + e.id) + '" aria-label="Favorito">' + A.ICO.est + '</button></div>' +
          '<div class="op-nums"><div><span>Projetos</span><b class="azul">' + A.br(nExec(e)) + '</b></div><div><span>ICTs parceiras</span><b>' + A.br(e.n_icts || 0) + '</b></div>' + (function () { var m = maiorParcela(e); return '<div><span>Maior valor declarado</span><b style="font-size:17px;padding-top:4px">' + (m ? reais(m[0], A.br) : '\u2014') + '</b>' + (m ? '<small class="nat-peq">' + m[1] + '</small>' : '') + '</div>'; })() + (np_.bndes_operacoes ? '<div><span>BNDES</span><b style="font-size:17px;padding-top:4px">' + A.br(np_.bndes_operacoes) + ' op.</b></div>' : '') + '</div>' +
          ((e.dominios || []).length ? '<div class="tags">' + e.dominios.slice(0, 3).map(function (d) { return '<span class="tag">' + esc(A.dom(d.dom)) + '</span>'; }).join('') + '</div>' : '') +
          '<div class="op-base"><div class="tags">' + progs.slice(0, 4).map(function (p) { return '<span class="selo-t' + (/^Defesa/.test(p) ? ' defesa' : '') + '">' + esc(p) + '</span>'; }).join('') + (progs.length > 4 ? '<span class="selo-t out">+' + (progs.length - 4) + '</span>' : '') + '</div><a class="btn-txt" style="position:relative;z-index:2;font-size:13px" href="#/dna/' + encodeURIComponent(e.id) + '">Ver o DNA</a></div></article>';
      }
    }, q, mesma);
  };
  /* ---- apoio da ficha ---- */
  function carregaJs(src, teste, feito) {
    if (teste()) return feito(false);
    var s = document.createElement('script'); s.src = src; s.onload = function () { feito(false); }; s.onerror = function () { feito(true); }; document.body.appendChild(s);
  }
  var PIREG_SRC = 'assets/atlas-v2-pi-registros.js?v=r90', FIN_SRC = 'assets/atlas-v2-financiadores.js?v=r90';
  var TIPOS_PIREG = ['Patente', 'Desenho industrial', 'Programa de computador', 'Contrato de tecnologia'];
  function dvCnpj(b, pesos) { var s = 0; for (var i = 0; i < pesos.length; i++) s += (+b[i]) * pesos[i]; var r = s % 11; return r < 2 ? 0 : 11 - r; }
  function cnpjMatriz(r8) { var b = r8 + '0001', b2 = b + dvCnpj(b, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]), c = b2 + dvCnpj(b2, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]); return c.slice(0, 2) + '.' + c.slice(2, 5) + '.' + c.slice(5, 8) + '/' + c.slice(8, 12) + '-' + c.slice(12, 14); }
  function chaveNome(s) { return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function nomeBase(A, s) { var k = A.sem(s).replace(/\./g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\b(sa|ltda|eireli|me|epp)\b/g, '').replace(/\s+/g, ' ').trim(); return k.length >= 5 ? k : ''; }
  function raizesDe(e) { return e.cnpj_raiz ? [e.cnpj_raiz] : (e.cnpj_raizes_grupo || []); }
  function dataBr(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : (d || ''); }
  /* parcelas do investimento, cada uma com a sua natureza: não se soma o que não é comparável */
  var NATUREZA = [['anp', 'Obrigação de PD&I (ANP)', 'obrigação regulatória', 'Investido em projetos sob a cláusula de PD&I dos contratos da ANP, valor acumulado reportado.'], ['finep', 'Contratado na FINEP', 'contratado', 'Valor dos contratos de fomento da FINEP ligados à empresa.'], ['aneel_antt', 'Projetos regulados (ANEEL e ANTT)', 'previsto', 'Valor previsto nos projetos de PD&I das agências, sem confirmação de execução.']];
  function maiorParcela(e) { var v = e.valor || {}, m = null; NATUREZA.forEach(function (n) { if (v[n[0]] && (!m || v[n[0]] > m[0])) m = [v[n[0]], n[2]]; }); return m; }

  var ABAS_DNA = [['resumo', 'Resumo'], ['projetos', 'Projetos executados'], ['pi', 'Propriedade intelectual'], ['financiamentos', 'Financiamentos'], ['obrigacoes', 'Obrigações e incentivos'], ['compras', 'Compras públicas']];
  function fichaDNA(A, id, box, q) {
    var esc = A.esc, e = window.ATLAS2_DNA.filter(function (x) { return x.id === id; })[0];
    if (!e) { box.innerHTML = '<div class="wrap ficha"><div class="bloco ficha-cab"><h1>Empresa não encontrada</h1><p class="ag"><a href="#/dna">Voltar ao DNA</a></p></div></div>'; return; }
    var P = window.ATLAS2_DNA_PROJ[id] || [], np = e.n_proj || {}, v = e.valor || {}, raizes = raizesDe(e), D = A.D, IDX = window.ATLAS2_IDX || {raiz: {}};
    var rz = {}; raizes.forEach(function (r) { rz[r] = 1; });
    var leiBem = e.lei_do_bem_anos || [];
    var icts = (e.icts || []).map(function (i) { var t = D.icts.filter(function (x) { return A.sem(x.nome) === A.sem(i.nome); })[0]; return [i.nome, i.n, t]; });
    var fontes = Object.keys(FONTE_ROT).filter(function (k) { return np[k]; }).map(function (k) { return [FONTE_ROT[k], np[k]]; });
    var cnpj = e.cnpj_raiz ? 'CNPJ raiz ' + cnpjFmt(e.cnpj_raiz) : e.cnpj_raizes_grupo ? 'Grupo com ' + e.cnpj_raizes_grupo.length + ' raízes de CNPJ' : 'Sem CNPJ identificado (ligado pelo nome)';
    var fonteSel = '', anoSel = '', lim = 25, termo = '';
    var anosP = {}; P.forEach(function (p) { if (p.t && p.ano) anosP[p.ano] = 1; }); anosP = Object.keys(anosP).sort().reverse();
    var mq = /(?:^|&)aba=([a-z]+)/.exec(q || ''), aba = mq ? mq[1] : 'resumo';
    if (!ABAS_DNA.some(function (a) { return a[0] === aba; })) aba = 'resumo';
    /* resultados assíncronos: null = ainda não sabemos */
    var ext = {pi: null, finLido: false, bndes: '', funttel: '', pdi: ''}, piOrg = null;

    /* ---------- blocos de HTML ---------- */
    function secao(tit, nota, corpo) { return '<div class="bloco largo dna-sec"><h4>' + tit + '</h4>' + (nota ? '<p class="aviso-txt" style="margin-top:6px">' + nota + '</p>' : '') + corpo + '</div>'; }
    var vit = [];
    (((D.compras || {}).COMPRAS_INOV_HIST || {}).compras || []).forEach(function (x) { (x.v || []).forEach(function (w) { if (w.r && (rz[w.r] || IDX.raiz[w.r] === e.id)) vit.push([x, w]); }); });
    vit.sort(function (a, b) { return String(b[0].d).localeCompare(String(a[0].d)); });
    function htmlCompras() {
      return secao('Compras públicas de inovação vencidas', 'CPSI, encomendas tecnológicas e diálogos competitivos publicados no PNCP em que a empresa venceu ao menos um item. <a href="#/compras">Ver o histórico completo</a>.', vit.map(function (p) { var x = p[0], w = p[1]; return '<div class="dna-lin"><p>' + esc(U.primeiro(x.obj, 260)) + '</p><small>' + esc(x.i) + ' · ' + esc(x.o) + (x.uf ? ' (' + esc(x.uf) + ')' : '') + ' · ' + esc(dataBr(w.dt || x.d)) + (w.val ? ' · ' + reais(w.val, A.br) : '') + ' · <a href="' + esc(x.l) + '" target="_blank" rel="noopener">PNCP</a></small></div>'; }).join(''));
    }
    var ident;
    if (e.cnpj_raiz && e.tipo_identidade === 'grupo') ident = '<div class="dado"><span>Grupo curado</span><b>Reúne 1 pessoa jurídica</b></div><div class="dado"><span>CNPJ da matriz (calculado)</span><b class="mono">' + cnpjMatriz(e.cnpj_raiz) + '</b></div><div class="dado"><span>Vínculo</span><b>Pela raiz do CNPJ ' + cnpjFmt(e.cnpj_raiz) + ' (lista curada)</b></div>';
    else if (e.cnpj_raiz) ident = '<div class="dado"><span>CNPJ da matriz (calculado)</span><b class="mono">' + cnpjMatriz(e.cnpj_raiz) + '</b></div><div class="dado"><span>Vínculo</span><b>Pela raiz do CNPJ (8 primeiros dígitos)</b></div><p class="aviso-txt">Confiança alta: alguma base com CNPJ resolveu o nome sem ambiguidade. A matriz é calculada da raiz (estabelecimento 0001); filiais têm outro número.</p>';
    else if (e.cnpj_raizes_grupo) ident = '<div class="dado"><span>Grupo curado</span><b>' + e.cnpj_raizes_grupo.length + ' raízes de CNPJ</b></div><div class="dado"><span>Vínculo</span><b>Pelas raízes do grupo (lista curada)</b></div><details class="dna-det"><summary>Ver as raízes e as matrizes</summary><ul class="lista-pontos">' + e.cnpj_raizes_grupo.map(function (r) { return '<li class="mono">' + cnpjFmt(r) + ' · matriz ' + cnpjMatriz(r) + '</li>'; }).join('') + '</ul></details><p class="aviso-txt">Grupos como este são listas curadas de raízes de CNPJ. As razões sociais de cada raiz não estão no conjunto de dados do Atlas.</p>';
    else ident = '<div class="dado"><span>Vínculo</span><b>Pelo nome da empresa</b></div><p class="f-aviso" style="color:var(--ambar);background:var(--ambar-bg);border-color:transparent">Nenhuma base trouxe o CNPJ desta empresa. Ela foi agrupada pelo nome, o que pode juntar ou separar empresas diferentes. Confirme o CNPJ antes de citá-la.</p>';
    ident += '<div class="dado"><span>Bases em que aparece</span><b>' + esc((e.programas || []).join(', ') || '—') + '</b></div>';
    var parcelas = NATUREZA.filter(function (n) { return v[n[0]]; });
    function htmlInvest() {
      return '<div class="bloco"><h4>Valores por natureza</h4>' + (parcelas.length || v.bndes_contratado ? parcelas.map(function (n) { return '<div class="dado"><span>' + n[1] + ' <em class="nat nat-' + n[0] + '">' + n[2] + '</em></span><b>' + reais(v[n[0]], A.br) + '</b><small class="dna-nota">' + esc(n[3]) + '</small></div>'; }).join('') +
        (v.bndes_contratado ? '<div class="dado"><span>BNDES, contratado <em class="nat nat-bndes">financiamento</em></span><b>' + reais(v.bndes_contratado, A.br) + '</b>' + (v.bndes_desembolsado ? '<small class="dna-nota">Desembolsado: ' + reais(v.bndes_desembolsado, A.br) + '</small>' : '') + '</div>' : '') : '<p class="txt">Sem valor registrado nas bases.</p>') +
        '<p class="aviso-txt">Os valores têm naturezas diferentes e não são somados: obrigação regulatória é o que a empresa investiu por exigência da agência; contratado é o valor de contratos de fomento; previsto é orçamento declarado. A EMBRAPII não traz valor por projeto.</p></div>';
    }
    function htmlResumo() {
      return '<p class="dna-nota-met">Dados de bases públicas e correlações inferidas; não refletem a posição oficial da empresa. <a href="#/metodologia">Metodologia</a></p>' +
        '<div class="ficha-tres">' + (fontes.length ? '' : '<div class="bloco"><h4>Projetos por fonte</h4><div class="dado"><b class="grande">' + A.br(nExec(e)) + '</b></div></div>') + htmlInvest() +
        '<div class="bloco"><h4>ICTs parceiras · ' + A.br(e.n_icts || 0) + '</h4>' + (icts.length ? '<div class="linhas-l">' + icts.map(function (i) { return '<a class="linha-l" href="' + (i[2] ? '#/icts/' + encodeURIComponent(i[2].id) : '#/icts?q=' + encodeURIComponent(i[0])) + '"><b>' + esc(i[0]) + '</b><small>' + i[1] + ' projeto' + (i[1] > 1 ? 's' : '') + (i[2] ? ' · ' + esc(i[2].categoria) : '') + '</small></a>'; }).join('') + '</div>' + ((e.n_icts || 0) > icts.length ? '<p class="aviso-txt">Mostrando as ' + icts.length + ' mais frequentes de ' + A.br(e.n_icts) + '.</p>' : '') : '<p class="txt">Sem ICT registrada nos projetos.</p>') + '</div></div>' +
        '<div class="ficha-duas"><div class="bloco"><h4>Áreas tecnológicas (inferidas)</h4>' + ((e.dominios || []).length ? barrasH(A, e.dominios.map(function (d) { return [A.dom(d.dom), d.n]; })) : '<p class="txt">Sem área inferida.</p>') + '<p class="aviso-txt">Inferidas por palavras-chave nos títulos, áreas e temas dos projetos.</p></div>' +
        '<div class="bloco"><h4>Linha do tempo de projetos</h4>' + ((e.anos || []).length ? serieAnos(A, (function () { var o = {}; e.anos.forEach(function (a) { o[a.ano] = a.n; }); return o; })()) : '<p class="txt">Sem ano registrado.</p>') + '<p class="aviso-txt">Projetos EMBRAPII não trazem ano na base e ficam fora da linha do tempo.</p></div></div>' +
        '<div class="bloco largo"><h4>Identificação e vínculo</h4><div class="dna-ident">' + ident + '</div></div>';
    }
    function htmlProjetos() {
      return '<div class="bloco" id="dna-proj"><div class="proj-ferr-dna"><div class="busca" style="max-width:520px;flex:1 1 280px"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><label class="sr" for="dna-q">Buscar nos projetos</label><input id="dna-q" type="search" value="' + esc(termo) + '" placeholder="Buscar nos projetos: termo do título, tema ou executor" autocomplete="off"></div>' +
        (anosP.length ? '<label class="ordem">Ano <select class="f-sel" id="dna-ano"><option value="">Todos</option>' + anosP.map(function (a) { return '<option' + (a === anoSel ? ' selected' : '') + '>' + esc(a) + '</option>'; }).join('') + '</select></label>' : '') + '</div><div id="dna-proj-lista"></div></div>';
    }
    function tabela() {
      var alvo = box.querySelector('#dna-proj-lista'); if (!alvo) return;
      var qn = A.sem(termo);
      var l = P.filter(function (p) { return p.t /* como no Atlas: a lista só traz projeto com título */ && (!fonteSel || p.f === fonteSel) && (!anoSel || String(p.ano) === anoSel) && (!qn || A.sem([p.t, p.ict, p.tema, p.area, p.instr].join(' ')).indexOf(qn) >= 0); });
      alvo.innerHTML = ((termo || anoSel) ? '<p class="contagem" style="margin-top:10px"><b>' + A.br(l.length) + '</b> projeto' + (l.length === 1 ? '' : 's') + (termo ? ' com “' + esc(termo) + '”' : '') + (anoSel ? ' em ' + esc(anoSel) : '') + '</p>' : '') + '<div class="tags" style="margin-top:10px">' + ['', 'EMBRAPII', 'ANP', 'FINEP', 'ANEEL', 'ANTT'].filter(function (f) { return !f || P.some(function (p) { return p.f === f; }); }).map(function (f) { var n = f ? P.filter(function (p) { return p.f === f; }).length : P.length; return '<button type="button" class="chip" data-fonte="' + f + '" aria-pressed="' + (f === fonteSel) + '">' + (f || 'Todas') + ' · ' + A.br(n) + '</button>'; }).join('') + '</div>' +
        (l.length ? '<table class="tabela proj-tab"><thead><tr><th>Fonte</th><th>Projeto</th><th>ICT ou executor</th><th>Ano</th><th>Valor</th></tr></thead><tbody>' + l.slice(0, lim).map(function (p) { return '<tr><td><span class="selo-t">' + esc(p.f) + '</span></td><td>' + esc(p.t || '') + (p.tema ? '<br><small style="color:var(--ink-3)">' + esc(p.tema) + '</small>' : '') + '</td><td>' + (p.ict ? window.AV2_execLink(A, p.ict) : '') + '</td><td>' + esc(p.ano || '') + '</td><td style="white-space:nowrap">' + (p.v ? reais(p.v, A.br) : '') + '</td></tr>'; }).join('') + '</tbody></table>' + (l.length > lim ? '<button type="button" class="btn-linha peq" style="margin-top:12px" id="dna-mais">Mostrar mais ' + Math.min(25, l.length - lim) + ' de ' + A.br(l.length - lim) + '</button>' : '') : '<p class="txt">Nenhum projeto com este filtro.</p>');
    }
    function htmlFinep() {
      var l = P.filter(function (p) { return p.f === 'FINEP'; }); if (!l.length) return '';
      var soma = l.reduce(function (s, p) { return s + (p.v || 0); }, 0);
      return secao('Projetos e contratos da FINEP', null, '<div class="dna-kpis"><div><span>Contratos</span><b>' + A.br(l.length) + '</b></div><div><span>Valor contratado <em class="nat nat-finep">contratado</em></span><b>' + reais(soma, A.br) + '</b></div></div><p style="margin-top:12px"><button type="button" class="btn-linha peq" data-vfonte="FINEP">Ver os projetos FINEP</button></p>');
    }
    function htmlFin() {
      var h = ext.bndes + ext.funttel + htmlFinep();
      if (!ext.finLido && !(ext.bndes || ext.funttel)) h += '<div class="carregando" style="padding:18px 0"><i></i><span>Carregando financiamentos…</span></div>';
      return h || '<p class="txt">Sem financiamento registrado nas bases.</p>';
    }
    function htmlObr() {
      var h = '';
      if (e.defesa) h += '<div class="bloco dna-defesa"><span class="selo-t">' + esc(e.defesa.classif || 'Defesa') + '</span><p><b>' + esc(e.defesa.classif === 'EED' ? 'Empresa Estratégica de Defesa (EED)' : 'Empresa de Defesa (ED)') + '</b> credenciada pelo Ministério da Defesa (CMID)' + (e.defesa.ano ? ', desde ' + esc(e.defesa.ano) : '') + (e.defesa.uf ? ', ' + esc(e.defesa.uf) : '') + '.</p></div>';
      h += ext.pdi;
      if (np.anp) h += secao('PD&amp;I da ANP (obrigação regulatória)', 'Cláusula de PD&amp;I dos contratos de exploração e produção de petróleo e gás.', '<div class="dna-kpis"><div><span>Projetos</span><b>' + A.br(np.anp) + '</b></div>' + (v.anp ? '<div><span>Investido <em class="nat nat-anp">obrigação regulatória</em></span><b>' + reais(v.anp, A.br) + '</b></div>' : '') + '</div>' + ((e.temas_anp || []).length ? '<h4 style="margin-top:16px">Investimento por tema</h4>' + barrasH(A, e.temas_anp.map(function (t) { return [t.tema, t.valor]; }), function (x) { return reais(x, A.br); }) : '') + '<p style="margin-top:12px"><button type="button" class="btn-linha peq" data-vfonte="ANP">Ver os projetos ANP</button></p>');
      if (np.aneel || np.antt) h += secao('PD&amp;I regulado da ANEEL e da ANTT', 'Projetos do programa de P&amp;D&amp;I das agências. O valor é o previsto nos projetos.', '<div class="dna-kpis">' + (np.aneel ? '<div><span>Projetos ANEEL</span><b>' + A.br(np.aneel) + '</b></div>' : '') + (np.antt ? '<div><span>Projetos ANTT</span><b>' + A.br(np.antt) + '</b></div>' : '') + (v.aneel_antt ? '<div><span>Valor <em class="nat nat-aneel_antt">previsto</em></span><b>' + reais(v.aneel_antt, A.br) + '</b></div>' : '') + '</div><p style="margin-top:12px"><button type="button" class="btn-linha peq" data-vfonte="' + (np.aneel ? 'ANEEL' : 'ANTT') + '">Ver os projetos</button></p>');
      if (leiBem.length || e.lei_informatica) h += secao('Incentivos fiscais', null, '<ul class="lista-ico">' + (leiBem.length ? '<li>' + A.ICO.doc + '<span>Lei do Bem em ' + leiBem.length + ' ano' + (leiBem.length > 1 ? 's' : '') + '</span></li>' : '') + (e.lei_informatica ? '<li>' + A.ICO.doc + '<span>Habilitada na Lei da Informática</span></li>' : '') + '</ul>' +
        (leiBem.length ? '<h4 style="margin-top:16px">Anos com Lei do Bem</h4><div class="tags" style="margin-top:8px">' + leiBem.map(function (a) { return '<span class="selo-t out">' + esc(a) + '</span>'; }).join('') + '</div><p class="aviso-txt">Os anos podem ser descontínuos: a empresa só aparece nos anos em que usou o incentivo.</p>' : ''));
      return h;
    }
    /* ---------- disponibilidade das abas ---------- */
    function tem(k) {
      if (k === 'resumo') return true;
      if (k === 'projetos') return P.length > 0;
      if (k === 'compras') return vit.length > 0;
      if (k === 'pi') return ext.pi;
      if (k === 'financiamentos') return !!(np.finep || np.bndes_operacoes || v.bndes_contratado || ext.bndes || ext.funttel) ? true : (ext.finLido ? false : null);
      if (k === 'obrigacoes') return !!(e.defesa || np.anp || np.aneel || np.antt || leiBem.length || e.lei_informatica || ext.pdi) ? true : (ext.finLido ? false : null);
      return false;
    }
    function nav() {
      var el = box.querySelector('#dna-abas'); if (!el) return;
      var vis = ABAS_DNA.filter(function (a) { var t = tem(a[0]); return t === true || (t === null && a[0] === aba); });
      if (!vis.some(function (a) { return a[0] === aba; }) && ext.finLido !== false) { /* aba pedida sem dado */ }
      el.innerHTML = vis.map(function (a) { return '<a href="#/dna/' + encodeURIComponent(id) + '?aba=' + a[0] + '" data-aba="' + a[0] + '" class="' + (a[0] === aba ? 'ativa' : '') + '">' + a[1] + '</a>'; }).join('');
    }
    function corpo() {
      var c = box.querySelector('#dna-corpo'); if (!c) return;
      if (tem(aba) === false) { aba = 'resumo'; }
      nav();
      if (aba === 'resumo') c.innerHTML = htmlResumo();
      else if (aba === 'projetos') { c.innerHTML = htmlProjetos(); tabela(); }
      else if (aba === 'pi') { c.innerHTML = '<div class="bloco" id="dna-pi" data-id="' + esc(id) + '"><div class="carregando" style="padding:18px 0"><i></i><span>Carregando os registros de PI (cerca de 6 MB, uma vez)…</span></div></div>'; blocoPI(); }
      else if (aba === 'financiamentos') c.innerHTML = htmlFin();
      else if (aba === 'obrigacoes') c.innerHTML = htmlObr();
      else if (aba === 'compras') c.innerHTML = htmlCompras();
      U.ativaCampos(A, c);
    }
    function vaiPara(k) { aba = k; try { history.replaceState(null, '', '#/dna/' + encodeURIComponent(id) + '?aba=' + k); } catch (er) {} corpo(); var n = box.querySelector('#dna-abas'); if (n && n.scrollIntoView) { var r = n.getBoundingClientRect(); if (r.top < 0 || r.top > 200) window.scrollTo({top: window.scrollY + r.top - 76, behavior: 'smooth'}); } }

    /* ---------- PI ---------- */
    function blocoPI() {
      var el = box.querySelector('#dna-pi[data-id="' + id + '"]'); if (!el) return;
      carregaJs(PIREG_SRC, function () { return !!window.ATLAS2_PIREG; }, function (erro) {
        el = box.querySelector('#dna-pi[data-id="' + id + '"]'); if (!el) return;
        var PR = window.ATLAS2_PIREG;
        if (erro || !PR) { el.innerHTML = '<h4>Propriedade intelectual (INPI)</h4><p class="txt">Não foi possível carregar a base de PI agora.</p><a class="btn-txt" href="#/pi?aba=orgs">Abrir o painel de PI</a>'; return; }
        if (piOrg === null) for (var pi0 = 0; pi0 < PR.orgs.length; pi0++) if (PR.orgs[pi0][1] === id && PR.orgs[pi0][0] === 'empresa') { piOrg = pi0; break; }
        if (piOrg === null) { el.innerHTML = '<h4>Propriedade intelectual (INPI)</h4><p class="txt">Sem registro no INPI nas bases do Atlas.</p>'; return; }
        var o = PR.orgs[piOrg];
        var regs = PR.r.filter(function (r) { return r[1] === piOrg; }).sort(function (a, b) { return (b[3] || 0) - (a[3] || 0); }), tipoSel = '', anoP = '', limP = 15;
        var anos = {}; regs.forEach(function (r) { if (r[3]) anos[r[3]] = 1; }); anos = Object.keys(anos).sort().reverse();
        el.innerHTML = '<h4>Registros no INPI · ' + A.br(o[3] + o[4] + o[5] + o[6]) + '</h4><div class="op-nums" style="margin-top:10px"><div><span>Patentes</span><b>' + A.br(o[3]) + '</b></div><div><span>Desenhos industriais</span><b>' + A.br(o[4]) + '</b></div><div><span>Programas</span><b>' + A.br(o[5]) + '</b></div><div><span>Contratos de tecnologia</span><b>' + A.br(o[6]) + '</b></div></div>' +
          '<div class="proj-ferr-dna" style="margin-top:14px"><div class="tags" data-pit></div>' + (anos.length ? '<label class="ordem">Ano <select class="f-sel" data-pia><option value="">Todos</option>' + anos.map(function (a) { return '<option>' + a + '</option>'; }).join('') + '</select></label>' : '') + '</div><div data-pil></div>' +
          '<p class="aviso-txt">Registros do INPI (dados abertos de ' + esc(A.fdata(R.pi.gerado_inpi)) + ') ligados à empresa por CNPJ ou razão social; os contratos de tecnologia não têm CNPJ na fonte, e o vínculo deles é o mais frágil. Contagem pela titularidade atual. <a href="#/pi?aba=orgs">Ver o painel de PI</a>.</p>';
        var desenha = function () {
          var cont = [0, 0, 0, 0], l = regs.filter(function (r) { if (anoP && String(r[3]) !== anoP) return false; cont[r[0]]++; return tipoSel === '' || String(r[0]) === tipoSel; });
          el.querySelector('[data-pit]').innerHTML = ['<button type="button" class="chip" data-pt="" aria-pressed="' + (tipoSel === '') + '">Todos · ' + A.br(cont[0] + cont[1] + cont[2] + cont[3]) + '</button>'].concat(TIPOS_PIREG.map(function (t, k) { return cont[k] || tipoSel === String(k) ? '<button type="button" class="chip" data-pt="' + k + '" aria-pressed="' + (tipoSel === String(k)) + '">' + t + ' · ' + A.br(cont[k]) + '</button>' : ''; })).join('');
          el.querySelector('[data-pil]').innerHTML = l.length ? '<table class="tabela"><thead><tr><th>Tipo</th><th>Número</th><th>Ano</th><th>Título</th></tr></thead><tbody>' + l.slice(0, limP).map(function (r) { return '<tr><td><span class="selo-t">' + TIPOS_PIREG[r[0]] + '</span></td><td class="mono" style="white-space:nowrap;font-size:12.5px">' + esc(r[2]) + '</td><td>' + esc(r[3] || '') + '</td><td>' + (r[4] ? esc(r[4]) : '<small>sem título na base</small>') + '</td></tr>'; }).join('') + '</tbody></table>' + (l.length > limP ? '<button type="button" class="btn-linha peq" style="margin-top:12px" data-pim>Mostrar mais ' + Math.min(15, l.length - limP) + ' de ' + A.br(l.length - limP) + '</button>' : '') : '<p class="txt">Nenhum registro com este filtro.</p>';
        };
        box._piClick = function (ev) { if (!el.contains(ev.target)) return; var t = ev.target.closest('[data-pt]'); if (t) { tipoSel = t.getAttribute('data-pt'); limP = 15; desenha(); return; } if (ev.target.closest('[data-pim]')) { limP += 15; desenha(); } };
        box._piChange = function (ev) { if (ev.target.hasAttribute('data-pia')) { anoP = ev.target.value; limP = 15; desenha(); } };
        desenha();
      });
    }
    function achaPI() {
      carregaJs(PIREG_SRC, function () { return !!window.ATLAS2_PIREG; }, function (erro) {
        if (!box.querySelector('#dna-corpo[data-id="' + id + '"]')) return;
        var PR = window.ATLAS2_PIREG; piOrg = null;
        if (PR) for (var i = 0; i < PR.orgs.length; i++) if (PR.orgs[i][1] === id && PR.orgs[i][0] === 'empresa') { piOrg = i; break; }
        ext.pi = piOrg !== null; nav();
        if (aba === 'pi') { if (ext.pi) blocoPI(); else corpo(); }
      });
    }

    /* ---------- financiamentos e obrigações (ATLAS2_FIN sob demanda) ---------- */
    function leFin() {
      carregaJs(FIN_SRC, function () { return !!window.ATLAS2_FIN; }, function (erro) {
        if (!box.querySelector('#dna-corpo[data-id="' + id + '"]')) return;
        ext.finLido = true; var F = window.ATLAS2_FIN;
        if (!erro && F) {
          var gid = F.PDI_ANEEL && F.PDI_ANEEL.empresas[chaveNome(e.nome)], g = gid && F.PDI_ANEEL.grupos[gid];
          if (g) ext.pdi = secao('Programa de P&amp;D&amp;I da ANEEL', 'Empresa com obrigação de investir em P&amp;D&amp;I pelas regras da ANEEL. O canal para propor projetos é o programa do grupo econômico.',
            '<div class="dna-lin"><p><b>' + esc(g.grupo) + '</b> <small>· ' + A.br(g.n) + ' projetos do grupo na base da ANEEL (último em ' + esc(g.ultimo) + ')</small></p><small>' + (g.url ? '<a href="' + esc(g.url) + '" target="_blank" rel="noopener">' + (g.pagina ? 'Página do programa de P&amp;D&amp;I' : 'Site oficial do grupo') + ' ↗</a>' : 'Página do programa não localizada') + (g.fluxo ? ' · recebe propostas a qualquer tempo' : '') + '</small>' +
            (g.chamada ? '<small>Chamada aberta: <a href="' + esc(g.chamada.link) + '" target="_blank" rel="noopener">' + esc(g.chamada.titulo) + ' ↗</a>, até ' + esc(dataBr(g.chamada.encerramento)) + '</small>' : '') +
            (g.parceiros && g.parceiros.length ? '<small>Parceiros citados na página do grupo: ' + g.parceiros.map(esc).join(', ') + '</small>' : '') + '<small><a href="#/ecossistema">Ver no Ecossistema (tipo Programa de P&amp;D&amp;I ANEEL)</a></small></div>');
          var nb = nomeBase(A, e.nome), fu = nb && F.FUNTTEL ? F.FUNTTEL.projetos.filter(function (p) { return nomeBase(A, p.b) === nb; }) : [];
          if (fu.length) ext.funttel = secao('Financiamentos com recursos do FUNTTEL', 'Operações de crédito ou convênios com recursos do Fundo para o Desenvolvimento Tecnológico das Telecomunicações, pela Finep ou pelo BNDES. O vínculo é pelo nome da empresa.', fu.map(function (p) { return '<div class="dna-lin"><p>' + esc(p.t) + '</p><small>' + esc(p.agd || p.ag || '') + (p.a ? ' · ' + esc(p.a) : '') + (p.v ? ' · ' + reais(p.v, A.br) : '') + (p.s ? ' · ' + esc(p.s) : '') + '</small></div>'; }).join(''));
          var B = F.BNDES_INOVACAO, rows = B ? B.e.filter(function (r) { return rz[r[0]]; }) : [];
          if (rows.length) {
            var soma = function (i) { return rows.reduce(function (s, r) { return s + r[i]; }, 0); };
            var dupC = (B.cc || []).reduce(function (s, gr) { var n = gr.filter(function (x) { return rows.some(function (r) { return r[0] === x; }); }).length; return s + (n > 1 ? n - 1 : 0); }, 0), nOps = soma(2), nCon = soma(10) - dupC;
            var a0 = Math.min.apply(null, rows.map(function (r) { return r[5]; })), a1 = Math.max.apply(null, rows.map(function (r) { return r[6]; }));
            var ops = [].concat.apply([], rows.map(function (r) { return r[9].map(function (o) { return {ano: o[0], prod: B.P[o[1]], inst: B.I[o[2]], valor: o[3], desc: o[4], desemb: o[5], uf: o[6]}; }); })).sort(function (x, y) { return (y.ano - x.ano) || (y.valor - x.valor); });
            var insts = []; rows.forEach(function (r) { r[8].forEach(function (i) { if (insts.indexOf(B.I[i]) < 0) insts.push(B.I[i]); }); });
            var money = function (x) { return x > 0 ? reais(x, A.br) : 'R$ 0'; };
            ext.bndes = secao('BNDES: operações de inovação', 'Operações de financiamento direto e indireto não automático que o BNDES classifica como inovação nos dados abertos. Cada operação é uma linha do arquivo; um contrato pode ter várias, e uma operação não é um projeto. O valor é o contratado (pode incluir limites de crédito) e não equivale a recurso não reembolsável, exceto no produto assim identificado.',
              '<div class="dna-kpis">' + [['Operações', A.br(nOps)], ['Contratos distintos', A.br(nCon)], ['Valor contratado', money(soma(3))], ['Desembolsado', money(soma(4))], ['Período', a0 === a1 ? String(a0) : a0 + ' a ' + a1]].map(function (k) { return '<div><span>' + k[0] + '</span><b>' + k[1] + '</b></div>'; }).join('') + '</div>' +
              '<div class="tags" style="margin-top:12px">' + insts.slice(0, 8).map(function (n) { return '<span class="tag">' + esc(n) + '</span>'; }).join('') + (insts.length > 8 ? '<span class="tag">+ ' + (insts.length - 8) + ' instrumentos</span>' : '') + '</div>' +
              '<h4 style="margin-top:16px">As 5 operações mais recentes</h4>' + ops.slice(0, 5).map(function (o) { return '<div class="dna-lin"><p>' + esc(o.desc ? o.desc.charAt(0).toUpperCase() + o.desc.slice(1) : 'Sem descrição') + '</p><small>' + o.ano + ' · ' + esc(o.prod) + ' · ' + esc(o.inst) + ' · contratado ' + reais(o.valor, A.br) + (o.desemb ? ' · desembolsado ' + reais(o.desemb, A.br) : '') + (o.uf ? ' · ' + esc(o.uf) : '') + '</small></div>'; }).join('') +
              (nOps > 5 ? '<p class="aviso-txt">Mostrando as 5 mais recentes, de ' + A.br(nOps) + '.</p>' : '') +
              '<p class="aviso-txt">Fonte: ' + esc(B.fonte) + '. Arquivo de ' + esc(dataBr(B.arquivo_data)) + '; contratações até ' + esc(dataBr(B.corte)) + '. A descrição vem do campo livre do BNDES, sem acentos na origem.</p>');
          }
        }
        nav(); if (aba === 'financiamentos' || aba === 'obrigacoes') corpo();
      });
    }

    /* ---------- montagem ---------- */
    box.innerHTML = '<div class="wrap ficha">' + U.cabecalho(A, {migalha: '<a href="#/dna">DNA da Inovação</a> / ' + esc(e.uf ? D.ufNomes[e.uf] : 'Empresa'), fav: 'dna:' + e.id, voltar: '#/dna', voltarRot: 'Voltar às empresas', olho: 'DNA da Inovação · ' + (e.tipo_identidade === 'grupo' ? 'grupo empresarial' : 'empresa'), tit: e.nome, sub: esc(cnpj) + (e.uf ? ' · ' + esc(D.ufNomes[e.uf]) : ''),
      tags: (e.programas || []).map(function (p) { return '<span class="selo-t' + (/^Defesa/.test(p) ? ' defesa' : '') + '" style="font-size:11.5px;padding:5px 8px">' + esc(p) + '</span>'; }).join(' ')}) +
      '<nav class="fin-abas dna-abas" id="dna-abas" aria-label="Seções da empresa"></nav><div id="dna-corpo" data-id="' + esc(id) + '" class="dna-corpo"></div></div>';
    /* Cabeçalho em duas colunas: identidade à esquerda; projetos por fonte à direita (cada fonte abre a aba Projetos filtrada) */
    (function () {
      var cab = box.querySelector('.ficha-cab'); if (!cab || !fontes.length) return;
      var ks = Object.keys(FONTE_ROT).filter(function (k) { return np[k]; }).sort(function (a, b) { return np[b] - np[a]; });
      var esq = document.createElement('div'); esq.className = 'cab-esq'; while (cab.firstChild) esq.appendChild(cab.firstChild);
      var dir = document.createElement('div'); dir.className = 'dna-cab-dir';
      dir.innerHTML = '<p class="dna-cab-tot"><b>' + A.br(nExec(e)) + '</b><span>projetos executados (EMBRAPII, ANP, FINEP)</span></p>' + (nReg(e) ? '<p class="dna-cab-tot" style="margin-top:6px"><b style="font-size:1.1em">' + A.br(nReg(e)) + '</b><span>projetos de PD&amp;I regulatória (ANEEL, ANTT), à parte</span></p>' : '') + '<div class="dna-cab-fontes">' +
        ks.map(function (k) { return '<button type="button" data-vfonte="' + esc(k) + '"><span>' + esc(FONTE_ROT[k]) + '</span><b>' + A.br(np[k]) + '</b></button>'; }).join('') + '</div>';
      cab.classList.add('dna-cab'); cab.appendChild(esq); cab.appendChild(dir);
    })();
    box.onclick = function (ev) {
      var a = ev.target.closest('[data-aba]'); if (a) { ev.preventDefault(); vaiPara(a.getAttribute('data-aba')); return; }
      var vf = ev.target.closest('[data-vfonte]'); if (vf) { fonteSel = vf.getAttribute('data-vfonte'); lim = 25; vaiPara('projetos'); return; }
      var f = ev.target.closest('[data-fonte]'); if (f) { fonteSel = f.getAttribute('data-fonte'); lim = 25; tabela(); return; }
      if (ev.target.id === 'dna-mais') { lim += 25; tabela(); return; }
      if (box._piClick) box._piClick(ev);
    };
    var tqd; box.onchange = function (ev) { if (ev.target.id === 'dna-ano') { anoSel = ev.target.value; lim = 25; tabela(); } else if (box._piChange) box._piChange(ev); };
    box.oninput = function (ev) { if (ev.target.id === 'dna-q') { var vq = ev.target.value; clearTimeout(tqd); tqd = setTimeout(function () { termo = vq.trim(); lim = 25; tabela(); }, 180); } };
    box._piClick = null; box._piChange = null;
    corpo(); achaPI(); leFin();
  }

  /* ================= PROPRIEDADE INTELECTUAL ================= */
  var PI_ABAS = [['patentes', 'Patentes', 'patentes'], ['desenhos', 'Desenhos industriais', 'desenhos_industriais'], ['programas', 'Programas de computador', 'programas_de_computador'], ['contratos', 'Contratos de tecnologia', 'contratos_transferencia_tecnologia'], ['atlas', 'Top 100 do Atlas', null], ['consulta', 'Consultar registros', null], ['orgs', 'Organizações do Atlas', null]];
  function tipoRank(t) { return t.tipo === 'ict' ? 'ict' : t.tipo === 'empresa' ? 'empresa' : 'outro'; }
  T.pi = function (A, sub, q, box) {
    var esc = A.esc, P = R.pi, tot = P.totais_por_tipo, ED = window.AV2_PI_EDIT;
    var aba = ((/(?:^|&)aba=([a-z]+)/.exec(q || '') || [])[1]) || 'patentes', sec = ((/(?:^|&)s=([a-z]+)/.exec(q || '') || [])[1]) || 'oque';
    if (aba === 'guia' && !ED) aba = 'patentes';
    var guia = aba === 'guia', anoG = +(P.gerado_inpi || '2026').slice(0, 4), rkSt = {tipo: '', lim: 25}, rkAtual = null;
    function marca() { box.querySelectorAll('[data-aba]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-aba') === aba)); }); box.querySelectorAll('[data-gs]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-gs') === sec)); }); }
    function rankHtml() {
      var a = rkAtual, rk = a[1], cont = {empresa: 0, ict: 0, outro: 0}, l = [];
      rk.forEach(function (t, i) { cont[tipoRank(t)]++; if (!rkSt.tipo || tipoRank(t) === rkSt.tipo) l.push([t, i]); });
      var chips = [['', 'Todos', rk.length], ['empresa', 'Empresas', cont.empresa], ['ict', 'ICTs', cont.ict], ['outro', 'Não identificados', cont.outro]].filter(function (c) { return c[0] === '' || c[2]; });
      return '<h4 class="olho">Maiores depositantes do Brasil · ' + esc(a[0]) + '</h4><div class="tags" style="margin-top:12px">' + chips.map(function (c) { return '<button type="button" class="chip" data-rk="' + c[0] + '" aria-pressed="' + (rkSt.tipo === c[0]) + '">' + c[1] + ' · ' + c[2] + '</button>'; }).join('') + '</div>' +
        '<table class="tabela"><thead><tr><th>#</th><th>Titular</th><th>UF</th><th>Total</th><th>No Atlas</th></tr></thead><tbody>' + l.slice(0, rkSt.lim).map(function (x) { var t = x[0]; return '<tr><td>' + (x[1] + 1) + '</td><td>' + esc(t.nome) + '</td><td>' + esc(t.uf || '') + '</td><td><b>' + A.br(t.total) + '</b></td><td><span class="selo-t' + (t.tipo === 'ict' ? ' ict' : t.tipo === 'empresa' ? '' : ' out') + '">' + (t.tipo === 'ict' ? 'ICT' : t.tipo === 'empresa' ? 'empresa' : 'não identificado') + '</span></td></tr>'; }).join('') + '</tbody></table>' +
        (l.length > rkSt.lim ? '<button type="button" class="btn-linha peq" style="margin-top:12px" data-rkmais>Mostrar mais ' + Math.min(25, l.length - rkSt.lim) + ' de ' + A.br(l.length - rkSt.lim) + '</button>' : '') +
        '<p class="aviso-txt">Mostrando ' + Math.min(rkSt.lim, l.length) + ' de ' + l.length + (rkSt.tipo ? ' neste filtro (ranking completo: ' + rk.length + ')' : '') + '. Todos os titulares do ranking são pessoas jurídicas. “Não identificado” significa que o titular não está entre as organizações mapeadas no Atlas; universidades federais costumam aparecer assim.</p>';
    }
    function comoLer() {
      return '<div class="bloco alerta pg-bloco" style="margin-top:18px"><h4 class="olho">Como ler estes dados</h4><p class="txt">As contagens usam processos distintos por organização (as bases do INPI trazem linhas repetidas, que foram deduplicadas). A associação a uma empresa ou ICT é feita por CNPJ com dígito verificador validado e, quando não há CNPJ na base, por razão social; os contratos de transferência de tecnologia não têm CNPJ na fonte, então o vínculo deles é o mais frágil. <b>Não exibimos a situação do pedido</b> (concedido, indeferido, arquivado): as bases abertas trazem os códigos de despacho sem a legenda oficial, e é melhor omitir do que informar errado.</p></div>';
    }
    function painel() {
      if (guia) { box.querySelector('#pi-painel').innerHTML = ED.html(A, sec); marca(); return; }
      if (aba === 'consulta' || aba === 'orgs') { window.AV2_PIX(A, aba, box.querySelector('#pi-painel'), function (nova) { aba = nova; history.replaceState(null, '', '#/pi?aba=' + aba); marca(); }); marca(); return; }
      var a = PI_ABAS.filter(function (x) { return x[0] === aba; })[0] || PI_ABAS[0], html = '';
      if (aba === 'atlas') {
        var O = P.organizacoes_mapeadas_no_atlas;
        html = '<div class="bloco largo"><h4 class="olho">Organizações do Atlas com mais registros no INPI</h4><p class="txt" style="font-size:14px">' + A.br(O.n_organizacoes) + ' organizações do Atlas têm algum registro: ' + A.br(O.n_empresas) + ' empresas e ' + O.n_icts + ' ICTs. Abaixo, as 100 com mais registros.</p>' +
          '<table class="tabela"><thead><tr><th>#</th><th>Organização</th><th>Patentes</th><th>Desenhos</th><th>Programas</th><th>Contratos</th><th>Total</th></tr></thead><tbody>' + O.top100_total.map(function (o, i) { var href = o.tipo === 'ict' ? '#/icts/' + encodeURIComponent(o.id) : '#/dna/' + encodeURIComponent(o.id); return '<tr><td>' + (i + 1) + '</td><td><a class="btn-txt" style="font-size:14px" href="' + href + '">' + esc(o.nome) + '</a> <span class="selo-t' + (o.tipo === 'ict' ? ' ict' : '') + '">' + (o.tipo === 'ict' ? 'ICT' : 'empresa') + '</span></td><td>' + A.br(o.patentes) + '</td><td>' + A.br(o.desenhos) + '</td><td>' + A.br(o.programas) + '</td><td>' + A.br(o.contratos) + '</td><td><b>' + A.br(o.total) + '</b></td></tr>'; }).join('') + '</tbody></table></div>';
      } else {
        var serie = P.serie_por_ano[a[0] === 'contratos' ? 'contratos' : a[2]] || {}, uf = (P.por_uf || {})[a[2]], rk = (P.ranking_titulares_top100 || {})[a[2]];
        html = '<div class="bloco largo"><h4 class="olho">Pedidos por ano · ' + esc(a[1]) + '</h4>' + serieAnos(A, serie, [anoG - 1, anoG]) + '<p class="aviso-txt">Os dois últimos anos aparecem incompletos: o INPI leva tempo para publicar os pedidos.</p></div>';
        var esq = '', dir = '';
        if (uf) {
          var ufs = Object.keys(uf).filter(function (k) { return A.D.ufNomes[k]; }), mx = Math.max.apply(null, ufs.map(function (k) { return uf[k]; }));
          var svg = A.svgBrasil('', false); ufs.forEach(function (k) { var n = Math.min(5, Math.ceil(Math.sqrt(uf[k] / mx) * 5)); svg = svg.replace('class="uf " data-uf="' + k + '"', 'class="uf" style="fill:var(--uf-' + n + ')" data-uf="' + k + '"'); });
          esq = '<div class="bloco"><h4 class="olho">Onde estão os depositantes</h4><div class="mapa-uf-mini">' + svg + '</div>' + barrasH(A, ufs.sort(function (x, y) { return uf[y] - uf[x]; }).slice(0, 10).map(function (k) { return [A.D.ufNomes[k], uf[k]]; })) + '</div>';
        }
        if (aba === 'patentes') dir = '<div class="bloco"><h4 class="olho">Áreas técnicas (seções da CIP)</h4>' + barrasH(A, Object.keys(P.ipc_rotulos).map(function (k) { return [k + ' · ' + P.ipc_rotulos[k], P.patentes_por_secao_ipc[k] || 0]; }).sort(function (x, y) { return y[1] - x[1]; })) + '<p class="aviso-txt">Uma patente pode ter mais de uma seção.</p></div>';
        if (aba === 'desenhos') dir = '<div class="bloco"><h4 class="olho">Classes de Locarno mais usadas</h4>' + barrasH(A, P.desenhos_por_classe_locarno.slice(0, 12).map(function (c) { return [c.classe + ' · ' + A.U_primeiro(c.rotulo_extraido_dos_dados, 48), c.n_DI]; })) + '</div>';
        if (aba === 'contratos') {
          var C = P.contratos_transferencia_tecnologia, pct = C.cedente_estrangeiro_pct;
          esq = '<div class="bloco"><h4 class="olho">De onde vem a tecnologia</h4>' + (pct != null ? '<div class="dado"><b class="grande">' + A.br(pct, 2) + '%</b><span>dos contratos têm cedente estrangeiro</span></div>' : '') + '<h4 class="olho" style="margin-top:16px">Países dos cedentes</h4>' + barrasH(A, Object.keys(C.top15_paises_cedentes).map(function (k) { return [k, C.top15_paises_cedentes[k]]; })) + '</div>';
          dir = '<div class="bloco"><h4 class="olho">Modalidades dos contratos</h4>' + barrasH(A, C.distribuicao_modalidade.slice(0, 10).map(function (m) { return [m.sigla + ' · ' + m.descricao.charAt(0) + m.descricao.slice(1).toLowerCase(), m.qtd_linhas]; })) + '</div>';
        }
        if (aba === 'programas') dir = '<div class="bloco"><h4 class="olho">Como ler</h4><p class="txt">O registro de programa de computador protege a obra autoral, sem exame de mérito técnico. A contagem por organização considera só a titularidade atual.</p></div>';
        if (esq || dir) html += '<div class="ficha-duas">' + (esq || '') + (dir || '') + '</div>';
        if (rk) { rkAtual = [a[1], rk]; html += '<div class="bloco largo" id="pi-rank">' + rankHtml() + '</div>'; }
      }
      html += comoLer();
      box.querySelector('#pi-painel').innerHTML = html; marca();
    }
    A.U_primeiro = U.primeiro;
    var grupos = '<nav class="abas" aria-label="Seções de PI"><a href="#/pi?aba=patentes" class="' + (guia ? '' : 'ativa') + '">Dados do INPI</a>' + (ED ? '<a href="#/pi?aba=guia" class="' + (guia ? 'ativa' : '') + '">Guia de PI</a>' : '') + '</nav>';
    if (guia) {
      box.innerHTML = U.faixa(A, {olho: 'Propriedade intelectual · guia prático', tit: 'Como proteger<br><em>o que você cria</em>', txt: 'Tipos de proteção, as etapas do depósito, <b>como negociar a PI com uma ICT</b>, as leis que importam, valoração e os erros que mais custam caro.', abas: grupos, extra: '<div style="height:8px"></div>'}) +
        '<div class="wrap" style="padding-bottom:110px"><div class="tab-seg pg-secoes">' + ED.secoes.map(function (s) { return '<button type="button" class="chip" data-gs="' + s[0] + '" aria-pressed="false">' + esc(s[1]) + '</button>'; }).join('') + '</div><div id="pi-painel" class="pg-painel"></div></div>';
    } else {
      box.innerHTML = U.faixa(A, {olho: 'Propriedade intelectual · dados abertos do INPI, ' + A.fdata(P.gerado_inpi), tit: 'O que o Brasil<br><em>protege</em>', txt: 'Patentes, desenhos industriais, programas de computador e contratos de transferência de tecnologia: <b>quanto, onde, em que áreas e quem mais deposita</b>.', abas: grupos, extra: '<div style="height:44px"></div>'}) +
        '<div class="wrap" style="padding-bottom:110px"><div class="kpis4">' + PI_ABAS.slice(0, 4).map(function (a) { return '<button type="button" data-aba="' + a[0] + '" aria-pressed="false"><b>' + A.br(tot[a[2]]) + '</b><span>' + esc(a[1]) + '</span></button>'; }).join('') + '</div>' +
        '<div class="tab-seg">' + PI_ABAS.map(function (a) { return '<button type="button" class="chip" data-aba="' + a[0] + '" aria-pressed="false">' + esc(a[1]) + '</button>'; }).join('') + '</div><div id="pi-painel"></div></div>';
    }
    U.ativaCampos(A, box);
    box.onclick = function (e) {
      var b = e.target.closest('[data-gs]'); if (b) { sec = b.getAttribute('data-gs'); history.replaceState(null, '', '#/pi?aba=guia&s=' + sec); painel(); return; }
      b = e.target.closest('[data-aba]'); if (b) { aba = b.getAttribute('data-aba'); rkSt.tipo = ''; rkSt.lim = 25; history.replaceState(null, '', '#/pi?aba=' + aba); painel(); return; }
      b = e.target.closest('[data-rk]'); if (b) { rkSt.tipo = b.getAttribute('data-rk'); rkSt.lim = 25; box.querySelector('#pi-rank').innerHTML = rankHtml(); return; }
      if (e.target.closest('[data-rkmais]')) { rkSt.lim += 25; box.querySelector('#pi-rank').innerHTML = rankHtml(); }
    };
    box.onchange = null; box.oninput = null;
    painel();
  };
})();
