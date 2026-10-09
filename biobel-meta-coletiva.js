/* Biobel — celebração coletiva da loja | v11.93
   Aciona apenas após leitura real da planilha (biobel:data-updated).
   Meta coletiva: vendas totais da loja acima de R$ 3.000 no dia.
*/
(function () {
  'use strict';
  const META = 3000;
  const KEY = 'biobel_conquistas_loja_3000_v1';
  const $ = (id) => document.getElementById(id);

  function agoraBrasilia() {
    try {
      if (typeof window.obterAgoraBrasilia === 'function') return window.obterAgoraBrasilia();
    } catch (_) {}
    return new Date();
  }
  function chaveHoje() {
    const d = agoraBrasilia();
    return String(d.getDate()).padStart(2, '0') + '.' +
      String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
  }
  function diaCurto(d) {
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0');
  }
  function dinheiro(n) {
    try { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n); }
    catch (_) { return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ','); }
  }
  function historico() {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(x) ? x : [];
    } catch (_) { return []; }
  }
  function salvarHistorico(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items.slice(-400))); } catch (_) {}
  }
  function lerTotalDeHoje() {
    let arr = [];
    try {
      arr = Array.isArray(window.daysData) ? window.daysData :
        (typeof daysData !== 'undefined' && Array.isArray(daysData) ? daysData : []);
    } catch (_) {}
    const hoje = diaCurto(agoraBrasilia());
    const dia = arr.find((x) => {
      const raw = String(x && x.dia || '').trim();
      return raw === hoje || raw === chaveHoje();
    });
    if (!dia) return null;
    const total = Number(dia.sales);
    if (Number.isFinite(total) && total >= 0) return total;
    const p2 = Number(dia.vendaP2);
    if (Number.isFinite(p2) && p2 >= 0) return p2;
    const pagamentos = ['dinheiro', 'debito', 'credito', 'pix']
      .reduce((sum, k) => sum + (Number(dia[k]) || 0), 0);
    return pagamentos > 0 ? pagamentos : null;
  }
  function css() {
    if ($('biobelMetaColetivaCss')) return;
    const s = document.createElement('style');
    s.id = 'biobelMetaColetivaCss';
    s.textContent = `
      @keyframes bioMetaEntrada{from{opacity:0;transform:translate(-50%,-12px) scale(.96)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
      @keyframes bioMetaConfete{0%{transform:translateY(-12px) rotate(0);opacity:0}15%{opacity:1}100%{transform:translateY(105vh) rotate(540deg);opacity:0}}
      #bioMetaCelebracao{position:fixed;inset:0;z-index:11000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,10,25,.72);backdrop-filter:blur(5px)}
      #bioMetaCelebracao .bio-meta-card{position:relative;overflow:hidden;width:min(560px,100%);max-height:90vh;overflow-y:auto;text-align:center;color:#fff;padding:30px 22px 24px;border:1px solid rgba(255,215,130,.65);border-radius:24px;background:radial-gradient(circle at top,#873c72 0,#3b214d 48%,#17182f 100%);box-shadow:0 24px 90px #0009;animation:bioMetaEntrada .35s ease-out}
      #bioMetaCelebracao .bio-meta-trophy{font-size:64px;line-height:1.15}
      #bioMetaCelebracao .bio-meta-title{font-size:clamp(23px,5vw,34px);font-weight:900;line-height:1.12;margin:12px 0;color:#ffe7a5}
      #bioMetaCelebracao .bio-meta-value{font-size:clamp(27px,7vw,40px);font-weight:900;color:#fff;margin:12px 0}
      #bioMetaCelebracao .bio-meta-copy{white-space:pre-line;color:#fce7f3;line-height:1.55;font-size:15px}
      #bioMetaCelebracao .bio-meta-btn{border:0;border-radius:12px;padding:12px 18px;margin-top:18px;font-weight:800;cursor:pointer;background:#f9a8d4;color:#50133c}
      .bio-meta-confete{position:fixed;top:-20px;z-index:11001;pointer-events:none;animation:bioMetaConfete 3.2s ease-in forwards}
      #bioMetaHistorico{margin:16px 0;padding:17px;border:1px solid #854d0e66;border-radius:18px;background:linear-gradient(135deg,#291d35,#18253a);color:#f8fafc}
      #bioMetaHistorico .bio-meta-stat{font-size:25px;font-weight:900;color:#f9a8d4}
      #bioMetaHistorico .bio-meta-muted{font-size:12px;color:#cbd5e1}
      @media(prefers-reduced-motion:reduce){#bioMetaCelebracao .bio-meta-card,.bio-meta-confete{animation:none!important}}
    `;
    document.head.appendChild(s);
  }
  function confetes(root) {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const colors = ['#f9a8d4', '#fde68a', '#ffffff', '#c4b5fd', '#fb7185'];
    for (let i = 0; i < 48; i++) {
      const c = document.createElement('span');
      c.className = 'bio-meta-confete';
      c.textContent = i % 3 === 0 ? '♥' : '✦';
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.color = colors[i % colors.length];
      c.style.fontSize = (12 + Math.random() * 16) + 'px';
      c.style.animationDelay = (Math.random() * 1.4) + 's';
      root.appendChild(c);
      setTimeout(() => c.remove(), 4800);
    }
  }
  function mostrarCelebracao(total, item) {
    if ($('bioMetaCelebracao')) return;
    css();
    const overlay = document.createElement('div');
    overlay.id = 'bioMetaCelebracao';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Conquista coletiva da Biobel');
    const card = document.createElement('div');
    card.className = 'bio-meta-card';
    const trofeu = document.createElement('div');
    trofeu.className = 'bio-meta-trophy';
    trofeu.textContent = '🏆';
    const title = document.createElement('div');
    title.className = 'bio-meta-title';
    title.textContent = 'A BIOBEL BRILHOU HOJE!';
    const value = document.createElement('div');
    value.className = 'bio-meta-value';
    value.textContent = dinheiro(total);
    const copy = document.createElement('div');
    copy.className = 'bio-meta-copy';
    copy.textContent = '🎉 PARABÉNS, EQUIPE BIOBEL! 💗\n\nVocês conseguiram juntas! Cada atendimento e cada venda fizeram a diferença. Essa conquista é de toda a equipe!\n\n✨ Troféu Equipe de Ouro desbloqueado!\n💌 Vocês merecem comemorar!';
    const note = document.createElement('div');
    note.className = 'bio-meta-copy';
    note.style.cssText = 'font-size:12px;opacity:.8;margin-top:10px';
    note.textContent = 'Conquista registrada em ' + item.data + '.';
    const btn = document.createElement('button');
    btn.className = 'bio-meta-btn';
    btn.type = 'button';
    btn.textContent = 'Comemorar com a equipe! 💖';
    btn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    card.append(trofeu, title, value, copy, note, btn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    confetes(overlay);
  }
  function atualizarHistoricoCard() {
    css();
    let anchor = $('bioMetaHistorico');
    if (!anchor) {
      anchor = document.createElement('section');
      anchor.id = 'bioMetaHistorico';
      anchor.setAttribute('aria-label', 'Conquistas coletivas da Biobel');
      const candidates = ['resumoDoDia', 'resumoDia', 'dashboardContent', 'main-content', 'main'];
      let target = candidates.map($).find(Boolean);
      if (!target) target = document.querySelector('main') || document.body;
      target.appendChild(anchor);
    }
    const h = historico();
    const now = agoraBrasilia();
    const mes = String(now.getMonth() + 1).padStart(2, '0') + '.' + now.getFullYear();
    const desteMes = h.filter(x => String(x.data || '').slice(3) === mes);
    const recorde = h.reduce((max, x) => Math.max(max, Number(x.total) || 0), 0);
    anchor.textContent = '';
    const eyebrow = document.createElement('div');
    eyebrow.textContent = '🌸 BIOBEL • CONQUISTAS COLETIVAS';
    eyebrow.style.cssText = 'font-size:11px;letter-spacing:.08em;color:#f9a8d4;font-weight:800';
    const heading = document.createElement('div');
    heading.textContent = '🏆 Equipe de Ouro';
    heading.style.cssText = 'font-size:18px;font-weight:900;margin:5px 0 12px';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:12px';
    const stats = [
      ['Dias extraordinários', String(desteMes.length)],
      ['Recorde diário', recorde ? dinheiro(recorde) : 'Ainda por conquistar'],
      ['Última conquista', h.length ? h[h.length - 1].data : 'A primeira está por vir!']
    ];
    stats.forEach(([label, val]) => {
      const box = document.createElement('div');
      const l = document.createElement('div');
      l.className = 'bio-meta-muted'; l.textContent = label;
      const v = document.createElement('div');
      v.className = 'bio-meta-stat'; v.style.fontSize = val.length > 17 ? '14px' : '22px'; v.textContent = val;
      box.append(l, v); grid.appendChild(box);
    });
    anchor.append(eyebrow, heading, grid);
  }
  let processando = false;
  function verificar() {
    if (processando) return;
    processando = true;
    try {
      const total = lerTotalDeHoje();
      if (total === null || !Number.isFinite(total)) return;
      const data = chaveHoje();
      const h = historico();
      const jaExiste = h.some(x => x.data === data);
      if (total > META && !jaExiste) {
        const item = { data, total: Math.round(total * 100) / 100, criadoEm: new Date().toISOString() };
        h.push(item);
        salvarHistorico(h);
        atualizarHistoricoCard();
        mostrarCelebracao(total, item);
      } else {
        atualizarHistoricoCard();
      }
    } catch (e) {
      console.warn('Celebração coletiva Biobel:', e);
    } finally {
      processando = false;
    }
  }
  window.addEventListener('biobel:data-updated', () => setTimeout(verificar, 900));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', atualizarHistoricoCard);
  else atualizarHistoricoCard();
})();