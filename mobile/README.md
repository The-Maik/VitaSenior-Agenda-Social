# Aplicativo VitaSênior

Aplicativo Flutter para Android. Consulta atividades publicadas pela administração e permite criar, consultar, alterar e cancelar inscrição por código. O código de inscrição funciona como credencial: guarde-o após o cadastro.

## Executar

```sh
flutter pub get
flutter run --dart-define=API_BASE=https://137.131.249.162.sslip.io/vitasenior/api
```

O [APK de demonstração](https://github.com/The-Maik/VitaSenior-Agenda-Social/releases/download/v1.0.0/vitasenior.apk) está publicado na versão `v1.0.0` deste repositório e na instância OCI. Para gerar novamente, execute `flutter build apk --release`. O projeto Android gerado pelo Flutter está em `android/`. O endereço da API pode ser trocado no build com `--dart-define=API_BASE=https://seu-dominio/vitasenior/api`. A versão de demonstração usa a chave de depuração padrão do projeto Flutter; uma distribuição permanente requer chave de assinatura própria.

O app não pede nem armazena dados de saúde. Ele não salva o código de inscrição no aparelho; para consultar depois, o participante precisa ter guardado o código.
