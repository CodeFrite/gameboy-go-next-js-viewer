document.go = new Go();

async function init() {
  const result = await WebAssembly.instantiateStreaming(
    fetch("main.wasm"),
    document.go.importObject
  );
  document.go.run(result.instance);
}

init();
