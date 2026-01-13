class StarryNightWallpaper {
  constructor() {
    this.canvas = document.getElementById('starsCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.timeInfo = document.getElementById('timeInfo');
    this.currentDateDisplay = document.getElementById('currentDate');
    this.currentTimeDisplay = document.getElementById('currentTime');
    this.sky = document.getElementById('sky');

    // DEV MODE: Variável para horário de teste
    this.devTime = null;
    this.initDevMode();

    // Controles de automação
    this.autoBirds = true;
    this.autoShootingStars = true;

    // Temporizadores
    this.birdsTimer = null;
    this.shootingStarsTimer = null;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.initStars();
    this.updateScene();
    setInterval(() => this.updateScene(), 1000);

    // Iniciar animações automáticas
    this.scheduleNextBird();
    this.scheduleNextShootingStar();

    // Inicializar equalizador de áudio
    this.initAudioEqualizer();
  }

  // DEV MODE: Inicializar painel de desenvolvedor
  initDevMode() {
    const devPanelToggle = document.getElementById('devPanelToggle');
    const devPanelContent = document.getElementById('devPanelContent');
    const hourInput = document.getElementById('hourInput');
    const resetButton = document.getElementById('resetTimeButton');
    const spawnBirdsButton = document.getElementById('spawnBirdsButton');
    const spawnShootingStarButton = document.getElementById('spawnShootingStarButton');
    const autoBirdsToggle = document.getElementById('autobirdsToggle');
    const autoStarsToggle = document.getElementById('autoStarsToggle');

    // Toggle painel
    if (devPanelToggle && devPanelContent) {
      devPanelToggle.addEventListener('click', () => {
        devPanelContent.classList.toggle('show');
      });

      // Fechar ao clicar fora
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.dev-panel')) {
          devPanelContent.classList.remove('show');
        }
      });
    }

    // Controle de horário
    if (hourInput) {
      hourInput.addEventListener('change', (e) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        this.devTime = { hours, minutes };
        this.updateScene();
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.devTime = null;
        hourInput.value = '';
        this.updateScene();
      });
    }

    // Controle de pássaros
    if (spawnBirdsButton) {
      spawnBirdsButton.addEventListener('click', () => {
        this.spawnBirdFlock();
      });
    }

    if (autoBirdsToggle) {
      autoBirdsToggle.addEventListener('change', (e) => {
        this.autoBirds = e.target.checked;
        if (this.autoBirds) {
          this.scheduleNextBird();
        } else {
          clearTimeout(this.birdsTimer);
        }
      });
    }

    // Controle de estrelas cadentes
    if (spawnShootingStarButton) {
      spawnShootingStarButton.addEventListener('click', () => {
        this.spawnShootingStar();
      });
    }

    if (autoStarsToggle) {
      autoStarsToggle.addEventListener('change', (e) => {
        this.autoShootingStars = e.target.checked;
        if (this.autoShootingStars) {
          this.scheduleNextShootingStar();
        } else {
          clearTimeout(this.shootingStarsTimer);
        }
      });
    }
  }
  // FIM DEV MODE

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Obter horário de Brasília (GMT-3)
  getBrazilTime() {
    // DEV MODE: Retornar horário de teste se definido
    if (this.devTime) {
      const testDate = new Date();
      testDate.setHours(this.devTime.hours, this.devTime.minutes, 0);
      return testDate;
    }
    // FIM DEV MODE

    const now = new Date();
    const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return brazilTime;
  }

  // Determinar o período do dia
  getDayPeriod(hour) {
    // Noite: 17:00 - 05:59
    // Amanhecer: 06:00 - 07:59
    // Dia: 08:00 - 16:59

    if (hour >= 17 || hour < 6) {
      return { period: 'night', intensity: 1 };
    } else if (hour >= 6 && hour < 8) {
      return { period: 'dawn', intensity: (hour - 6 + (new Date().getMinutes() / 60)) / 2 };
    } else if (hour >= 8 && hour < 17) {
      return { period: 'day', intensity: 0 };
    }
  }

  initStars() {
    const numStars = 150;
    this.stars = [];

    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * (this.canvas.height * 0.6),
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  drawStars(intensity) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenhar constelações primeiro (atrás das estrelas)
    if (intensity > 0.3) {
      this.drawConstellations(intensity);
    }

    for (let star of this.stars) {
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;

      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle * intensity})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Brilho das estrelas mais próximas
      if (star.radius > 1) {
        const glowGradient = this.ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 3
        );
        glowGradient.addColorStop(0, `rgba(255, 255, 200, ${0.3 * intensity})`);
        glowGradient.addColorStop(1, `rgba(255, 255, 200, 0)`);
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  // Desenhar constelações conectando as maiores estrelas
  drawConstellations(intensity) {
    // Usar todas as estrelas, não apenas as maiores
    const brightStars = this.stars.filter(star => star.radius > 0.7);

    if (brightStars.length < 2) return;

    this.ctx.strokeStyle = `rgba(100, 149, 237, ${0.4 * intensity})`;
    this.ctx.lineWidth = 1.2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Conectar estrelas próximas para formar constelações
    for (let i = 0; i < brightStars.length; i++) {
      for (let j = i + 1; j < brightStars.length; j++) {
        const dx = brightStars[j].x - brightStars[i].x;
        const dy = brightStars[j].y - brightStars[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Conectar apenas se as estrelas estiverem a uma distância razoável (densidade reduzida)
        if (distance < 120 && distance > 40) {
          this.ctx.beginPath();
          this.ctx.moveTo(brightStars[i].x, brightStars[i].y);
          this.ctx.lineTo(brightStars[j].x, brightStars[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  updateSky(hour, intensity) {
    // Cores do céu em diferentes períodos
    let skyColor;

    if (hour >= 17 || hour < 6) {
      // Noite
      skyColor = 'linear-gradient(180deg, #0a0e27 0%, #1a1a3e 50%, #2d2d5f 100%)';
    } else if (hour >= 6 && hour < 8) {
      // Amanhecer - transição gradual
      const dawn1 = this.interpolateColor('#0a0e27', '#ff6b35', intensity);
      const dawn2 = this.interpolateColor('#1a1a3e', '#f7931e', intensity);
      const dawn3 = this.interpolateColor('#2d2d5f', '#fdb833', intensity);
      skyColor = `linear-gradient(180deg, ${dawn1} 0%, ${dawn2} 50%, ${dawn3} 100%)`;
    } else {
      // Dia
      skyColor = 'linear-gradient(180deg, #87ceeb 0%, #e0f6ff 50%, #fff9e6 100%)';
    }

    this.sky.style.background = skyColor;
    this.updateCelestialBody(hour, intensity);
    this.updateClouds(hour, intensity);
  }

  // Atualizar posição e aparência do sol/lua
  updateCelestialBody(hour, intensity) {
    const sunMoon = document.getElementById('sunMoon');
    if (!sunMoon) return;

    const isNight = hour >= 17 || hour < 6;
    const isDawn = hour >= 6 && hour < 8;

    if (isDawn) {
      // Amanhecer - transição do sol
      const progress = (hour - 6 + new Date().getMinutes() / 60) / 2;
      const sunTop = 80 - progress * 40;
      const sunLeft = 10 + progress * 20;

      sunMoon.style.background = `radial-gradient(circle, #ffb84d, #ff8c00)`;
      sunMoon.style.top = sunTop + '%';
      sunMoon.style.left = sunLeft + '%';
      sunMoon.style.boxShadow = `0 0 80px rgba(255, 140, 0, 0.8)`;
      sunMoon.style.opacity = '1';
    } else if (hour >= 8 && hour < 17) {
      // Dia - sol no topo
      const dayProgress = (hour - 8) / 9;
      const sunLeft = 15 + dayProgress * 70;
      const sunTop = Math.sin(dayProgress * Math.PI) * 30 + 15;

      sunMoon.style.background = `radial-gradient(circle, #ffeb3b, #ffd700)`;
      sunMoon.style.top = sunTop + '%';
      sunMoon.style.left = sunLeft + '%';
      sunMoon.style.boxShadow = `0 0 100px rgba(255, 235, 59, 0.9)`;
      sunMoon.style.opacity = '1';
    } else {
      // Noite - lua
      const nightProgress = hour >= 17 ? (hour - 17) / 12 : (hour + 24 - 17) / 12;
      const moonLeft = 20 + nightProgress * 60;
      const moonTop = 15 + Math.sin(nightProgress * Math.PI) * 25;

      sunMoon.style.background = `radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0)`;
      sunMoon.style.top = moonTop + '%';
      sunMoon.style.left = moonLeft + '%';
      sunMoon.style.boxShadow = `0 0 60px rgba(200, 200, 200, 0.6)`;
      sunMoon.style.opacity = '0.95';
    }
  }

  // Atualizar nuvens durante o dia
  updateClouds(hour, intensity) {
    const cloudsContainer = document.getElementById('cloudsContainer');
    if (!cloudsContainer) return;

    const isDayTime = hour >= 8 && hour < 17;

    if (isDayTime) {
      cloudsContainer.classList.add('visible');
    } else {
      cloudsContainer.classList.remove('visible');
    }
  }

  interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  updateTime() {
    const brazilTime = this.getBrazilTime();
    const hour = brazilTime.getHours();
    const minutes = String(brazilTime.getMinutes()).padStart(2, '0');

    // Atualizar data
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const day = brazilTime.getDate();
    const month = monthNames[brazilTime.getMonth()];
    this.currentDateDisplay.textContent = `${month} ${day}`;

    // Atualizar hora
    this.currentTimeDisplay.textContent = `${String(hour).padStart(2, '0')}:${minutes}`;

    const dayPeriod = this.getDayPeriod(hour);

    return { hour, dayPeriod };
  }

  updateScene() {
    const { hour, dayPeriod } = this.updateTime();

    this.updateSky(hour, dayPeriod.intensity);
    this.drawStars(dayPeriod.intensity);
  }

  // ============ ANIMAÇÕES DE PÁSSAROS ============

  createBirdSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 50');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '50');

    // Corpo do pássaro em formato de V
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M20,25 Q30,15 40,20 Q50,15 60,25');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');

    svg.appendChild(path);
    return svg;
  }

  spawnBirdFlock() {
    const brazilTime = this.getBrazilTime();
    const hour = brazilTime.getHours();

    // Pássaros apenas durante o dia
    if (hour < 8 || hour >= 17) return;

    // Número de pássaros no bando (5-9)
    const flockSize = 5 + Math.floor(Math.random() * 5);

    // Posição Y base do bando (para manter coesão visual)
    const baseY = Math.random() * 30 + 10; // 10% a 40% da altura

    // Duração da animação para todos os pássaros do bando
    const duration = 18 + Math.random() * 8;

    for (let i = 0; i < flockSize; i++) {
      setTimeout(() => {
        const birdsContainer = document.getElementById('birdsContainer');
        if (!birdsContainer) return;

        const bird = document.createElement('div');
        bird.className = 'bird';

        // Posição Y com variação pequena em relação à base (mantém bando coeso)
        const startY = baseY + (Math.random() - 0.5) * 15;
        bird.style.top = Math.max(5, Math.min(50, startY)) + '%';
        bird.style.left = '-50px';

        // Curva similar para todos os pássaros (criam trajetória de bando)
        const curve = (Math.random() - 0.5) * 80;
        bird.style.setProperty('--bird-curve', curve + 'px');

        // Adicionar SVG do pássaro
        bird.appendChild(this.createBirdSVG());

        // Mesma duração para todo o bando
        bird.style.animation = `flyAcross ${duration}s linear`;

        birdsContainer.appendChild(bird);

        // Remover após animação
        setTimeout(() => {
          bird.remove();
        }, duration * 1000);
      }, i * 150); // Delay de 150ms entre cada pássaro do bando
    }
  }

  scheduleNextBird() {
    if (!this.autoBirds) return;

    const brazilTime = this.getBrazilTime();
    const hour = brazilTime.getHours();

    // Apenas durante o dia
    if (hour >= 8 && hour < 17) {
      // Intervalo aleatório entre 25 e 50 segundos (tempo maior para bando aparecer/desaparecer)
      const delay = 25000 + Math.random() * 25000;

      this.birdsTimer = setTimeout(() => {
        this.spawnBirdFlock();
        this.scheduleNextBird();
      }, delay);
    } else {
      // Verificar novamente em 1 minuto se não for horário de dia
      this.birdsTimer = setTimeout(() => {
        this.scheduleNextBird();
      }, 60000);
    }
  }

  // ============ ANIMAÇÕES DE ESTRELAS CADENTES ============

  spawnShootingStar() {
    const brazilTime = this.getBrazilTime();
    const hour = brazilTime.getHours();

    // Estrelas cadentes apenas durante a noite
    if (hour >= 8 && hour < 17) return;

    const container = document.getElementById('shootingStarsContainer');
    if (!container) return;

    const star = document.createElement('div');
    star.className = 'shooting-star';

    // Posição inicial aleatória (parte superior da tela)
    const startX = Math.random() * 80 + 10; // 10% a 90% da largura
    const startY = Math.random() * 30; // 0% a 30% da altura

    star.style.left = startX + '%';
    star.style.top = startY + '%';

    // Duração aleatória
    const duration = 0.5 + Math.random() * 0.5;
    star.style.animation = `shootingStar ${duration}s ease-out`;

    container.appendChild(star);

    // Remover após animação
    setTimeout(() => {
      star.remove();
    }, duration * 1000);
  }

  scheduleNextShootingStar() {
    if (!this.autoShootingStars) return;

    const brazilTime = this.getBrazilTime();
    const hour = brazilTime.getHours();

    // Apenas durante a noite
    if (hour >= 17 || hour < 8) {
      // Intervalo aleatório entre 15 e 45 segundos
      const delay = 15000 + Math.random() * 30000;

      this.shootingStarsTimer = setTimeout(() => {
        this.spawnShootingStar();
        this.scheduleNextShootingStar();
      }, delay);
    } else {
      // Verificar novamente em 1 minuto se não for horário noturno
      this.shootingStarsTimer = setTimeout(() => {
        this.scheduleNextShootingStar();
      }, 60000);
    }
  }

  // Inicializar equalizador de áudio
  initAudioEqualizer() {
    const barCount = 128;
    const equalizer = document.getElementById('audioEqualizer');
    this.audioBars = [];
    this.baseHeights = [];

    // Criar barras do equalizador com alturas base seguindo curvatura da montanha
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'audio-bar';

      // Calcular altura base seguindo perfil de montanha
      const position = i / barCount; // 0 a 1
      const baseHeight = this.calculateMountainCurve(position);
      this.baseHeights.push(baseHeight);

      bar.style.height = baseHeight + 'vh';
      equalizer.appendChild(bar);
      this.audioBars.push(bar);
    }

    // Variáveis para detecção de batida
    this.lastBeatTime = 0;
    this.bpm = 0;
    this.beatCooldown = 300;
    this.threshold = 0.25;
    this.bassSmooth = 0;

    // Inicializar listener de áudio
    this.initAudioListener();
  }

  // Calcular curvatura da montanha para cada posição
  calculateMountainCurve(position) {
    // Baseado nos pontos do mountains.svg (viewBox='0 0 1600 900')
    // Normalizar posição para 0-1600
    const x = position * 1600;
    
    // Pico principal em x=957, y=450 (altura 900-450=450)
    const peak1 = Math.exp(-Math.pow((x - 957) / 200, 2)) * 50;
    
    // Pico em x=398, y=662 (altura 900-662=238)
    const peak2 = Math.exp(-Math.pow((x - 398) / 180, 2)) * 26;
    
    // Pico em x=1203, y=546 (altura 900-546=354)
    const peak3 = Math.exp(-Math.pow((x - 1203) / 220, 2)) * 39;
    
    // Pico em x=641, y=695 (altura 900-695=205)
    const peak4 = Math.exp(-Math.pow((x - 641) / 150, 2)) * 22;
    
    // Pico em x=1401, y=632 (altura 900-632=268)
    const peak5 = Math.exp(-Math.pow((x - 1401) / 170, 2)) * 29;
    
    // Pico em x=971, y=687 (altura 900-687=213)
    const peak6 = Math.exp(-Math.pow((x - 971) / 140, 2)) * 23;
    
    // Altura base mínima (quase zero para ficar invisível sem som)
    const baseHeight = 0.5;
    
    return baseHeight + peak1 + peak2 + peak3 + peak4 + peak5 + peak6;
  }

  // Inicializar listener de áudio
  initAudioListener() {
    // Registrar listener de áudio do Wallpaper Engine
    if (window.wallpaperRegisterAudioListener) {
      window.wallpaperRegisterAudioListener((audioArray) => {
        this.updateAudioVisualizer(audioArray);
      });
    } else {
      // Simulação para testes fora do Wallpaper Engine
      this.simulateAudio();
    }
  }

  // Variáveis para suavização de valores
  smoothValues = new Array(128).fill(0);

  // Atualizar visualizador de áudio
  updateAudioVisualizer(audioArray) {
    const barCount = this.audioBars.length;

    // Atualizar altura das barras - crescem apenas com som
    for (let i = 0; i < barCount; i++) {
      const index = Math.floor((i / barCount) * audioArray.length);
      const value = audioArray[index] || 0;
      
      // Suavizar valores para animação mais fluida
      this.smoothValues[i] = this.smoothValues[i] * 0.85 + value * 0.15;
      const smoothed = this.smoothValues[i];
      
      // Barras ficam invisíveis (scale 0) sem som e crescem com o áudio
      const audioScale = smoothed * 8; // Multiplicador alto para reação visível
      this.audioBars[i].style.transform = `scaleY(${audioScale})`;
      // Ajustar opacidade baseada no valor do áudio
      this.audioBars[i].style.opacity = Math.min(smoothed * 3, 1);
    }

    // Detecção de batida
    let bass = 0;
    for (let i = 0; i < 8; i++) {
      bass += audioArray[i];
    }
    bass /= 8;

    this.bassSmooth = this.bassSmooth * 0.8 + bass * 0.2;

    const now = performance.now();

    if (this.bassSmooth > this.threshold && now - this.lastBeatTime > this.beatCooldown) {
      const interval = now - this.lastBeatTime;
      this.lastBeatTime = now;

      if (interval > 0) {
        this.bpm = Math.round(60000 / interval);
      }

      if (this.bpm > 60 && this.bpm < 200) {
        this.triggerBeat();
      }
    }
  }

  // Disparar animação de batida
  triggerBeat() {
    document.body.classList.remove('beat');
    void document.body.offsetWidth;
    document.body.classList.add('beat');
  }

  // Simulação de áudio para testes
  simulateAudio() {
    setInterval(() => {
      const audioArray = [];
      for (let i = 0; i < 128; i++) {
        // Simular valores de áudio com base em frequências (reduzido)
        const randomValue = Math.random() * Math.sin(Date.now() / 1000 + i / 10);
        audioArray.push(Math.abs(randomValue) * 0.4);
      }
      this.updateAudioVisualizer(audioArray);
    }, 50);
  }
}

// Registrar propriedades do Wallpaper Engine (opcional)
if (window.wallpaperPropertyListener) {
  window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
      if (properties.audioSensitivity) {
        wallpaper.threshold = properties.audioSensitivity.value;
      }
    }
  };
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
  new StarryNightWallpaper();
});
