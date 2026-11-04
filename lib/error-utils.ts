/** Convierte errores del cliente y PostgREST en mensajes legibles. */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const value = error as Record<string, unknown>;
    for (const field of ['message', 'details', 'hint']) {
      if (typeof value[field] === 'string' && value[field]) return value[field] as string;
    }
  }
  return 'No se pudo completar la operación. Vuelve a intentarlo.';
}
