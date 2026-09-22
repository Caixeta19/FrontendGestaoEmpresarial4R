# ⚡ Syscor — Frontend

[![React](https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Lucide Icons](https://img.shields.io/badge/Icons-Lucide_React-F56565?style=for-the-badge)](https://lucide.dev/)
[![Status](https://img.shields.io/badge/Ambiente-Demonstração%20%2F%20Mock-blueviolet?style=for-the-badge)](#)

Interface web moderna do ecossistema **Syscor (4R Solutions)**, projetada para gestão de vendas de telecomunicações, controle documental de protocolos (GED/NEXT), monitoramento de estoque com seriais/IMEI e comissões de parceiros.

---

## 📌 Sumário

- [Visão Geral e Recursos](#-visão-geral-e-recursos)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Arquitetura e Estrutura de Pastas](#-arquitetura-e-estrutura-de-pastas)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Sistema de Temas (Claro / Escuro)](#-sistema-de-temas-claro--escuro)
- [Integração com Backend](#-integração-com-backend)
- [Boas Práticas de Commit e Git](#-boas-práticas-de-commit-e-git)

---

## 🚀 Visão Geral e Recursos

- **PDV / Lançamento de Vendas:** Venda guiada por categorias (Produtos com validação de IMEI, Serviços/Planos Vivo com ICCID, Acessórios e Recargas) com controle de formas de pagamento e parcelamento.
- **Gestão Documental:** Pesquisa e conferência de protocolos de ativação (GED/RPON/360), validação de linha ativa, status BKO e motivos de cancelamento.
- **Controle de Estoque:** Rastreamento de saldos por SKU/código de barras, seriais disponíveis e status de ruptura em tempo real.
- **Power BI / Comitê Diário:** Dashboards integrados para acompanhamento de metas, atingimento diário e remuneração variável.
- **WhatsApp CRM & Mailing:** Gestão rápida de leads e histórico de interações.

---

## 🛠 Tecnologias Utilizadas

- **Core:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Roteamento:** [React Router DOM v6](https://reactrouter.com/) (configurado com `HashRouter` para compatibilidade total com deploys em hospedagens estáticas/Electron)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Estilização:** CSS Variables com tokens semânticos (`data-theme`) e Tailwind CSS
- **Manipulação de Arquivos:** `xlsx` para importação/leitura de planilhas de inventário

---

## 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- **[Node.js](https://nodejs.org/)** (versão `18.x` ou superior recomendada)
- **npm** (versão `9.x` ou superior) ou **yarn** / **pnpm**
- **Git**

---

## 💻 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/SEU-USUARIO/syscor-frontend.git](https://github.com/SEU-USUARIO/syscor-frontend.git)
   cd syscor-frontend