# Lucis

Jogo relaxante de reação em cadeia: toque uma vez, solte uma onda de luz e encadeie os orbes ao som de uma melodia.

## Estrutura

```
www/index.html            o jogo inteiro (HTML + canvas, sem dependências)
capacitor.config.json     id do app: br.com.claulis.lucis
android/                  projeto Android gerado pelo Capacitor
assets/                   ícone original e ícone 512 px da Play Store
.github/workflows/        build automático do APK e do AAB
```

## Rodar no navegador

Abra `www/index.html`.

## Gerar o app

Cada push na `main` roda o workflow **Android** (aba *Actions*) e publica os arquivos:

- `app-debug.apk`: para instalar direto no celular e testar
- `app-release.aab`: para enviar à Google Play (assinado se os secrets abaixo existirem)

Depois de mudar `www/`, rode `npm run sync` para copiar o jogo para o projeto Android.

## Assinatura (Google Play)

Em *Settings → Secrets and variables → Actions*, crie:

| Secret | Conteúdo |
|---|---|
| `LUCIS_KEYSTORE_BASE64` | o arquivo `.jks` em base64 |
| `LUCIS_KEYSTORE_PASSWORD` | senha do keystore |
| `LUCIS_KEY_ALIAS` | alias da chave |
| `LUCIS_KEY_PASSWORD` | senha da chave |

Guarde o `.jks` e as senhas fora do repositório.

## Lançar uma versão

1. Suba o `version` no `package.json` (ex.: `1.1.1`).
2. **Mudou algo nativo?** (pasta `android/`, plugins, `capacitor.config.json`) Coloque `nativeSince` igual à nova versão.
3. Faça push na `main`. O workflow cria o release `v1.1.1` com APK, AAB, `lucis-v1.1.1-web.zip` e `update.json`.

A tag vira o `versionName` do app.

## Atualização automática

Ao abrir, o app lê `releases/latest/download/update.json` (o repositório precisa ser **público**).

- **Só mudou o jogo** (`www/`): o app baixa o `.zip`, confere o SHA-256 e troca de versão sozinho. Na tela inicial a troca é imediata; no meio de uma partida, fica para a próxima abertura. A troca é transacional (via [`@capgo/capacitor-updater`](https://github.com/Cap-go/capacitor-updater)): se a versão nova não chamar `notifyAppReady()` em 10 s, o app volta para a anterior e não tenta aquela versão de novo.
- **Mudou algo nativo** (`nativeSince` maior que o APK instalado): aparece o botão *Atualizar*, que baixa o APK novo; o Android só instala se ele tiver a mesma assinatura.

Sem servidor da Capgo e sem telemetria: `statsUrl`, `updateUrl` e `channelUrl` vazios em `capacitor.config.json`.

Teste da lógica: `npx -y -p playwright npm test`.
