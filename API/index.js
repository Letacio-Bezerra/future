// Importa módulos necessários da biblioteca '@google/generative-ai'
import {
  GoogleGenerativeAI, // Classe para interagir com o Google Generative AI
  HarmCategory,       // Enum para categorias de conteúdo prejudicial
  HarmBlockThreshold  // Enum para os níveis de bloqueio de conteúdo prejudicial
} from '@google/generative-ai';

// Importa a biblioteca 'chalk' para estilização de texto no console
import chalk from 'chalk';

// Importa a biblioteca 'ora' para exibir uma mensagem de carregamento (spinner)
import ora from 'ora';

// Importa a biblioteca 'prompt-sync' para ler entradas do usuário sincronicamente
import prompt from 'prompt-sync';

// Cria uma instância da função prompt-sync para ler entradas do usuário
const promptSync = prompt();

// Define o nome do modelo que será utilizado na geração de respostas
const MODEL_NAME = "gemini-1.0-pro";

// Define a chave da API para autenticação com o Google Generative AI
const API_KEY = "AIAIzaSyAx7cixCAG1VNvLg1DwBfkbkvVdbW8n7bkPg";

// Configuração de geração para o modelo, ajustando parâmetros como temperatura e tokens de saída
const GENERATION_CONFIG = {
  temperature: 0.9,             // Define a criatividade da resposta; valores mais altos resultam em respostas mais variadas
  topK: 1,                      // Controla o número de palavras candidatas consideradas durante a geração
  topP: 1,                      // Controla a probabilidade cumulativa das palavras candidatas consideradas
  maxOutputTokens: 2048        // Define o número máximo de tokens (palavras) na resposta gerada
};

// Configuração de segurança para filtrar conteúdo prejudicial com diferentes categorias e limiares
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,           // Categoria de conteúdo prejudicial: assédio
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE       // Bloqueia conteúdo com nível médio de gravidade e acima
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,          // Categoria de conteúdo prejudicial: discurso de ódio
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,    // Categoria de conteúdo prejudicial: conteúdo sexual explícito
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,    // Categoria de conteúdo prejudicial: conteúdo perigoso
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  }
];

async function runChat() {
  const spinner = ora('Inicializando chat...').start();

  // Inicializa cliente IA
  const genAI = new GoogleGenerativeAI(API_KEY);

  // Obtém o modelo
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  // Inicia sessão de chat
  const chat = model.startChat({
    generationConfig: GENERATION_CONFIG,
    safetySettings: SAFETY_SETTINGS,
    history: [],
  });

  spinner.stop();
  console.log(chalk.blue('\n🤖 Chat iniciado! Digite sua mensagem abaixo.'));
  console.log(chalk.gray('(Digite "exit" para sair)\n'));

  const prompt = promptSync();

  // Loop principal do chat
  while (true) {
    const userInput = prompt(chalk.green('Você: '));

    if (userInput.toLowerCase() === 'exit') {
      console.log(chalk.yellow('\n👋 Até breve!'));
      process.exit(0);
    }

    const thinking = ora('Pensando...').start();

    try {
      const result = await chat.sendMessage(userInput);
      const response = await result.response;
      const text = response.text();

      thinking.stop();
      console.log(chalk.cyan('\nIA: ') + text + '\n');
    } catch (error) {
      thinking.stop();
      console.error(chalk.red('Erro ao gerar resposta:'), error);
    }
  }
}

runChat();