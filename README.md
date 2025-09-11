# Bluemine Frontend

Este é o repositório do frontend do Bluemine, um sistema de gestão de projetos, desenvolvido para ser robusto, escalável e de fácil manutenção.

## Funcionalidades Implementadas

### Autenticação e Usuários

- **Login e Registro:** Sistema completo de autenticação com login e registro de novos usuários.
- **Logout:** Funcionalidade para encerrar a sessão do usuário de forma segura.
- **Gerenciamento de Usuários:** Tela para administradores visualizarem os usuários cadastrados no sistema.
- **Controle de Acesso por Permissão:** O sistema utiliza um mecanismo de permissões para controlar o acesso às rotas e funcionalidades, garantindo que cada tipo de usuário (Desenvolvedor, Gerente, Admin) veja apenas o que lhe é permitido.

### Projetos e Tarefas

- **CRUD de Projetos:** Gerentes podem criar, visualizar, editar e excluir projetos.
- **Atribuição de Desenvolvedores:** Gerentes podem atribuir desenvolvedores a projetos específicos, definindo seus papéis (Visualizador, Colaborador, Mantenedor).
- **CRUD de Tarefas:** Gerentes e administradores podem criar, visualizar, editar e excluir tarefas, atribuindo-as a projetos e a um desenvolvedor responsável.
- **Visualização de Tarefas (Kanban):** Desenvolvedores têm uma tela "Minhas Tarefas" no estilo Kanban, onde podem visualizar suas tarefas e alterar o status (A Fazer, Em Progresso, Revisão, Concluído) arrastando e soltando ou por um seletor.

### Dashboards

- **Dashboard Gerencial:** Uma visão geral para gerentes com estatísticas sobre projetos ativos, tarefas atrasadas e concluídas, além de gráficos sobre o status dos projetos e o progresso das tarefas.
- **Dashboard do Desenvolvedor:** Um painel para desenvolvedores com um resumo de suas tarefas (A Fazer, Em Progresso, Atrasadas) e gráficos de tarefas por prioridade e próximos vencimentos.

## Decisões Técnicas

- **Framework**: O [React](https://react.dev/) foi utilizado com o [Vite](https://vitejs.dev/) como ferramenta de build, proporcionando um ambiente de desenvolvimento rápido e otimizado.

- **Gerenciamento de Estado**: Para o gerenciamento de estado global, especialmente da autenticação, foi escolhido o [Zustand](https://zustand-demo.pmnd.rs/). Sua simplicidade e API mínima o tornam uma alternativa leve ao Redux.

- **UI Kit**: A biblioteca de componentes [Mantine](https://mantine.dev/) foi utilizada para a construção da interface, oferecendo um rico conjunto de componentes, hooks e um sistema de temas.

- **Roteamento**: O [React Router DOM](https://reactrouter.com/) é responsável pelo gerenciamento das rotas da aplicação, incluindo rotas protegidas que verificam a autenticação do usuário.

- **Comunicação com API**: O [Axios](https://axios-http.com/) foi utilizado para as requisições HTTP. Foi configurado um interceptor para injetar o token de autenticação e lidar com a renovação de tokens (refresh token).

- **Estilização**: A estilização é feita primariamente com o sistema do Mantine, complementado por **PostCSS** e **Tailwind CSS** para utilitários e customizações específicas.

## Instruções de Instalação e Execução

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento.

### Pré-requisitos

- Node.js (versão 18.x ou superior)
- Yarn

### Passos

1.  **Clone o repositório:**

    ```bash
    git clone [https://github.com/gabrielhtres/bluemine-frontend.git](https://github.com/gabrielhtres/bluemine-frontend.git)
    cd bluemine-frontend
    ```

2.  **Instale as dependências:**

    ```bash
    yarn install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo `.env` na raiz do projeto, copiando o exemplo de `.env.example`:

    ```bash
    cp .env.example .env
    ```

    Abra o arquivo `.env` e defina a URL da sua API backend:

    ```
    VITE_API_URL=http://localhost:3000/
    ```

4.  **Execute o projeto:**

    Para iniciar o servidor de desenvolvimento, execute:

    ```bash
    yarn dev
    ```

    O projeto estará disponível em `http://localhost:5173` (ou em outra porta, se a 5173 estiver em uso).

### Outros Scripts

- **Build para produção:**

  ```bash
  yarn build
  ```

- **Executar linter:**

  ```bash
  yarn lint
  ```

- **Visualizar o build de produção:**

  ```bash
  yarn preview
  ```
