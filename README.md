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

1. Em *Releases → Draft a new release*, crie uma tag nova (ex.: `v1.0.1`) a partir da `main`.
2. Clique em **Generate release notes** e depois em **Publish release**.
3. Em ~4 minutos o workflow anexa ao release o `lucis-v1.0.1.apk` e o `lucis-v1.0.1.aab`, ambos assinados.

A tag vira o `versionName` do app.
