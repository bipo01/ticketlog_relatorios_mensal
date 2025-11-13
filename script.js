const form = document.querySelector("form");
const fileInput = document.querySelector("#file");

const dropzone = document.querySelector("#dropzone"); // Você precisará do div <div id="dropzone">...</div> no seu HTML

// 1. Configuração do Dropzone
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover"); // Classe para feedback visual (ver CSS)
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    // ESSENCIAL: Injeta o arquivo solto no input file (ID #file)
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(files[0]);
    fileInput.files = dataTransfer.files;

    // Feedback de arquivo selecionado
    dropzone.querySelector(
      "p"
    ).textContent = `Arquivo selecionado: ${files[0].name}`;
  }
});

// Permite clicar no dropzone para abrir o seletor de arquivo
dropzone.addEventListener("click", () => {
  fileInput.click();
});

// Feedback de arquivo selecionado (via clique)
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    dropzone.querySelector(
      "p"
    ).textContent = `Arquivo selecionado: ${fileInput.files[0].name}`;
  } else {
    dropzone.querySelector("p").textContent =
      "Arraste e solte o arquivo Excel aqui ou clique para selecionar.";
  }
});

fileInput.addEventListener("input", (e) => {
  // e.preventDefault();

  const fileInput = document.querySelector("#file");
  const file = fileInput.files[0];

  if (!file) {
    console.log("Nenhum arquivo selecionado");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    // Pegando a primeira aba (sheet)
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertendo para JSON
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const header = json.slice(0, 1);
    const body = json.slice(1, -1);

    console.log(body);

    const viaturas = [
      ...new Set(
        body
          .map((linha) => linha[5])
          .filter((item) => item && !item.includes("MAQ"))
      ),
    ];

    const maquinas = [
      ...new Set(
        body
          .map((linha) => linha[5])
          .filter((item) => item && item.includes("MAQ"))
      ),
    ];

    const motoristas = [...new Set(body.map((linha) => linha[11]))];
    const valorTotal = body.reduce((acc, cur) => {
      const value = Number(cur[19]);
      return acc + value;
    }, 0);

    const valorFormatado = valorTotal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    /*

    const checarDuplicatasArr = [];
    body.forEach((row) => {
      const obj = {
        id: row[0],
        placa: row[5],
        km: row[16],
      };
      checarDuplicatasArr.push(obj);
    });

    const duplicatas = [];

    const checarDuplicatas = checarDuplicatasArr.filter((row, i, arr) => {
      const { placa, km } = row;
      const existemDuplicatas = arr.filter(
        (row1) => row1.placa === placa && row1.km === km
      );
      if (existemDuplicatas.length > 1) {
        duplicatas.push(existemDuplicatas);
      }
    });

    const duplicatasSet = [...new Set(duplicatas)];

    console.log(duplicatas);
    */

    if (document.querySelector("table")) {
      document.querySelector("table").remove();
    }

    const html = `
<table border="1">
  <tr>
    <td><h1>Valor Total de Abastecimentos</h1></td>
    <td><h1>${valorFormatado}</h1></td>
  </tr>
  <tr>
    <td><h1>Quantidade de Viaturas</h1></td>
    <td><h1>${viaturas.length}</h1></td>
  </tr>
  <tr>
    <td><h1>Quantidade de Máquinas</h1></td>
    <td><h1>${maquinas.length}</h1></td>
  </tr>
  <tr>
    <td><h1>Quantidade de Motoristas</h1></td>
    <td><h1>${motoristas.length}</h1></td>
  </tr>
  <tr>
    <td><h1>Quantidade de Abastecimentos</h1></td>
    <td><h1>${body.length}</h1></td>
  </tr>
</table>
`;

    document.body.insertAdjacentHTML("beforeend", html);
  };

  reader.readAsArrayBuffer(file);
});
