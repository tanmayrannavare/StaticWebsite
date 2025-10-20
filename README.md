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
| SSH | 22 | 0.0.0.0/0 |
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
Step 6:Download AWS CLI v2 installer
```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
```
Unzip the AWS CLI installer
Run:
```
unzip awscliv2.zip
```
Now run the installer
```
sudo ./aws/install
```
Verify AWS CLI is installed
```
aws --version
```
Step 6:Access Jenkins Web UI
In your browser, go to:
```
http://<EC2-Public-IP>:8080
```
Step 7: Unlock Jenkins
Get the initial admin password:
```
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
Copy the password, paste it into the browser prompt.

Step 8: Finish Jenkins Setup
Choose “Install Suggested Plugins”
Create your admin user
Finish setup
✅ Jenkins is now installed and ready to use!

---

### 🔌 8️⃣. Install Necessary Plugins

## Add Required Plugins
1. Go to:  
   `Manage Jenkins > Plugins > Available`
2. Search and **tick the following plugins**:
   - **Git Server Plugin**
   - **AWS Credentials Plugin**
3. Click **Install without restart**
---


# Credential Setup

## AWS Credentials
1. Go to: IAM > Users > [Create new or select existing user]
2. Create Access Key
   - Use case: CLI
3. Download the `.csv` file with the Access Key ID and Secret Access Key

## GitHub Personal Access Token (PAT)
1. Go to: Settings > Developer Settings > Personal Access Tokens > Tokens (classic)
2. Generate new token (or skip if it already exists)
3. Select the required scopes
4. Copy your PAT (this will be used as the password in Jenkins)

## Add Credentials to Jenkins
1. Go to Jenkins > Manage Jenkins > Credentials
2. Add credentials for:
   - **AWS** (Access Key ID + Secret Access Key)
   - **GitHub** (Username + PAT)

### AWS:
- **Kind**: Username with password
- **Username**: AWS Access Key ID
- **Password**: AWS Secret Access Key
- **ID**: e.g., aws-jenkins

### GitHub:
- **Kind**: Username with password
- **Username**: GitHub username
- **Password**: GitHub PAT
- **ID**: e.g., github-jenkins

---
## ❓ Is a Webhook Necessary in Jenkins?

### ✅ No – Not Always Necessary

You **do not need** a webhook if:
- You are triggering builds manually
- You are using **polling** (Jenkins checks GitHub for changes at intervals)

### ✅ Yes – Necessary If You Want:
- **Automatic builds** on every Git push (recommended for CI/CD)
- **Faster response time** – builds are triggered instantly
- **Less load** on Jenkins (no repeated polling needed)

### 🔁 Summary: Webhook vs Polling

| Use Case                             | Is Webhook Needed? |
|--------------------------------------|---------------------|
| Triggering builds manually           | ❌ No                |
| Using SCM polling in Jenkins         | ❌ No                |
| Want automatic builds on Git push    | ✅ Yes               |
| Running CI/CD in real-time           | ✅ Yes               |
| Jenkins is not publicly accessible   | ❌ No (or use polling/ngrok) |

---
---
## 🛠️ Build Pipeline in Jenkins?
Step: Add the GitHub Webhook
In GitHub: go to your repository > settings > webhooks > add webhook > Payload URL > http://<your_jenkin_server_ip>/github-webhook/ > content type > application/json > ✅ Select "Just the Push event" >click Add Webhook
### Dont forgot to add:port😄
chech the delivery
now jenkins will auto-triggers when you push to GitHub

### Pipeline
In jenkins:
create new item > name > click on pipeline > scroll > in trigger- click on GitHub hook trigger for GITScm polling > scroll> pipeline > Defination > Pipeline script from SCM > select scm to Git > add url "https://github.com/your_githubusername/repo_name" > Add credential > Branch Specifier > chech in github -main/master > apply/save > build now > check in console.

---
✅ Final Verification
✅ Website loads from CloudFront domain (secured with HTTPS)
✅ Jenkins pipeline auto-deploys updates from GitHub → S3 → CloudFront
✅ All AWS resources are properly configured (VPC, SG, EC2, S3, CloudFront)
