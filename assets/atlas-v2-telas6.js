/* Atlas v2 · rodada 5b — ICT completa (contato e EMBRAPII em números) e Agenda de inovação (eventos, prazos e etapas). */
(function () {
  'use strict';
  var T = window.AV2_TELAS, U = window.AV2_UTIL, D = window.ATLAS2;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function sem(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function br(n) { return Number(n || 0).toLocaleString('pt-BR'); }

  /* Formato do Atlas no bloco da ficha da ICT: valor médio com 2 casas e "a preços de IPCA", repartição dos aportes com R$ e % com 1 casa, nota de Transferência de Tecnologia */
  function brN(n, c) { return Number(n || 0).toLocaleString('pt-BR', {minimumFractionDigits: c, maximumFractionDigits: c}); }
  function reaisAtlas(v, dec) { v = +v; return v >= 1e9 ? 'R$ ' + brN(v / 1e9, 2) + ' bi' : v >= 1e6 ? 'R$ ' + brN(v / 1e6, dec) + ' mi' : v >= 1e3 ? 'R$ ' + brN(v / 1e3, 0) + ' mil' : 'R$ ' + brN(v, 0); }
  function blocoICT(A, u, DIC, M) {
    var h = window.AV2_blocoUnidade(A, u, DIC, M), ipca = (M.meta || {}).ipca || '';
    if (!u.n) return h;
    if (u.vm != null) h = h.replace(/(<span>Valor médio<\/span><b>)[^<]*(<\/b>)(<small>[^<]*<\/small>)?/, function (m, a, b) { return a + reaisAtlas(u.vm, 2) + b + '<small>a preços de IPCA ' + esc(ipca) + '</small>'; });
    if (u.pi && u.pi[0] && !u.pi[1]) h = h.replace(/(<span>Pedidos de PI<\/span><b>[^<]*<\/b>)(<small>[^<]*<\/small>)?/, function (m, a) { return a + '<small>nenhum é de Transferência de Tecnologia</small>'; });
    var tot = (u.rep || []).reduce(function (s, v) { return s + (v || 0); }, 0), cores = ['#2563EB', '#10b981', '#f59e0b', '#8b5cf6'], nomes = ['EMBRAPII', 'Empresa', 'Unidade EMBRAPII', 'Sebrae'];
    if (tot) h = h.replace(/<div class="leg">[\s\S]*?<\/div>/, function () { return '<div class="leg">' + u.rep.map(function (v, i) { return '<span style="--c:' + cores[i] + '">' + nomes[i] + ' ' + reaisAtlas(v || 0, 1) + ' · ' + brN((v || 0) / tot * 100, 1) + '%</span>'; }).join('') + '</div>'; });
    return h;
  }

  /* ================= ICT: contato e EMBRAPII em números ================= */
  var ictPrev = T.icts;
  T.icts = function (A, sub, q, box, mesma) {
    ictPrev.apply(this, arguments);
    if (!sub) return;
    var t = D.icts.filter(function (x) { return x.id === sub; })[0], f = box.querySelector('.ficha'); if (!t || !f) return;
    var ident = f.querySelector('.ficha-tres .bloco');
    if (ident && t.contato) {
      var c = document.createElement('div'); c.className = 'dado';
      var partes = String(t.contato).split(/\s*·\s*/).map(function (p) { p = p.trim(); if (/@/.test(p)) return '<a href="mailto:' + esc(p) + '">' + esc(p) + '</a>'; if (/^\+?[\d\s()-]{8,}$/.test(p)) return '<a href="tel:' + esc(p.replace(/[^\d+]/g, '')) + '">' + esc(p) + '</a>'; return esc(p); });
      c.innerHTML = '<span>Contato institucional</span><b style="font-weight:400;font-size:14px;line-height:1.6">' + partes.join('<br>') + '</b>';
      var btn = ident.querySelector('a.btn-azul'); if (btn) ident.insertBefore(c, btn); else ident.appendChild(c);
    }
    /* PI no INPI: os totais vêm no bundle (t.pi); a lista de registros carrega sob demanda (cerca de 6 MB) */
    if (t.pi && (t.pi[0] + t.pi[1] + t.pi[2] + t.pi[3]) > 0) {
      var pib = document.createElement('div'), rots = ['Patentes', 'Desenhos industriais', 'Programas de computador', 'Contratos de tecnologia'];
      pib.innerHTML = '<div class="secao-tit"><h2 class="tit-md">Propriedade intelectual no INPI</h2><a class="btn-txt" href="#/pi?aba=orgs">Ranking de organizações</a></div><div class="bloco" data-pi><div class="pi-tot">' + t.pi.map(function (n, k) { return '<div><b>' + br(n) + '</b><span>' + rots[k] + '</span></div>'; }).join('') + '</div>' +
        '<p class="txt" style="font-size:13.5px;margin-top:12px">Registros em que a ICT consta como titular nas bases do INPI. Patentes recentes podem aparecer sem título por causa do sigilo de 18 meses.</p><button type="button" class="btn-linha peq" data-pi-ver style="margin-top:10px">Ver os registros (carrega cerca de 6 MB)</button><div data-pi-lista></div></div>';
      var duasF = f.querySelectorAll('.ficha-duas'), refPI = duasF.length ? duasF[duasF.length - 1] : null;
      f.insertBefore(pib, refPI);
      var pst = {tipo: '', lim: 15, regs: null};
      function pintaPI() {
        var el = pib.querySelector('[data-pi-lista]'), ROT = ['Patente', 'Desenho industrial', 'Programa de computador', 'Contrato'];
        var l = pst.regs.filter(function (r) { return pst.tipo === '' || r[0] === +pst.tipo; });
        el.innerHTML = '<div class="proj-ferr" style="margin-top:12px"><label class="ordem">Tipo <select data-pi-tipo><option value="">Todos (' + pst.regs.length + ')</option>' + ROT.map(function (r, k) { var n = pst.regs.filter(function (x) { return x[0] === k; }).length; return n ? '<option value="' + k + '"' + (pst.tipo === String(k) ? ' selected' : '') + '>' + r + ' (' + n + ')</option>' : ''; }).join('') + '</select></label></div>' +
          '<div class="rola-x"><table class="tabela"><thead><tr><th>Tipo</th><th>Número</th><th>Ano</th><th>Título</th></tr></thead><tbody>' + l.slice(0, pst.lim).map(function (r) { return '<tr><td>' + ROT[r[0]] + '</td><td style="white-space:nowrap">' + esc(r[2]) + '</td><td>' + esc(r[3] || '') + '</td><td>' + (r[4] ? esc(r[4]) : '<small>sem título na base</small>') + '</td></tr>'; }).join('') + '</tbody></table></div>' + (l.length > pst.lim ? '<button type="button" class="btn-linha peq" data-pi-mais style="margin-top:10px">Mostrar mais ' + Math.min(25, l.length - pst.lim) + ' de ' + (l.length - pst.lim) + '</button>' : '');
      }
      function achaPI() {
        var P = window.ATLAS2_PIREG, idx = -1; P.orgs.some(function (o, i) { if (o[0] === 'ict' && o[1] === t.id) { idx = i; return true; } return false; });
        pst.regs = idx < 0 ? [] : P.r.filter(function (r) { return r[1] === idx; }).sort(function (a, b) { return (b[3] || 0) - (a[3] || 0); });
        var bt = pib.querySelector('[data-pi-ver]'); if (bt) bt.remove(); pintaPI();
      }
      pib.addEventListener('click', function (e) {
        if (e.target.closest('[data-pi-mais]')) { pst.lim += 25; pintaPI(); return; }
        var v = e.target.closest('[data-pi-ver]'); if (!v) return;
        v.disabled = true; v.textContent = 'Carregando os registros…';
        if (window.ATLAS2_PIREG) { achaPI(); return; }
        var sc = document.createElement('script'); sc.src = 'assets/atlas-v2-pi-registros.js?v=r90'; sc.onload = achaPI; sc.onerror = function () { v.disabled = false; v.textContent = 'Não carregou. Tentar de novo'; }; document.body.appendChild(sc);
      });
      pib.addEventListener('change', function (e) { if (e.target.hasAttribute('data-pi-tipo')) { pst.tipo = e.target.value; pst.lim = 15; pintaPI(); } });
    }
    /* Como no Atlas: um bloco por código da EMBRAPII (atual e anterior); sem código, a ficha não mostra o bloco nem mensagem */
    var codsEmb = [].concat(t.embrapiiCod == null ? [] : t.embrapiiCod, t.embrapiiCodAnt == null ? [] : t.embrapiiCodAnt);
    if (!codsEmb.length) return;
    var div = document.createElement('div');
    div.innerHTML = '<div class="secao-tit"><h2 class="tit-md">EMBRAPII em números</h2><a class="btn-txt" href="#/agentes/embrapii?aba=numeros">Todas as unidades</a></div><div class="bloco" data-emb><div class="carregando" style="padding:20px 0"><i></i><span>Carregando o painel da EMBRAPII…</span></div></div>';
    var alvo = f.querySelector('.ficha-duas'); f.insertBefore(div, alvo || null);
    var s = document.createElement('script'); s.src = 'assets/atlas-v2-financiadores.js?v=r90';
    function pinta() {
      var F = window.ATLAS2_FIN, M = F && F.EMBRAPII_METRICAS; var el = div.querySelector('[data-emb]'); if (!M) { el.innerHTML = '<p class="txt">Painel indisponível.</p>'; return; }
      var nomes = [t.nome, t.longo].filter(Boolean).map(sem), u = null;
      var uc = (F.EMBRAPII_UNIDADES || []).filter(function (x) { return nomes.indexOf(sem(x.nome)) >= 0; })[0];
      if (uc && (uc.competencia || (uc.linhas || []).length) && div.parentNode) {
        var cb = document.createElement('div'); cb.className = 'bloco largo'; cb.innerHTML = '<h4>Competência EMBRAPII e linhas de atuação</h4>' + (uc.competencia ? '<p class="txt" style="font-size:15px"><b style="font-weight:500">' + esc(uc.competencia) + '</b></p>' : '') + ((uc.linhas || []).length ? '<ul class="lista-pontos">' + uc.linhas.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '');
        div.parentNode.insertBefore(cb, div);
      }
      var cods = codsEmb.filter(function (c) { return M.unidades[c]; });
      if (!cods.length) { div.remove(); return; }
      el.innerHTML = cods.map(function (c, i) {
        var x = M.unidades[c], rot = i > 0 ? 'Credenciamento anterior' : (cods.length > 1 ? 'Credenciamento atual' : '');
        return '<div' + (i > 0 ? ' style="border-top:1px solid var(--line);margin-top:18px;padding-top:14px"' : '') + '>' + (rot ? '<p class="olho">' + rot + ' · código ' + c + '</p>' : '') + blocoICT(A, x, F.EMBRAPII_DIC || {}, M) + '</div>';
      }).join('');
    }
    if (window.ATLAS2_FIN) pinta(); else { s.onload = pinta; document.body.appendChild(s); }
  };

  /* ================= AGENDA DE INOVAÇÃO ================= */
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var TIPOS = {evento: ['Eventos de inovação', '#7C3AED'], prazo: ['Prazos de chamadas', '#ef4444'], etapa: ['Etapas de chamadas', '#2563EB'], eco: ['Inovação aberta', '#10b981'], intl: ['Internacional', '#d97706']};
  function iso(s) { var m = /(\d{4}-\d{2}-\d{2})/.exec(String(s || '')); return m ? m[1] : ''; }
  function isoFim(s) { var m = String(s || '').match(/\d{4}-\d{2}-\d{2}/g); return m && m.length > 1 ? m[1] : ''; }
  function itens(A) {
    var L = [];
    ((D.eventos || {}).itens || []).forEach(function (e) { if (e.inicio) L.push({id: e.id, tipo: 'evento', d: e.inicio, fim: e.fim && e.fim !== e.inicio ? e.fim : '', t: e.nome, sub: [e.organizador, e.cidade ? e.cidade + (e.uf ? '/' + e.uf : '') : '', e.formato].filter(Boolean).join(' · '), uf: e.uf || '', formato: e.formato || '', url: e.url, custo: e.custo || '', publico: e.publico || '', verificadoEm: e.verificadoEm || '', fonteData: e.fonteData || ''}); });
    D.chamadas.forEach(function (c) {
      if (c.status !== 'encerrada' && c.encerramento) L.push({id: c.id + '-fim', tipo: 'prazo', d: c.encerramento, t: 'Encerra: ' + c.titulo, sub: c.agenciaNome || '', uf: c.uf || '', href: '#/radar/' + encodeURIComponent(c.id), url: c.link});
      (c.cronograma || []).forEach(function (et, i) { var d = iso(et.data); if (!d) return; L.push({id: c.id + '-et' + i, tipo: 'etapa', d: d, fim: isoFim(et.data), t: et.etapa, sub: c.titulo, uf: c.uf || '', href: '#/radar/' + encodeURIComponent(c.id), url: c.link}); });
    });
    D.ecossistema.forEach(function (e) { if (e.encerramento) L.push({id: e.id, tipo: 'eco', d: e.encerramento, t: 'Encerra: ' + e.nome, sub: e.promotor || '', uf: (e.ufs || [])[0] || '', url: e.url}); });
    ((D.internacional || {}).programas || []).forEach(function (x, i) { if (x.encerramento) L.push({id: 'intl-' + i, tipo: 'intl', d: x.encerramento, t: 'Encerra: ' + (x.nome_pt || x.programa), sub: x.pais + ' · ' + x.orgao, uf: '', url: x.url_oficial}); });
    return L.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  }
  function ics(lista, nome) {
    function txt(s) { return String(s || '').replace(/[\\;,]/g, function (c) { return '\\' + c; }).replace(/\n/g, ' '); }
    function mais1(d) { var x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + 1); return x.toISOString().slice(0, 10).replace(/-/g, ''); }
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Atlas da Inovacao//Agenda//PT', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + txt(nome)];
    lista.forEach(function (x) { L.push('BEGIN:VEVENT', 'UID:' + x.id + '@atlas-inovacao', 'DTSTAMP:' + D.hoje.replace(/-/g, '') + 'T000000Z', 'DTSTART;VALUE=DATE:' + x.d.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + mais1(x.fim || x.d), 'SUMMARY:' + txt(x.t), 'DESCRIPTION:' + txt([TIPOS[x.tipo][0], x.sub, x.url].filter(Boolean).join(' · ')), x.url ? 'URL:' + x.url : '', 'END:VEVENT'); });
    L.push('END:VCALENDAR');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([L.filter(Boolean).join('\r\n')], {type: 'text/calendar'})); a.download = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.ics'; document.body.appendChild(a); a.click(); a.remove();
  }
  T.agenda = function (A, sub, q, box) {
    var todos = itens(A);
    var m = /(?:^|&)mes=(\d{4})-(\d{2})/.exec(q || ''), ano = m ? +m[1] : A.HOJE.getFullYear(), mes = m ? +m[2] - 1 : A.HOJE.getMonth();
    var st = {tipos: Object.keys(TIPOS), q: '', uf: '', formato: '', periodo: 'mes', marcados: {}};
    try { st.marcados = JSON.parse(localStorage.getItem('atlas-agenda-marcados') || '{}'); } catch (e) {}
    var futuros = todos.filter(function (x) { return A.dias(x.fim || x.d) >= 0; });
    var nEv = futuros.filter(function (x) { return x.tipo === 'evento'; }).length, proxEv = futuros.filter(function (x) { return x.tipo === 'evento'; })[0];
    box.innerHTML = U.faixa(A, {abas: U.abasDinheiro('agenda'), olho: 'Agenda de inovação · última verificação em ' + A.fdata((D.eventos || {}).atualizado), tit: 'Eventos, prazos e etapas<br><em>num só calendário</em>', txt: '<b>Eventos de inovação</b>, encerramento de <b>chamadas</b>, <b>etapas dos editais</b>, desafios de inovação aberta e programas internacionais. Filtre e leve para o seu calendário.',
      num: [br(futuros.length), 'datas daqui para frente'], quebra: [[br(nEv), 'eventos em ' + Object.keys(futuros.filter(function (x) { return x.tipo === 'evento' && x.uf; }).reduce(function (o, x) { o[x.uf] = 1; return o; }, {})).length + ' estados'], [br(futuros.filter(function (x) { return x.tipo === 'prazo'; }).length), 'prazos de chamadas'], [br(futuros.filter(function (x) { return x.tipo === 'etapa'; }).length), 'etapas de editais'], [proxEv ? (A.dias(proxEv.d) < 0 ? 'agora' : A.fdata(proxEv.d).slice(0, 5)) : 'n/d', proxEv ? (A.dias(proxEv.d) < 0 ? 'evento em andamento' : 'próximo evento') + ' · ' + proxEv.t : 'próximo evento']]}) +
      '<div class="wrap" style="padding-bottom:110px"><div class="bloco" style="margin-top:28px"><div class="cal-topo"><h3 data-mes></h3><div class="cal-nav"><button type="button" class="btn-linha peq" data-nav="-1" aria-label="Mês anterior">←</button><button type="button" class="btn-linha peq" data-nav="0">Hoje</button><button type="button" class="btn-linha peq" data-nav="1" aria-label="Próximo mês">→</button></div></div>' +
        '<div class="cal cal-largo" data-cal></div><div class="cal-leg">' + Object.keys(TIPOS).map(function (k) { return '<span><i style="background:' + TIPOS[k][1] + '"></i>' + TIPOS[k][0] + '</span>'; }).join('') + '</div></div>' +
      '<div class="secao-tit"><h2 class="tit-md" data-ltit>Lista</h2><div class="barra-esq"><button type="button" class="btn-azul peq" data-ics="mes">Baixar o mês (.ics)</button><button type="button" class="btn-linha peq" data-ics="filtro">Baixar o que está filtrado</button><button type="button" class="btn-linha peq" data-ics="marcados">Baixar os marcados (<span data-nm>0</span>)</button></div></div>' +
      '<div class="bloco"><div class="tags" data-tipos>' + Object.keys(TIPOS).map(function (k) { return '<button type="button" class="chip" data-tipo="' + k + '" aria-pressed="true"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:' + TIPOS[k][1] + '"></i>' + TIPOS[k][0] + '</button>'; }).join('') + '</div>' +
        '<div class="tg-barra"><div class="busca"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><input type="search" data-aq placeholder="Buscar evento, chamada ou organizador" autocomplete="off"></div>' +
        '<select class="f-sel" data-per><option value="mes">Só o mês do calendário</option><option value="30">Próximos 30 dias</option><option value="futuro">Tudo daqui para frente</option><option value="tudo">Tudo, inclusive passado</option></select>' +
        '<select class="f-sel" data-auf><option value="">Todas as UFs</option>' + A.UFS.map(function (u) { return '<option value="' + u + '">' + u + '</option>'; }).join('') + '</select>' +
        '<select class="f-sel" data-afo><option value="">Qualquer formato de evento</option><option value="presencial">Presencial</option><option value="online">On-line</option><option value="hibrido">Híbrido</option></select></div>' +
        '<div data-lista></div></div></div>';
    U.ativaCampos(A, box);
    function filtrados() {
      var qs = sem(st.q).trim().split(/\s+/).filter(Boolean), ini = new Date(ano, mes, 1), fim = new Date(ano, mes + 1, 0);
      var iniS = ini.getFullYear() + '-' + String(ini.getMonth() + 1).padStart(2, '0') + '-01', fimS = fim.getFullYear() + '-' + String(fim.getMonth() + 1).padStart(2, '0') + '-' + String(fim.getDate()).padStart(2, '0');
      return todos.filter(function (x) {
        if (st.tipos.indexOf(x.tipo) < 0) return false;
        if (st.uf && x.uf !== st.uf) return false;
        if (st.formato && x.tipo === 'evento' && sem(x.formato).indexOf(st.formato) < 0) return false;
        var d0 = x.d, d1 = x.fim || x.d;
        if (st.periodo === 'mes' && (d1 < iniS || d0 > fimS)) return false;
        if (st.periodo === '30' && (A.dias(d1) < 0 || A.dias(d0) > 30)) return false;
        if (st.periodo === 'futuro' && A.dias(d1) < 0) return false;
        if (qs.length) { var k = sem(x.t + ' ' + x.sub); if (!qs.every(function (t) { return k.indexOf(t) >= 0; })) return false; }
        return true;
      });
    }
    function cal() {
      var ini = new Date(ano, mes, 1), dow = (ini.getDay() + 6) % 7, s = '';
      ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].forEach(function (d) { s += '<div class="cal-dow">' + d + '</div>'; });
      var vis = todos.filter(function (x) { return st.tipos.indexOf(x.tipo) >= 0 && (!st.uf || x.uf === st.uf); });
      for (var k = 0; k < 42; k++) {
        var dt = new Date(ano, mes, 1 - dow + k), i = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
        var dd = vis.filter(function (x) { return x.d === i || (x.fim && x.d <= i && x.fim >= i && x.tipo === 'evento'); });
        s += '<div class="cal-dia' + (dt.getMonth() !== mes ? ' fora-mes' : '') + (i === D.hoje ? ' hoje' : '') + '"><span>' + dt.getDate() + '</span>' + dd.slice(0, 4).map(function (x) { return '<a class="cal-ev" style="background:color-mix(in srgb,' + TIPOS[x.tipo][1] + ' 14%,transparent);color:var(--ink);box-shadow:inset 3px 0 0 ' + TIPOS[x.tipo][1] + '" href="' + esc(x.href || x.url || '#/agenda') + '"' + (!x.href && x.url ? ' target="_blank" rel="noopener"' : '') + ' title="' + esc(x.t + ' · ' + x.sub) + '">' + esc(x.t.replace(/^Encerra: /, '')) + '</a>'; }).join('') + (dd.length > 4 ? '<span class="cal-mais">+' + (dd.length - 4) + '</span>' : '') + '</div>';
        if (k === 34 && new Date(ano, mes, 1 - dow + 35).getMonth() !== mes) break;
      }
      box.querySelector('[data-cal]').innerHTML = s;
      box.querySelector('[data-mes]').textContent = MESES[mes].charAt(0).toUpperCase() + MESES[mes].slice(1) + ' de ' + ano;
    }
    function lista() {
      var l = filtrados(), nm = Object.keys(st.marcados).length;
      box.querySelector('[data-nm]').textContent = nm;
      box.querySelector('[data-ltit]').textContent = br(l.length) + (l.length === 1 ? ' data' : ' datas') + (st.periodo === 'mes' ? ' em ' + MESES[mes] : '');
      box.querySelector('[data-lista]').innerHTML = l.length ? '<table class="tabela"><thead><tr><th style="width:34px"></th><th>Data</th><th>O quê</th><th>Tipo</th><th>Onde ou quem</th><th>Calendário</th></tr></thead><tbody>' + l.slice(0, 300).map(function (x) {
        var link = x.href ? '<a href="' + esc(x.href) + '">' + esc(x.t) + '</a>' : x.url ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.t) + ' ↗</a>' : esc(x.t);
        return '<tr><td><input type="checkbox" data-mk="' + esc(x.id) + '"' + (st.marcados[x.id] ? ' checked' : '') + ' aria-label="Marcar para o calendário" style="accent-color:var(--azul);width:16px;height:16px"></td><td style="white-space:nowrap">' + A.fdata(x.d) + (x.fim ? '<br><small>até ' + A.fdata(x.fim) + '</small>' : '') + '</td><td>' + link + (x.custo ? '<br><small>' + esc(x.custo) + '</small>' : '') + (x.publico ? '<br><small>Público: ' + esc(x.publico) + '</small>' : '') + (x.verificadoEm ? '<br><small class="ag-conf">Data conferida em ' + A.fdata(x.verificadoEm) + (x.fonteData ? ' · <a href="' + esc(x.fonteData) + '" target="_blank" rel="noopener">fonte da data ↗</a>' : '') + '</small>' : '') + '</td><td><span class="selo-t" style="background:color-mix(in srgb,' + TIPOS[x.tipo][1] + ' 14%,transparent);color:var(--ink)">' + TIPOS[x.tipo][0].replace(/ de chamadas| de inovação/, '') + '</span></td><td><small>' + esc(x.sub) + '</small></td><td><button type="button" class="btn-txt" style="font-size:13px;white-space:nowrap" data-ics1="' + esc(x.id) + '" title="Baixa só esta data (.ics)">+ .ics</button></td></tr>';
      }).join('') + '</tbody></table>' + (l.length > 300 ? '<p class="nota-base">Mostrando 300 de ' + br(l.length) + '. Refine os filtros.</p>' : '') + '<p class="nota-base">Só entram eventos com data confirmada na fonte do organizador; cada linha mostra quando a data foi conferida e a fonte. Confirme sempre no site oficial antes de se programar.</p>' : '<p class="txt">Nenhuma data com esses filtros.</p>';
    }
    function tudo() { cal(); lista(); }
    var tq;
    box.oninput = function (e) { if (e.target.hasAttribute('data-aq')) { var v = e.target.value; clearTimeout(tq); tq = setTimeout(function () { st.q = v; lista(); }, 180); } };
    box.onchange = function (e) {
      var t = e.target;
      if (t.hasAttribute('data-per')) { st.periodo = t.value; lista(); }
      else if (t.hasAttribute('data-auf')) { st.uf = t.value; tudo(); }
      else if (t.hasAttribute('data-afo')) { st.formato = t.value; lista(); }
      else if (t.hasAttribute('data-mk')) { var id = t.getAttribute('data-mk'); if (t.checked) st.marcados[id] = 1; else delete st.marcados[id]; try { localStorage.setItem('atlas-agenda-marcados', JSON.stringify(st.marcados)); } catch (x) {} box.querySelector('[data-nm]').textContent = Object.keys(st.marcados).length; }
    };
    box.onclick = function (e) {
      var n = e.target.closest('[data-nav]'); if (n) { var v = +n.getAttribute('data-nav'); if (!v) { ano = A.HOJE.getFullYear(); mes = A.HOJE.getMonth(); } else { var d = new Date(ano, mes + v, 1); ano = d.getFullYear(); mes = d.getMonth(); } history.replaceState(null, '', '#/agenda?mes=' + ano + '-' + String(mes + 1).padStart(2, '0')); tudo(); return; }
      var tp = e.target.closest('[data-tipo]'); if (tp) { var k = tp.getAttribute('data-tipo'), i = st.tipos.indexOf(k); if (i >= 0) st.tipos.splice(i, 1); else st.tipos.push(k); tp.setAttribute('aria-pressed', String(i < 0)); tudo(); return; }
      var u1 = e.target.closest('[data-ics1]'); if (u1) { var x1 = todos.filter(function (x) { return x.id === u1.getAttribute('data-ics1'); })[0]; if (x1) ics([x1], x1.t.replace(/^Encerra: /, '')); return; }
      var b = e.target.closest('[data-ics]'); if (!b) return;
      var modo = b.getAttribute('data-ics'), l;
      if (modo === 'mes') { var p = st.periodo; st.periodo = 'mes'; l = filtrados(); st.periodo = p; ics(l, 'Atlas ' + MESES[mes] + ' ' + ano); }
      else if (modo === 'filtro') { l = filtrados(); ics(l, 'Atlas agenda filtrada'); }
      else { l = todos.filter(function (x) { return st.marcados[x.id]; }); if (!l.length) { b.textContent = 'Marque itens na lista primeiro'; setTimeout(function () { b.innerHTML = 'Baixar os marcados (<span data-nm>' + Object.keys(st.marcados).length + '</span>)'; }, 2200); return; } ics(l, 'Atlas meus itens'); }
    };
    tudo();
  };
})();
