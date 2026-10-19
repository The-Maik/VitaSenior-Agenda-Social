import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';

const apiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'https://137.131.249.162.sslip.io/vitasenior/api',
);

String displayDate(String value) {
  final date = DateTime.tryParse(value);
  if (date == null) return value;
  String two(int number) => number.toString().padLeft(2, '0');
  return '${two(date.day)}/${two(date.month)}/${date.year} às ${two(date.hour)}:${two(date.minute)}';
}

void main() => runApp(const VitaApp());

class VitaApi {
  final _client = HttpClient()..connectionTimeout = const Duration(seconds: 10);

  Future<dynamic> call(String route, {Map<String, String>? form}) async {
    final uri = Uri.parse('$apiBase$route');
    final request = form == null ? await _client.getUrl(uri) : await _client.postUrl(uri);
    if (form != null) {
      request.headers.contentType = ContentType('application', 'x-www-form-urlencoded', charset: 'utf-8');
      request.write(form.entries.map((e) => '${Uri.encodeQueryComponent(e.key)}=${Uri.encodeQueryComponent(e.value)}').join('&'));
    }
    final response = await request.close().timeout(const Duration(seconds: 15));
    final body = await utf8.decoder.bind(response).join();
    final data = jsonDecode(body);
    if (response.statusCode >= 400) throw Exception(data['erro'] ?? 'Erro ${response.statusCode}');
    return data;
  }
}

class VitaApp extends StatelessWidget {
  const VitaApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'VitaSênior',
    theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff186047)), useMaterial3: true),
    home: const HomePage(),
  );
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final api = VitaApi();
  List<dynamic> activities = [];
  bool loading = true;
  String? error;

  @override
  void initState() { super.initState(); refresh(); }

  Future<void> refresh() async {
    setState(() { loading = true; error = null; });
    try {
      final items = await api.call('/activities') as List<dynamic>;
      if (mounted) setState(() => activities = items);
    } catch (e) {
      if (mounted) setState(() => error = '$e');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> openBooking([Map<String, dynamic>? activity]) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => BookingPage(api: api, activity: activity)));
    if (mounted) refresh();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('VitaSênior'), actions: [IconButton(tooltip: 'Atualizar', onPressed: refresh, icon: const Icon(Icons.refresh))]),
    body: RefreshIndicator(
      onRefresh: refresh,
      child: ListView(padding: const EdgeInsets.all(16), children: [
        Text('Atividades educativas', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 8),
        const Text('Encontros de leitura e bem-estar. Este aplicativo não oferece avaliação ou orientação clínica.'),
        const SizedBox(height: 16),
        OutlinedButton.icon(onPressed: () => openBooking(), icon: const Icon(Icons.confirmation_number_outlined), label: const Text('Consultar minha inscrição')),
        if (loading) const Center(child: CircularProgressIndicator()),
        if (error != null) Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        if (!loading && activities.isEmpty) const Padding(padding: EdgeInsets.all(20), child: Text('Ainda não há atividades cadastradas.')),
        for (final item in activities)
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item['titulo'], style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(item['descricao']),
            const SizedBox(height: 8),
            Text('${displayDate(item['data_hora'].toString())} · ${item['local']}'),
            Text('${item['vagas'] - item['inscritos']} vagas disponíveis'),
            const SizedBox(height: 8),
            FilledButton(onPressed: item['inscritos'] >= item['vagas'] ? null : () => openBooking(Map<String, dynamic>.from(item)), child: const Text('Inscrever-me')),
          ]))),
      ]),
    ),
  );
}

class BookingPage extends StatefulWidget {
  const BookingPage({super.key, required this.api, this.activity});
  final VitaApi api;
  final Map<String, dynamic>? activity;
  @override
  State<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends State<BookingPage> {
  final name = TextEditingController();
  final code = TextEditingController();
  Map<String, dynamic>? booking;
  String? message;
  bool busy = false;

  @override
  void dispose() { name.dispose(); code.dispose(); super.dispose(); }

  Future<void> run(Future<dynamic> Function() action) async {
    setState(() { busy = true; message = null; });
    try {
      final result = await action();
      if (mounted) setState(() {
        booking = result is Map<String, dynamic> ? result : null;
        if (booking != null) {
          code.text = booking!['codigo'];
          name.text = booking!['nome'];
        }
        message = booking != null ? 'Operação concluída. Guarde o código da inscrição.' : 'Inscrição cancelada.';
      });
    } catch (e) {
      if (mounted) setState(() => message = '$e');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  bool validName() => name.text.trim().length >= 2 && name.text.trim().length <= 60;

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.activity == null ? 'Minha inscrição' : 'Inscrição')),
    body: ListView(padding: const EdgeInsets.all(20), children: [
      if (widget.activity != null) Text(widget.activity!['titulo'], style: Theme.of(context).textTheme.headlineSmall),
      const SizedBox(height: 12),
      TextField(controller: name, maxLength: 60, decoration: const InputDecoration(labelText: 'Nome ou apelido', border: OutlineInputBorder())),
      if (widget.activity != null) FilledButton(onPressed: busy ? null : () {
        if (!validName()) { setState(() => message = 'Informe um nome de 2 a 60 caracteres.'); return; }
        run(() async => Map<String, dynamic>.from(await widget.api.call('/bookings', form: {'atividade_id': '${widget.activity!['id']}', 'nome': name.text.trim()})));
      }, child: const Text('Confirmar inscrição')),
      const SizedBox(height: 20),
      TextField(controller: code, maxLength: 32, decoration: const InputDecoration(labelText: 'Código da inscrição', border: OutlineInputBorder())),
      OutlinedButton(onPressed: busy ? null : () => run(() async => Map<String, dynamic>.from(await widget.api.call('/bookings/lookup', form: {'codigo': code.text.trim()}))), child: const Text('Consultar código')),
      if (booking != null) ...[
        const SizedBox(height: 16),
        SelectableText('Código: ${booking!['codigo']}'),
        Text('Atividade: ${booking!['atividade']}'),
        Text('Nome: ${booking!['nome']}'),
        const SizedBox(height: 12),
        OutlinedButton(onPressed: busy ? null : () {
          if (!validName()) { setState(() => message = 'Informe um nome de 2 a 60 caracteres.'); return; }
          run(() async => Map<String, dynamic>.from(await widget.api.call('/bookings/update', form: {'codigo': code.text.trim(), 'nome': name.text.trim()})));
        }, child: const Text('Alterar nome')),
        TextButton(onPressed: busy ? null : () async {
          final confirmed = await showDialog<bool>(context: context, builder: (dialogContext) => AlertDialog(
            title: const Text('Cancelar inscrição?'),
            content: const Text('Sua vaga será liberada e este código deixará de funcionar.'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Voltar')),
              FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Cancelar inscrição')),
            ],
          ));
          if (confirmed != true || !mounted) return;
          await run(() async {
            await widget.api.call('/bookings/delete', form: {'codigo': code.text.trim()});
            return null;
          });
        }, child: const Text('Cancelar inscrição')),
      ],
      if (busy) const Center(child: CircularProgressIndicator()),
      if (message != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(message!)),
      const SizedBox(height: 20),
      const Text('O código permite consultar, alterar e cancelar a inscrição. Guarde-o em local seguro.'),
    ]),
  );
}
