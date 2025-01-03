/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Id = string;
export type UserId = string;
export type CancelAt = string | null;
export type TrialEnd = string | null;
export type CreatedAt = string;
export type UpdatedAt = string;
export type CanceledAt = string | null;
export type TrialStart = string | null;
export type SubscriptionPlan = "BASIC" | "PREMIUM" | "ENTERPRISE";
export type CurrentPeriodEnd = string | null;
export type StripeCustomerId = string | null;
export type SubscriptionStatus = "ACTIVE" | "INACTIVE" | "TRIALING" | "CANCELLED";
export type CurrentPeriodStart = string | null;
export type StripeSubscriptionId = string | null;

export interface Subscriptions {
  id: Id;
  user_id: UserId;
  cancel_at?: CancelAt;
  trial_end?: TrialEnd;
  created_at: CreatedAt;
  updated_at: UpdatedAt;
  canceled_at?: CanceledAt;
  trial_start?: TrialStart;
  subscription_plan: SubscriptionPlan;
  current_period_end?: CurrentPeriodEnd;
  stripe_customer_id?: StripeCustomerId;
  subscription_status: SubscriptionStatus;
  current_period_start?: CurrentPeriodStart;
  stripe_subscription_id?: StripeSubscriptionId;
  [k: string]: unknown;
}
