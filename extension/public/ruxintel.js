console.log("Ruxintel content loaded");

const checkInterval = 5000; // 5 segundos

function checkLocalStorage() {
  const jwt = localStorage.getItem("sessionToken");

  if (jwt) {
    chrome.runtime.sendMessage({ jwtToken: jwt }, function (response) {
      if (chrome.runtime.lastError) {
        console.error(
          "Erro ao enviar mensagem para a extensão:",
          chrome.runtime.lastError
        );
      } else {
        console.log(
          "JWT enviado para a extensão. Resposta:",
          response ? response.status : "sem resposta"
        );
      }
    });
  } else {
    console.log("Nenhum JWT encontrado no localStorage.");
  }
}

setInterval(checkLocalStorage, checkInterval);
