// Seleção de elementos da DOM, incluindo o contêiner de notas, o campo de entrada de texto e o botão de adicionar nota.
const notesContainer = document.querySelector("#notes-container");
const noteInput = document.querySelector("#note-content");
const addNoteBtn = document.querySelector(".add-note");
const searchInput = document.querySelector("#search-input");
const exportBtn = document.querySelector("#export-notes");

// Função para exibir todas as notas armazenadas
function showNotes() {
    // Limpa o contêiner de notas antes de adicionar as novas
    cleanNotes();
    // Itera sobre as notas armazenadas e as adiciona ao contêiner
    getNotes().forEach((note) => {
        const noteElement = createNote(note.id, note.content, note.fixed);
        notesContainer.appendChild(noteElement);
    });
}

// Função para limpar o contêiner de notas
function cleanNotes() {
    // Remove todos os elementos filhos do contêiner
    notesContainer.replaceChildren([]);
}

// Função para adicionar uma nova nota
function addNote() {
    // Pega as notas armazenadas
    const notes = getNotes();

    // Cria um objeto de nota com ID gerado, conteúdo do campo de entrada e define como não fixo
    const noteObject = {
        id: generateId(),
        content: noteInput.value,
        fixed: false,
    };

    // Cria o elemento da nota na DOM e o adiciona ao contêiner
    const noteElement = createNote(noteObject.id, noteObject.content);
    notesContainer.appendChild(noteElement);

    // Adiciona a nova nota ao array de notas e a salva no localStorage
    notes.push(noteObject);
    saveNotes(notes);

    // Limpa o campo de entrada após a adição
    noteInput.value = "";
}

// Função para gerar um ID aleatório para as notas
function generateId() {
    // Gera um número aleatório entre 0 e 5000
    return Math.floor(Math.random() * 5000);
}

// Função para criar um elemento de nota na DOM
function createNote(id, content, fixed) {
    // Cria o elemento da nota e o textarea para o conteúdo
    const element = document.createElement("div");
    element.classList.add("note");

    const textarea = document.createElement("textarea");
    textarea.value = content;
    textarea.placeholder = "Adicione algum texto";
    element.appendChild(textarea);

    // Cria os ícones de fixar, deletar e duplicar a nota, e os adiciona ao elemento da nota
    const pinIcon = document.createElement("i");
    // Adiciona as classes necessárias para o ícone de fixar
    pinIcon.classList.add(...["bi", "bi-pin"]); 
    pinIcon.setAttribute("title", "Fixar");
    element.appendChild(pinIcon);

    const deleteIcon = document.createElement("i");
    // Adiciona as classes necessárias para o ícone de deletar
    deleteIcon.classList.add(...["bi", "bi-x-lg"]); 
    deleteIcon.setAttribute("title", "Deletar");
    element.appendChild(deleteIcon);

    const duplicateIcon = document.createElement("i");
    // Adiciona as classes necessárias para o ícone de duplicar
    duplicateIcon.classList.add(...["bi", "bi-file-earmark-plus"]); 
    duplicateIcon.setAttribute("title", "Duplicar");
    element.appendChild(duplicateIcon);

    // Adiciona a classe 'fixed' ao elemento, se a nota estiver fixada
    if (fixed) {
        element.classList.add("fixed");
    }

    // Adiciona eventos aos ícones e ao textarea
    element.querySelector("textarea").addEventListener("keyup", (e) => {
        const noteContent = e.target.value;
        // Atualiza o conteúdo da nota
        updateNote(id, noteContent);
    });

    element.querySelector(".bi-pin").addEventListener("click", () => {
        // Alterna a fixação da nota
        toggleFixNote(id);
    });

    element.querySelector(".bi-x-lg").addEventListener("click", () => {
        // Deleta a nota
        deleteNote(id, element);
    });

    element.querySelector(".bi-file-earmark-plus").addEventListener("click", () => {
        // Duplica a nota
        copyNote(id);
    });

    return element;
}

// Função para atualizar o conteúdo de uma nota existente
function updateNote(id, newContent) {
    const notes = getNotes();

    // Encontra a nota pelo ID e atualiza o seu conteúdo
    const targetNote = notes.filter((note) => note.id === id)[0];
    targetNote.content = newContent;

    // Salva as notas atualizadas no localStorage
    saveNotes(notes);
}

// Função para deletar uma nota
function deleteNote(id, element) {
    // Filtra as notas removendo a que tem o ID correspondente
    const notes = getNotes().filter((note) => note.id !== id);
    saveNotes(notes);

    // Remove o elemento da nota do contêiner
    notesContainer.removeChild(element);
}

// Função para duplicar uma nota
function copyNote(id) {
    const notes = getNotes();

    // Encontra a nota pelo ID e cria um novo objeto de nota com um novo ID
    const targetNote = notes.filter((note) => note.id === id)[0];
    const noteObject = {
        id: generateId(),
        content: targetNote.content,
        fixed: false,
    };

    // Cria o elemento da nota duplicada e a adiciona ao contêiner
    const noteElement = createNote(noteObject.id, noteObject.content, noteObject.fixed);
    notesContainer.appendChild(noteElement);

    // Adiciona a nova nota ao array de notas e a salva no localStorage
    notes.push(noteObject);
    saveNotes(notes);
}

// Função para alternar a fixação de uma nota
function toggleFixNote(id) {
    const notes = getNotes();

    // Encontra a nota pelo ID e inverte o valor de fixação
    const targetNote = notes.filter((note) => note.id === id)[0];
    targetNote.fixed = !targetNote.fixed;

    // Salva as notas atualizadas no localStorage e atualiza a exibição
    saveNotes(notes);
    showNotes();
}

// Função para obter as notas do localStorage
function getNotes() {
    // Retorna as notas armazenadas ou um array vazio
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");

    // Ordena as notas, colocando as fixadas no topo
    const orderedNotes = notes.sort((a, b) => a.fixed > b.fixed ? -1 : 1);
    return orderedNotes;
}

// Função para salvar as notas no localStorage
function saveNotes(notes) {
    localStorage.setItem("notes", JSON.stringify(notes));
}

function searchNotes(search) {
    const searchResults = getNotes().filter((note) => 
        note.content.includes(search)
    );

    if(search !== "") {

        cleanNotes();

        searchResults.forEach((note) => {
            const noteElement = createNote(note.id, note.content);
            notesContainer.appendChild(noteElement);
        });

        return;
    }

    cleanNotes();
    showNotes();
}

function exportData() {
    const notes = getNotes();
    // Separa os dados por vírgula e quebra linha com \n
    // Cria um array com os cabeçalhos e depois adiciona as linhas de dados
    const csvString = [
        ["ID", "Conteúdo", "Fixado?"],
        ...notes.map((note) => [note.id, note.content, note.fixed]),
    ].map((e) => e.join(",")).join("\n");

    const element = document.createElement("a");
    element.href = "data:text/csv;charset=utf-8," + encodeURI(csvString);
    element.download = "notes.csv";
    document.body.appendChild(element); // Adiciona o elemento ao DOM
    element.click();
    document.body.removeChild(element); // Remove o elemento após o clique
}


// Evento para adicionar uma nova nota ao clicar no botão
addNoteBtn.addEventListener("click", () => addNote());

searchInput.addEventListener("keyup", (e) => {

    const search = e.target.value

    searchNotes(search);

});

noteInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        addNote();
    }
});

exportBtn.addEventListener("click", () => {
    exportData();
});

// Inicializa a exibição das notas ao carregar a página
showNotes();