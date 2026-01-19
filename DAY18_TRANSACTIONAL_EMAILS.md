# DAY 18: Transactional Emails with AWS SES

## 🎯 Learning Objective
**2.24 Transactional Emails**: Implement secure transactional email functionality using AWS SES with HTML templates, environment-based configuration, and delivery verification.

## 📋 Overview
Implemented a complete transactional email system that:
- ✅ Sends emails via AWS SES with proper authentication
- ✅ Provides 3 professional HTML email templates (Welcome, Task Assigned, Password Reset)
- ✅ Validates email requests with Zod schemas
- ✅ Logs message IDs and delivery information
- ✅ Supports both templated and custom HTML emails
- ✅ Handles sandbox and production configurations

## 🏗️ Architecture

### Email Flow
```
Client Request → API Route → Validate Data → Generate HTML → AWS SES → Recipient
                                                                 ↓
                                                        Log Message ID
```

### Components
1. **Email Utility** (`lib/email.js`)
   - SES client initialization
   - `sendEmail()` function
   - HTML email templates (welcome, taskAssigned, passwordReset)

2. **Email API** (`app/api/email/route.js`)
   - POST: Send emails with template or custom HTML
   - GET: Check email configuration status
   - Request validation with Zod
   - Authentication required

3. **Testing Script** (`scripts/test-email.js`)
   - Automated email testing
   - Tests all 3 templates
   - Custom HTML email test
   - Configuration verification

## 📁 File Structure
```
lib/
  email.js                  # AWS SES utilities & templates
app/api/
  email/
    route.js                # Email sending API
scripts/
  test-email.js            # Automated email testing
```

## 🔧 Configuration

### Environment Variables (.env.development)
```env
# AWS SES Configuration (Transactional Emails)
AWS_ACCESS_KEY_ID='your-access-key-id'
AWS_SECRET_ACCESS_KEY='your-secret-access-key'
AWS_REGION='ap-south-1'
SES_EMAIL_SENDER='no-reply@sprintlite.com'
```

### AWS SES Setup

#### 1. Verify Sender Email/Domain
```bash
# Via AWS CLI
aws ses verify-email-identity --email-address no-reply@sprintlite.com --region ap-south-1

# Or via AWS Console:
# SES → Verified Identities → Create Identity → Email Address
```

#### 2. Verify Recipient Emails (Sandbox Mode)
In sandbox mode, both sender AND recipient must be verified:
```bash
aws ses verify-email-identity --email-address user@example.com --region ap-south-1
```

#### 3. Request Production Access
To send to unverified emails:
1. SES Console → Account Dashboard → Request Production Access
2. Fill out use case details
3. Approval typically takes 24-48 hours

#### 4. Configure IAM Permissions
Ensure your AWS user has `ses:SendEmail` permission:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

## 📧 Email Templates

### 1. Welcome Email
Professional gradient header, call-to-action button, responsive design.

**Usage:**
```javascript
import { welcomeTemplate } from '@/lib/email';

const html = welcomeTemplate('John Doe');
```

**Features:**
- Gradient purple header
- Personalized greeting
- CTA button to dashboard
- Professional footer

### 2. Task Assigned Email
Notification when user is assigned a task.

**Usage:**
```javascript
import { taskAssignedTemplate } from '@/lib/email';

const html = taskAssignedTemplate(
  'John Doe',
  'Implement Email Service',
  'http://localhost:3000/tasks/123'
);
```

**Features:**
- Eye-catching gradient header
- Task details box
- Direct link to task
- Clear visual hierarchy

### 3. Password Reset Email
Secure password reset with expiring link.

**Usage:**
```javascript
import { passwordResetTemplate } from '@/lib/email';

const html = passwordResetTemplate(
  'John Doe',
  'http://localhost:3000/reset?token=abc123',
  15 // minutes
);
```

**Features:**
- Security warning box
- Expiration time display
- Fallback URL text
- Yellow warning styling

## 🚀 API Usage

### 1. Check Email Configuration
```bash
GET /api/email
Authorization: Bearer <token>
```

**Response:**
```json
{
  "configured": true,
  "sender": "no-reply@sprintlite.com",
  "region": "ap-south-1",
  "templates": ["welcome", "taskAssigned", "passwordReset"]
}
```

### 2. Send Welcome Email
```bash
POST /api/email
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Welcome to SprintLite!",
  "template": "welcome",
  "templateData": {
    "userName": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "010001234567890a-abcdef12-3456-7890-abcd-ef1234567890-000000",
  "requestId": "abc123-def456"
}
```

### 3. Send Task Assigned Email
```bash
POST /api/email
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "developer@example.com",
  "subject": "New Task Assigned",
  "template": "taskAssigned",
  "templateData": {
    "userName": "Jane Smith",
    "taskTitle": "Fix authentication bug",
    "taskUrl": "http://localhost:3000/tasks/456"
  }
}
```

### 4. Send Password Reset Email
```bash
POST /api/email
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Password Reset Request",
  "template": "passwordReset",
  "templateData": {
    "userName": "John Doe",
    "resetUrl": "http://localhost:3000/reset?token=xyz789",
    "expiryMinutes": 15
  }
}
```

### 5. Send Custom HTML Email
```bash
POST /api/email
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Custom Notification",
  "message": "<h1>Hello!</h1><p>This is a custom email.</p>"
}
```

## 🧪 Testing

### Automated Test Script
```bash
node scripts/test-email.js
```

**Test Coverage:**
- ✅ User authentication
- ✅ Email configuration check
- ✅ Welcome email template
- ✅ Task assigned template
- ✅ Password reset template
- ✅ Custom HTML email
- ✅ Message ID logging

**Expected Output:**
```
============================================================
AWS SES TRANSACTIONAL EMAIL TEST
============================================================

📝 Step 1: Authenticating user...
✅ Authenticated as: john@example.com

⚙️  Step 2: Checking email configuration...
✅ Email service configured
   Sender: no-reply@sprintlite.com
   Region: ap-south-1
   Available templates: welcome, taskAssigned, passwordReset

📧 Step 3: Sending welcome email...
✅ Welcome email sent
   Message ID: 010001234567890a-abcdef12...

📋 Step 4: Sending task assigned email...
✅ Task assigned email sent
   Message ID: 010001234567890b-bcdef123...

🔐 Step 5: Sending password reset email...
✅ Password reset email sent
   Message ID: 010001234567890c-cdef1234...

✨ Step 6: Sending custom HTML email...
✅ Custom email sent
   Message ID: 010001234567890d-def12345...

============================================================
✅ ALL EMAIL TESTS PASSED
============================================================

📬 Check your inbox:
   Email: john@example.com
   Expected emails: 4 (Welcome, Task, Reset, Custom)

💡 Note: Emails may take 1-2 minutes to arrive
💡 Check spam folder if not in inbox
```

### Manual Testing with curl

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  | jq -r '.token')

# 2. Send welcome email
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Welcome!",
    "template": "welcome",
    "templateData": {
      "userName": "John Doe"
    }
  }'
```

## 📊 Rate Limits & Monitoring

### AWS SES Sandbox Limits
- **Sending Rate**: 1 email per second
- **Daily Quota**: 200 emails per 24 hours
- **Recipient Restriction**: Only verified emails
- **Use Case**: Development and testing

### AWS SES Production Limits
- **Sending Rate**: 14 emails per second (default, can be increased)
- **Daily Quota**: 50,000 emails per 24 hours (default)
- **Recipient Restriction**: None (can send to any valid email)
- **Use Case**: Production applications

### Monitoring
1. **CloudWatch Metrics**:
   - Sends, Bounces, Complaints, Rejects
   - Delivery rate tracking
   - Custom alarms

2. **SES Console**:
   - Reputation dashboard
   - Sending statistics
   - Suppression list

3. **Application Logs**:
   ```javascript
   logInfo(`Email sent successfully`, {
     messageId: response.messageId,
     to: recipientEmail,
     subject: emailSubject
   });
   ```

## 🛡️ Bounce & Complaint Handling

### Setting Up SNS Notifications
```bash
# 1. Create SNS topic
aws sns create-topic --name ses-bounces --region ap-south-1

# 2. Subscribe to topic
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:123456789012:ses-bounces \
  --protocol email \
  --notification-endpoint admin@sprintlite.com

# 3. Configure SES notifications
aws ses set-identity-notification-topic \
  --identity no-reply@sprintlite.com \
  --notification-type Bounce \
  --sns-topic arn:aws:sns:ap-south-1:123456789012:ses-bounces
```

### Handling Bounces in Code
```javascript
// API route to handle SNS notifications
export async function POST(request) {
  const notification = await request.json();
  
  if (notification.notificationType === 'Bounce') {
    const bounces = notification.bounce.bouncedRecipients;
    
    for (const recipient of bounces) {
      // Mark email as bounced in database
      await prisma.user.update({
        where: { email: recipient.emailAddress },
        data: { emailBounced: true }
      });
      
      logWarning('Email bounced', {
        email: recipient.emailAddress,
        bounceType: notification.bounce.bounceType
      });
    }
  }
}
```

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit AWS credentials to git
- ✅ Use different credentials for dev/prod
- ✅ Rotate credentials regularly

### 2. Rate Limiting
Implement application-level rate limits:
```javascript
// Limit to 10 emails per user per hour
const emailCount = await redis.incr(`email:user:${userId}:count`);
await redis.expire(`email:user:${userId}:count`, 3600);

if (emailCount > 10) {
  throw new Error('Rate limit exceeded');
}
```

### 3. Email Validation
```javascript
// Validate email format
const emailSchema = z.string().email();

// Check against suppression list
const isSuppressed = await checkSuppressionList(email);
if (isSuppressed) {
  throw new Error('Email is suppressed');
}
```

## 📈 Scaling to 10,000+ Emails/Day

### Strategy
1. **Queue System**: Use Bull/BullMQ with Redis
   ```javascript
   import Queue from 'bull';
   
   const emailQueue = new Queue('email', process.env.REDIS_URL);
   
   emailQueue.process(async (job) => {
     await sendEmail(job.data);
   });
   
   // Add to queue instead of sending directly
   await emailQueue.add({ to, subject, html });
   ```

2. **Batch Processing**: Group emails by priority
   - High: Instant (password resets, security)
   - Medium: 5-minute batches (notifications)
   - Low: Hourly digests (marketing)

3. **Multiple Senders**: Rotate between verified domains
   ```javascript
   const senders = [
     'no-reply@sprintlite.com',
     'notifications@sprintlite.com',
     'alerts@sprintlite.com'
   ];
   
   const sender = senders[index % senders.length];
   ```

4. **Monitoring & Alerts**:
   - Track bounce rate (keep < 5%)
   - Monitor complaint rate (keep < 0.1%)
   - Alert on quota usage > 80%

5. **Warm-up Strategy**:
   - Start with small volumes
   - Gradually increase over 2-4 weeks
   - Monitor reputation metrics

6. **Suppression Management**:
   - Maintain bounce list
   - Honor unsubscribe requests
   - Clean inactive emails

## 🎨 Email Design Best Practices

### HTML Email Guidelines
1. **Inline CSS**: Email clients don't support `<style>` tags well
2. **Table Layouts**: Use tables for layout (flex/grid unsupported)
3. **Image Fallbacks**: Always include alt text
4. **Mobile First**: 60%+ of emails opened on mobile
5. **Plain Text Alternative**: Always provide text version

### Testing Tools
- **Litmus**: Cross-client testing
- **Email on Acid**: Rendering preview
- **Mail Trap**: Development inbox
- **AWS SES Mailbox Simulator**: Test bounces/complaints

## 📸 Screenshots

### 1. Welcome Email
![Welcome Email](./docs/screenshots/email-welcome.png)
*Professional welcome email with gradient header and CTA*

### 2. Task Assigned Email
![Task Email](./docs/screenshots/email-task.png)
*Clean task notification with direct action link*

### 3. Password Reset Email
![Reset Email](./docs/screenshots/email-reset.png)
*Secure reset email with warning box and expiry*

### 4. Console Logs
```
[2024-01-19 10:30:15] INFO: Sending email to user@example.com - Subject: Welcome!
[2024-01-19 10:30:16] INFO: Email sent successfully
  messageId: 010001234567890a-abcdef12-3456-7890-abcd-ef1234567890-000000
  requestId: abc123-def456-789ghi
  to: user@example.com
  userId: user123
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Email address is not verified"
**Problem**: Trying to send to unverified email in sandbox mode  
**Solution**: Verify recipient email in SES Console

#### 2. "MessageRejected: Email address is not verified"
**Problem**: Sender email not verified  
**Solution**: Verify sender email/domain in SES Console

#### 3. "Request has expired"
**Problem**: System clock out of sync  
**Solution**: Sync system time with NTP server

#### 4. "Daily sending quota exceeded"
**Problem**: Hit sandbox limit (200/day)  
**Solution**: Request production access or wait 24 hours

#### 5. Emails going to spam
**Solutions**:
- Set up SPF, DKIM, DMARC records
- Warm up sender reputation gradually
- Avoid spam trigger words
- Include unsubscribe link
- Monitor bounce/complaint rates

## 📝 Reflection

### Sandbox vs Production
**Sandbox** is ideal for:
- Development and testing
- Internal team notifications
- Prototype demos

**Production** is required for:
- Customer-facing emails
- Large-scale notifications
- Marketing campaigns

### What Went Well
- AWS SES is cost-effective ($0.10 per 1,000 emails)
- Template system makes consistent branding easy
- Message IDs enable delivery tracking
- HTML emails render consistently

### Challenges
- Sandbox restrictions during development
- Email deliverability (spam filters)
- HTML email compatibility across clients
- Managing bounces and complaints at scale

### Key Learnings
- Always verify sender domain for production
- Implement retry logic for transient failures
- Monitor reputation metrics closely
- Queue system essential for high volumes
- Plain text alternative improves deliverability

### Scaling Safeguards
To handle 10,000+ emails/day without spam flags:

1. **Technical**:
   - Queue system with rate limiting
   - Multiple verified sender domains
   - Gradual warm-up process
   - Retry with exponential backoff

2. **Reputation**:
   - Keep bounce rate < 5%
   - Keep complaint rate < 0.1%
   - Honor unsubscribe immediately
   - Clean inactive emails quarterly

3. **Compliance**:
   - CAN-SPAM compliance (unsubscribe link)
   - GDPR consent tracking
   - Privacy policy link
   - Physical mailing address

4. **Monitoring**:
   - CloudWatch alarms on metrics
   - Daily reputation dashboard
   - Real-time bounce processing
   - Weekly deliverability reports

---

**Status**: ✅ Complete  
**Date**: January 2024  
**Provider**: AWS SES  
**Next**: Integration with user flows (signup, task assignment, etc.)
