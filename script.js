// =====================
// Definição da Gramática
// =====================

const grammar = {
    "S": [["a", "A", "a"], ["b", "B", "b"], ["c", "C", "c"]],
    "A": [["a", "A"], ["c", "D", "B"]],
    "B": [["b", "B"], ["c", "C", "D"]],
    "C": [["D", "c"]],
    "D": [["d", "D"], ["ε"]]
};

// ================================
// Conjuntos FIRST e FOLLOW
// ================================

const first = {
    "S": ["a", "b", "c"],
    "A": ["a", "c"],
    "B": ["b", "c"],
    "C": ["d", "c"],
    "D": ["d", "ε"]
};

const follow = {
    "S": ["$"],
    "A": ["a"],
    "B": ["b", "a"],
    "C": ["c", "d", "b", "a"],
    "D": ["c", "b", "a"]
};

// ========================
// Tabela de Parsing LL(1)
// ========================

const parsingTable = {
    "S": {
        "a": "S → a A a",
        "b": "S → b B b",
        "c": "S → c C c"
    },
    "A": {
        "a": "A → a A",
        "c": "A → c D B"
    },
    "B": {
        "b": "B → b B",
        "c": "B → c C D"
    },
    "C": {
        "c": "C → D c",
        "d": "C → D c"
    },
    "D": {
        "a": "D → ε",
        "b": "D → ε",
        "c": "D → ε",
        "d": "D → d D"
    }
};

const estado = {
    pilha: [],
    entrada: [],
    pointer: 0,
    iteracoes: 0,
    sucesso: false,
    terminou: false
};

// ==================================
// Exibir Gramática, FIRST e FOLLOW
// ==================================

window.onload = function () {
    // Mostrar gramática
    const grammarDiv = document.getElementById('grammar');
    for (let nonTerminal in grammar) {
        const productions = grammar[nonTerminal].map(p => p.join(' ')).join(' | ');
        grammarDiv.innerText += `${nonTerminal} → ${productions}\n`;
    }

    // Mostrar conjuntos FIRST e FOLLOW
    const firstDiv = document.getElementById('firstSet');
    const followDiv = document.getElementById('followSet');

    for (let nt in first) {
        firstDiv.innerText += `FIRST(${nt}) = { ${first[nt].join(', ')} }\n`;
    }

    for (let nt in follow) {
        followDiv.innerText += `FOLLOW(${nt}) = { ${follow[nt].join(', ')} }\n`;
    }


    // Mostrar tabela de parsing
    const tableDiv = document.getElementById('parsingTable');
    let tableHTML = '<table><tr><th></th>';
    const terminals = ["a", "b", "c", "d", "$"];

    terminals.forEach(t => {
        tableHTML += `<th>${t}</th>`;
    });
    tableHTML += '</tr>';

    for (let nt in parsingTable) {
        tableHTML += `<tr><th>${nt}</th>`;
        terminals.forEach(t => {
            const entry = parsingTable[nt][t] || "";
            tableHTML += `<td>${entry}</td>`;
        });
        tableHTML += '</tr>';
    }

    tableHTML += '</table>';
    tableDiv.innerHTML = tableHTML;
};


function analisar() {
    // Limpa a tabela de traço e o resultado anterior
    const traceBody = document.querySelector('#traceTable tbody');
    traceBody.innerHTML = "";
    document.getElementById('resultado').innerText = "";
    document.getElementById('btnProximoPasso').disabled = true;

    // Lê a sentença digitada e prepara a entrada
    const input = document.getElementById('inputSentence').value.trim();
    const entrada = input.split("").concat("$");

    // Inicializa a pilha com símbolo inicial S e marcador de fundo $
    const pilha = ["$", "S"];

    let pointer = 0; // Posição atual da entrada
    let sucesso = false; // Indicador de aceite
    let iteracoes = 0;

    while (pilha.length > 0) {
        const topo = pilha[pilha.length - 1]; // Olha o topo da pilha
        const atual = entrada[pointer];       // Olha o símbolo atual da entrada
        iteracoes++;

        // Adiciona uma linha no traço da pilha
        adicionarTrace(pilha.join(" "), entrada.slice(pointer).join(" "), "");

        if (topo === atual) {
            // Quando terminal casa com o símbolo da entrada
            pilha.pop();
            pointer++;
            atualizarUltimaAcao("Ler " + atual);
        } else if (Object.keys(parsingTable).includes(topo)) {
            // Se topo é não-terminal
            const producao = parsingTable[topo][atual];

            if (producao) {
                pilha.pop();
                const rhs = producao.split("→")[1].trim().split(" ");

                if (!(rhs.length === 1 && rhs[0] === "ε")) {
                    for (let i = rhs.length - 1; i >= 0; i--) {
                        pilha.push(rhs[i]);
                    }
                }

                atualizarUltimaAcao(producao);
            } else {
                atualizarUltimaAcao("Erro: entrada inesperada");
                break;
            }
        } else {
            atualizarUltimaAcao("Erro: topo da pilha inesperado");
            break;
        }

        if (topo === "$" && atual === "$") {
            sucesso = true;
            break;
        }
    }

    document.getElementById('resultado').innerText = sucesso ? "Sentença aceita ✔️" : "Sentença rejeitada ❌";
    document.getElementById('resultado2').innerText = sucesso ? "Sentença aceita em " + iteracoes + " iterações." : "Sentença rejeitada em " + iteracoes + " iterações.";
}


function adicionarTrace(pilha, entrada, acao) {
    const traceBody = document.querySelector('#traceTable tbody');
    const row = document.createElement('tr');

    const cellPilha = document.createElement('td');
    cellPilha.innerText = pilha;
    row.appendChild(cellPilha);

    const cellEntrada = document.createElement('td');
    cellEntrada.innerText = entrada;
    row.appendChild(cellEntrada);

    const cellAcao = document.createElement('td');
    cellAcao.innerText = acao;
    row.appendChild(cellAcao);

    traceBody.appendChild(row);
}


function atualizarUltimaAcao(acao) {
    const traceBody = document.querySelector('#traceTable tbody');
    const ultimaLinha = traceBody.lastElementChild;
    if (ultimaLinha) {
        const cellAcao = ultimaLinha.children[2];
        cellAcao.innerText = acao;
    }
}


function gerarSentenca() {
    const sequencia = [];
    const inputLimite = parseInt(document.getElementById('inputLimite').value);
    const tamanhoMax = isNaN(inputLimite) || inputLimite <= 0 ? 20 : inputLimite;
    //console.log("----------------" + tamanhoMax + "-----------------");

    const resultado = derivarComLimite("S", sequencia, tamanhoMax).join("");

    document.getElementById('inputSentence').value = resultado;
    document.getElementById('resultadoSequencia').innerText =
        "Sequência de produções da sentença automática:\n" + (sequencia.length > 0 ? sequencia.join(" | ") : "(nenhuma)");
}



function derivarComLimite(simbolo, sequencia, limiteRestante) {
    //console.log(simbolo);
    //console.log(sequencia);
    //console.log(limiteRestante);
    // Se for terminal, retorna ele
    if (!grammar[simbolo]) {
        return [simbolo === "ε" ? "" : simbolo];
    }

    const producoes = grammar[simbolo];

    // Se estamos perto do limite, prioriza ε se existir
    let producoesFiltradas = producoes;

    if (limiteRestante <= 1) {
        const possuiEpsilon = producoes.some(p => p.length === 1 && p[0] === "ε");
        const possuiEstadoFinal = producoes.some(p => p.includes("D"));
        if (possuiEpsilon) {
            producoesFiltradas = producoes.filter(p => p.length === 1 && p[0] === "ε");
        } else if (possuiEstadoFinal) {
            producoesFiltradas = producoes.filter(p => p.includes("D"));
        }
    }


    // Escolhe uma produção aleatória das possíveis
    const producao = producoesFiltradas[Math.floor(Math.random() * producoesFiltradas.length)];

    sequencia.push(`${simbolo} → ${producao.join(' ')}`);

    let resultado = [];

    for (let simboloDaProducao of producao) {
        const derivado = derivarComLimite(simboloDaProducao, sequencia, limiteRestante - resultado.length);
        resultado = resultado.concat(derivado);
    }

    return resultado;
}


function iniciarPasso() {
    const input = document.getElementById('inputSentence').value.trim();
    const entrada = input.split("").concat("$");

    estado.pilha = ["$", "S"];
    estado.entrada = entrada;
    estado.pointer = 0;
    estado.iteracoes = 0;
    estado.sucesso = false;
    estado.terminou = false;

    const traceBody = document.querySelector('#traceTable tbody');
    traceBody.innerHTML = "";
    document.getElementById('resultado').innerText = "";
    document.getElementById('resultado2').innerText = "";

    limparDestaqueTabela();

    document.getElementById('btnProximoPasso').disabled = false;
}


function proximoPasso() {
    if (estado.terminou) return;
    estado.iteracoes++;

    const topo = estado.pilha[estado.pilha.length - 1];
    const atual = estado.entrada[estado.pointer];

    limparDestaqueTabela();

    adicionarTrace(estado.pilha.join(" "), estado.entrada.slice(estado.pointer).join(" "), "");

    if (topo === atual) {
        estado.pilha.pop();
        estado.pointer++;
        atualizarUltimaAcao("Ler " + atual);
    }
    else if (Object.keys(parsingTable).includes(topo)) {
        const producao = parsingTable[topo][atual];

        if (producao) {
            estado.pilha.pop();
            const rhs = producao.split("→")[1].trim().split(" ");

            if (!(rhs.length === 1 && rhs[0] === "ε")) {
                for (let i = rhs.length - 1; i >= 0; i--) {
                    estado.pilha.push(rhs[i]);
                }
            }

            atualizarUltimaAcao(producao);
            destacarTabela(topo, atual);
        } else {
            atualizarUltimaAcao("Erro: entrada inesperada");
            document.getElementById('resultado2').innerText = "Sentença rejeitada em " + estado.iteracoes + " iterações.";
            estado.terminou = true;
            document.getElementById('btnProximoPasso').disabled = true;
            return;
        }
    }
    else {
        atualizarUltimaAcao("Erro: topo da pilha inesperado");
        estado.terminou = true;
        document.getElementById('resultado2').innerText = "Sentença rejeitada em " + estado.iteracoes + " iterações.";
        document.getElementById('btnProximoPasso').disabled = true;
        return;
    }

    if (topo === "$" && atual === "$") {
        estado.sucesso = true;
        estado.terminou = true;
        document.getElementById('resultado').innerText = "Sentença aceita ✔️";
        //document.getElementById('resultado2').innerText = "Passo a passo concluído.";
        document.getElementById('resultado2').innerText = "Sentença aceita em " + estado.iteracoes + " iterações.";
        document.getElementById('btnProximoPasso').disabled = true;
        return;
    }
}


function destacarTabela(naoTerminal, terminal) {
    const table = document.querySelector('#parsingTable table');
    const linhas = table.rows;

    let linhaIndex = -1;
    let colunaIndex = -1;

    // Localizar índices das linhas e colunas
    for (let i = 0; i < linhas[0].cells.length; i++) {
        if (linhas[0].cells[i].innerText === terminal) {
            colunaIndex = i;
            break;
        }
    }

    for (let i = 1; i < linhas.length; i++) {
        if (linhas[i].cells[0].innerText === naoTerminal) {
            linhaIndex = i;
            break;
        }
    }

    // Aplicar destaque se encontrou
    if (linhaIndex !== -1 && colunaIndex !== -1) {
        linhas[linhaIndex].cells[colunaIndex].classList.add('highlight');
    }
}


function limparDestaqueTabela() {
    const cells = document.querySelectorAll('#parsingTable td');
    cells.forEach(cell => cell.classList.remove('highlight'));
}