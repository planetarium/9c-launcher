export class CancellableExtractFailedError extends Error {
  constructor(targetDir: string, outputDir: string) {
    super(
      `Cancellable extract failed.\nurl: ${targetDir}\ndownloadPath: ${outputDir}`,
    );
  }
}
