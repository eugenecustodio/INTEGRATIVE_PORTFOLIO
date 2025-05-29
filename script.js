document.addEventListener('DOMContentLoaded', () => {
  let zIndexCounter = 1;
  let tabs = [];
  let currentTabId = null;
  let animationRunning = false;
  let walkInterval, spawnTimer;




    setTimeout(function () {
      const loadingScreen = document.getElementById('ubuntu-loading');
      loadingScreen.style.opacity = '0';
      loadingScreen.style.visibility = 'hidden';

      // Remove loading class to show content
      document.body.classList.remove('loading');

      // Start the clock and other functionality
      startClock();
    }, 3000);

  // Clock function
  function startClock() {
    function updateClock() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      document.getElementById('live-clock').textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();
  }

  // Tab management
  function newTab(url = 'about:blank') {
    const tabId = Date.now().toString();
    const tabBar = document.getElementById('tab-bar');
    const tabContent = document.getElementById('tab-content');

    // Create tab
    const tab = document.createElement('div');
    tab.className = `tab${tabs.length === 0 ? ' active' : ''}`;
    tab.innerHTML = `
      <span>${url === 'about:blank' ? 'New Tab' : getFileName(url)}</span>
      <span class="tab-close" onclick="closeTab('${tabId}')">&times;</span>
    `;
    tab.dataset.tabId = tabId;
    tab.addEventListener('click', () => switchTab(tabId));

    // Create content
    const content = document.createElement('div');
    content.className = 'tab-content';
    content.style.display = 'none';

    // Handle different file types
    if (url.endsWith('.html')) {
      content.innerHTML = `<iframe src="${url}" class="firefox-frame"></iframe>`;
    } else if (url.endsWith('.pdf')) {
      content.innerHTML = `
        <object data="${url}" type="application/pdf" class="firefox-frame">
          <p>Unable to display PDF file. <a href="${url}">Download instead</a></p>
        </object>
      `;
    } else {
      content.innerHTML = `<div class="unsupported-content">
        <i class="fas fa-exclamation-triangle"></i>
        <p>File type not supported in this view</p>
        <p>${getFileName(url)}</p>
      </div>`;
    }

    content.dataset.tabId = tabId;

    tabs.push({ id: tabId, url, tabElement: tab, contentElement: content });
    tabBar.appendChild(tab);
    tabContent.appendChild(content);

    if (tabs.length === 1) {
      switchTab(tabId);
    }
  }

  // Tab switching
  function switchTab(tabId) {
    currentTabId = tabId;
    tabs.forEach(tab => {
      const isActive = tab.id === tabId;
      tab.tabElement.classList.toggle('active', isActive);
      tab.contentElement.style.display = isActive ? 'block' : 'none';
    });

    const activeTab = tabs.find(t => t.id === tabId);
    if (activeTab) {
      updateUrlBar(activeTab.url);
    }
  }

  function closeTab(tabId) {
    const index = tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    const tab = tabs[index];
    tab.tabElement.remove();
    tab.contentElement.remove();
    tabs.splice(index, 1);

    if (tabs.length > 0) {
      const newTabId = tabs[Math.max(index - 1, 0)].id;
      switchTab(newTabId);
    } else {
      document.querySelector('.firefox-window').style.display = 'none';
    }
  }

  function updateUrlBar(url) {
    document.getElementById('url-bar').value = url;
  }

  function getFileName(url) {
    return url.split('/').pop();
  }

  // Navigation functions
  function navBack() {
    console.log('Back button clicked');
  }

  function navForward() {
    console.log('Forward button clicked');
  }

  function reloadPage() {
    const currentTab = tabs.find(t => t.id === currentTabId);
    if (currentTab) {
      const iframe = currentTab.contentElement.querySelector('iframe');
      if (iframe) {
        iframe.contentWindow.location.reload();
      }
    }
  }

  // Window management - FIXED
  window.showWindow = function (windowId, url) {
    const window = document.querySelector(`.${windowId}`);
    if (!window) return;

    const wasHidden = window.style.display === 'none' || window.style.display === '';
    window.style.display = 'block';
    window.style.zIndex = ++zIndexCounter;

    // Special handling for Firefox window
    if (windowId === 'firefox-window') {
      if (wasHidden) {
        // Close any existing tabs if window was hidden
        if (tabs.length > 0) {
          const tabBar = document.getElementById('tab-bar');
          const tabContent = document.getElementById('tab-content');
          tabBar.innerHTML = '';
          tabContent.innerHTML = '';
          tabs = [];
        }

        // Create new tab with URL or blank
        newTab(url || 'about:blank');
      } else if (url) {
        // If window is already open, create new tab with URL
        newTab(url);
      }
    }
  };

  // Window controls with event delegation
  document.addEventListener('click', function (e) {
    const control = e.target.closest('.window-control');
    if (!control) return;

    const window = control.closest('.window');
    if (!window) return;

    e.stopPropagation();

    if (control.classList.contains('close')) {
      window.style.display = 'none';
      removeFromTaskbar(window);

      // Special handling for Firefox window
      if (window.classList.contains('firefox-window')) {
        // Close all tabs when window is closed
        const tabBar = document.getElementById('tab-bar');
        const tabContent = document.getElementById('tab-content');
        tabBar.innerHTML = '';
        tabContent.innerHTML = '';
        tabs = [];
      }
    } else if (control.classList.contains('minimize')) {
      window.style.display = 'none';
      addToTaskbar(window);
    } else if (control.classList.contains('maximize')) {
      window.classList.toggle('maximized');
    }
  });

  // Taskbar management
  function addToTaskbar(window) {
    const title = window.querySelector('.window-header span').textContent;
    const taskbarItem = document.createElement('span');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.textContent = title;
    taskbarItem.onclick = () => {
      window.style.display = 'block';
      window.style.zIndex = ++zIndexCounter;
      taskbarItem.remove();
    };
    document.getElementById('taskbar').appendChild(taskbarItem);
  }

  function removeFromTaskbar(window) {
    const title = window.querySelector('.window-header span').textContent;
    document.querySelectorAll('.taskbar-item').forEach(item => {
      if (item.textContent === title) item.remove();
    });
  }

  // Window dragging
  document.querySelectorAll('.window-header').forEach(header => {
    let isDragging = false;
    let offset = [0, 0];
    const currentWindow = header.parentElement;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      currentWindow.style.zIndex = ++zIndexCounter;
      offset = [
        currentWindow.offsetLeft - e.clientX,
        currentWindow.offsetTop - e.clientY
      ];
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        currentWindow.style.left = (e.clientX + offset[0]) + 'px';
        currentWindow.style.top = (e.clientY + offset[1]) + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  });

  // Terminal functionality
  const terminalInput = document.querySelector('.terminal-input');
  const terminalContent = document.querySelector('.terminal-content');

  terminalInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;

    const cmd = terminalInput.value.trim();
    if (!cmd) return e.preventDefault();

    // Echo the command
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="prompt"></span> eugenecustodioportfolio: ~/Portfolio$ ${cmd}`;
    terminalContent.insertBefore(line, terminalInput.parentElement);

    // Process command
    handleCommand(cmd.toLowerCase());

    // Reset input and refocus
    terminalInput.value = '';
    terminalInput.focus();
    terminalContent.scrollTop = terminalContent.scrollHeight;
    e.preventDefault();
  });

  document.querySelector('.terminal-content').addEventListener('click', () => {
    terminalInput.focus();
  });

  function handleCommand(cmd) {
    let output = '';
    switch (cmd) {
      case 'help':
        output = `
          <br>Available commands:<br>
          <span class="prompt">help</span>    - Show this help<br>
          <span class="prompt">about</span>   - Developer info<br>
          <span class="prompt">projects</span>- Project list<br>
          <span class="prompt">animate</span> - Start animation<br>
          <span class="prompt">clear</span>   - Clear terminal <br>
        `;
        print(output);
        break;
      case 'about':
        print('Full-stack developer passionate about web UIs');
        break;
      case 'projects':
        print('- Ubuntu Web Desktop<br>- Stickman Runner<br>- Portfolio');
        break;
      case 'animate':
        showWindow('animation-terminal');
        createStickmanAnimation();
        break;
      case 'clear':
        terminalContent.innerHTML = '';
        terminalContent.appendChild(terminalInput.parentElement);
        break;
      default:
        print(`Command '${cmd}' not found. Type 'help' for commands.`);
    }
  }

  function print(html) {
    const out = document.createElement('div');
    out.className = 'terminal-line';
    out.innerHTML = html;
    terminalContent.insertBefore(out, terminalInput.parentElement);
  }

  // Stickman Animation
  function createStickmanAnimation() {
    if (animationRunning) return;
    animationRunning = true;

    const animWindow = document.querySelector('.animation-terminal');
    animWindow.style.display = 'block';
    animWindow.style.zIndex = ++zIndexCounter;

    const container = document.querySelector('.animation-container');
    container.innerHTML = `
      <div class="counter">
        <span>Jumps: <span id="jump-counter">0</span></span>
        <span>Steps: <span id="walk-counter">0</span></span>
      </div>
      <div class="stickman-container">
        <div class="stickman">
          <div class="stickman-arms">
            <div class="arm left-arm"></div>
            <div class="arm right-arm"></div>
          </div>
          <div class="stickman-body"></div>
          <div class="stickman-legs">
            <div class="leg left-leg"></div>
            <div class="leg right-leg"></div>
          </div>
        </div>
      </div>
    `;

    // Counters setup
    let jumpCount = 0;
    let walkSteps = 0;
    const jumpCounter = document.getElementById('jump-counter');
    const walkCounter = document.getElementById('walk-counter');

    // Game parameters
    const GRAVITY = 1800;
    const JUMP_FORCE = -650;
    const OB_SPEED = 400;
    const SPAWN_MS = 1500;

    let lastTime = null;
    let vy = 0;
    let y = 0;
    let isJump = false;
    let obstacles = [];
    const stick = container.querySelector('.stickman');
    const arena = container.querySelector('.stickman-container');

    // Walk counter interval
    walkInterval = setInterval(() => {
      walkSteps++;
      walkCounter.textContent = walkSteps;
    }, 800);

    // Obstacle spawning
    spawnTimer = setInterval(() => {
      const ob = document.createElement('div');
      ob.className = 'obstacle';
      arena.appendChild(ob);
      obstacles.push({ el: ob, x: arena.clientWidth });
    }, SPAWN_MS);

    // Game loop
    function gameLoop(ts) {
      if (!lastTime) lastTime = ts;
      const dt = (ts - lastTime) / 1000;
      lastTime = ts;

      // Physics
      vy += GRAVITY * dt;
      y += vy * dt;

      if (y > 0) {
        y = 0;
        vy = 0;
        isJump = false;
      }

      // Update stickman position
      stick.style.bottom = `${50 - y}px`;
      stick.style.transform = `translateY(${y}px)`;

      // Process obstacles
      obstacles = obstacles.filter(ob => {
        ob.x -= OB_SPEED * dt;
        ob.el.style.left = `${ob.x}px`;

        if (ob.x + ob.el.clientWidth < 0) {
          ob.el.remove();
          jumpCount++;
          jumpCounter.textContent = jumpCount;
          return false;
        }

        // Auto-jump logic
        if (!isJump && ob.x < 220 && ob.x > 80) {
          vy = JUMP_FORCE;
          isJump = true;
        }

        return true;
      });

      if (animationRunning) requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
  }

  // Cleanup when animation window closes
  document.querySelector('.animation-terminal .close').addEventListener('click', () => {
    animationRunning = false;
    clearInterval(walkInterval);
    clearInterval(spawnTimer);
  });
});