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

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.initStars();
    this.updateScene();
    setInterval(() => this.updateScene(), 1000);
  }

  // DEV MODE: Inicializar seletor de horário
  initDevMode() {
    const hourInput = document.getElementById('hourInput');
    const resetButton = document.getElementById('resetTimeButton');

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
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
  new StarryNightWallpaper();
});
