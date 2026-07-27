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
    contract, contractimpl, contracttype, panic_with_error, symbol_short, token, Address, Env,
    Error, Symbol,
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

/// Internal storage key type.
#[contracttype]
pub enum DataKey {
    /// Number of subscriptions created for an address.
    Counter(Address),
    /// Full subscription record keyed by (subscriber, id).
    Sub(SubscriptionKey),
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

impl From<ContractError> for Error {
    fn from(e: ContractError) -> Self {
        Error::from_contract_error(e as u32)
    }
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
    ///
    /// ### Pre-requisites
    ///
    /// The `subscriber` must have previously approved this contract (or
    /// otherwise authorised) enough tokens so the token contract's
    /// `transfer` call succeeds.
    #[allow(clippy::too_many_arguments)]
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
        // Require the subscriber's authorisation for this invocation.
        subscriber.require_auth();

        // -- Parameter validation -------------------------------------------
        if amount <= 0 || interval_seconds == 0 {
            panic_with_error!(&env, ContractError::InvalidParams);
        }

        if initial_escrow < amount {
            panic_with_error!(&env, ContractError::InvalidParams);
        }

        let now = env.ledger().timestamp();
        if expiration_time <= now {
            panic_with_error!(&env, ContractError::InvalidParams);
        }

        // -- Generate subscription id ---------------------------------------
        let count_key = DataKey::Counter(subscriber.clone());
        let mut count: u32 = env.storage().instance().get(&count_key).unwrap_or(0);
        let id = count;
        count += 1;
        env.storage().instance().set(&count_key, &count);

        // -- Build & persist subscription -----------------------------------
        let subscription = Subscription {
            subscriber: subscriber.clone(),
            recipient,
            token: token.clone(),
            amount,
            interval_seconds,
            next_payment_time: now + interval_seconds,
            escrow_balance: initial_escrow,
            payment_count: 0,
            status: SubscriptionStatus::Active,
            created_at: now,
            expiration_time,
        };

        let sub_key = DataKey::Sub(SubscriptionKey {
            subscriber: subscriber.clone(),
            id,
        });
        env.storage().instance().set(&sub_key, &subscription);

        // -- Transfer initial escrow from subscriber -> contract ------------
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&subscriber, &contract_address, &initial_escrow);

        // -- Emit event ----------------------------------------------------
        #[allow(deprecated)]
        env.events().publish(
            (EVENT_SUBSCRIPTION_CREATED, subscriber, id),
            initial_escrow,
        );

        id
    }

    /// Top up the escrow balance of an existing active subscription.
    pub fn top_up(
        env: Env,
        subscriber: Address,
        id: u32,
        amount: i128,
    ) {
        subscriber.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, ContractError::InvalidParams);
        }

        let key = DataKey::Sub(SubscriptionKey {
            subscriber: subscriber.clone(),
            id,
        });
        let mut sub: Subscription = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotFound));

        if sub.status != SubscriptionStatus::Active {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        // Transfer tokens from subscriber → contract.
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &sub.token);
        token_client.transfer(&subscriber, &contract_address, &amount);

        // Update escrow balance.
        sub.escrow_balance += amount;
        env.storage().instance().set(&key, &sub);

        // Emit event.
        #[allow(deprecated)]
        env.events().publish((EVENT_SUBSCRIPTION_TOP_UP, subscriber, id), amount);
    }

    /// Execute a single payment for a due subscription.
    ///
    /// Callable by anyone (off-chain keeper).
    /// Succeeds only if the subscription is due, active, and has sufficient
    /// escrow balance.
    pub fn execute_payment(
        env: Env,
        subscriber: Address,
        id: u32,
    ) {
        let key = DataKey::Sub(SubscriptionKey {
            subscriber: subscriber.clone(),
            id,
        });
        let mut sub: Subscription = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotFound));

        if sub.status != SubscriptionStatus::Active {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }

        let now = env.ledger().timestamp();

        // Check expiration first — if expired, transition state and stop.
        if now >= sub.expiration_time {
            sub.status = SubscriptionStatus::Expired;
            env.storage().instance().set(&key, &sub);
            #[allow(deprecated)]
            env.events().publish(
                (EVENT_SUBSCRIPTION_EXPIRED, subscriber, id),
                sub.escrow_balance,
            );
            return;
        }

        // Must be due.
        if now < sub.next_payment_time {
            panic_with_error!(&env, ContractError::NotDue);
        }

        // Must have sufficient escrow balance.
        if sub.escrow_balance < sub.amount {
            panic_with_error!(&env, ContractError::InsufficientEscrow);
        }

        // Transfer amount from contract → recipient.
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &sub.token);
        token_client.transfer(&contract_address, &sub.recipient, &sub.amount);

        // Update subscription state.
        sub.escrow_balance -= sub.amount;
        sub.payment_count += 1;
        sub.next_payment_time = now + sub.interval_seconds;
        env.storage().instance().set(&key, &sub);

        // Emit event.
        #[allow(deprecated)]
        env.events().publish(
            (EVENT_PAYMENT_EXECUTED, subscriber, id),
            (sub.amount, sub.escrow_balance),
        );
    }

    /// Cancel an active subscription and refund remaining escrow to the
    /// subscriber.
    pub fn cancel(_env: Env, _subscriber: Address, _id: u32, _recipient: Address) {
        todo!("implement cancel")
    }

    // -----------------------------------------------------------------------
    // Read methods
    // -----------------------------------------------------------------------

    /// Get subscription details.
    pub fn get_subscription(env: Env, subscriber: Address, id: u32) -> Subscription {
        let key = DataKey::Sub(SubscriptionKey { subscriber, id });
        env.storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotFound))
    }

    /// Get the number of subscriptions for a given subscriber.
    pub fn subscription_count(env: Env, subscriber: Address) -> u32 {
        let key = DataKey::Counter(subscriber);
        env.storage().instance().get(&key).unwrap_or(0)
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as AddressTestTrait, Ledger},
        token::{self, StellarAssetClient},
    };

    /// Shared test harness: creates an environment with a minted token,
    /// funded subscriber, and a fixed ledger timestamp.
    fn setup_env() -> (Env, Address, Address, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);

        let stellar = env.register_stellar_asset_contract_v2(admin.clone());
        let token = stellar.address();

        // Mint 10_000 tokens to subscriber.
        let sac = StellarAssetClient::new(&env, &token);
        sac.mint(&subscriber, &10_000_000_000);

        // Pin a deterministic ledger timestamp.
        env.ledger().with_mut(|li| {
            li.timestamp = 1_700_000_000;
        });

        (env, subscriber, recipient, token, admin)
    }

    /// Deploy the subscription contract, returning (client, contract_address).
    fn deploy_contract(env: &Env) -> (SubscriptionContractClient<'_>, Address) {
        let contract_id = env.register(SubscriptionContract, ());
        let client = SubscriptionContractClient::new(env, &contract_id);
        (client, contract_id)
    }

    // ======================================================================
    // subscribe — success paths
    // ======================================================================

    #[test]
    fn test_subscribe_creates_subscription_and_transfers_tokens() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, contract_id) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,              // 100  XLM per payment
            &86_400,                   // 24 h interval
            &500_000_000,              // 500  XLM initial escrow
            &(now + 86_400 * 30),      // 30 d expiration
        );

        assert_eq!(id, 0);

        // Subscription stored correctly.
        let sub = client.get_subscription(&subscriber, &id);
        assert_eq!(sub.subscriber, subscriber);
        assert_eq!(sub.recipient, recipient);
        assert_eq!(sub.token, token);
        assert_eq!(sub.amount, 100_000_000);
        assert_eq!(sub.interval_seconds, 86_400);
        assert_eq!(sub.next_payment_time, now + 86_400);
        assert_eq!(sub.escrow_balance, 500_000_000);
        assert_eq!(sub.payment_count, 0);
        assert_eq!(sub.status, SubscriptionStatus::Active);
        assert_eq!(sub.created_at, now);
        assert_eq!(sub.expiration_time, now + 86_400 * 30);

        // Tokens moved from subscriber to contract.
        let token_client = token::Client::new(&env, &token);
        assert_eq!(token_client.balance(&subscriber), 9_500_000_000);
        assert_eq!(token_client.balance(&contract_id), 500_000_000);
    }

    #[test]
    fn test_subscribe_multiple_subscriptions_for_same_subscriber() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, contract_id) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id0 = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &50_000_000,
            &3600,
            &100_000_000,
            &(now + 86_400 * 30),
        );
        let id1 = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &75_000_000,
            &7200,
            &200_000_000,
            &(now + 86_400 * 60),
        );

        assert_eq!(id0, 0);
        assert_eq!(id1, 1);
        assert_eq!(client.subscription_count(&subscriber), 2);

        // Each subscription has its own data.
        let s0 = client.get_subscription(&subscriber, &0);
        assert_eq!(s0.amount, 50_000_000);
        assert_eq!(s0.escrow_balance, 100_000_000);

        let s1 = client.get_subscription(&subscriber, &1);
        assert_eq!(s1.amount, 75_000_000);
        assert_eq!(s1.escrow_balance, 200_000_000);

        // Total escrow transferred.
        let t = token::Client::new(&env, &token);
        assert_eq!(t.balance(&contract_id), 300_000_000);
        assert_eq!(t.balance(&subscriber), 9_700_000_000);
    }

    #[test]
    fn test_subscription_count_independent_per_subscriber() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let subscriber2 = Address::generate(&env);

        let sac2 = StellarAssetClient::new(&env, &token);
        sac2.mint(&subscriber2, &10_000_000_000);

        let (client, _contract_id) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        // Subscriber A — 2 subs.
        client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &50_000_000,
            &3600,
            &100_000_000,
            &(now + 86_400 * 30),
        );
        client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &75_000_000,
            &7200,
            &200_000_000,
            &(now + 86_400 * 60),
        );

        // Subscriber B — 1 sub.
        client.subscribe(
            &subscriber2,
            &recipient,
            &token,
            &30_000_000,
            &3600,
            &50_000_000,
            &(now + 86_400 * 30),
        );

        assert_eq!(client.subscription_count(&subscriber), 2);
        assert_eq!(client.subscription_count(&subscriber2), 1);
    }

    // ======================================================================
    // subscribe — error paths
    // ======================================================================

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_subscribe_amount_zero_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, _) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &0,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );
    }

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_subscribe_interval_zero_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, _) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &0,
            &500_000_000,
            &(now + 86_400 * 30),
        );
    }

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_subscribe_escrow_less_than_amount_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, _) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &500_000_000,
            &86_400,
            &100_000_000,  // initial_escrow < amount
            &(now + 86_400 * 30),
        );
    }

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_subscribe_expiration_in_past_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, _) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now - 1),  // expiration ≤ now
        );
    }

    // ======================================================================
    // get_subscription — error paths
    // ======================================================================

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_get_subscription_not_found_fails() {
        let (env, subscriber, _, _, _) = setup_env();
        let (client, _) = deploy_contract(&env);

        client.get_subscription(&subscriber, &999);
    }

    // ======================================================================
    // subscription_count — edge cases
    // ======================================================================

    #[test]
    fn test_subscription_count_zero_when_none() {
        let (env, subscriber, _, _, _) = setup_env();
        let (client, _) = deploy_contract(&env);

        assert_eq!(client.subscription_count(&subscriber), 0);
    }

    // ======================================================================
    // top_up — success paths
    // ======================================================================

    #[test]
    fn test_top_up_increases_escrow_and_transfers_tokens() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, contract_id) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        // Top up 200 more tokens.
        client.top_up(&subscriber, &id, &200_000_000);

        let sub = client.get_subscription(&subscriber, &id);
        assert_eq!(sub.escrow_balance, 700_000_000);

        let t = token::Client::new(&env, &token);
        assert_eq!(t.balance(&contract_id), 700_000_000);
        assert_eq!(t.balance(&subscriber), 9_300_000_000);
    }

    // ======================================================================
    // top_up — error paths
    // ======================================================================

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_top_up_zero_amount_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, _) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        client.top_up(&subscriber, &id, &0);
    }

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_top_up_not_found_fails() {
        let (env, subscriber, _, _, _) = setup_env();
        let (client, _) = deploy_contract(&env);

        client.top_up(&subscriber, &999, &100_000_000);
    }

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_top_up_cancelled_subscription_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, contract_id) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        // Directly set subscription to Cancelled state via contract storage.
        let sub_key = DataKey::Sub(SubscriptionKey {
            subscriber: subscriber.clone(),
            id,
        });
        env.as_contract(&contract_id, || {
            let mut sub: Subscription =
                env.storage().instance().get(&sub_key).unwrap();
            sub.status = SubscriptionStatus::Cancelled;
            env.storage().instance().set(&sub_key, &sub);
        });

        client.top_up(&subscriber, &id, &100_000_000);
    }

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_top_up_expired_subscription_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, contract_id) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        // Directly set subscription to Expired state.
        let sub_key = DataKey::Sub(SubscriptionKey {
            subscriber: subscriber.clone(),
            id,
        });
        env.as_contract(&contract_id, || {
            let mut sub: Subscription =
                env.storage().instance().get(&sub_key).unwrap();
            sub.status = SubscriptionStatus::Expired;
            env.storage().instance().set(&sub_key, &sub);
        });

        client.top_up(&subscriber, &id, &100_000_000);
    }

    // ======================================================================
    // execute_payment — success paths
    // ======================================================================

    #[test]
    fn test_execute_payment_transfers_tokens_and_updates_state() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, contract_id) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        // Advance past next_payment_time.
        env.ledger().with_mut(|li| li.timestamp = now + 86_400 + 1);

        client.execute_payment(&subscriber, &id);

        let sub = client.get_subscription(&subscriber, &id);
        assert_eq!(sub.escrow_balance, 400_000_000);
        assert_eq!(sub.payment_count, 1);
        assert_eq!(sub.next_payment_time, now + 86_400 + 1 + 86_400);

        let t = token::Client::new(&env, &token);
        assert_eq!(t.balance(&recipient), 100_000_000);
        assert_eq!(t.balance(&contract_id), 400_000_000);
    }

    #[test]
    fn test_execute_payment_multiple_payments() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, contract_id) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        // Payment 1.
        env.ledger().with_mut(|li| li.timestamp = now + 86_400 + 1);
        client.execute_payment(&subscriber, &id);

        // Payment 2.
        env.ledger().with_mut(|li| li.timestamp = now + 86_400 * 2 + 1);
        client.execute_payment(&subscriber, &id);

        // Payment 3.
        env.ledger().with_mut(|li| li.timestamp = now + 86_400 * 3 + 1);
        client.execute_payment(&subscriber, &id);

        let sub = client.get_subscription(&subscriber, &id);
        assert_eq!(sub.payment_count, 3);
        assert_eq!(sub.escrow_balance, 200_000_000);

        let t = token::Client::new(&env, &token);
        assert_eq!(t.balance(&recipient), 300_000_000);
        assert_eq!(t.balance(&contract_id), 200_000_000);
    }

    // ======================================================================
    // execute_payment — error paths
    // ======================================================================

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_execute_payment_not_found_fails() {
        let (env, subscriber, _, _, _) = setup_env();
        let (client, _) = deploy_contract(&env);

        client.execute_payment(&subscriber, &999);
    }

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_execute_payment_not_due_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, _) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        // Don't advance time — still before next_payment_time.
        client.execute_payment(&subscriber, &id);
    }

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_execute_payment_insufficient_escrow_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, _) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &1_000_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        // Advance past due — but escrow (500) < amount (1000).
        env.ledger().with_mut(|li| li.timestamp = now + 86_400 + 1);

        client.execute_payment(&subscriber, &id);
    }

    #[test]
    fn test_execute_payment_expired_transitions_state() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, _) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        // Advance past expiration.
        env.ledger().with_mut(|li| li.timestamp = now + 86_400 * 30 + 1);

        // execute_payment should transition to Expired and return (no panic).
        client.execute_payment(&subscriber, &id);

        let sub = client.get_subscription(&subscriber, &id);
        assert_eq!(sub.status, SubscriptionStatus::Expired);
        assert_eq!(sub.escrow_balance, 500_000_000);
        assert_eq!(sub.payment_count, 0);
    }

    #[test]
    #[should_panic(expected = "HostError")]
    fn test_execute_payment_cancelled_fails() {
        let (env, subscriber, recipient, token, _) = setup_env();
        let (client, contract_id) = deploy_contract(&env);
        let now = env.ledger().timestamp();

        let id = client.subscribe(
            &subscriber,
            &recipient,
            &token,
            &100_000_000,
            &86_400,
            &500_000_000,
            &(now + 86_400 * 30),
        );

        // Directly set to Cancelled.
        let sub_key = DataKey::Sub(SubscriptionKey {
            subscriber: subscriber.clone(),
            id,
        });
        env.as_contract(&contract_id, || {
            let mut sub: Subscription =
                env.storage().instance().get(&sub_key).unwrap();
            sub.status = SubscriptionStatus::Cancelled;
            env.storage().instance().set(&sub_key, &sub);
        });

        env.ledger().with_mut(|li| li.timestamp = now + 86_400 + 1);

        client.execute_payment(&subscriber, &id);
    }
}
