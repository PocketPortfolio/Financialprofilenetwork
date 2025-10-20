# Waitlist Feature Documentation

## Overview

The Pocket Portfolio waitlist feature allows users to sign up for early access to upcoming features and receive updates about the platform's development. This feature is designed with privacy, security, and scalability in mind.

## Architecture

### Frontend Components

- **WaitlistCTA**: Reusable call-to-action button component used in headers and footers
- **WaitlistForm**: Full-featured form component with validation and analytics
- **Join Page**: Dedicated `/join` page with comprehensive signup experience

### Backend API

- **POST /api/waitlist**: Main API endpoint for processing waitlist submissions
- **Rate Limiting**: Server-side rate limiting using Firestore counters
- **Deduplication**: Email-based deduplication using SHA-256 hashing
- **Validation**: Zod schema validation for all inputs

### Data Storage

- **Collection**: `waitlist` - Stores user signup information
- **Collection**: `waitlist_rate_limit` - Tracks rate limiting counters
- **Indexes**: Optimized for email hash lookups and chronological queries

## Data Schema

### Waitlist Document

```typescript
{
  email_normalized: string,        // Lowercase, trimmed email
  email_hash: string,              // SHA-256 hash for privacy-preserving lookups
  display_email?: string,          // Raw email (optional, for admin use)
  name?: string,                   // User's name (optional)
  region?: string,                 // Geographic region (optional)
  role?: string,                   // User role (investor, engineer, etc.)
  status: 'pending' | 'subscribed' | 'unconfirmed' | 'blocked',
  source: 'web:join' | 'web:footer' | 'web:header',
  user_agent?: string,             // Browser user agent
  ip_hash?: string,                // Anonymized IP hash for rate limiting
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Rate Limit Document

```typescript
{
  identifier: string,              // Email hash or IP hash
  count: number,                   // Number of attempts in current window
  window_start: Timestamp,         // Start of current rate limit window
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## Security & Privacy

### Privacy Protection

- **Email Hashing**: All emails are hashed with SHA-256 for privacy-preserving lookups
- **IP Anonymization**: IP addresses are hashed with HMAC using a secret key
- **No PII in Analytics**: Analytics events contain no personally identifiable information
- **Minimal Data Collection**: Only essential fields are required

### Rate Limiting

- **Per-Email Limit**: 5 attempts per hour per email address
- **Per-IP Limit**: 5 attempts per hour per IP address
- **Sliding Window**: Rate limits use a 1-hour sliding window
- **Fail-Open**: Rate limiting failures don't block legitimate requests

### Firestore Security Rules

```javascript
// Allow unauthenticated users to create waitlist entries
match /waitlist/{waitlistId} {
  allow create: if !isAuthenticated() 
    && request.resource.data.keys().hasAll(['email_normalized', 'email_hash', 'status', 'source', 'created_at', 'updated_at'])
    && // ... validation rules
  allow read: if isAdmin();
  allow update, delete: if false;
}
```

## Configuration

### Environment Variables

```bash
# Feature Toggle
NEXT_PUBLIC_ENABLE_WAITLIST=true

# Double Opt-in (optional)
WAITLIST_DOUBLE_OPT_IN=false

# Security
ENCRYPTION_SECRET=your-secret-key-here

# Email (if double opt-in enabled)
MAIL_FROM=noreply@pocketportfolio.app
MAIL_PROVIDER=sendgrid
```

### Feature Flags

- **NEXT_PUBLIC_ENABLE_WAITLIST**: Controls whether waitlist features are enabled
- **WAITLIST_DOUBLE_OPT_IN**: Enables email confirmation flow

## Admin Interface

### Development Access

The admin interface at `/admin/waitlist` is only accessible in development mode:

```typescript
if (process.env.NODE_ENV === 'production') {
  throw new Error('Admin access is not available in production');
}
```

### Features

- **Entry List**: Paginated view of all waitlist entries
- **Search**: Search by email, name, or region
- **Statistics**: Real-time counts by status
- **Export**: (Future) CSV export functionality

### Production Security

In production, the admin interface should be protected by:
1. Admin authentication (Firebase Auth with custom claims)
2. IP whitelisting
3. Additional access controls

## Analytics & Monitoring

### Events Tracked

- `waitlist_submit_attempt`: User attempts to submit form
- `waitlist_submit_success`: Successful submission
- `waitlist_submit_duplicate`: Duplicate email submission
- `waitlist_rate_limited`: Rate limit exceeded

### Privacy-Preserving Analytics

All analytics events are designed to be privacy-preserving:
- No email addresses in event payloads
- No IP addresses in event payloads
- Sampling enabled to reduce noise
- Client-side event emission only

## API Endpoints

### POST /api/waitlist

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",           // Optional
  "region": "United States",    // Optional
  "role": "investor",           // Optional
  "source": "web:join",         // Required
  "userAgent": "Mozilla/5.0..." // Optional, auto-populated
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thanks for joining our waitlist! We'll notify you when we launch."
}
```

**Error Responses:**

- **400 Bad Request**: Invalid input data
- **409 Conflict**: Duplicate email
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Testing

### Unit Tests

- **Normalize Functions**: Email normalization, hashing, validation
- **Rate Limiting**: Rate limit logic and Firestore interactions
- **API Handler**: Request validation, error handling, response formatting

### E2E Tests

- **Happy Path**: Successful form submission
- **Validation**: Invalid email, missing fields
- **Duplicate Handling**: Duplicate email submission
- **Rate Limiting**: Rate limit behavior
- **Accessibility**: Keyboard navigation, screen reader support
- **Mobile**: Mobile viewport compatibility

### Test Coverage

- **Target**: ≥80% coverage for new waitlist modules
- **Critical Paths**: 100% coverage for security-sensitive functions
- **E2E**: All user-facing flows covered

## GDPR Compliance

### Data Minimization

- Only collect necessary data (email required, others optional)
- No unnecessary personal information stored
- Automatic data retention policies (future implementation)

### User Rights

- **Access**: Users can request their data via admin interface (future)
- **Deletion**: Users can request data deletion via admin interface (future)
- **Portability**: Data export functionality (future)

### Legal Basis

- **Consent**: Users explicitly opt-in to the waitlist
- **Legitimate Interest**: Platform development and user communication

## Performance

### Optimization

- **Client-Side Validation**: Immediate feedback without server round-trips
- **Optimistic UI**: Show success state before server confirmation
- **Lazy Loading**: Analytics and heavy components loaded on demand
- **Caching**: Rate limit counters cached in Firestore

### Scalability

- **Firestore Indexes**: Optimized for email lookups and chronological queries
- **Rate Limiting**: Distributed rate limiting using Firestore counters
- **Analytics Sampling**: 10% sampling to reduce event volume

## Monitoring & Alerts

### Key Metrics

- **Submission Success Rate**: Target >95%
- **Duplicate Rate**: Monitor for spam/abuse
- **Rate Limit Hits**: Monitor for potential attacks
- **API Response Times**: Target <200ms

### Error Tracking

- **Server Errors**: All 5xx errors logged with context
- **Validation Errors**: Track common validation failures
- **Rate Limit Events**: Monitor for abuse patterns

## Rollout Plan

### Phase 1: Development (Current)
- ✅ Feature development and testing
- ✅ Admin interface for development
- ✅ Comprehensive test coverage

### Phase 2: Beta Testing
- [ ] Deploy to staging environment
- [ ] Internal team testing
- [ ] Security review and penetration testing

### Phase 3: Production Rollout
- [ ] Deploy to production with feature flag disabled
- [ ] Enable for small percentage of users
- [ ] Monitor metrics and error rates
- [ ] Gradual rollout to 100% of users

### Phase 4: Post-Launch
- [ ] Monitor user feedback and analytics
- [ ] Iterate based on user behavior
- [ ] Implement additional features (email campaigns, etc.)

## Future Enhancements

### Planned Features

- **Email Campaigns**: Automated email sequences for waitlist users
- **Segmentation**: User segmentation based on role, region, etc.
- **A/B Testing**: Test different signup flows and messaging
- **Export Functionality**: CSV export for admin users
- **Webhook Integration**: Real-time notifications for new signups

### Technical Improvements

- **Caching**: Redis caching for rate limiting (if needed)
- **Queue System**: Background processing for email sending
- **Monitoring**: Enhanced monitoring and alerting
- **Backup**: Automated data backup and recovery procedures

## Troubleshooting

### Common Issues

**Rate Limiting Too Aggressive**
- Check rate limit configuration
- Monitor for false positives
- Adjust limits if necessary

**Duplicate Submissions**
- Verify email normalization logic
- Check for race conditions
- Monitor deduplication effectiveness

**Analytics Not Working**
- Verify Firebase Analytics setup
- Check client-side event emission
- Monitor browser console for errors

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=waitlist:*
```

## Support

For technical support or questions about the waitlist feature:

- **Development Team**: Contact the development team for technical issues
- **Documentation**: This document and inline code comments
- **Monitoring**: Check application logs and analytics dashboard
