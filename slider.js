(function(){
  var wrap = document.getElementById('lucodeia-fullcarousel');
  if(!wrap) return;
  var maxItems = parseInt(wrap.getAttribute('data-max')||'5',10) || 5;
  var feedPath = '/feeds/posts/default?alt=json-in-script&callback=__lucodeia_cb&max-results=' + maxItems;

  function injectScript(url){ var s = document.createElement('script'); s.src = window.location.protocol + '//' + window.location.host + url; s.async = true; (document.head||document.body||document.documentElement).appendChild(s); }

  window.__lucodeia_cb = function(json){
    try{
      var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
      var stage = wrap.querySelector('.stage'); var dots = wrap.querySelector('.dots');
      stage.innerHTML = ''; dots.innerHTML = '';
      if(!entries.length){ stage.innerHTML = '<div class="item"><div style="padding:20px;color:#fff">لا توجد تدوينات</div></div>'; return; }

      entries.forEach(function(entry, idx){
        var title = entry.title.$t || 'بدون عنوان';
        var postUrl = (entry.link||[]).find(l=>l.rel==='alternate')?.href || '#';
        var img = (entry.media$thumbnail && entry.media$thumbnail.url) ? entry.media$thumbnail.url.replace(/\/s72(-c)?\//,'/s1600/') : (entry.content && (entry.content.$t.match(/<img[^>]+src=["']([^"']+)["']/i)||[])[1] || '');
        if(!img){ img = 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="28">No image</text></svg>'); }
        var subtitle = '';
        var mAr = title.match(/(الحلقة\\s*\\d{1,4})/i) || (entry.content && entry.content.$t.match(/(الحلقة\\s*\\d{1,4})/i));
        var mEn = title.match(/(Episode\\s*\\d{1,4})/i) || (entry.content && entry.content.$t.match(/(Episode\\s*\\d{1,4})/i));
        if(mAr) subtitle = mAr[1]; else if(mEn) subtitle = mEn[1];

        var item = document.createElement('div'); item.className = 'item';
        var a = document.createElement('a'); a.className='slide-link'; a.href=postUrl; a.target='_blank'; a.rel='noopener'; a.style.backgroundImage='url("'+img+'")';
        var overlay = document.createElement('div'); overlay.className='overlay';
        var meta = document.createElement('div'); meta.className='meta';
        var titleBox = document.createElement('div'); titleBox.className='title-box';
        var h1 = document.createElement('h1'); h1.innerText = title; titleBox.appendChild(h1); meta.appendChild(titleBox);
        if(subtitle){ var sub = document.createElement('div'); sub.className='subtitle'; sub.innerText=subtitle; meta.appendChild(sub); }
        item.appendChild(a); item.appendChild(overlay); item.appendChild(meta); stage.appendChild(item);
        var dot = document.createElement('div'); dot.className = 'dot' + (idx===0? ' active':''); dot.dataset.index = idx; dots.appendChild(dot);
      });

      // Slider logic (percentage translate)
      var items = stage.children; var total = items.length; var current = 0;
      function goTo(i){ if(i<0) i=total-1; if(i>=total) i=0; current=i; stage.style.transform='translateX('+(-current*100)+'%)'; var allDots = wrap.querySelectorAll('.dot'); allDots.forEach(d=>d.classList.remove('active')); if(allDots[current]) allDots[current].classList.add('active'); }

      dots.addEventListener('click', function(e){ if(e.target && e.target.classList.contains('dot')){ goTo(parseInt(e.target.dataset.index,10)); resetAutoplay(); } });
      var autoplayInterval = 4200; var autoplayTimer = setInterval(function(){ goTo(current+1); }, autoplayInterval);
      function resetAutoplay(){ clearInterval(autoplayTimer); autoplayTimer = setInterval(function(){ goTo(current+1); }, autoplayInterval); }
      wrap.addEventListener('mouseenter', function(){ clearInterval(autoplayTimer); });
      wrap.addEventListener('mouseleave', function(){ resetAutoplay(); });
      setTimeout(function(){ goTo(0); }, 120);
      window.addEventListener('resize', function(){ setTimeout(function(){ goTo(current); }, 80); });

    }catch(err){ console.error('Slider render error',err); }
  };

  injectScript(feedPath);
})();