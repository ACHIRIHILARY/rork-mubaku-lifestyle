# Payment Gateway API Documentation

## **Technical Specification**
**Version:** 1.0.0  
**Last Updated:** December 15, 2024  
**Gateway:** SmobilPay (Maviance)  
**Supported Currencies:** XAF  
**Authentication:** JWT Bearer Token

---

## **1. API Overview**

### **1.1 System Architecture**
```
Frontend → Django REST API → Payment Manager → SmobilPay Gateway → Mobile Network
      ↑                                      ↓
      └────── Polling/Webhooks ←────────────┘
```

### **1.2 Payment Flow Sequence**
1. **Initiation** → Create payment intent with gateway
2. **Authorization** → Customer approves via USSD/App
3. **Execution** → Funds captured and held in escrow
4. **Confirmation** → Transaction verified and completed
5. **Settlement** → Funds released based on escrow rules

### **1.3 Supported Payment Methods**
| Method | Code | Network | Limits | Processing Time |
|--------|------|---------|--------|-----------------|
| MTN Mobile Money | `mtn_momo` | MTN Cameroon | 100 - 1,000,000 XAF | 30-60 seconds |
| Orange Money | `orange_money` | Orange Cameroon | 100 - 1,000,000 XAF | 30-60 seconds |

---

## **2. Authentication & Headers**

### **2.1 Required Headers**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### **2.2 JWT Token Format**
```json
{
  "user_id": "uuid",
  "exp": 1700000000,
  "role": "customer|provider|admin"
}
```

### **2.3 Rate Limits**
| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| Payment Initiation | 5/min | 60s | Per user |
| Status Polling | 20/min | 60s | Per payment token |
| Payment Methods | 10/min | 60s | Per user |

---

## **3. Core Endpoints**

### **3.1 GET `/api/v1/payments/methods/`**
*Retrieves available payment methods for current user context.*

**Response: 200 OK**
```json
{
  "success": true,
  "default_currency": "XAF",
  "methods": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "method_code": "mtn_momo",
      "display_name": "MTN Mobile Money",
      "gateway": {
        "name": "SmobilPay",
        "type": "SmobilPay (Maviance)",
        "logo_url": "https://cdn.example.com/gateways/smobilpay.png"
      },
      "configuration": {
        "requires_service_number": true,
        "service_number_label": "MTN Phone Number",
        "service_number_hint": "Enter phone number with country code (237XXXXXXXXX)",
        "validation_regex": "^237[0-9]{9}$",
        "example": "237612345678"
      },
      "limits": {
        "min_amount": 100.00,
        "max_amount": 1000000.00,
        "currency": "XAF"
      },
      "fees": {
        "type": "percentage",
        "rate": 1.5,
        "description": "Gateway processing fee"
      },
      "metadata": {
        "icon_url": "https://cdn.example.com/methods/mtn.png",
        "instructions": "You will receive a USSD prompt to authorize the payment",
        "estimated_processing_time": "30-60 seconds"
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "method_code": "orange_money",
      "display_name": "Orange Money",
      "gateway": {
        "name": "SmobilPay",
        "type": "SmobilPay (Maviance)",
        "logo_url": "https://cdn.example.com/gateways/smobilpay.png"
      },
      "configuration": {
        "requires_service_number": true,
        "service_number_label": "Orange Phone Number",
        "service_number_hint": "Enter phone number with country code (237XXXXXXXXX)",
        "validation_regex": "^237[0-9]{9}$",
        "example": "237698765432"
      },
      "limits": {
        "min_amount": 100.00,
        "max_amount": 1000000.00,
        "currency": "XAF"
      },
      "fees": {
        "type": "percentage",
        "rate": 1.5,
        "description": "Gateway processing fee"
      },
      "metadata": {
        "icon_url": "https://cdn.example.com/methods/orange.png",
        "instructions": "You will receive a USSD prompt to authorize the payment",
        "estimated_processing_time": "30-60 seconds"
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
- `429 Too Many Requests`: Rate limit exceeded

---

### **3.2 POST `/api/v1/payments/initiate/`**
*Creates a payment intent and initiates the payment flow.*

**Request Body:**
```json
{
  "appointment_id": "550e8400-e29b-41d4-a716-446655440002",
  "payment_method": "mtn_momo",
  "customer_phone": "237612345678",
  "customer_email": "optional@example.com",
  "metadata": {
    "device_info": "iOS/15.0 Safari",
    "ip_address": "102.89.32.155",
    "user_agent": "Mozilla/5.0...",
    "session_id": "session_123456"
  }
}
```

**Field Validation Rules:**
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `appointment_id` | UUID | Yes | Must exist and be in payable state | Appointment must have status `pending_payment` |
| `payment_method` | String | Yes | `mtn_momo` or `orange_money` | Must be active and supported |
| `customer_phone` | String | Yes | `^237[0-9]{9}$` | Must include country code |
| `customer_email` | Email | No | Valid email format | Optional, used for receipts |
| `metadata` | Object | No | Max 5KB | Arbitrary key-value pairs |

**Response: 201 Created**
```json
{
  "success": true,
  "payment": {
    "id": "660e8400-e29b-41d4-a716-446655440003",
    "frontend_token": "770e8400-e29b-41d4-a716-446655440004",
    "status": "pending",
    "amount": {
      "total": 5325.00,
      "currency": "XAF",
      "breakdown": {
        "service_amount": 5000.00,
        "platform_fee": 250.00,
        "gateway_fee": 75.00,
        "provider_payout": 4675.00
      },
      "percentages": {
        "platform_fee": 5.0,
        "gateway_fee": 1.5,
        "provider_payout": 93.5
      }
    },
    "appointment": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "service": "Professional Hair Styling",
      "scheduled_at": "2024-01-16T14:00:00Z",
      "provider_name": "Jane Smith"
    },
    "payment_method": {
      "code": "mtn_momo",
      "display_name": "MTN Mobile Money",
      "instructions": "Check your phone for a USSD prompt to authorize payment of 5,325 XAF",
      "authorization_required": true
    },
    "gateway_reference": "QUOTE-1700000000",
    "requires_action": true,
    "next_action": {
      "type": "customer_authorization",
      "description": "Authorize payment via USSD prompt on your phone",
      "expected_timeout": 300,
      "polling_interval": 3000
    },
    "timestamps": {
      "created_at": "2024-01-15T10:30:00Z",
      "expires_at": "2024-01-15T10:35:00Z",
      "estimated_completion": "2024-01-15T10:31:30Z"
    },
    "polling": {
      "endpoint": "/api/v1/payments/status/770e8400-e29b-41d4-a716-446655440004/",
      "recommended_interval": 3000,
      "max_attempts": 60
    }
  }
}
```

**Error Responses:**
| Code | Response | Reason |
|------|----------|--------|
| `400 Bad Request` | `{"error": "Invalid phone number format", "code": "VALIDATION_ERROR", "field": "customer_phone"}` | Invalid input data |
| `403 Forbidden` | `{"error": "Appointment not owned by user", "code": "AUTHORIZATION_ERROR"}` | User doesn't own appointment |
| `409 Conflict` | `{"error": "Payment already exists", "code": "DUPLICATE_PAYMENT"}` | Payment already initiated |
| `422 Unprocessable` | `{"error": "Payment method unavailable", "code": "METHOD_UNAVAILABLE"}` | Method not active |

---

### **3.3 GET `/api/v1/payments/status/{frontend_token}/`**
*Poll endpoint to check payment status. Frontend should poll every 3-5 seconds.*

**Path Parameters:**
- `frontend_token`: UUID returned in initiation response

**Response: 200 OK (Pending)**
```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440003",
  "frontend_token": "770e8400-e29b-41d4-a716-446655440004",
  "status": "pending",
  "state_machine": {
    "current": "awaiting_authorization",
    "next": "processing",
    "progress": 25,
    "estimated_remaining": 45
  },
  "amount": {
    "total": 5325.00,
    "currency": "XAF"
  },
  "timestamps": {
    "created_at": "2024-01-15T10:30:00Z",
    "last_updated": "2024-01-15T10:30:15Z",
    "elapsed_seconds": 15
  },
  "gateway": {
    "reference": "QUOTE-1700000000",
    "transaction_id": null,
    "status": "quote_generated",
    "last_check": "2024-01-15T10:30:15Z"
  },
  "instructions": {
    "user_action_required": true,
    "message": "Please check your phone and authorize the payment",
    "action_type": "mobile_authorization",
    "timeout_warning": "Payment will expire in 4:45"
  },
  "polling": {
    "next_poll_after": 3000,
    "poll_count": 5,
    "max_polls_remaining": 55
  }
}
```

**Response: 200 OK (Completed)**
```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440003",
  "frontend_token": "770e8400-e29b-41d4-a716-446655440004",
  "status": "completed",
  "state_machine": {
    "current": "held_in_escrow",
    "next": "awaiting_service",
    "progress": 100,
    "final": true
  },
  "amount": {
    "total": 5325.00,
    "currency": "XAF"
  },
  "timestamps": {
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:31:20Z",
    "processing_duration": 80
  },
  "gateway": {
    "reference": "QUOTE-1700000000",
    "transaction_id": "PTN-123456789012",
    "status": "success",
    "receipt_number": "RCPT-987654321098",
    "verification_code": "123456",
    "confirmation_time": "2024-01-15T10:31:20Z"
  },
  "escrow": {
    "status": "held",
    "release_trigger": "service_completion",
    "auto_release_date": "2024-01-16T16:00:00Z",
    "available_balance": 5325.00
  },
  "next_steps": {
    "user_action": "none",
    "message": "Payment completed successfully",
    "actions": [
      {
        "type": "view_receipt",
        "endpoint": "/api/v1/payments/660e8400-e29b-41d4-a716-446655440003/receipt/",
        "method": "GET"
      },
      {
        "type": "view_appointment",
        "endpoint": "/api/v1/appointments/550e8400-e29b-41d4-a716-446655440002/",
        "method": "GET"
      }
    ]
  },
  "polling": {
    "stop": true,
    "reason": "payment_completed"
  }
}
```

**Response: 200 OK (Failed)**
```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440003",
  "frontend_token": "770e8400-e29b-41d4-a716-446655440004",
  "status": "failed",
  "state_machine": {
    "current": "failed",
    "error_state": "authorization_declined",
    "progress": 0,
    "final": true
  },
  "amount": {
    "total": 5325.00,
    "currency": "XAF"
  },
  "timestamps": {
    "created_at": "2024-01-15T10:30:00Z",
    "failed_at": "2024-01-15T10:32:00Z",
    "failure_duration": 120
  },
  "gateway": {
    "reference": "QUOTE-1700000000",
    "transaction_id": null,
    "status": "failed",
    "error_code": "USER_DECLINED",
    "error_message": "Customer declined authorization",
    "failure_time": "2024-01-15T10:32:00Z"
  },
  "failure_details": {
    "code": "AUTHORIZATION_DECLINED",
    "message": "Payment authorization was declined by customer",
    "recoverable": true,
    "retry_allowed": true,
    "suggested_action": "retry_payment"
  },
  "next_steps": {
    "user_action": "required",
    "message": "Payment authorization was declined",
    "actions": [
      {
        "type": "retry_payment",
        "endpoint": "/api/v1/payments/initiate/",
        "method": "POST",
        "payload": {
          "appointment_id": "550e8400-e29b-41d4-a716-446655440002",
          "payment_method": "mtn_momo",
          "customer_phone": "237612345678"
        }
      },
      {
        "type": "contact_support",
        "endpoint": "/api/v1/support/tickets/",
        "method": "POST",
        "payload_template": {
          "subject": "Payment failure for appointment {appointment_id}",
          "category": "payment_issues"
        }
      }
    ]
  },
  "polling": {
    "stop": true,
    "reason": "payment_failed"
  }
}
```

**Error Responses:**
| Code | Response | Reason |
|------|----------|--------|
| `404 Not Found` | `{"error": "Payment not found", "code": "RESOURCE_NOT_FOUND"}` | Invalid frontend_token |
| `410 Gone` | `{"error": "Payment expired", "code": "PAYMENT_EXPIRED", "expired_at": "2024-01-15T10:35:00Z"}` | Quote expired |
| `403 Forbidden` | `{"error": "Not authorized to view this payment", "code": "AUTHORIZATION_ERROR"}` | User mismatch |

---

### **3.4 GET `/api/v1/payments/history/`**
*Retrieves payment history for authenticated user with pagination.*

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | String | - | Filter by status (`pending`, `completed`, `failed`, `refunded`) |
| `page` | Integer | 1 | Page number (1-indexed) |
| `page_size` | Integer | 20 | Items per page (max 100) |
| `date_from` | ISO8601 | - | Filter payments after date |
| `date_to` | ISO8601 | - | Filter payments before date |
| `currency` | String | - | Filter by currency (`XAF`) |
| `payment_method` | String | - | Filter by method code |

**Response: 200 OK**
```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 145,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false,
    "next_page": "/api/v1/payments/history/?page=2",
    "previous_page": null
  },
  "summary": {
    "total_amount": 756800.00,
    "total_fees": 37840.00,
    "completed_count": 128,
    "failed_count": 12,
    "refunded_count": 5
  },
  "payments": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440003",
      "frontend_token": "770e8400-e29b-41d4-a716-446655440004",
      "status": "completed",
      "amount": {
        "total": 5325.00,
        "currency": "XAF",
        "breakdown": {
          "service_amount": 5000.00,
          "platform_fee": 250.00,
          "gateway_fee": 75.00
        }
      },
      "appointment": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "service_name": "Professional Hair Styling",
        "provider_name": "Jane Smith",
        "scheduled_at": "2024-01-16T14:00:00Z",
        "status": "confirmed"
      },
      "payment_method": {
        "code": "mtn_momo",
        "display_name": "MTN Mobile Money",
        "icon_url": "https://cdn.example.com/methods/mtn.png"
      },
      "gateway": {
        "transaction_id": "PTN-123456789012",
        "receipt_number": "RCPT-987654321098",
        "completed_at": "2024-01-15T10:31:20Z"
      },
      "escrow": {
        "status": "held",
        "auto_release_date": "2024-01-16T16:00:00Z"
      },
      "timestamps": {
        "created_at": "2024-01-15T10:30:00Z",
        "completed_at": "2024-01-15T10:31:20Z"
      },
      "actions": {
        "view_receipt": "/api/v1/payments/660e8400-e29b-41d4-a716-446655440003/receipt/",
        "view_appointment": "/api/v1/appointments/550e8400-e29b-41d4-a716-446655440002/"
      }
    }
  ]
}
```

---

## **4. Payment Status Lifecycle**

### **4.1 State Transitions**
```
initiated → pending → processing → completed → (held_in_escrow)
     ↓          ↓          ↓           ↓
     failed ←──────┘       │           │
                           │           │
                    authorization    escrow
                    timeout/declined  release
```

### **4.2 Status Definitions**
| Status | Description | User Action Required | Frontend UI State |
|--------|-------------|---------------------|-------------------|
| `initiated` | Payment created, quote generated | No | Show "Preparing payment" |
| `pending` | Awaiting customer authorization | Yes | Show "Authorize on phone" with timer |
| `processing` | Authorization received, processing | No | Show "Processing" with spinner |
| `completed` | Payment successful, funds held | No | Show "Success" with receipt |
| `failed` | Payment failed or declined | Yes | Show "Failed" with retry option |
| `refunded` | Payment refunded to customer | No | Show "Refunded" with details |

### **4.3 Timeouts & Expirations**
| Event | Timeout | Action |
|-------|---------|--------|
| Quote validity | 5 minutes | Payment expires, must restart |
| Authorization | 2 minutes | Auto-fail, can retry |
| Processing | 3 minutes | Escalate to support |
| Polling session | 10 minutes | Stop polling, check manually |

---

## **5. Error Reference**

### **5.1 HTTP Status Codes**
| Code | Meaning | Retry | User Action |
|------|---------|-------|-------------|
| `400` | Bad Request | No | Fix input data |
| `401` | Unauthorized | Yes* | Re-authenticate |
| `403` | Forbidden | No | Contact support |
| `404` | Not Found | No | Check resource ID |
| `409` | Conflict | No | Check existing payment |
| `422` | Unprocessable | No | Change payment method |
| `429` | Rate Limited | Yes | Wait and retry |
| `500` | Server Error | Yes | Retry later |
| `502` | Bad Gateway | Yes | Retry later |
| `503` | Service Unavailable | Yes | Retry later |

### **5.2 Error Codes**
| Code | Message | Resolution |
|------|---------|------------|
| `PAYMENT_INITIATION_FAILED` | Failed to create payment intent | Retry or change method |
| `INVALID_PHONE_FORMAT` | Phone must be 237XXXXXXXXX | Re-enter with country code |
| `INSUFFICIENT_FUNDS` | Customer balance insufficient | Add funds or use other method |
| `GATEWAY_TIMEOUT` | Payment gateway not responding | Retry in 30 seconds |
| `USER_DECLINED` | Customer declined authorization | Retry with confirmation |
| `NETWORK_ERROR` | Mobile network issue | Retry or try Orange Money |
| `DUPLICATE_TRANSACTION` | Same transaction detected | Check payment history |
| `QUOTE_EXPIRED` | Payment quote expired | Re-initiate payment |
| `DAILY_LIMIT_EXCEEDED` | Daily limit reached | Try tomorrow or contact support |

### **5.3 Error Response Format**
```json
{
  "error": {
    "code": "INVALID_PHONE_FORMAT",
    "message": "Phone number must start with country code 237",
    "field": "customer_phone",
    "value": "612345678",
    "expected_format": "^237[0-9]{9}$",
    "example": "237612345678",
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_1234567890",
    "documentation_url": "https://docs.example.com/errors/INVALID_PHONE_FORMAT"
  },
  "suggestions": [
    "Add country code 237 to the beginning",
    "Ensure phone number is 9 digits after 237",
    "Example: 237612345678"
  ]
}
```

---

## **6. Escrow System**

### **6.1 Escrow Status Flow**
```
Payment → Held → Pending Release → Released → Settled
    ↓         ↓         ↓           ↓
    Refund ←──┘         │           │
                        │           │
                 Dispute → Resolution
```

### **6.2 Escrow Release Triggers**
| Trigger | Delay | Conditions |
|---------|-------|------------|
| Service Completion | 2 hours | Provider marks service complete |
| Auto-release | 24 hours | No action from either party |
| Manual Release | Immediate | Provider requests, admin approves |
| Refund | Immediate | Customer cancellation within policy |
| Dispute Resolution | Variable | Admin decision after investigation |

### **6.3 Fee Structure**
```javascript
// Calculation formula
total_amount = service_amount + platform_fee + gateway_fee
platform_fee = service_amount * 0.05  // 5%
gateway_fee = service_amount * 0.015  // 1.5%
provider_payout = service_amount - platform_fee
```

---

## **7. Webhook Events (Internal)**

*Note: For frontend implementation reference only*

### **7.1 Webhook Payload Format**
```json
{
  "event_type": "payment.success",
  "event_id": "evt_1234567890",
  "created_at": "2024-01-15T10:31:20Z",
  "data": {
    "payment_id": "660e8400-e29b-41d4-a716-446655440003",
    "gateway_transaction_id": "PTN-123456789012",
    "amount": 5325.00,
    "currency": "XAF",
    "status": "success",
    "metadata": {
      "appointment_id": "550e8400-e29b-41d4-a716-446655440002"
    }
  },
  "signature": "hmac_sha256_signature"
}
```

### **7.2 Event Types**
- `payment.initiated` - Payment created
- `payment.pending` - Awaiting authorization
- `payment.processing` - Authorization received
- `payment.success` - Payment completed
- `payment.failed` - Payment failed
- `payment.refunded` - Refund processed
- `escrow.held` - Funds held in escrow
- `escrow.released` - Funds released to provider
- `escrow.refunded` - Funds refunded to customer

---

## **8. Testing & Staging**

### **8.1 Test Environment**
```
Base URL: https://staging.api.example.com
Test Phone: 237600000001 - 237600000010
Auto-completion: Enabled (3-second delay)
Escrow bypass: Available via /fix-escrow/
Logs: https://staging.logs.example.com/payments/
```

### **8.2 Test Cards/Accounts**
| Network | Test Number | PIN | Balance | Behavior |
|---------|-------------|-----|---------|----------|
| MTN | 237600000001 | 0000 | 1,000,000 XAF | Auto-approve |
| Orange | 237600000002 | 0000 | 1,000,000 XAF | Auto-approve |
| MTN (Decline) | 237600000003 | 0000 | 100 XAF | Auto-decline |
| Orange (Timeout) | 237600000004 | 0000 | 500,000 XAF | Timeout after 30s |

### **8.3 Monitoring Endpoints**
```
GET /health/ - API health status
GET /metrics/ - Payment metrics
GET /gateway-status/ - SmobilPay connectivity
POST /simulate-webhook/ - Trigger test webhook
```

---

## **9. Implementation Checklist**

### **9.1 Frontend Requirements**
- [ ] Implement JWT token refresh mechanism
- [ ] Store `frontend_token` securely for polling
- [ ] Implement exponential backoff for polling failures
- [ ] Handle offline scenarios gracefully
- [ ] Display fee breakdown before confirmation
- [ ] Implement retry logic for failed payments
- [ ] Validate phone number format client-side
- [ ] Track payment timeout countdown
- [ ] Provide clear error messages with recovery steps
- [ ] Log payment flow events for debugging

### **9.2 Security Requirements**
- [ ] Never log full payment details
- [ ] Mask phone numbers in logs (2376*****89)
- [ ] Validate all input server-side (don't trust client)
- [ ] Implement CSRF protection for web endpoints
- [ ] Rate limit all payment endpoints
- [ ] Encrypt sensitive data in transit and at rest
- [ ] Regular security audits of payment flows

### **9.3 Monitoring Requirements**
- [ ] Track payment success/failure rates
- [ ] Monitor average processing times
- [ ] Alert on gateway downtime
- [ ] Log all error cases with context
- [ ] Monitor rate limit hits
- [ ] Track user drop-off points in payment flow

---

## **10. Support & Troubleshooting**

### **10.1 Diagnostic Information to Collect**
```json
{
  "user_id": "uuid",
  "payment_id": "uuid",
  "frontend_token": "uuid",
  "appointment_id": "uuid",
  "payment_method": "mtn_momo",
  "customer_phone": "2376*****89",
  "timestamp": "2024-01-15T10:30:00Z",
  "error_code": "USER_DECLINED",
  "gateway_reference": "QUOTE-1700000000",
  "network_type": "MTN",
  "device_info": "iOS/15.0 Safari",
  "request_id": "req_1234567890"
}
```

### **10.2 Escalation Matrix**
| Issue | First Response | Escalation | SLA |
|-------|---------------|------------|-----|
| Payment processing > 3min | Auto-retry | Manual review | 15min |
| Gateway timeout | Circuit breaker | Provider contact | 30min |
| Funds deducted but no confirmation | Check webhooks | Contact SmobilPay | 1hr |
| Escrow release delayed | Check triggers | Admin override | 2hr |
| Refund not processed | Verify policy | Manual refund | 4hr |

### **10.3 Contact Information**
- **Technical Support:** `payments-support@example.com`
- **Emergency Escalation:** `+237 6XX XXX XXX` (24/7)
- **SmobilPay Support:** `support@smobilpay.com`
- **Status Page:** `https://status.example.com/payments`

---

## **Appendix A: Mobile Network Specifications**

### **A.1 MTN Mobile Money**
- **API Version:** SmobilPay v3.0.0
- **Service ID:** S-112-948-MTNMOMO-20053-200050001-1
- **Cashin Endpoint:** `/collectstd`
- **Cashout Endpoint:** `/collectstd`
- **Status Endpoint:** `/verifytx`
- **Limits:** 100 - 1,000,000 XAF per transaction
- **Daily Limit:** 5,000,000 XAF
- **Settlement:** T+1 business day

### **A.2 Orange Money**
- **API Version:** SmobilPay v3.0.0
- **Service ID:** S-112-948-ORANGEMONEY-20053-200050001-1
- **Cashin Endpoint:** `/collectstd`
- **Cashout Endpoint:** `/collectstd`
- **Status Endpoint:** `/verifytx`
- **Limits:** 100 - 1,000,000 XAF per transaction
- **Daily Limit:** 3,000,000 XAF
- **Settlement:** T+1 business day

---

## **Appendix B: Code Samples**

### **B.1 Initiate Payment (cURL)**
```bash
curl -X POST https://api.example.com/api/v1/payments/initiate/ \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "550e8400-e29b-41d4-a716-446655440002",
    "payment_method": "mtn_momo",
    "customer_phone": "237612345678",
    "customer_email": "customer@example.com"
  }'
```

### **B.2 Poll Status (cURL)**
```bash
curl -X GET \
  "https://api.example.com/api/v1/payments/status/770e8400-e29b-41d4-a716-446655440004/" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### **B.3 Error Handling Example**
```javascript
async function handlePaymentError(error) {
  switch(error.code) {
    case 'INVALID_PHONE_FORMAT':
      return showPhoneFormatError(error.example);
    case 'INSUFFICIENT_FUNDS':
      return showInsufficientFundsError();
    case 'USER_DECLINED':
      return showRetryPrompt();
    case 'GATEWAY_TIMEOUT':
      return setTimeout(retryPayment, 30000);
    default:
      return showGenericError(error);
  }
}
```

---

**Document Version:** 1.0.0  
**Last Updated:** December 15, 2024  
**Maintainer:** Backend Engineering Team  
**Review Cycle:** Monthly  
**Next Review:** January 15, 2025