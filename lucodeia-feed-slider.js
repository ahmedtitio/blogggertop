(function(){
  // lucodeia-feed-slider-fixed.js
  // Improved: waits for DOM ready, gives clearer console errors, and tolerates missing elements.
  function init(){
    try{
      var slider = document.getElementById('lucodeiaFeedSlider');
      if(!slider){
        console.warn('Lucodeia slider: container element #lucodeiaFeedSlider not found. Make sure the slider HTML exists and that this script runs after the HTML, or wrap initialization in DOMContentLoaded.');
        return;
      }

      var track = slider.querySelector('.track');
      var prevBtn = slider.querySelector('.prev');
      var nextBtn = slider.querySelector('.next');
      var dotsWrap = slider.querySelector('.dots');
      if(!track || !dotsWrap){
        console.error('Lucodeia slider: required child elements .track or .dots are missing. Ensure you used the provided HTML structure.');
        return;
      }

      var autoplay = slider.getAttribute('data-autoplay') === 'true';
      var interval = parseInt(slider.getAttribute('data-interval')||'4200', 10);

      var current = 0;
      var total = 0;
      var animating = false;
      var autoplayTimer = null;

      // JSONP callback name (unique)
      var cbName = '__lucodeia_feed_cb_' + Math.floor(Math.random()*1000000);

      // Helper: create slide element
      function makeSlide(title, url, img, subtitle){
        var item = document.createElement('div');
        item.className = 'l-slide';
        if(img) item.style.backgroundImage = 'url("'+img+'")';
        else item.style.backgroundColor = '#222';
        var overlay = document.createElement('div'); overlay.className = 'overlay'; overlay.setAttribute('aria-hidden','true');
        var a = document.createElement('a'); a.className='slide-link'; a.href = url || '#'; a.target = '_blank'; a.rel = 'noopener';
        var meta = document.createElement('div'); meta.className = 'meta';
        var h = document.createElement('h3'); h.className = 'title'; h.textContent = title || 'بدون عنوان';
        meta.appendChild(h);
        if(subtitle){
          var s = document.createElement('div'); s.className='subtitle'; s.textContent = subtitle;
          meta.appendChild(s);
        }
        item.appendChild(overlay);
        item.appendChild(a);
        item.appendChild(meta);
        return item;
      }

      function showNoPosts(){
        track.innerHTML = '';
        dotsWrap.innerHTML = '';
        var box = document.createElement('div'); box.className = 'no-posts'; box.textContent = 'لا توجد تدوينات للعرض';
        track.appendChild(box);
      }

      function buildDots(n){
        dotsWrap.innerHTML = '';
        for(var i=0;i<n;i++){
          var d = document.createElement('button');
          d.className = 'dot' + (i===0? ' active':'');
          d.type='button';
          d.setAttribute('aria-label', 'انتقال إلى الشريحة ' + (i+1));
          d.dataset.index = i;
          (function(idx){ d.addEventListener('click', function(){ goTo(idx); resetAutoplay(); }); })(i);
          dotsWrap.appendChild(d);
        }
      }

      function updateDots(){
        var all = dotsWrap.children;
        for(var i=0;i<all.length;i++){ all[i].classList.toggle('active', i===current); }
      }

      function goTo(index){
        if(animating) return;
        index = ((index%total)+total)%total;
        current = index;
        animating = true;
        requestAnimationFrame(function(){
          track.style.transition = 'transform ' + (getComputedStyle(document.documentElement).getPropertyValue('--transition').trim() || '600ms');
          track.style.transform = 'translateX(' + (-current * 100) + '%)';
        });
        setTimeout(function(){ animating = false; updateDots(); }, 700);
      }

      if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(current-1); resetAutoplay(); });
      if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(current+1); resetAutoplay(); });

      function startAutoplay(){ if(!autoplay) return; stopAutoplay(); autoplayTimer = setInterval(function(){ goTo(current+1); }, interval); }
      function stopAutoplay(){ if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer = null; } }
      function resetAutoplay(){ stopAutoplay(); startAutoplay(); }

      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);
      slider.addEventListener('focusin', stopAutoplay);
      slider.addEventListener('focusout', startAutoplay);

      slider.addEventListener('keydown', function(e){
        if(e.key === 'ArrowLeft') { e.preventDefault(); goTo(current-1); resetAutoplay(); }
        if(e.key === 'ArrowRight'){ e.preventDefault(); goTo(current+1); resetAutoplay(); }
      });

      // Swipe (pointer)
      var pointer = {down:false, startX:0, currentX:0, dx:0};
      slider.addEventListener('pointerdown', function(e){
        pointer.down = true; pointer.startX = e.clientX; pointer.currentX = e.clientX;
        try{ slider.setPointerCapture && slider.setPointerCapture(e.pointerId); }catch(err){}
        track.style.transition = 'none';
      });
      slider.addEventListener('pointermove', function(e){
        if(!pointer.down) return;
        pointer.currentX = e.clientX; pointer.dx = pointer.currentX - pointer.startX;
        track.style.transform = 'translateX(' + ((-current * 100) + (pointer.dx / slider.clientWidth * 100)) + '%)';
      });
      slider.addEventListener('pointerup', function(e){
        if(!pointer.down) return; pointer.down=false;
        var threshold = Math.min(60, slider.clientWidth * 0.14);
        if(pointer.dx > threshold){ goTo(current-1); }
        else if(pointer.dx < -threshold){ goTo(current+1); }
        else { goTo(current); }
        pointer.dx = 0;
        resetAutoplay();
      });
      slider.addEventListener('pointercancel', function(){ if(pointer.down){ pointer.down=false; goTo(current); resetAutoplay(); } });

      // JSONP callback
      window[cbName] = function(json){
        try{
          var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
          track.innerHTML = '';
          dotsWrap.innerHTML = '';
          if(!entries.length){ showNoPosts(); return; }

          var max = Math.min(5, entries.length);
          for(var i=0;i<max;i++){
            var e = entries[i];
            var title = (e.title && e.title.$t) ? e.title.$t : 'بدون عنوان';
            var postUrl = '#';
            if(e.link && e.link.length){
              for(var j=0;j<e.link.length;j++){ if(e.link[j].rel === 'alternate'){ postUrl = e.link[j].href; break; } }
            }
            var img = '';
            if(e.media$thumbnail && e.media$thumbnail.url) img = e.media$thumbnail.url.replace(/\/s72(-c)?\//,'/s1600/');
            else if(e.content && e.content.$t){
              var m = e.content.$t.match(/<img[^>]+src=["']([^"']+)["']/i);
              if(m && m[1]) img = m[1];
            }
            var subtitle = '';
            if(e.published && e.published.$t){
              try{ var d = new Date(e.published.$t); subtitle = d.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'}); }catch(err){}
            }

            var slide = makeSlide(title, postUrl, img, subtitle);
            track.appendChild(slide);
          }

          total = track.children.length;
          if(total === 0){ showNoPosts(); return; }

          Array.prototype.forEach.call(track.children, function(s){ s.setAttribute('tabindex','-1'); });
          buildDots(total);
          track.style.transform = 'translateX(0%)';
          current = 0;
          updateDots();
          startAutoplay();

        }catch(e){ console.error('Feed render error', e); showNoPosts(); }
        try{ delete window[cbName]; if(scriptTag && scriptTag.parentNode) scriptTag.parentNode.removeChild(scriptTag); }catch(e){}
      };

      // Insert JSONP script
      var feedPath = '/feeds/posts/default?alt=json-in-script&max-results=5&callback=' + cbName;
      var scriptTag = document.createElement('script');
      scriptTag.src = window.location.protocol + '//' + window.location.host + feedPath;
      scriptTag.async = true;
      scriptTag.onerror = function(){ console.error('Failed to load feed JSONP — check the URL and that you are on the same domain.'); showNoPosts(); };
      (document.head||document.body||document.documentElement).appendChild(scriptTag);

    }catch(err){ console.error('Lucodeia slider initialization error', err); }
  }

  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();