(function () {
  // Inject shared header
  var header = document.getElementById('site-header');
  if (header) {
    header.outerHTML =
      '<header>' +
        '<h1><a href="/">Vinayak Vikram</a></h1>' +
        '<nav>' +
          '<a href="/">Blog</a>' +
          '<a href="/about.html">About</a>' +
        '</nav>' +
      '</header>';
  }

  // Inject shared footer
  var footer = document.getElementById('site-footer');
  if (footer) {
    footer.outerHTML =
      '<footer>' +
        '&copy; 2026 Vinayak Vikram' +
      '</footer>';
  }

  // Load Prism.js on any page that has code blocks
  if (document.querySelector('pre > code')) {
    var prismCSS = document.createElement('link');
    prismCSS.rel = 'stylesheet';
    prismCSS.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
    document.head.appendChild(prismCSS);

    var prismCore = document.createElement('script');
    prismCore.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js';
    prismCore.onload = function () {
      var autoloader = document.createElement('script');
      autoloader.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js';
      document.body.appendChild(autoloader);
    };
    document.body.appendChild(prismCore);
  }

  // On the index page, fetch posts.json and render the post list
  var list = document.getElementById('post-list');
  if (!list) return;

  fetch('/posts.json')
    .then(function (r) { return r.json(); })
    .then(function (posts) {
      if (posts.length === 0) {
        list.innerHTML = '<li style="color:#6b88a8">No posts yet.</li>';
        return;
      }
      list.innerHTML = posts.map(function (p) {
        return (
          '<li>' +
            '<span class="post-date">' + p.date + '</span>' +
            '<a class="post-title" href="' + p.href + '">' + p.title + '</a>' +
            (p.synopsis ? '<p class="post-excerpt">' + p.synopsis + '</p>' : '') +
          '</li>'
        );
      }).join('');
    })
    .catch(function () {
      list.innerHTML = '<li style="color:#6b88a8">Could not load posts.</li>';
    });
})();
