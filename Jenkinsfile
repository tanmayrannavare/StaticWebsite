pipeline {
    agent any

    environment {
        AWS_REGION           = 'ap-south-1'
        S3_BUCKET            = 'bucket-bcci'
        AWS_ACCESS_KEY_ID     = credentials('aws-jenkins')
        AWS_SECRET_ACCESS_KEY = credentials('aws-jenkins')
        CLOUDFRONT_DIST_ID    = 'EKFX8L2MS6EP'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/yashpflutter/Capproject.git', credentialsId: 'github-jenkins'
            }
        }

        stage('Check AWS CLI') {
            steps {
                sh '''
                if command -v aws &> /dev/null
                then
                    echo "AWS CLI found."
                else
                    echo "AWS CLI not found. Please install manually on Jenkins server."
                    exit 1
                fi
                '''
            }
        }

        stage('Deploy to S3') {
            steps {
                sh '''
                aws s3 sync . s3://$S3_BUCKET --region $AWS_REGION --delete --exclude ".git/*" --exclude "Jenkinsfile"
                '''
            }
        }

        stage('CloudFront Invalidation') {
            steps {
                sh '''
                aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST_ID --paths "/*" --region $AWS_REGION
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment successful and CloudFront cache invalidated.'
        }
        failure {
            echo 'Deployment failed. Check the logs.'
        }
    }
}