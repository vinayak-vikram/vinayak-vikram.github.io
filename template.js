(function () {
  // === Shared header ===
  var header = document.getElementById('site-header');
  if (header) {
    header.outerHTML =
      '<header>' +
        '<h1><a href="/">Vinayak Vikram</a></h1>' +
        '<nav>' +
          '<a href="/">Blog</a>' +
          '<a href="/notes.html">Notes</a>' +
          '<a href="/about.html">About</a>' +
        '</nav>' +
      '</header>';
  }

  // === Shared footer ===
  var footer = document.getElementById('site-footer');
  if (footer) {
    footer.outerHTML =
      '<footer>' +
        '&copy; 2026 Vinayak Vikram' +
      '</footer>';
  }

  // === Prism.js — lazy, deduped loader ===
  var prismState = 'idle'; // idle | loading | ready
  var prismQueue = [];

  function withPrism(fn) {
    if (prismState === 'ready') { fn(); return; }
    prismQueue.push(fn);
    if (prismState === 'loading') return;
    prismState = 'loading';

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
    document.head.appendChild(link);

    var core = document.createElement('script');
    core.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js';
    core.setAttribute('data-manual', '');
    core.onload = function () {
      var al = document.createElement('script');
      al.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js';
      al.onload = function () {
        prismState = 'ready';
        prismQueue.forEach(function (cb) { cb(); });
        prismQueue = [];
      };
      document.body.appendChild(al);
    };
    document.body.appendChild(core);
  }

  function highlightEl(el) {
    withPrism(function () { Prism.highlightElement(el); });
  }

  // Highlight any static code blocks already in the post
  document.querySelectorAll('pre > code').forEach(highlightEl);

  // === <file> tag — collapsible code blocks ===
  var extLang = {
    py: 'python', js: 'javascript', ts: 'typescript',
    cpp: 'cpp', cc: 'cpp', cxx: 'cpp', c: 'c', h: 'cpp', hpp: 'cpp',
    rs: 'rust', go: 'go', java: 'java', rb: 'ruby',
    yaml: 'yaml', yml: 'yaml', repos: 'yaml',
    json: 'json', xml: 'xml', md: 'markdown',
    sh: 'bash', bash: 'bash', cmake: 'cmake',
  };

  document.querySelectorAll('file').forEach(function (tag) {
    var path = tag.textContent.trim();
    var filename = path.split('/').pop();
    var ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
    var lang = extLang[ext] || '';

    var details = document.createElement('details');
    details.className = 'file-block';

    var summary = document.createElement('summary');
    summary.textContent = filename;
    details.appendChild(summary);

    var pre = document.createElement('pre');
    var code = document.createElement('code');
    if (lang) code.className = 'language-' + lang;
    pre.appendChild(code);
    details.appendChild(pre);

    tag.replaceWith(details);

    fetch(path)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (text) {
        code.textContent = text;
        highlightEl(code);
      })
      .catch(function () {
        code.textContent = '(could not load ' + path + ')';
        code.style.color = '#6b88a8';
      });
  });

  // === <github> tag — Aesthetic repo cards ===
  document.querySelectorAll('github').forEach(function (tag) {
    var repoPath = tag.textContent.trim(); // e.g., "vinayak-vikram/vterm"
    
    var card = document.createElement('a');
    card.className = 'github-card';
    card.href = 'https://github.com/' + repoPath;
    card.target = '_blank';
    card.innerHTML = '<div class="gh-loading">Loading repo ' + repoPath + '...</div>';

    tag.replaceWith(card);

    fetch('https://api.github.com/repos/' + repoPath)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        card.innerHTML = 
          '<div class="gh-header">' +
            '<span class="gh-title">' + data.full_name + '</span>' +
            '<span class="gh-stars">★ ' + data.stargazers_count + '</span>' +
          '</div>' +
          '<p class="gh-description">' + (data.description || 'No description provided.') + '</p>' +
          '<div class="gh-footer">' +
            '<span class="gh-lang">' + (data.language || 'Plain') + '</span>' +
            '<span class="gh-link">View on GitHub ↗</span>' +
          '</div>';
      })
      .catch(function () {
        card.innerHTML = '<div class="gh-error">GitHub Repo: ' + repoPath + '</div>';
      });
  });

  // === Post page — inject date from posts.json ===
  var dateEl = document.querySelector('.post-header .post-date');
  if (dateEl) {
    fetch('/posts.json')
      .then(function (r) { return r.json(); })
      .then(function (posts) {
        var match = posts.find(function (p) { return p.href === location.pathname; });
        if (match && match.date) dateEl.textContent = match.date;
      })
      .catch(function () {});
  }

  // === Blog index — auto-render post list ===
  var list = document.getElementById('post-list');
  var notesList = document.getElementById('notes-list');
  if (!list && !notesList) return;

  if (list) {
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
  }

  if (!notesList) return;

  fetch('/notes.json')
    .then(function (r) { return r.json(); })
    .then(function (notes) {
      if (notes.length === 0) {
        notesList.innerHTML = '<li style="color:#6b88a8">No notes yet.</li>';
        return;
      }
      notesList.innerHTML = notes.map(function (n) {
        return (
          '<li>' +
            (n.date ? '<span class="note-date">' + n.date + '</span>' : '') +
            '<a class="note-title" href="' + n.href + '">' + n.name + '</a>' +
          '</li>'
        );
      }).join('');
    })
    .catch(function () {
      notesList.innerHTML = '<li style="color:#6b88a8">Could not load notes.</li>';
    });
})();
