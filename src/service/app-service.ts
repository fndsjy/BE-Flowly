// src/service/application-service.ts
export class ApplicationService {
  static getRootMessage() {
    return {
      status: "Flowly GO!",
      message: "Flowly Domas' API is up and running!"
    };
  }
}