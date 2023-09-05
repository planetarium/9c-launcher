declare module "refiner-js" {
  type IdOrEmail = { id: string } | { email: string };

  interface Methods {
    setProject(id: string): void;
    identifyUser(meta: IdOrEmail & Record<string, any>): void;
    resetUser(): void;
    trackEvent(event: string): void;
    showForm(surveyId: string, force?: boolean): void;
    dismissForm(surveyId: string): void;
    closeForm(surveyId: string): void;
    addToResponse(meta: any): void;
    stopPinging(): void;
  }

  interface Callbacks {
    onShow(surveyId: string): void;
    onDismiss(surveyId: string): void;
    onClose(surveyId: string): void;
    onComplete(surveyId: string, data: any): void;
  }

  function _refiner<T extends keyof Methods>(
    method: T,
    ...args: Parameters<Methods[T]>
  ): ReturnType<Methods[T]>;
  function _refiner<T extends keyof Callbacks>(
    callback: T,
    fn: Callbacks[T],
  ): void;

  export = _refiner;
}
