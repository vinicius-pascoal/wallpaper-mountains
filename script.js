class StarryNightWallpaper {
  constructor() {
    this.canvas = document.getElementById('starsCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.timeInfo = document.getElementById('timeInfo');
    this.currentTimeDisplay = document.getElementById('currentTime');
    this.timeStatusDisplay = document.getElementById('timeStatus');
    this.sky = document.getElementById('sky');

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.initStars();
    this.updateScene();
    setInterval(() => this.updateScene(), 1000);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Obter horário de Brasília (GMT-3)
  getBrazilTime() {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return brazilTime;
  }

  // Determinar o período do dia
  getDayPeriod(hour) {
    // Noite: 18:00 - 05:59
    // Amanhecer: 06:00 - 07:59
    // Dia: 08:00 - 17:59

    if (hour >= 18 || hour < 6) {
      return { period: 'night', intensity: 1 };
    } else if (hour >= 6 && hour < 8) {
      return { period: 'dawn', intensity: (hour - 6 + (new Date().getMinutes() / 60)) / 2 };
    } else if (hour >= 8 && hour < 18) {
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

  updateSky(hour, intensity) {
    // Cores do céu em diferentes períodos
    let skyColor;

    if (hour >= 18 || hour < 6) {
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

    this.currentTimeDisplay.textContent = `${String(hour).padStart(2, '0')}:${minutes}`;

    const dayPeriod = this.getDayPeriod(hour);

    if (dayPeriod.period === 'night') {
      this.timeStatusDisplay.textContent = 'Noite';
    } else if (dayPeriod.period === 'dawn') {
      this.timeStatusDisplay.textContent = 'Amanhecer';
    } else {
      this.timeStatusDisplay.textContent = 'Dia';
    }

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
