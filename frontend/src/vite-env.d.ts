/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEATHERXM_API_KEY: string
  readonly VITE_FLOW_ACCESS_NODE: string
  readonly VITE_FLOW_NETWORK: string
  readonly VITE_INSURANCE_POOL_ADDRESS: string
  readonly VITE_ORACLE_CONTRACT_ADDRESS: string
  readonly VITE_XINSURE_CONTRACT_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}