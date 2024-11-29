const btnElegir = document.getElementById("divBtnElegir");
const fileInput = document.getElementById("inpFile");
const divFile = document.getElementById("divFile");
const dragArea = document.getElementById("divFile");
const btnSubmit = document.getElementById("btnSubmit");

const obtener = () => {
  const fileName = fileInput.files[0]?.name || "Ningún archivo seleccionado";
  document.getElementById("btnElegir").innerText = "Cambiar archivo";
  document.getElementById(
    "pFile"
  ).innerText = `Archivo seleccionado: ${fileName}`;
};

const convertir = async (archivo) => {
  let result = [];
  let tmp = "";
  let tmpLinea = "";
  let contador = 0;
  let guardar = false;
  let persona = "";
  let contadorCaracteres = [0, 0, 0, 0]; // [/, ',', '-', ':']
  let ContadorEspaciosPersona = 0;

  let tmpFecha = "";
  let tmpHora = "";

  let totalPersonas = [];
  // Procesar el archivo línea por línea
  for (let i = 0; i < archivo.length; i++) {
    switch (archivo[i]) {
      case "/":
        contadorCaracteres[0]++;
        break;
      case ",":
        contadorCaracteres[1]++;
        break;
      case "-":
        contadorCaracteres[2]++;
        break;
      case ":":
        contadorCaracteres[3]++;
        break;
    }

    tmpLinea += archivo[i];

    if (archivo[i] === "\n") {
      contador++;

      let fecha = /^[1-9]?[1-9].[1-9].[1-9]?[0-9]?[0-9]?[0-9]/;
      let hora = /(?:\d{1,2}:\d{2}\s?[ap]\.?\s?m\.?|\d{2}:\d{2})/;

      if (persona != "" && tmp == "") {
        tmp = persona;
        persona = "Whatsapp";
      }

      if (!totalPersonas.includes(persona)) {
        totalPersonas.push(persona);
      }

      if (tmpLinea.match(hora)) {
        tmpHora =
          tmpLinea.match(hora)[0] != null ? tmpLinea.match(hora)[0] : "";
      }
      if (tmpLinea.match(fecha)) {
        tmpFecha =
          tmpLinea.match(fecha)[0] != null ? tmpLinea.match(fecha)[0] : "";
      }

      result.push({
        numMensaje: contador,
        mensaje: tmp,
        emitidoPor: persona,
        fecha: tmpFecha,
        hora: tmpHora,
      });

      // Resetear
      tmp = "";
      tmpLinea = "";
      guardar = false;
      contadorCaracteres = [0, 0, 0, 0];
      persona = "";
      ContadorEspaciosPersona = 0;
    }

    // estructura: 1/8/24, 13:44 - CamiLLa: Maigad  // [/, ',', '-', ':']
    if (contadorCaracteres[2] == 1 && archivo[i - 2] == "-") {
      guardar = true;
    }
    if (contadorCaracteres[3] == 1 && guardar) {
      persona += archivo[i];
    }

    if (guardar && contadorCaracteres[3] >= 2) {
      if (ContadorEspaciosPersona >= 1) {
        tmp += archivo[i];
      }
      if (archivo[i] == " ") {
        ContadorEspaciosPersona++;
      }
    }
  }
  return { data: result, integrantes: totalPersonas };
};

const generar = (content) => {
  if (!content.data) {
    return;
  }
  let element = `
  <main class="div-main">
    <div class="divHeader">
      <div class="divLogo"></div>
      <div>
          <div class="divNombre">
              ${content.integrantes[1]}
          </div>
          <div class="divActividad">
              En línea
          </div>
        </div>
    </div>
    `;

  let cantidad = document.getElementById("inpMSJs").value;
  if (cantidad > content.data.length) {
    cantidad = content.data.length;
  }
  for (let i = 0; i < cantidad; i++) {
    if (content.data[i].emitidoPor == content.integrantes[1]) {
      element += `
        <div class="contenedor_mensajeIzquierda">
            <div class="divChatEnviado">
              ${content.data[i].mensaje}
              <div class="divEnviado">${content.data[i].fecha} | ${content.data[i].hora}</div>
            </div>
        </div>`;
    } else if (content.data[i].emitidoPor != "Whatsapp") {
      element += `
      <div class="contenedor_mensajeDerecha">
          <div class="divChatRespondido">
            ${content.data[i].mensaje}
            <div class="divEnviado">${content.data[i].fecha} | ${content.data[i].hora}</div>
          </div>
      </div>
      `;
    } else if (content.data[i].emitidoPor === "Whatsapp") {
      element += `
      <div class="contenedor_mensaje">
          <div class="divChatAlerta">
                ${content.data[i].mensaje}
                <div class="divEnviado">${content.data[i].hora}</div>
          </div>
      </div>
      `;
    }
  }

  element += "</main>";

  document.body.innerHTML += element;
};

btnElegir.addEventListener("click", function () {
  fileInput.click();
});

btnSubmit.addEventListener("click", (e) => {
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target.result; // contenido del archivo
      const obj = convertir(fileContent);
      obj
        .then((result) => {
          document.getElementById("mainContainer").style.display = "none";
          generar(result);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    reader.onerror = (e) => {
      console.error("Ocurrio un error al leer el archivo");
    };
    reader.readAsText(file);
  } else {
    alert("Ingrese un archivo para leerlo.");
  }
});

fileInput.addEventListener("change", obtener);

dragArea.addEventListener("dragover", function (event) {
  event.preventDefault(); // Prevenir el comportamiento por defecto (como abrir el archivo)
  dragArea.style.border = "3px dashed #81e650"; // Cambio de estilo para indicar el área de drop
});

dragArea.addEventListener("dragleave", function (event) {
  dragArea.style.border = "3px dashed rgb(183, 176, 176)"; // Revertir el estilo cuando el archivo se sale del área
});

dragArea.addEventListener("drop", function (event) {
  event.preventDefault();
  dragArea.style.border = "4px dashed #81e650"; // Revertir el estilo

  // Obtener el archivo del evento de drop
  const file = event.dataTransfer.files[0];
  if (file) {
    // Establecer el archivo seleccionado en el input file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    obtener();
  }
});
