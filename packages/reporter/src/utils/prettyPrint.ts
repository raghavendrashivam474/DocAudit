/**
 * Prints a JSON string to stdout.
 *
 * Thin wrapper kept separate so JsonReporter never touches process.stdout.
 */
export function prettyPrint(json: string): void {
  console.log(json);
}
