export {};

declare global {
  type PageProps = {
    params: Promise<Record<string, string>>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  };
}
