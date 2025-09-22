// theme-controls.js: manages saving/applying theme and colors
document.addEventListener('DOMContentLoaded', function(){
  (function(){
    try{
      var root = document.documentElement;
      var saved = localStorage.getItem('lucodeia_theme');
      var savedColors = localStorage.getItem('lucodeia_colors');
      if(saved){ root.setAttribute('data-theme', saved); }
      if(savedColors){
        try{ var colors = JSON.parse(savedColors); if(colors.accent) root.style.setProperty('--accent', colors.accent); if(colors.text) root.style.setProperty('--text', colors.text); }
        catch(e){}
      }

      // init control UI values
      var btn = document.getElementById('themeControlBtn');
      var panel = document.getElementById('themePanel');
      var select = document.getElementById('themeSelect');
      var accent = document.getElementById('accentColor');
      var textc = document.getElementById('textColor');
      // set UI default states based on current values
      if(select && saved) select.value = saved;
      if(accent && getComputedStyle(root).getPropertyValue('--accent')) accent.value = rgbToHex(getComputedStyle(root).getPropertyValue('--accent'));
      if(textc && getComputedStyle(root).getPropertyValue('--text')) textc.value = rgbToHex(getComputedStyle(root).getPropertyValue('--text'));

      // toggle panel
      if(btn && panel){ btn.addEventListener('click', function(){ panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; }); }

      // save button
      var save = document.getElementById('saveTheme');
      var reset = document.getElementById('resetTheme');
      if(save){ save.addEventListener('click', function(){ var theme = select.value; var acol = accent.value; var tcol = textc.value; root.setAttribute('data-theme', theme); root.style.setProperty('--accent', acol); root.style.setProperty('--text', tcol); localStorage.setItem('lucodeia_theme', theme); localStorage.setItem('lucodeia_colors', JSON.stringify({accent:acol, text:tcol})); alert('تم حفظ المظهر وسيُطبّق عبر الموقع.'); }); }
      if(reset){ reset.addEventListener('click', function(){ localStorage.removeItem('lucodeia_theme'); localStorage.removeItem('lucodeia_colors'); root.removeAttribute('data-theme'); root.style.removeProperty('--accent'); root.style.removeProperty('--text'); if(select) select.value = 'dark'; alert('تمت إعادة الافتراضيات.'); }); }

      // helper: convert rgb/rgba to hex if needed
      function rgbToHex(str){ if(!str) return '#000000'; str = str.trim(); try{ if(str.indexOf('#')===0) return str; if(str.indexOf('rgb')===-1) return str; var nums = str.match(/\d+/g).map(Number); return '#'+nums.slice(0,3).map(function(n){ return ('0'+n.toString(16)).slice(-2); }).join(''); }catch(e){ return '#000000'; }}

    }catch(e){ console.error('Theme init error',e); }
  })();
});
