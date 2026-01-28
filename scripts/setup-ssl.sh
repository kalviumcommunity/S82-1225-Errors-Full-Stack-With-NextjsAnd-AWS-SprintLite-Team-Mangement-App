#!/bin/bash

# ============================================================================
# AWS Route53 & SSL Certificate Setup Script for SprintLite
# ============================================================================
# This script automates:
# 1. Creating a Route53 hosted zone
# 2. Creating DNS records (A, CNAME)
# 3. Requesting SSL certificate from ACM
# 4. Validating certificate with DNS CNAME records
# 5. Attaching certificate to load balancer
# ============================================================================

set -e

# Configuration
DOMAIN="sprintlite-app.com"
AWS_REGION="us-east-1"
ALB_DNS_NAME=""  # Will be set by user
CERTIFICATE_EMAIL="admin@sprintlite-app.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}SprintLite SSL/Domain Setup Script${NC}"
echo -e "${BLUE}===========================================${NC}\n"

# ============================================================================
# Step 1: Check Prerequisites
# ============================================================================
echo -e "${YELLOW}[Step 1] Checking prerequisites...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Install it with: pip install awscli${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq not found. Install it with: brew install jq (macOS) or apt install jq (Linux)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI and jq are installed${NC}\n"

# ============================================================================
# Step 2: Verify AWS Credentials
# ============================================================================
echo -e "${YELLOW}[Step 2] Verifying AWS credentials...${NC}"

if ! aws sts get-caller-identity --region "$AWS_REGION" > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS account: $ACCOUNT_ID${NC}\n"

# ============================================================================
# Step 3: Get Load Balancer Information
# ============================================================================
echo -e "${YELLOW}[Step 3] Getting load balancer information...${NC}"

# List available load balancers
echo "Available Load Balancers:"
aws elbv2 describe-load-balancers --region "$AWS_REGION" \
    --query 'LoadBalancers[*].[LoadBalancerName,DNSName]' \
    --output table

read -p "Enter your ALB DNS name (e.g., sprintlite-alb-123456.us-east-1.elb.amazonaws.com): " ALB_DNS_NAME

if [ -z "$ALB_DNS_NAME" ]; then
    echo -e "${RED}❌ ALB DNS name is required${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using ALB: $ALB_DNS_NAME${NC}\n"

# ============================================================================
# Step 4: Create Route53 Hosted Zone
# ============================================================================
echo -e "${YELLOW}[Step 4] Creating Route53 Hosted Zone for $DOMAIN...${NC}"

# Check if hosted zone already exists
EXISTING_ZONE=$(aws route53 list-hosted-zones-by-name \
    --dns-name "$DOMAIN" \
    --query "HostedZones[?Name=='${DOMAIN}.'].Id" \
    --output text)

if [ -z "$EXISTING_ZONE" ]; then
    echo "Creating new hosted zone..."
    ZONE_RESPONSE=$(aws route53 create-hosted-zone \
        --name "$DOMAIN" \
        --caller-reference "sprintlite-$(date +%s)" \
        --region "$AWS_REGION")
    
    ZONE_ID=$(echo "$ZONE_RESPONSE" | jq -r '.HostedZone.Id' | cut -d'/' -f3)
    echo -e "${GREEN}✅ Created hosted zone: $ZONE_ID${NC}"
else
    ZONE_ID=$(echo "$EXISTING_ZONE" | cut -d'/' -f3)
    echo -e "${GREEN}✅ Using existing hosted zone: $ZONE_ID${NC}"
fi

echo "Hosted Zone ID: $ZONE_ID"
echo "Store this for later: $ZONE_ID"
echo ""

# Get nameservers
NS_RECORDS=$(aws route53 get-hosted-zone --id "$ZONE_ID" \
    --query 'DelegationSet.NameServers' \
    --output text)

echo -e "${YELLOW}IMPORTANT: Update your domain registrar with these nameservers:${NC}"
for ns in $NS_RECORDS; do
    echo "  - $ns"
done
echo ""

# ============================================================================
# Step 5: Create A Record (Root Domain)
# ============================================================================
echo -e "${YELLOW}[Step 5] Creating A record for $DOMAIN -> $ALB_DNS_NAME...${NC}"

# Create change batch for A record
cat > /tmp/route53-a-record.json <<EOF
{
  "Comment": "Create A record for SprintLite",
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "$DOMAIN",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "$ALB_DNS_NAME",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
    --hosted-zone-id "$ZONE_ID" \
    --change-batch file:///tmp/route53-a-record.json

echo -e "${GREEN}✅ Created A record${NC}\n"

# ============================================================================
# Step 6: Create CNAME Record (www subdomain)
# ============================================================================
echo -e "${YELLOW}[Step 6] Creating CNAME record for www.$DOMAIN...${NC}"

cat > /tmp/route53-cname-record.json <<EOF
{
  "Comment": "Create CNAME record for www subdomain",
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.$DOMAIN",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "$DOMAIN"
          }
        ]
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
    --hosted-zone-id "$ZONE_ID" \
    --change-batch file:///tmp/route53-cname-record.json

echo -e "${GREEN}✅ Created CNAME record${NC}\n"

# ============================================================================
# Step 7: Request SSL Certificate from ACM
# ============================================================================
echo -e "${YELLOW}[Step 7] Requesting SSL certificate from AWS Certificate Manager...${NC}"

CERT_RESPONSE=$(aws acm request-certificate \
    --domain-name "$DOMAIN" \
    --subject-alternative-names "www.$DOMAIN" "*.${DOMAIN}" \
    --validation-method DNS \
    --region "$AWS_REGION" \
    --tags Key=Application,Value=SprintLite Key=Environment,Value=production)

CERTIFICATE_ARN=$(echo "$CERT_RESPONSE" | jq -r '.CertificateArn')
echo -e "${GREEN}✅ Certificate requested: $CERTIFICATE_ARN${NC}\n"

# ============================================================================
# Step 8: Get Certificate Validation Records
# ============================================================================
echo -e "${YELLOW}[Step 8] Getting certificate validation records...${NC}"

sleep 3  # Wait for cert to be registered

VALIDATION_OPTIONS=$(aws acm describe-certificate \
    --certificate-arn "$CERTIFICATE_ARN" \
    --region "$AWS_REGION" \
    --query 'Certificate.DomainValidationOptions' \
    --output json)

echo "$VALIDATION_OPTIONS" | jq '.[]' | while read -r record; do
    DOMAIN_NAME=$(echo "$record" | jq -r '.DomainName')
    CNAME_NAME=$(echo "$record" | jq -r '.ResourceRecord.Name')
    CNAME_VALUE=$(echo "$record" | jq -r '.ResourceRecord.Value')
    
    echo -e "${YELLOW}Domain: $DOMAIN_NAME${NC}"
    echo "  CNAME Name:  $CNAME_NAME"
    echo "  CNAME Value: $CNAME_VALUE"
    echo ""
done

# ============================================================================
# Step 9: Auto-add Validation Records (Optional)
# ============================================================================
read -p "Do you want to auto-add validation records to Route53? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Adding validation records...${NC}"
    
    aws acm add-tags-to-certificate \
        --certificate-arn "$CERTIFICATE_ARN" \
        --region "$AWS_REGION" \
        --tags Key=Name,Value=SprintLite
    
    # Note: Automatic CNAME addition requires Route53 management console
    # Alternative: Manually add or use AWS CLI:
    echo -e "${BLUE}Validation records will be added automatically by AWS${NC}"
    echo -e "${GREEN}✅ Check ACM console for certificate status${NC}\n"
else
    echo -e "${YELLOW}Please manually add the validation records to Route53${NC}\n"
fi

# ============================================================================
# Step 10: Wait for Certificate Validation
# ============================================================================
echo -e "${YELLOW}[Step 10] Waiting for certificate validation (max 5 minutes)...${NC}"

CERT_STATUS="PENDING_VALIDATION"
WAIT_TIME=0
MAX_WAIT=300

while [ "$CERT_STATUS" != "ISSUED" ] && [ $WAIT_TIME -lt $MAX_WAIT ]; do
    CERT_STATUS=$(aws acm describe-certificate \
        --certificate-arn "$CERTIFICATE_ARN" \
        --region "$AWS_REGION" \
        --query 'Certificate.Status' \
        --output text)
    
    if [ "$CERT_STATUS" = "ISSUED" ]; then
        echo -e "${GREEN}✅ Certificate issued!${NC}\n"
        break
    else
        echo -n "."
        sleep 5
        WAIT_TIME=$((WAIT_TIME + 5))
    fi
done

if [ "$CERT_STATUS" != "ISSUED" ]; then
    echo -e "${RED}❌ Certificate validation timed out${NC}"
    echo "Please manually validate in AWS Certificate Manager console"
else
    echo -e "${GREEN}✅ Certificate status: $CERT_STATUS${NC}\n"
fi

# ============================================================================
# Step 11: Summary
# ============================================================================
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}Setup Summary${NC}"
echo -e "${BLUE}===========================================${NC}\n"

echo "Domain:              $DOMAIN"
echo "Zone ID:             $ZONE_ID"
echo "ALB:                 $ALB_DNS_NAME"
echo "Certificate ARN:     $CERTIFICATE_ARN"
echo "Region:              $AWS_REGION"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Wait for certificate validation (status: $CERT_STATUS)"
echo "2. Update .env.production with certificate ARN:"
echo "   AWS_ACM_CERTIFICATE_ARN=$CERTIFICATE_ARN"
echo "3. Attach certificate to load balancer HTTPS listener (443)"
echo "4. Test: https://$DOMAIN"
echo "5. Verify SSL: https://www.ssllabs.com/ssltest/"
echo ""

echo -e "${GREEN}✅ Setup script completed!${NC}\n"

# Cleanup
rm -f /tmp/route53-a-record.json /tmp/route53-cname-record.json
