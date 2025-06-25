const container = document.getElementById("puzzle-container");
const img = document.getElementById("source-image");

const imagenesDisponibles = [
  "img/animal1.jpg",
  "img/animal2.jpg",
  "img/animal3.jpg",
  "img/animal4.jpg", // Agrega aquí las que tengas en tu carpeta
];

const niveles = {
  facil: 3,
  intermedio: 5,
  avanzado: 8,
};

let size;
let piezas = [];
let emptyIndex = 0;
let imagenCargada = null;

function elegirImagenAleatoria() {
  const i = Math.floor(Math.random() * imagenesDisponibles.length);
  return imagenesDisponibles[i];
}

function cargarImagen() {
  const ruta = elegirImagenAleatoria();
  const nuevaImagen = new Image();
  nuevaImagen.src = ruta;

  nuevaImagen.onload = () => {
    img.src = ruta;
    imagenCargada = ruta;
    generarRompecabezas();
  };

  nuevaImagen.onerror = () => {
    alert(
      "No se pudo cargar la imagen. Verifica que exista en la carpeta img/"
    );
  };
}

function generarRompecabezas() {
  size = niveles[document.getElementById("level").value];
  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  piezas = [];
  container.innerHTML = "";

  const piezaSize = 600 / size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      const pieza = document.createElement("div");
      pieza.classList.add("piece");
      pieza.style.width = `${piezaSize}px`;
      pieza.style.height = `${piezaSize}px`;

      if (index === size * size - 1) {
        pieza.classList.add("empty");
        pieza.style.background = "white";
        piezas.push(pieza);
        continue;
      }

      pieza.style.backgroundImage = `url(${imagenCargada})`;
      pieza.style.backgroundPosition = `-${piezaSize * x}px -${
        piezaSize * y
      }px`;
      pieza.style.backgroundSize = `600px 600px`;
      piezas.push(pieza);
    }
  }

  const sinVacia = piezas.slice(0, -1).sort(() => Math.random() - 0.5);
  piezas = [...sinVacia, piezas[piezas.length - 1]];
  emptyIndex = piezas.length - 1;

  renderizar();
}

function renderizar() {
  container.innerHTML = "";
  piezas.forEach((pieza, i) => {
    pieza.onclick = () => intentarMover(i);
    container.appendChild(pieza);
  });
}

function intentarMover(i) {
  const x1 = i % size;
  const y1 = Math.floor(i / size);
  const x2 = emptyIndex % size;
  const y2 = Math.floor(emptyIndex / size);

  const adyacente = Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;
  if (adyacente) {
    [piezas[i], piezas[emptyIndex]] = [piezas[emptyIndex], piezas[i]];
    emptyIndex = i;
    renderizar();
  }
}

window.onload = cargarImagen;
