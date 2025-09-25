


(function(){const themeToggle=document.getElementById(&#39;showSearch23&#39;);const themeIcon=themeToggle?.querySelector(&#39;i&#39;);if(themeToggle){const saved=localStorage.getItem(&#39;theme&#39;)||&#39;dark&#39;;if(saved===&#39;dark&#39;){document.body.classList.add(&#39;dark&#39;)}else{document.body.classList.add(&#39;light&#39;)}
if(themeIcon){themeIcon.className=saved===&#39;dark&#39;?&#39;far fa-sun&#39;:&#39;far fa-moon&#39;}
themeToggle.addEventListener(&#39;click&#39;,(e)=&gt;{e.preventDefault();document.body.classList.toggle(&#39;dark&#39;);document.body.classList.toggle(&#39;light&#39;);const isDark=document.body.classList.contains(&#39;dark&#39;);const newTheme=isDark?&#39;dark&#39;:&#39;light&#39;;localStorage.setItem(&#39;theme&#39;,newTheme);if(themeIcon){themeIcon.className=isDark?&#39;far fa-sun&#39;:&#39;far fa-moon&#39;}})}})();
