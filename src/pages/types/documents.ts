/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Id = string;
export type ClientId = string;
export type FileName = string;
export type FilePath = string;
/**
 * File size in bytes
 */
export type FileSize = number;
export type MimeType = "application/pdf";
export type CreatedAt = string;
export type UpdatedAt = string;
export type DocumentType =
  | "BANK_STATEMENT"
  | "PAYSLIP"
  | "UTILITY_BILL"
  | "COUNCIL_TAX"
  | "MORTGAGE_STATEMENT"
  | "CREDIT_CARD_STATEMENT"
  | "INVESTMENT_STATEMENT"
  | "PENSION_STATEMENT"
  | "TAX_DOCUMENT"
  | "OTHER";
export type DocumentStatus = "PENDING" | "PROCESSING" | "PROCESSED" | "ERROR";
export type ErrorType = "INVALID_DATE_FORMAT" | "MISSING_REQUIRED_FIELD" | "OTHER";
export type Message = string;
export type ValidationErrors = Error[];

export interface Documents {
  id: Id;
  client_id: ClientId;
  file_name: FileName;
  file_path: FilePath;
  file_size: FileSize;
  mime_type: MimeType;
  created_at: CreatedAt;
  updated_at: UpdatedAt;
  document_type: DocumentType;
  document_status: DocumentStatus;
  validation_errors?: ValidationErrors;
  [k: string]: unknown;
}
export interface Error {
  type: ErrorType;
  message: Message;
  [k: string]: unknown;
}