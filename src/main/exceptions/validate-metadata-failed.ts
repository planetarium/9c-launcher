export class ValidateMetadataFailedError extends Error {
    constructor(meta: string) {
      super(`ValidateMetadata failed.\nmeta: ${meta}`);
    }
  }
  