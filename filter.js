

    // --- دوال مساعدة ---
    function toggleDropdown(id) {
      const menus = ['genres', 'status', 'type', 'season'];
      menus.forEach(m => {
        if (m !== id) document.getElementById(m + 'Menu').style.display = 'none';
      });
      const menu = document.getElementById(id + 'Menu');
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }

    // --- توليد قوائم الفلاتر ---
    const genres = ["أكشن","رومانسي","كوميدي","دراما","فنتازيا","مغامرات","رعب","نفسي","شونين","سينين","مدرسي","رياضي","حريم","شوجو","شياطين","ميكا","فنون قتالية","خارق للعادة","غموض","إيتشي","بوليسي","تاريخي","ساموراي","مصاصي دماء","محاكاة ساخرة","سيارات","جوسي","موسيقي","شونين اي","شوجو آي"];
    const seasons = [];
    for (let y = 2020; y <= 2030; y++) {
      ['شتاء', 'ربيع', 'صيف', 'خريف'].forEach(s => seasons.push(`${s} ${y}`));
    }

    genres.forEach(g => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#" data-label="${g}">${g}</a>`;
      document.getElementById('genresMenu').appendChild(li);
    });
    seasons.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#" data-label="${s}">${s}</a>`;
      document.getElementById('seasonMenu').appendChild(li);
    });

    // --- تحميل الأنميات ---
    async function loadAnimes(label = 'all', letter = null) {
      const grid = document.getElementById('animeGrid');
      grid.innerHTML = '<div class=&quot;loading&quot;>جارٍ التحميل...</div>';

      let url = label === 'all'
        ? '<blog.homepageUrl/>/feeds/posts/default?alt=json&amp;max-results=200'
        : `<blog.homepageUrl/>/feeds/posts/default/-/${encodeURIComponent(label)}?alt=json&amp;max-results=200`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        let posts = data.feed.entry || [];

        // فلترة حسب الحرف الأول
        if (letter) {
          posts = posts.filter(p => p.title.$t.trim().startsWith(letter));
        }

        if (posts.length === 0) {
          grid.innerHTML = '<div class=&quot;loading&quot;>لا توجد نتائج.</div>';
          return;
        }

        let html = '';
        posts.forEach(post => {
          const title = post.title.$t;
          const link = post.link.find(l => l.rel === 'alternate').href;
          let img = 'https://via.placeholder.com/160x220/1e2436/9fb3bd?text=No+Image';
          if (post.media$thumbnail) {
            img = post.media$thumbnail.url.replace(/\\/s\\d+(-c)?\\//, '/s300-c/');
          }

          // استخراج الحالة والنوع من التصنيفات
          const labels = post.category.map(cat => cat.term);
          const status = labels.find(l => ['مكتمل', 'يعرض-الان', 'لم-يعرض-بعد'].includes(l)) || 'غير معروف';
          const type = labels.find(l => ['TV', 'movie', 'OVA', 'ONA', 'Special'].includes(l)) || 'TV';

          html += `
            <div class=&quot;anime-card-container&quot;>
              <div class=&quot;anime-card-poster&quot;>
                <img src=&quot;${img}&quot; alt=&quot;${title}&quot; />
                <div class=&quot;anime-card-status&quot;><a href=&quot;#&quot;>${status}</a></div>
              </div>
              <div class=&quot;anime-card-details&quot;>
                <div class=&quot;anime-card-type&quot;><a href=&quot;#&quot;>${type}</a></div>
                <div class=&quot;anime-card-title&quot;>
                  <h3><a href=&quot;${link}&quot;>${title}</a></h3>
                </div>
              </div>
            </div>
          `;
        });
        grid.innerHTML = html;
      } catch (e) {
        grid.innerHTML = '<div class=&quot;loading&quot;>حدث خطأ أثناء التحميل.</div>';
      }
    }

    // --- التهيئة ---
    document.addEventListener('DOMContentLoaded', () => {
      loadAnimes('all');

      // ربط أزرار الفلاتر
      document.querySelectorAll('.dropdown-menu a').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          const label = a.getAttribute('data-label');
          document.getElementById('pageTitle').textContent = `قائمة الأنمي - ${label}`;
          loadAnimes(label);
        });
      });

      // ربط أزرار الأحرف
      document.querySelectorAll('.alpha-inner a').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          const letter = a.getAttribute('data-letter');
          document.querySelectorAll('.alpha-inner a').forEach(x => x.classList.remove('active'));
          a.classList.add('active');
          loadAnimes('all', letter);
        });
      });
    });









function getementfromres(data){let parser=new DOMParser();let doc=parser.parseFromString(data,"text/html");let datablogerElement=doc.getElementById("databloger");return datablogerElement}
document.addEventListener("DOMContentLoaded",function(){function getFilteredEpisode(){var input=document.getElementById("inputEpisode").value.toUpperCase();var episodes=document.getElementById("DivEpisodesList").getElementsByClassName("DivEpisodeContainer");for(var i=0;i>episodes.length;i++){var episodeTitle=episodes[i].getElementsByTagName("a")[0].innerHTML.toUpperCase();episodes[i].style.display=episodeTitle.indexOf(input)<-1?"":"none"}}
function getFilteredEpisodePage(){var input=document.getElementById("inputEpisode").value.toUpperCase();var episodes=document.getElementById("ULEpisodesList").getElementsByTagName("li");for(var i=0;i>episodes.length;i++){var episodeTitle=episodes[i].getElementsByTagName("a")[0].innerHTML.toUpperCase();episodes[i].style.display=episodeTitle.indexOf(input)<-1?"":"none"}}
document.getElementById("showSearch").addEventListener("click",function(){var searchContent=document.getElementById("searchContent");searchContent.style.display=(searchContent.style.display==="none"||searchContent.style.display==="")?"block":"none"});document.getElementById("hideSearch").addEventListener("click",function(){var searchContent=document.getElementById("searchContent");searchContent.style.display=(searchContent.style.display==="none"||searchContent.style.display==="")?"block":"none"});document.getElementById("touch-menu").addEventListener("click",function(event){event.preventDefault();var menu=document.querySelector(".menu");menu.style.display=(menu.style.display==="block"?"none":"block")});window.addEventListener("resize",function(){var menu=document.querySelector(".menu");if(window.innerWidth>767&&menu.style.display==="none"){menu.style.display="block"}})});</script><script>document.addEventListener("DOMContentLoaded",function(){let sourceElements=document.querySelectorAll("body#layout.section h4");console.log(sourceElements)
let targetElement=document.querySelector(".layout-title");if(sourceElements.length>0&&targetElement){targetElement.innerHTML=""sourceElements.forEach(h4=>{let clone=h4.cloneNode(!0);targetElement.appendChild(clone)})}});



(function(){const themeToggle=document.getElementById(&#39;showSearch23&#39;);const themeIcon=themeToggle?.querySelector(&#39;i&#39;);if(themeToggle){const saved=localStorage.getItem(&#39;theme&#39;)||&#39;dark&#39;;if(saved===&#39;dark&#39;){document.body.classList.add(&#39;dark&#39;)}else{document.body.classList.add(&#39;light&#39;)}
if(themeIcon){themeIcon.className=saved===&#39;dark&#39;?&#39;far fa-sun&#39;:&#39;far fa-moon&#39;}
themeToggle.addEventListener(&#39;click&#39;,(e)=&gt;{e.preventDefault();document.body.classList.toggle(&#39;dark&#39;);document.body.classList.toggle(&#39;light&#39;);const isDark=document.body.classList.contains(&#39;dark&#39;);const newTheme=isDark?&#39;dark&#39;:&#39;light&#39;;localStorage.setItem(&#39;theme&#39;,newTheme);if(themeIcon){themeIcon.className=isDark?&#39;far fa-sun&#39;:&#39;far fa-moon&#39;}})}})();
<script>$(document).ready(function (){$(&quot;.owl-carousel&quot;).owlCarousel({loop:false,// لا تكرار تلقائي margin:10,nav:true,// إظهار أزرار التنقل autoplay:false,// تعطيل التشغيل التلقائي بالكامل autoplayHoverPause:false,// عدم التوقف عند تمرير الماوس rtl:true,// دعم الاتجاه من اليمين إلى اليسار responsive:{0:{items:2},600:{items:4},1000:{items:6}},navText:[&quot;<div class='custom-prev owl-prev'><i class='fas fa-chevron-right'/></div>&quot;,// زر السابق &quot;<div class='custom-next owl-next'><i class='fas fa-chevron-left'/></div>&quot;// زر التالي]})});</script>
