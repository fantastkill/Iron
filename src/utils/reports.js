export function peopleCsv(people, teachers) {
  // Evita injeção de fórmulas ao abrir o CSV em uma planilha.
  const cell = (value) => {
    let text = String(value ?? '');
    if (/^\s*[=+@-]|^[\t\r\n]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [
    ['Nome', 'E-mail', 'Plano', 'Professor', 'Situação'],
    ...people.map((p) => [
      p.name,
      p.email,
      p.plan,
      teachers.find((t) => t.id === p.teacherId)?.name || '',
      p.active ? 'Ativo' : 'Inativo',
    ]),
  ]
    .map((row) => row.map(cell).join(';'))
    .join('\r\n');
}
export function downloadReport(content, name) {
  const url = URL.createObjectURL(
    new Blob(['\ufeff', content], { type: 'text/csv;charset=utf-8;' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
