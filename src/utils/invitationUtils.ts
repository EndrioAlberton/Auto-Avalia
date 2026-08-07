/**
 * ID determinístico do convite.
 *
 * As regras do Firestore não fazem query, só `exists()` em caminho exato — é
 * isso que permite validar, na hora em que o professor grava seu `schoolId`,
 * que existe um convite daquela escola para o e-mail dele.
 *
 * O formato precisa bater exatamente com `invitedToSchool()` em
 * firestore.rules, que monta `schoolId + '__' + request.auth.token.email.lower()`.
 * Se um dos lados mudar, todo aceite de convite quebra.
 */
export function invitationId(schoolId: string, email: string): string {
  return `${schoolId}__${email.trim().toLowerCase()}`;
}
