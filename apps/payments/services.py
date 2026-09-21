import uuid
import logging
from abc import ABC, abstractmethod
from decimal import Decimal

logger = logging.getLogger(__name__)

class PaymentGatewayInterface(ABC):
    """
    Abstract Payment Provider Interface.
    Allows seamlessly swapping or extending payment providers (Stripe, SSLCommerz, bKash, Mock)
    without touching core booking logic.
    """

    @abstractmethod
    def initiate_payment(self, amount: Decimal, currency: str, booking_reference: str, user_email: str) -> dict:
        pass

    @abstractmethod
    def verify_payment(self, transaction_id: str, idempotency_key: str) -> dict:
        pass

class MockPaymentGateway(PaymentGatewayInterface):
    """
    Sandbox / Mock Payment Gateway for testing high-traffic booking flow,
    idempotent webhooks, and simulated failures without actual credit cards.
    """

    def initiate_payment(self, amount: Decimal, currency: str = 'USD', booking_reference: str = '', user_email: str = '') -> dict:
        transaction_id = f"TXN-MOCK-{uuid.uuid4().hex[:12].upper()}"
        return {
            'status': 'INITIATED',
            'transaction_id': transaction_id,
            'amount': str(amount),
            'currency': currency,
            'booking_reference': booking_reference,
            'checkout_url': f"/mock-checkout/{transaction_id}/",
        }

    def verify_payment(self, transaction_id: str, idempotency_key: str) -> dict:
        # Check idempotency cache or DB
        logger.info(f"Mock Payment Verified for {transaction_id} with idempotency key {idempotency_key}")
        return {
            'status': 'SUCCESS',
            'transaction_id': transaction_id,
            'verified': True,
            'idempotency_key': idempotency_key,
        }

class PaymentService:
    """
    Unified payment service factory and dispatcher.
    """
    @classmethod
    def get_gateway(cls, provider: str = 'mock') -> PaymentGatewayInterface:
        if provider == 'mock':
            return MockPaymentGateway()
        # Future integrations can be registered here:
        # elif provider == 'stripe':
        #     return StripePaymentGateway()
        # elif provider == 'sslcommerz':
        #     return SSLCommerzPaymentGateway()
        return MockPaymentGateway()
