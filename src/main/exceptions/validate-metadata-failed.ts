export class ValidateMetadataFailedError extends Error {
    constructor(meta: string) {
      super(`Validate metadata failed.\nmeta: ${meta}`);
    }
  }
  