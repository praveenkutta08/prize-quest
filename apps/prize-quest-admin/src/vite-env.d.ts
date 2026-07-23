/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When "1", start MSW and serve mock endpoints. Default on in dev. */
  readonly VITE_MOCK?: string;
  /** When "1", inject the mock backend's 5% failure rate (exercises error/retry states). */
  readonly VITE_MOCK_FAILURES?: string;
  /** Optional tenant id override for local demos (also read from `?tenant=`). */
  readonly VITE_TENANT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
