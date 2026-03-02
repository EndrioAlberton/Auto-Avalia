# 🚀 Início Rápido - SELF

## ⚡ Comandos Essenciais

```bash
# 1. Entre na pasta do projeto
cd c:\Users\MAXIQUIM\Documents\novoprojeto

# 2. Instale as dependências
npm install

# 3. Execute o projeto
npm run dev
```

## 📋 Checklist de Configuração

### Antes de Começar
- [ ] Node.js 18+ instalado
- [ ] Conta no Firebase criada
- [ ] Editor de código (VS Code recomendado)

### Configuração Firebase (5 minutos)
1. [ ] Criar projeto no [Firebase Console](https://console.firebase.google.com/)
2. [ ] Ativar **Authentication** (Email/Password e Google)
3. [ ] Ativar **Firestore Database**
4. [ ] Copiar credenciais para `src/firebaseConfig.ts`
5. [ ] Publicar regras de segurança (copiar de `firestore.rules`)

### Primeiro Acesso
1. [ ] Executar `npm run dev`
2. [ ] Acessar `http://localhost:3000`
3. [ ] Criar primeira conta (usar "Secretaria/Rede")
4. [ ] No Firebase Console, mudar role para "admin"

## 🎯 Próximos Passos

1. **Leia a Documentação**
   - [GUIA_INSTALACAO.md](./GUIA_INSTALACAO.md) - Setup completo
   - [ARQUITETURA.md](./ARQUITETURA.md) - Arquitetura técnica
   - [README_COMPLETO.md](./README_COMPLETO.md) - Visão geral

2. **Configure o Firebase**
   - Siga o passo 2 do guia de instalação
   - Não esqueça de publicar as regras de segurança

3. **Personalize o Projeto**
   - Edite cores em `src/theme.ts`
   - Adicione logo em `public/`
   - Customize textos conforme sua instituição

4. **Desenvolva Funcionalidades**
   - Implemente páginas de questionários
   - Adicione gráficos nos relatórios
   - Crie sistema de convites
   - Implemente exportação de dados

## 📁 Arquivos Importantes

```
novoprojeto/
├── src/
│   ├── firebaseConfig.ts        ⚠️ CONFIGURE AQUI
│   ├── types/index.ts           📝 Tipos TypeScript
│   ├── services/                🔧 Lógica de negócio
│   ├── pages/                   📄 Páginas da aplicação
│   └── theme.ts                 🎨 Personalize cores
│
├── firestore.rules              🔒 Regras de segurança
├── firebase.json                ⚙️ Config do Firebase
├── package.json                 📦 Dependências
└── README.md                    📖 Documentação
```

## 🆘 Problemas Comuns

### "Firebase not initialized"
**Solução**: Configure as credenciais em `src/firebaseConfig.ts`

### "Permission denied" no Firestore
**Solução**: Publique as regras de `firestore.rules` no Firebase Console

### Erro ao fazer login
**Solução**: Verifique se Authentication está ativado no Firebase

### Página em branco
**Solução**: Limpe o cache do navegador e recarregue

## 💡 Dicas

- Use o navegador em modo **anônimo** para testar diferentes perfis
- Mantenha o **Firebase Console** aberto para monitorar dados
- Use as **DevTools do navegador** para debug
- Consulte a documentação do Firebase quando necessário

## 🎓 Aprenda Mais

- [React Docs](https://react.dev) - Documentação oficial do React
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Guia TypeScript
- [Firebase Docs](https://firebase.google.com/docs) - Documentação Firebase
- [Material-UI](https://mui.com) - Componentes Material-UI

## 📞 Suporte

Encontrou um problema? Verifique:
1. Console do navegador (F12)
2. Console do terminal
3. Logs no Firebase Console
4. Documentação do projeto

---

**Boa sorte com seu projeto! 🚀**

Desenvolvido por MAXIQUIM
