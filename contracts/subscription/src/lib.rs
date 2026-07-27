//! Stellar Drips — Soroban Subscription Contract
//!
//! Manages recurring payments on the Stellar network.
//! Subscribers deposit funds into the contract, which are then
//! disbursed to recipients on a schedule by an off-chain keeper.
//!
//! # Architecture
//!
//! Soroban has no native on-chain timer. Time-based execution
//! relies on ledger timestamps recorded during write operations
//! and an off-chain scheduler that calls `execute_payment` when
//! a subscription is due.
//!
//! # Security
//!
//! - Escrow model: contract only disburses funds the subscriber
//!   explicitly deposited.
//! - `payment_count` and `next_payment_time` prevent double
//!   execution for the same period.
//! - Only the subscriber can cancel their subscription and
//!   withdraw remaining escrow.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol,
};

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/// Status of a subscription.
#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SubscriptionStatus {
    Active,
    Cancelled,
    Expired,
}

/// Core subscription data stored on-chain.
#[contracttype]
#[derive(Debug, Clone)]
pub struct Subscription {
    pub subscriber: Address,
    pub recipient: Address,
    pub token: Address,
    pub amount: i128,
    pub interval_seconds: u64,
    pub next_payment_time: u64,
    pub escrow_balance: i128,
    pub payment_count: u64,
    pub status: SubscriptionStatus,
    pub created_at: u64,
    pub expiration_time: u64,
}

/// Key type for mapping subscription ID → Subscription.
#[contracttype]
pub struct SubscriptionKey {
    pub subscriber: Address,
    pub id: u32,
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/// Emitted when a new subscription is created.
pub const EVENT_SUBSCRIPTION_CREATED: Symbol = symbol_short!("sub_crt");
/// Emitted when a subscription is cancelled.
pub const EVENT_SUBSCRIPTION_CANCELLED: Symbol = symbol_short!("sub_cnc");
/// Emitted when a subscription expires.
pub const EVENT_SUBSCRIPTION_EXPIRED: Symbol = symbol_short!("sub_exp");
/// Emitted when a subscriber tops up escrow.
pub const EVENT_SUBSCRIPTION_TOP_UP: Symbol = symbol_short!("sub_top");
/// Emitted when a payment is successfully executed.
pub const EVENT_PAYMENT_EXECUTED: Symbol = symbol_short!("pay_exe");
/// Emitted when a payment attempt fails.
pub const EVENT_PAYMENT_FAILED: Symbol = symbol_short!("pay_fal");

// ---------------------------------------------------------------------------
// Contract errors
// ---------------------------------------------------------------------------

/// Contract-level error codes.
#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ContractError {
    NotFound = 1,
    NotAuthorized = 2,
    NotDue = 3,
    InsufficientEscrow = 4,
    Expired = 5,
    AlreadyCancelled = 6,
    InvalidParams = 7,
    TransferFailed = 8,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    // -----------------------------------------------------------------------
    // Write methods
    // -----------------------------------------------------------------------

    /// Create a new subscription.
    ///
    /// The `subscriber` authorizes and funds the initial escrow.
    /// The `recipient` receives payments.
    /// `token` is the Stellar Asset Contract address of the token to use
    /// (XLM via wrapped native, or a custom token).
    #[allow(unused_variables)]
    pub fn subscribe(
        env: Env,
        subscriber: Address,
        recipient: Address,
        token: Address,
        amount: i128,
        interval_seconds: u64,
        initial_escrow: i128,
        expiration_time: u64,
    ) -> u32 {
        todo!("implement subscribe")
    }

    /// Top up the escrow balance of an existing active subscription.
    #[allow(unused_variables)]
    pub fn top_up(env: Env, subscriber: Address, id: u32, amount: i128) {
        todo!("implement top_up")
    }

    /// Execute a single payment for a due subscription.
    ///
    /// Callable by anyone (off-chain keeper).
    /// Succeeds only if the subscription is due, active, and has sufficient
    /// escrow balance.
    #[allow(unused_variables)]
    pub fn execute_payment(env: Env, subscriber: Address, id: u32) {
        todo!("implement execute_payment")
    }

    /// Cancel an active subscription and refund remaining escrow to the
    /// subscriber.
    #[allow(unused_variables)]
    pub fn cancel(
        env: Env,
        subscriber: Address,
        id: u32,
        recipient: Address,
    ) {
        todo!("implement cancel")
    }

    // -----------------------------------------------------------------------
    // Read methods
    // -----------------------------------------------------------------------

    /// Get subscription details.
    #[allow(unused_variables)]
    pub fn get_subscription(
        env: Env,
        subscriber: Address,
        id: u32,
    ) -> Subscription {
        todo!("implement get_subscription")
    }

    /// Get the number of subscriptions for a given subscriber.
    #[allow(unused_variables)]
    pub fn subscription_count(env: Env, subscriber: Address) -> u32 {
        todo!("implement subscription_count")
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_placeholder() {
        // First test will be written in Phase 2
        assert!(true);
    }
}
