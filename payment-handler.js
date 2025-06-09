// Payment and Subscription Handler
// This would typically be a backend service, but for demo purposes, it's client-side

class PaymentHandler {
    constructor() {
        this.stripePublicKey = 'pk_test_demo_key'; // Demo key
        this.plans = {
            starter: {
                id: 'starter',
                name: 'Starter',
                price: 299,
                annualPrice: 239,
                features: [
                    'Up to 10 wallets',
                    'Basic alerting',
                    'Email support',
                    'Standard reporting',
                    'API access'
                ]
            },
            professional: {
                id: 'professional',
                name: 'Professional',
                price: 899,
                annualPrice: 719,
                features: [
                    'Up to 100 wallets',
                    'Advanced alerting & webhooks',
                    'Auto rebalancing',
                    'Priority support',
                    'Custom reporting',
                    'Role-based access',
                    'Compliance tools'
                ]
            },
            enterprise: {
                id: 'enterprise',
                name: 'Enterprise',
                price: 2499,
                annualPrice: 1999,
                features: [
                    'Unlimited wallets',
                    'White-label options',
                    'On-premise deployment',
                    '24/7 dedicated support',
                    'Custom integrations',
                    'Advanced compliance',
                    'SLA guarantees'
                ]
            }
        };
    }

    // Simulate payment processing
    async processPayment(paymentData) {
        return new Promise((resolve, reject) => {
            // Simulate API call delay
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve({
                        success: true,
                        transactionId: this.generateTransactionId(),
                        amount: paymentData.amount,
                        currency: 'USD',
                        timestamp: new Date().toISOString()
                    });
                } else {
                    reject({
                        success: false,
                        error: 'Payment failed. Please try again.',
                        code: 'PAYMENT_DECLINED'
                    });
                }
            }, 2000);
        });
    }

    // Create subscription
    async createSubscription(userId, planId, paymentMethodId, isAnnual = false) {
        const plan = this.plans[planId];
        if (!plan) {
            throw new Error('Invalid plan selected');
        }

        const amount = isAnnual ? plan.annualPrice : plan.price;
        
        try {
            const paymentResult = await this.processPayment({
                amount: amount,
                currency: 'USD',
                paymentMethodId: paymentMethodId,
                userId: userId
            });

            // Create subscription record
            const subscription = {
                id: this.generateSubscriptionId(),
                userId: userId,
                planId: planId,
                status: 'active',
                amount: amount,
                currency: 'USD',
                interval: isAnnual ? 'annual' : 'monthly',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
                paymentMethodId: paymentMethodId,
                lastPayment: paymentResult
            };

            // Store subscription (in real app, this would be in database)
            this.storeSubscription(subscription);

            return subscription;
        } catch (error) {
            throw error;
        }
    }

    // Update subscription
    async updateSubscription(subscriptionId, newPlanId, isAnnual = false) {
        const subscription = this.getSubscription(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const newPlan = this.plans[newPlanId];
        if (!newPlan) {
            throw new Error('Invalid plan selected');
        }

        const newAmount = isAnnual ? newPlan.annualPrice : newPlan.price;
        const oldAmount = subscription.amount;
        
        // Calculate prorated amount
        const proratedAmount = this.calculateProration(subscription, newAmount);

        if (proratedAmount > 0) {
            try {
                await this.processPayment({
                    amount: proratedAmount,
                    currency: 'USD',
                    paymentMethodId: subscription.paymentMethodId,
                    userId: subscription.userId
                });
            } catch (error) {
                throw error;
            }
        }

        // Update subscription
        subscription.planId = newPlanId;
        subscription.amount = newAmount;
        subscription.interval = isAnnual ? 'annual' : 'monthly';
        subscription.updatedAt = new Date();

        this.storeSubscription(subscription);
        return subscription;
    }

    // Cancel subscription
    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
        const subscription = this.getSubscription(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        if (cancelAtPeriodEnd) {
            subscription.cancelAtPeriodEnd = true;
            subscription.status = 'active'; // Keep active until period ends
        } else {
            subscription.status = 'canceled';
            subscription.canceledAt = new Date();
        }

        subscription.updatedAt = new Date();
        this.storeSubscription(subscription);
        return subscription;
    }

    // Add payment method
    async addPaymentMethod(userId, paymentMethodData) {
        // Simulate payment method validation
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.validatePaymentMethod(paymentMethodData)) {
                    const paymentMethod = {
                        id: this.generatePaymentMethodId(),
                        userId: userId,
                        type: paymentMethodData.type,
                        last4: paymentMethodData.cardNumber.slice(-4),
                        expiryMonth: paymentMethodData.expiryMonth,
                        expiryYear: paymentMethodData.expiryYear,
                        brand: this.detectCardBrand(paymentMethodData.cardNumber),
                        isDefault: paymentMethodData.isDefault || false,
                        createdAt: new Date()
                    };

                    this.storePaymentMethod(paymentMethod);
                    resolve(paymentMethod);
                } else {
                    reject({
                        success: false,
                        error: 'Invalid payment method',
                        code: 'INVALID_PAYMENT_METHOD'
                    });
                }
            }, 1500);
        });
    }

    // Get subscription details
    getSubscription(subscriptionId) {
        const subscriptions = JSON.parse(localStorage.getItem('vaultscope_subscriptions') || '[]');
        return subscriptions.find(sub => sub.id === subscriptionId);
    }

    // Get user subscriptions
    getUserSubscriptions(userId) {
        const subscriptions = JSON.parse(localStorage.getItem('vaultscope_subscriptions') || '[]');
        return subscriptions.filter(sub => sub.userId === userId);
    }

    // Store subscription
    storeSubscription(subscription) {
        const subscriptions = JSON.parse(localStorage.getItem('vaultscope_subscriptions') || '[]');
        const existingIndex = subscriptions.findIndex(sub => sub.id === subscription.id);
        
        if (existingIndex >= 0) {
            subscriptions[existingIndex] = subscription;
        } else {
            subscriptions.push(subscription);
        }
        
        localStorage.setItem('vaultscope_subscriptions', JSON.stringify(subscriptions));
    }

    // Store payment method
    storePaymentMethod(paymentMethod) {
        const paymentMethods = JSON.parse(localStorage.getItem('vaultscope_payment_methods') || '[]');
        paymentMethods.push(paymentMethod);
        localStorage.setItem('vaultscope_payment_methods', JSON.stringify(paymentMethods));
    }

    // Get user payment methods
    getUserPaymentMethods(userId) {
        const paymentMethods = JSON.parse(localStorage.getItem('vaultscope_payment_methods') || '[]');
        return paymentMethods.filter(pm => pm.userId === userId);
    }

    // Utility functions
    generateTransactionId() {
        return 'txn_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    generateSubscriptionId() {
        return 'sub_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    generatePaymentMethodId() {
        return 'pm_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    validatePaymentMethod(paymentMethodData) {
        // Basic validation
        const cardNumber = paymentMethodData.cardNumber.replace(/\s/g, '');
        return cardNumber.length >= 13 && 
               cardNumber.length <= 19 && 
               /^\d+$/.test(cardNumber) &&
               paymentMethodData.expiryMonth >= 1 && 
               paymentMethodData.expiryMonth <= 12 &&
               paymentMethodData.expiryYear >= new Date().getFullYear();
    }

    detectCardBrand(cardNumber) {
        const number = cardNumber.replace(/\s/g, '');
        
        if (/^4/.test(number)) return 'visa';
        if (/^5[1-5]/.test(number)) return 'mastercard';
        if (/^3[47]/.test(number)) return 'amex';
        if (/^6(?:011|5)/.test(number)) return 'discover';
        
        return 'unknown';
    }

    calculateProration(subscription, newAmount) {
        const currentPeriodStart = new Date(subscription.currentPeriodStart);
        const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
        const now = new Date();
        
        const totalPeriodDays = (currentPeriodEnd - currentPeriodStart) / (1000 * 60 * 60 * 24);
        const remainingDays = (currentPeriodEnd - now) / (1000 * 60 * 60 * 24);
        
        const unusedAmount = (subscription.amount * remainingDays) / totalPeriodDays;
        const newPeriodAmount = (newAmount * remainingDays) / totalPeriodDays;
        
        return Math.max(0, newPeriodAmount - unusedAmount);
    }

    // Generate invoice
    generateInvoice(subscriptionId) {
        const subscription = this.getSubscription(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const plan = this.plans[subscription.planId];
        
        return {
            id: 'inv_' + Math.random().toString(36).substr(2, 9),
            subscriptionId: subscriptionId,
            amount: subscription.amount,
            currency: subscription.currency,
            status: 'paid',
            periodStart: subscription.currentPeriodStart,
            periodEnd: subscription.currentPeriodEnd,
            planName: plan.name,
            createdAt: new Date(),
            dueDate: subscription.currentPeriodEnd,
            paidAt: subscription.lastPayment?.timestamp || new Date()
        };
    }

    // Webhook simulation for subscription events
    triggerWebhook(event, data) {
        // In a real application, this would send HTTP requests to configured webhook URLs
        console.log('Webhook triggered:', event, data);
        
        // Simulate webhook delivery
        const webhookEvent = {
            id: 'evt_' + Math.random().toString(36).substr(2, 9),
            type: event,
            data: data,
            created: new Date().toISOString(),
            livemode: false
        };

        // Store webhook events for debugging
        const webhookEvents = JSON.parse(localStorage.getItem('vaultscope_webhook_events') || '[]');
        webhookEvents.push(webhookEvent);
        localStorage.setItem('vaultscope_webhook_events', JSON.stringify(webhookEvents));

        return webhookEvent;
    }
}

// Export for use in main application
window.PaymentHandler = PaymentHandler;

// Initialize payment handler
window.paymentHandler = new PaymentHandler();

// Demo functions for testing payment flow
window.demoPaymentFlow = {
    async startTrial(planId) {
        try {
            console.log(`Starting trial for ${planId} plan...`);
            
            // In real app, this would create a trial subscription
            const trialSubscription = {
                id: window.paymentHandler.generateSubscriptionId(),
                userId: currentUser?.id || 'demo_user',
                planId: planId,
                status: 'trialing',
                amount: 0,
                currency: 'USD',
                interval: 'monthly',
                trialStart: new Date(),
                trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                createdAt: new Date()
            };

            window.paymentHandler.storeSubscription(trialSubscription);
            window.paymentHandler.triggerWebhook('trial.started', trialSubscription);
            
            return trialSubscription;
        } catch (error) {
            console.error('Trial creation failed:', error);
            throw error;
        }
    },

    async upgradeFromTrial(subscriptionId, paymentMethodData) {
        try {
            console.log('Upgrading from trial...');
            
            // Add payment method
            const paymentMethod = await window.paymentHandler.addPaymentMethod(
                currentUser?.id || 'demo_user',
                paymentMethodData
            );

            // Get trial subscription
            const trialSubscription = window.paymentHandler.getSubscription(subscriptionId);
            if (!trialSubscription) {
                throw new Error('Trial subscription not found');
            }

            // Create paid subscription
            const paidSubscription = await window.paymentHandler.createSubscription(
                trialSubscription.userId,
                trialSubscription.planId,
                paymentMethod.id
            );

            // Cancel trial
            trialSubscription.status = 'canceled';
            trialSubscription.canceledAt = new Date();
            window.paymentHandler.storeSubscription(trialSubscription);

            window.paymentHandler.triggerWebhook('subscription.created', paidSubscription);
            
            return paidSubscription;
        } catch (error) {
            console.error('Upgrade failed:', error);
            throw error;
        }
    },

    async simulatePaymentFailure(subscriptionId) {
        const subscription = window.paymentHandler.getSubscription(subscriptionId);
        if (subscription) {
            subscription.status = 'past_due';
            subscription.updatedAt = new Date();
            window.paymentHandler.storeSubscription(subscription);
            window.paymentHandler.triggerWebhook('invoice.payment_failed', subscription);
        }
    },

    async simulatePaymentSuccess(subscriptionId) {
        const subscription = window.paymentHandler.getSubscription(subscriptionId);
        if (subscription) {
            subscription.status = 'active';
            subscription.updatedAt = new Date();
            
            // Extend period
            const isAnnual = subscription.interval === 'annual';
            const extensionDays = isAnnual ? 365 : 30;
            subscription.currentPeriodStart = new Date();
            subscription.currentPeriodEnd = new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000);
            
            window.paymentHandler.storeSubscription(subscription);
            window.paymentHandler.triggerWebhook('invoice.payment_succeeded', subscription);
        }
    }
};

console.log('Payment Handler initialized');
console.log('Available demo functions:', Object.keys(window.demoPaymentFlow));