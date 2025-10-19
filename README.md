# 🚀 Static Website Deployment using AWS S3, CloudFront & Jenkins Pipeline

This project demonstrates how to host and automate a **static website deployment** using **AWS S3**, **CloudFront**, and a **Jenkins pipeline**.  
We’ll create all the required AWS infrastructure — **S3 bucket, CloudFront Distribution, VPC, EC2 (Jenkins Server)**, and **Security Groups**.

---

## 🧱 Architecture Overview

GitHub → Jenkins (EC2 in VPC) → S3 Bucket → CloudFront → End Users

- **GitHub**: Stores your website source code.
- **Jenkins**: CI/CD automation tool to deploy website updates to S3 automatically.
- **S3**: Hosts static website files (HTML, CSS, JS, images, etc.).
- **CloudFront**: CDN that delivers content securely and faster worldwide.
- **VPC**: Provides network isolation for Jenkins EC2 instance.

---

## ⚙️ Step-by-Step Setup

### 1️⃣ Create S3 Bucket

1. Go to **AWS Console → S3 → Create bucket**
2. **Bucket name:** `s3demonstratedemo`
3. Leave all settings **default**
4. Click **Create bucket**
5. Upload your static website code/folders/files (same as GitHub repo)

### 2️⃣ Configure S3 Permissions

- Go to **Permissions tab**
- Ensure **Static website hosting** is **disabled** (we’ll use CloudFront)
- **Block all public access: ON**
- **Bucket Policy:**  
  Keep it default unless a CloudFront **Distribution ID** is mentioned.

---

### 3️⃣ Create CloudFront Distribution

1. Open **CloudFront → Create Distribution**
2. **Distribution type:** “Single website or app”
3. **Origin type:** Amazon S3
4. **S3 origin:** Choose your `s3demonstratedemo` bucket
5. **Cache settings:** Customize → Redirect HTTP to HTTPS
6. **Security:** Skip WAF (optional)
7. Click **Create Distribution**
8. Once created → Go to **General → Edit**
   - Set **Default Root Object** → `index.html`
   - Click **Save changes**
9. Open your site using the **CloudFront domain name** (e.g., `https://dxxxxx.cloudfront.net`)

---

### 4️⃣ Create Custom VPC for Jenkins

#### 🧩 Create VPC

- Name: `jenkinsvpc`
- IPv4 CIDR block: `10.0.0.0/16`
- Type: VPC only → Create

#### 🧩 Create Subnets

| Subnet Name | CIDR Block | Purpose |
|--------------|-------------|----------|
| `publicjen`  | `10.0.1.0/24` | For public Jenkins EC2 |
| `privatejen` | `10.0.2.0/24` | For private instances |

#### 🧩 Internet Gateway

1. Create **Internet Gateway** → `jenkingateway`
2. Attach it to **jenkinsvpc**

#### 🧩 Route Table

1. Create **Route Table** → `myrouteforjenkins`
2. Add Route:
   - Destination: `0.0.0.0/0`
   - Target: `jenkingateway`
3. Associate route table with **publicjen** subnet
4. Enable:
   - Auto-assign public IPv4 address for `publicjen` subnet

---

### 5️⃣ Security Groups Setup

#### 🔓 Public SG (sg-public)

| Type | Port | Source |
|------|------|--------|
| SSH | 22 | 0.0.0.0/0 |
| HTTP | 80 | 0.0.0.0/0 |
| Custom TCP | 8080 | 0.0.0.0/0 |

#### 🔐 Private SG (sg-private)

| Type | Port | Source |
|------|------|--------|
| SSH | 22 | 0.0.0.0/16 |
| HTTP | 80 | 10.0.0.0/16 |
| Custom TCP | 8080 | 10.0.0.0/16 |

---

### 6️⃣ Launch Jenkins EC2 Instance

1. Go to **EC2 → Launch instance**
2. **Name:** `jenkin-server`
3. **AMI:** Ubuntu (latest LTS)
4. **Key Pair:** Create new → `jenkinskey.pem`
5. **Network settings:**
   - VPC: `jenkinsvpc`
   - Subnet: `publicjen`
   - Security group: `sg-public`
6. **Create Instance**

---

### 7️⃣ Jenkins Installation on EC2
✅ Jenkins Installation on Ubuntu EC2
Step 1: Update System
```
sudo apt update && sudo apt upgrade -y
```
Step 2: Install Java (Required for Jenkins)
Jenkins requires Java. Install OpenJDK 17 (recommended):
```
sudo apt install openjdk-17-jdk -y
```
Check if Java was installed:
```
java -version
```
Step 3: Add Jenkins Repository
Run the following to add the Jenkins key and source list:
```
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
```
```
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
```
Step 4: Install Jenkins
Update the package index and install Jenkins:
```
sudo apt update
sudo apt install jenkins -y
```
Step 5: Start and Enable Jenkins
```
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

Check status:
```
sudo systemctl status jenkins
```
Step 6:Access Jenkins Web UI
In your browser, go to:
```
http://<EC2-Public-IP>:8080
```

✅ Final Verification
✅ Website loads from CloudFront domain (secured with HTTPS)
✅ Jenkins pipeline auto-deploys updates from GitHub → S3 → CloudFront
✅ All AWS resources are properly configured (VPC, SG, EC2, S3, CloudFront)
