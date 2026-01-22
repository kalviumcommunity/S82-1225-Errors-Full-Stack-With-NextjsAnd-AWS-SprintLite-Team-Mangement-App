# DAY24: Cloud Database Configuration (AWS RDS / Azure PostgreSQL)

## 1. Managed Database Overview
A managed database service like AWS RDS or Azure Database for PostgreSQL automates backups, patching, scaling, and network security. This lets you focus on development, not database admin.

| Provider | Service Name | Key Advantage |
|----------|-------------|--------------|
| AWS      | Amazon RDS (PostgreSQL) | Easy autoscaling, CloudWatch monitoring |
| Azure    | Azure Database for PostgreSQL | Strong Azure networking/IAM integration |

---

## 2. Provisioning Details
- **Provider:** (AWS RDS or Azure Database for PostgreSQL)
- **Instance/Server Name:** `nextjs-db` (example)
- **Engine:** PostgreSQL (e.g., 15.x)
- **Admin Username:** `admin`
- **Region:** (e.g., us-east-1, West Europe)
- **Tier:** Free/Basic (e.g., db.t3.micro, B1MS)
- **Status:** ✅ Deployed

**AWS Steps:**
- Console → RDS → Create Database → PostgreSQL → Free tier → Set identifier, username, password → Enable public access (for testing) → Create.

**Azure Steps:**
- Portal → Create resource → Azure Database for PostgreSQL → Single Server → Basic tier → Set server name, admin login, password → Allow public access (for testing) → Create.

---

## 3. Network Access Configuration
- **AWS:**
  - VPC Security Group inbound rule:
    - Type: PostgreSQL
    - Port: 5432
    - Source: My IP (`203.0.113.42/32`)
- **Azure:**
  - Firewall rule for client IP:
    - Rule Name: `AllowMyIP`
    - Start/End IP: `203.0.113.42`

**Reflection:**
Only your IP or app server IP is allowed. This prevents unauthorized access and brute-force attacks.

---

## 4. Next.js App Connection
- **.env.local Example:**
  ```
  DATABASE_URL=postgresql://admin:YourStrongPassword@your-db-endpoint:5432/nextjsdb
  ```
- **API Route Test Example:**
  ```js
  // pages/api/dbtest.js or app/api/dbtest/route.js
  import { Pool } from 'pg';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  export default async function handler(req, res) {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ serverTime: result.rows[0] });
  }
  ```
- **Test Result:**
  - Successful response: `{ "serverTime": "2026-01-22T12:34:56.789Z" }`
  - (Include screenshot of API response or terminal output)

---

## 5. Admin Client Verification
- **Tool Used:** (pgAdmin, psql CLI, Azure Data Studio, etc.)
- **Command Example:**
  ```
  psql -h your-db-endpoint -U admin -d nextjsdb
  ```
- **Screenshot:**
  - Show successful login or query result (e.g., `SELECT version();`)

---

## 6. Backups, Cost, and Scaling
- **Backups:**
  - Automated backups enabled (7+ days retention)
- **Estimated Cost:**
  - Free/Basic tier (e.g., $0–$15/month)
- **Scaling/Replication Reflection:**
  - Read replicas can improve reliability and performance for production.
  - Vertical scaling (CPU/RAM) and storage can be adjusted as needed.
  - Automated failover and point-in-time restore are available.

---

## 7. Security & Best Practices
- **Connection Security:**
  - Use SSL/TLS for connections (if supported)
  - Never expose DB to 0.0.0.0/0 in production
- **Secrets Management:**
  - Store credentials in `.env.local` (never commit to git)
- **Network:**
  - Prefer private endpoints or VPC peering for production

---

## 8. Screenshots & Logs
- [ ] Screenshot: Cloud provider DB dashboard
- [ ] Screenshot: Security group/firewall rule
- [ ] Screenshot: Successful app/API query
- [ ] Screenshot: Admin client connection

---

## 9. Video Demo Script
1. Show cloud console: DB creation, network/firewall setup
2. Show .env.local and Next.js API route test
3. Show admin client connection
4. Briefly explain security, backup, and scaling features

---

## Summary
- Managed PostgreSQL is provisioned, secured, and connected to the app.
- Network access is restricted for safety.
- Backups and scaling options are enabled and understood.
- All steps are documented and verifiable.

---

**Replace placeholders with your actual values and screenshots.**
**If you want a more detailed step-by-step for AWS or Azure, just ask!**
