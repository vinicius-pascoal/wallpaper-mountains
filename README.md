# 🏔️ Wallpaper Mountains

Um wallpaper interativo com montanhas, céu estrelado dinâmico e efeitos visuais que acompanham o horário do Brasil em tempo real.

## ✨ Funcionalidades

- **Céu Dinâmico**: Muda de acordo com a hora do dia (noite, amanhecer, dia)
- **Estrelas e Constelações**: Céu estrelado à noite com constelações conectadas
- **Sol e Lua**: Acompanha a trajetória realista durante o dia e noite
- **Nuvens Animadas**: Nuvens em movimento durante o dia
- **Montanhas em Camadas**: Silhuetas de montanhas em primeiro plano
- **Relógio em Tempo Real**: Data e hora sincronizadas com Brasília (GMT-3)
- **Responsivo**: Funciona em diferentes tamanhos de tela

## 🕐 Períodos do Dia

| Horário | Descrição | Recursos |
|---------|-----------|----------|
| 00:00 - 05:59 | **Noite** | Céu escuro, Lua, Estrelas, Constelações |
| 06:00 - 07:59 | **Amanhecer** | Transição gradual, Sol nascente |
| 08:00 - 16:59 | **Dia** | Céu azul, Sol, Nuvens animadas |
| 17:00 - 23:59 | **Noite** | Céu escuro, Lua, Estrelas, Constelações |

## 🚀 Como Usar

1. Abra o arquivo `index.html` em um navegador web
2. O wallpaper começará a exibir o horário e visual correspondente ao horário de Brasília
3. Use como wallpaper do seu desktop ou em qualquer página web

## 🛠️ Desenvolvimento

### Seletor de Horário (Dev Mode)

Para testes durante o desenvolvimento, há um seletor de horário no canto superior esquerdo:

- **Input de hora**: Selecione qualquer hora para testar os diferentes períodos do dia
- **Botão Resetar**: Volta ao horário real de Brasília

### Como Remover Dev Mode

Para remover o seletor de horário em produção:

**1. Em `index.html`:**
```html
<!-- Remova esta seção inteira -->
<div class="dev-time-selector" id="devTimeSelector">
    <label for="hourInput">Hora de teste:</label>
    <input type="time" id="hourInput" value="00:00">
    <button id="resetTimeButton">Resetar</button>
</div>
<!-- FIM DEV MODE -->
```

**2. Em `styles.css`:**
```css
/* Remova esta seção inteira */
.dev-time-selector {
    position: fixed;
    top: 20px;
    left: 20px;
    /* ... resto do CSS ... */
}
/* ... todas as classes .dev-time-selector ... */
/* FIM DEV MODE */
```

**3. Em `script.js`:**
- Remova a função `initDevMode()`
- Remova a linha `this.initDevMode();` do construtor
- Remova as 3 linhas de inicialização `this.devTime = null;` do constructor
- Remova o bloco DEV MODE dentro da função `getBrazilTime()`

## 📁 Estrutura do Projeto

```
wallpaper-mountains/
├── index.html          # Arquivo principal HTML
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── README.md          # Este arquivo
└── imgs/
    └── mountains.svg  # Imagem das montanhas
```

## 🎨 Tecnologias Utilizadas

- **HTML5**: Estrutura do projeto
- **CSS3**: Estilos e animações (gradientes, blur, transitions)
- **Canvas API**: Renderização de estrelas e constelações
- **JavaScript Vanilla**: Lógica de animações e cálculo de horários

## ⚙️ Configuração de Horários

Os períodos do dia podem ser ajustados editando a função `getDayPeriod()` em `script.js`:

```javascript
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
```

## 📝 Notas

- A hora é sincronizada com a zona horária de Brasília (America/Sao_Paulo)
- As estrelas são aleatoriamente geradas e formam constelações conectando estrelas próximas
- O relógio mostra data e hora no topo central da tela
- As nuvens só aparecem durante o dia

## 📄 Licença

Código desenvolvido para uso pessoal
