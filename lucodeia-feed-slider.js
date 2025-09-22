(function(){
  // lucodeia-feed-slider.js
  // External JS to be used with the HTML/CSS slider container.
  // Usage:
  // 1) Include this file after the slider HTML in your template or widget:
  //    <script src="PATH_TO/lucodeia-feed-slider.js"></script>
  // 2) Ensure the HTML container with id="lucodeiaFeedSlider" exists and CSS is loaded.
  // 3) The script will fetch the latest 5 posts via JSONP and build the slides.
  var slider = document.getElementById('lucodeiaFeedSlider');
  if(!slider) return;

  var track = slider.querySelector('.track');
  var prevBtn = slider.querySelector('.prev');
  var nextBtn = slider.querySelector('.next');
  var dotsWrap = slider.querySelector('.dots');
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

  // Insert no-posts fallback
  function showNoPosts(){
    track.innerHTML = '';
    dotsWrap.innerHTML = '';
    var box = document.createElement('div'); box.className = 'no-posts'; box.textContent = 'لا توجد تدوينات للعرض';
    track.appendChild(box);
  }

  // Build dots
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
    // ensure transition apply
    requestAnimationFrame(function(){
      track.style.transition = 'transform ' + (getComputedStyle(document.documentElement).getPropertyValue('--transition').trim() || '600ms');
      track.style.transform = 'translateX(' + (-current * 100) + '%)';
    });
    setTimeout(function(){ animating = false; updateDots(); }, 700);
  }

  // Controls
  if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(current-1); resetAutoplay(); });
  if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(current+1); resetAutoplay(); });

  // Autoplay
  function startAutoplay(){ if(!autoplay) return; stopAutoplay(); autoplayTimer = setInterval(function(){ goTo(current+1); }, interval); }
  function stopAutoplay(){ if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer = null; } }
  function resetAutoplay(){ stopAutoplay(); startAutoplay(); }

  if(slider){
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);

    // Keyboard
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
  }

  // Fetch feed via JSONP and render last 5 posts
  window[cbName] = function(json){
    try{
      var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
      track.innerHTML = '';
      dotsWrap.innerHTML = '';
      if(!entries.length){ showNoPosts(); return; }

      // Build slides from entries (limit to 5)
      var max = Math.min(5, entries.length);
      for(var i=0;i<max;i++){
        var e = entries[i];
        // title
        var title = (e.title && e.title.$t) ? e.title.$t : 'بدون عنوان';
        // link
        var postUrl = '#';
        if(e.link && e.link.length){
          for(var j=0;j<e.link.length;j++){ if(e.link[j].rel === 'alternate'){ postUrl = e.link[j].href; break; } }
        }
        // image: media$thumbnail preferred, else find first <img> in content
        var img = '';
        if(e.media$thumbnail && e.media$thumbnail.url) img = e.media$thumbnail.url.replace(/\/s72(-c)?\//,'/s1600/');
        else if(e.content && e.content.$t){
          var m = e.content.$t.match(/<img[^>]+src=["']([^"']+)["']/i);
          if(m && m[1]) img = m[1];
        }
        // subtitle: use published date (localized)
        var subtitle = '';
        if(e.published && e.published.$t){
          try{
            var d = new Date(e.published.$t);
            subtitle = d.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'});
          }catch(err){}
        }

        var slide = makeSlide(title, postUrl, img, subtitle);
        track.appendChild(slide);
      }

      // finalize
      total = track.children.length;
      if(total === 0){ showNoPosts(); return; }

      // make slides focusable for accessibility
      Array.prototype.forEach.call(track.children, function(s){ s.setAttribute('tabindex','-1'); });

      // build dots & set initial position
      buildDots(total);
      track.style.transform = 'translateX(0%)';
      current = 0;
      updateDots();
      startAutoplay();

    }catch(e){ console.error('Feed render error', e); showNoPosts(); }
    // cleanup JSONP callback & script
    try{
      delete window[cbName];
      if(scriptTag && scriptTag.parentNode) scriptTag.parentNode.removeChild(scriptTag);
    }catch(e){}
  };

  // Insert JSONP script
  var feedPath = '/feeds/posts/default?alt=json-in-script&max-results=5&callback=' + cbName;
  // Use absolute URL (helps if template loaded in different context)
  var scriptTag = document.createElement('script');
  scriptTag.src = window.location.protocol + '//' + window.location.host + feedPath;
  scriptTag.async = true;
  scriptTag.onerror = function(){ console.error('Failed to load feed JSONP'); showNoPosts(); };
  (document.head||document.body||document.documentElement).appendChild(scriptTag);

})();