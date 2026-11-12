// A chave de leitura combina aluno, ficha e data; a escrita acontece no RPC do banco.
export const completionKey = (studentId, workoutId, date) => `${studentId}|${workoutId}|${date}`;
