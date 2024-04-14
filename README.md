# Zap Scrapper Extension

Uma extensão para navegador capaz de raspar uma conversa aberta no WhatsApp. A extensão extrai o nome, a foto de perfil e o histório de mensagens do chat.

Esse projeto foi desenvolvido para o Challenge da Axur para o curso de Defesa Cibernética da FIAP.

O objetivo do Challenge era criar uma forma monitorar as conversas do usuário, para reduzir as chances de golpe via WhatsApp.

A minha ideia de solução foi criar uma extensão para o navegador, capaz de fazer essa raspagem de dados no WhatsApp, e formatar o conteúdo para o envio via API Rest.

A concepção inicial da extensão considera uma ação do usuário de denúncia/pergunta, em que o usuário, ao se sentir inseguro com uma conversa, possa abrir a extensão, reportar uma atividade maliciosa, e receber após alguns minutos uma resposta da análise, podendo ser via email ou até WhatsApp, dependendo do que vai ser integrado à extensão.

## Como rodar o projeto?

O projeto foi desenvolvido usando Vite, React e Typescript, buscando facilitar o desenvolvimento de uma interface amigável para interação do usuário. Sendo assim, para testar a extensão, será necessário clonar o repositório, instalar os pacotes e realizar o build do código.

Clonar repositório
```bash
git clone https://github.com/r4topunk/zap-scrapper-extension.git
cd zap-scrapper-extension
```

Instalar pacotes
```bash
npm install
```

Executar build
```bash
npm run build
```

Com isso, será gerada a pasta `dist` contendo a extensão.

## Como instalar no browser?

A extensão é baseada em Chrome, então necessita de um navegador baseado em Chromium para funcionar corretamente.

Abra a página de `Gerenciamento de Extensões` do navegador, habilite o modo de desenvolvimento no canto direito superior, clique no botão `Carregar sem compactação` e selecione a pasta `dist` criada durante a etapa de build.

A partir disso, a extensão está instalada e pronta para uso.

## Como integrar?

O código da extensão é uma prova de conceito, considerando que o código será utilizado em um ambiente coorporativo, é importante que o código seja clonado e sejam feitas as alterações necessárias para a integração com o endpoint do serviço de análise e resposta.