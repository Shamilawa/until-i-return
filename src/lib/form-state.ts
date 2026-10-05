/** Result a server action hands back to its form via useActionState. */
export type FormState = { error?: string; success?: string } | null;

/** Login keeps the typed name so a wrong password does not clear it. */
export type LoginState = { error: string; username: string } | null;
