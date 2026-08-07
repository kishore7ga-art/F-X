export {};

declare global {
  type PageProps<T = string> = {
    params: Promise<Record<string, string>>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  };
}
