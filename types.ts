export interface BusinessStatusItem {
  b_no: string;
  b_stt: string; // e.g., "계속사업자"
  b_stt_cd: string; // e.g., "01"
  tax_type: string; // e.g., "부가가치세 일반과세자"
  tax_type_cd: string; // e.g., "01"
  end_dt: string;
  utcc_yn: string;
  tax_type_change_dt: string;
  invoice_apply_dt: string;
  rbf_tax_type: string;
  rbf_tax_type_cd: string;
}

export interface ApiResponse {
  request_cnt: number;
  match_cnt: number;
  status_code: string;
  data: BusinessStatusItem[];
}

export interface ApiError {
  msg: string;
}

export enum ProcessStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface LogItem extends BusinessStatusItem {
  id: string; // unique internal ID for rendering
  timestamp: number;
  isSuccess: boolean;
  errorMessage?: string;
}