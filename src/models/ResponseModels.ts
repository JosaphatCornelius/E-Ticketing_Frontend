export type ResponseModels<T> = {
  statusCode: number;
  message: string;
  data: Array<T>;
}