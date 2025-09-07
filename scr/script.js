document.addEventListener('DOMContentLoaded', () => {
    const telaJogo = document.getElementById("telaJogo");
    const btnNovoJogo = document.getElementById("novoJogo");
    const paresEncontrados = document.getElementById("paresEncontrados");
    const totalDePares = document.getElementById("totalDePares");
    const tentativasDisplay = document.getElementById("tentativas");

    let deckID = "";
    let cartas = [];
    let cartasViradas = [];
    let paresIguais = 0;
    let tentativas = 0;
    let totalPares = 0;
    let podeVirar = true;

    btnNovoJogo.addEventListener("click", iniciarJogo);

    async function iniciarJogo() {
        resetarJogo();
        try {
            const resposta = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
            const dados = await resposta.json();
            deckID = dados.deck_id;

            const respostaCartas = await fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=8`);
            const dadosCartas = await respostaCartas.json();

            if (dadosCartas.cards.length < 8) {
                throw new Error('Não há cartas suficientes no baralho');
            }

            cartas = [...dadosCartas.cards, ...dadosCartas.cards];
            totalPares = dadosCartas.cards.length;
            totalDePares.textContent = totalPares;

            embaralharCartas();
            criarTabuleiro();
        } catch (erro) {
            console.error("Erro:", erro);
            alert('Erro ao iniciar jogo. Por favor, tente novamente.');
        }
    }

    function resetarJogo() {
        telaJogo.innerHTML = '';
        cartasViradas = [];
        paresIguais = 0;
        tentativas = 0;
        podeVirar = true;
        atualizarStatus();
    }

    function embaralharCartas() {
        for (let i = cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
        }
    }

    function criarTabuleiro() {
        // Cria 4 linhas
        for (let linha = 0; linha < 4; linha++) {
            const linhaDiv = document.createElement('div');
            linhaDiv.className = 'linha-cartas';
            
            // Adiciona 4 cartas por linha
            for (let coluna = 0; coluna < 4; coluna++) {
                const indice = linha * 4 + coluna;
                if (indice >= cartas.length) break;
                
                const carta = cartas[indice];
                const elementoCarta = document.createElement('div');
                elementoCarta.className = 'card';
                elementoCarta.dataset.indice = indice;
                
                const frente = document.createElement('div');
                frente.className = 'frente';
                frente.innerHTML = `<img src="${carta.image}" alt="${carta.value} de ${carta.suit}">`;
                
                const verso = document.createElement('div');
                verso.className = 'traz';
                verso.textContent = '?';
                
                elementoCarta.appendChild(frente);
                elementoCarta.appendChild(verso);
                elementoCarta.addEventListener('click', virarCarta);
                linhaDiv.appendChild(elementoCarta);
            }
            
            telaJogo.appendChild(linhaDiv);
        }
    }

    function virarCarta() {
        if (!podeVirar || this.classList.contains('flipped') || this.classList.contains('matched')) {
            return;
        }
        
        this.classList.add('flipped');
        const indice = parseInt(this.dataset.indice);
        cartasViradas.push({ indice, elemento: this });
        
        if (cartasViradas.length === 2) {
            tentativas++;
            atualizarStatus();
            verificarPar();
        }
    }

    function verificarPar() {
        podeVirar = false;
        const [carta1, carta2] = cartasViradas;
        const valor1 = cartas[carta1.indice].code;
        const valor2 = cartas[carta2.indice].code;
        
        if (valor1 === valor2) {
            setTimeout(() => {
                carta1.elemento.classList.add('matched');
                carta2.elemento.classList.add('matched');
                paresIguais++;
                atualizarStatus();
                
                cartasViradas = [];
                podeVirar = true;
                
                if (paresIguais === totalPares) {
                    setTimeout(() => {
                        alert(`🎉 Parabéns! Você venceu em ${tentativas} tentativas!`);
                    }, 500);
                }
            }, 300);
        } else {
            setTimeout(() => {
                carta1.elemento.classList.remove('flipped');
                carta2.elemento.classList.remove('flipped');
                cartasViradas = [];
                podeVirar = true;
            }, 1000);
        }
    }

    function atualizarStatus() {
        tentativasDisplay.textContent = tentativas;
        paresEncontrados.textContent = paresIguais;
    }

    // Iniciar jogo automaticamente
    iniciarJogo();
});