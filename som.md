# Wallpaper Engine – Equalizador de Áudio e Sincronização com BPM

Guia único em Markdown para adicionar **barras de áudio estilo equalizador** e **animações sincronizadas com BPM** em wallpapers do **Wallpaper Engine** usando **HTML, CSS e JavaScript**.

---

## Requisitos

- Wallpaper Engine (Steam)
- Tipo de wallpaper: **Web**
- `Audio Processing` ativado
- Modo de áudio: **FFT**

---

## Estrutura esperada

- index.html  
- style.css  
- main.js  

---

## HTML – Equalizador

```html
<div id="equalizer"></div>
CSS – Estilo das barras e animação de batida
css
Copiar código
#equalizer {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
}

.bar {
    width: 12px;
    height: 10px;
    background: linear-gradient(to top, #00f, #0ff);
    border-radius: 4px;
    transform-origin: bottom;
    transition: transform 0.08s linear;
}

body.beat {
    animation: pulse 0.15s ease-out;
}

@keyframes pulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.03); }
    100% { transform: scale(1); }
}
JavaScript – Criação das barras
js
Copiar código
const barCount = 32;
const eq = document.getElementById("equalizer");
const bars = [];

for (let i = 0; i < barCount; i++) {
    const bar = document.createElement("div");
    bar.className = "bar";
    eq.appendChild(bar);
    bars.push(bar);
}
JavaScript – Equalizador (FFT)
js
Copiar código
window.wallpaperRegisterAudioListener(function(audioArray) {
    for (let i = 0; i < barCount; i++) {
        const value = audioArray[i] || 0;
        const height = Math.max(value * 120, 5);
        bars[i].style.transform = `scaleY(${height / 10})`;
    }
});
JavaScript – Detecção de batida e cálculo de BPM
js
Copiar código
let lastBeatTime = 0;
let bpm = 0;
let beatCooldown = 300;
let threshold = 0.35;
let bassSmooth = 0;

window.wallpaperRegisterAudioListener(function(audioArray) {
    let bass = 0;

    for (let i = 0; i < 8; i++) {
        bass += audioArray[i];
    }

    bass /= 8;

    bassSmooth = bassSmooth * 0.8 + bass * 0.2;

    const now = performance.now();

    if (bassSmooth > threshold && now - lastBeatTime > beatCooldown) {
        const interval = now - lastBeatTime;
        lastBeatTime = now;

        if (interval > 0) {
            bpm = Math.round(60000 / interval);
        }

        if (bpm > 60 && bpm < 200) {
            triggerBeat();
        }
    }
});
JavaScript – Animação sincronizada com a batida
js
Copiar código
function triggerBeat() {
    document.body.classList.remove("beat");
    void document.body.offsetWidth;
    document.body.classList.add("beat");
}
Propriedades do Wallpaper Engine (opcional)
JavaScript
js
Copiar código
window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if (properties.sensitivity) {
            threshold = properties.sensitivity.value;
        }
    }
};
properties.json
json
Copiar código
"sensitivity": {
    "type": "slider",
    "min": 0.1,
    "max": 1,
    "value": 0.35
}
Observações
FFT é mais indicado que Waveform para equalizadores

Ajustar barCount, threshold e beatCooldown conforme o estilo musical

Testar sempre dentro do Wallpaper Engine

Fim do arquivo.
